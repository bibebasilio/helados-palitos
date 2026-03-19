const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// === PARCHE DE EMERGENCIA PARA NODE v22+ ===
const usb = require('usb');
if (usb && usb.on === undefined) {
    usb.on = function() { return this; };
    console.log("🛠️ Parche usb.on aplicado");
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PRODUCTS_PATH = path.join(__dirname, 'data', 'products.json');
const PEDIDOS_PATH = path.join(__dirname, 'data', 'pedidosrecibidos.json');

// Configuración Impresora (Ajusta según tu dispositivo)
const VENDOR_ID = 0x1FC9;
const PRODUCT_ID = 0x2016;
////////////////// imprimr ticket con nro pedido
const imprimirTicket = (pedido) => {
    try {
        const device = new escpos.USB(VENDOR_ID, PRODUCT_ID);
        if (device.device && typeof device.device.on !== 'function') {
            device.device.on = function() { return this; };
        }

        const printer = new escpos.Printer(device);

        device.open((err) => {
            if (err) {
                console.error('❌ Error de conexión con impresora:', err.message);
                return;
            }

            printer
                .font('B').align('ct').style('b').size(1, 1)
                .text('NUEVO PEDIDO')
                .text(`ORDEN: #${pedido.idPedido || 'N/A'}`) 
                .text('--------------------------------')
                .font('A').align('ct').style('b').size(0, 0)
                
                .align('lt').style('normal')
                .text(`Cliente: ${pedido.cliente || 'Mostrador'}`)
                .text(`Fecha: ${new Date().toLocaleString()}`)
                .font('B').align('ct').style('b').size(1, 1)
                .text('--------------------------------')
                .font('A').align('lt').style('b').size(0, 0)

            // 1. Listado de Productos
            if (pedido.items) {
                pedido.items.forEach(item => {
                    const nombreProd = `${item.title} ${item.category || ''}`.substring(0, 22);
                    const precioUnitario = Number(item.price) || 0;
                    const subtotalItem = (item.cantidad * precioUnitario).toFixed(2);
                    printer.text(`${item.cantidad}x ${nombreProd} $${subtotalItem}`);
                });
            }

            // 2. Desglose de Totales (Antes del Total Final)
            printer
                .font('B').align('ct').style('b')
                .text('---------------------------------------------')
                .font('A').align('rt').style('normal'); // Alineado a la derecha para montos

            // Subtotal (Suma de productos sin descuentos)
            // Si no viene calculado del front, lo podemos omitir o enviarlo como pedido.subtotal
            if (pedido.subtotal) {
                printer.text(`Subtotal: $${pedido.subtotal}`);
            }

            // Descuento Cupón (Solo si existe)
            if (pedido.descCupon && parseFloat(pedido.descCupon) > 0) {
                printer.text(`Descuento Cupon: -$${pedido.descCupon}`);
            }

            // Descuento Efectivo (Solo si existe)
            if (pedido.descEfectivo && parseFloat(pedido.descEfectivo) > 0) {
                printer.text(`Desc. Efectivo: -$${pedido.descEfectivo}`);
            }

            // Costo de Envío
            if (pedido.costoEnvio) {
                printer.text(`Envio: $${pedido.costoEnvio}`);
            }

            // 3. Total Final
            printer
                .font('B').align('ct').style('b').size(1, 1)
                .text('---------------------------------------------')
                .text(`TOTAL: ${pedido.total}`)
                .feed(3)
                .cut()
                .close();
            
            console.log(`✅ Ticket impreso con desglose para Pedido #${pedido.idPedido}`);
        });
    } catch (e) {
        console.error("❌ Fallo en impresión:", e.message);
    }
};

///////////////////////////////////
// Ruta para que la PC local consulte pedidos nuevos
/*app.get('/api/pendientes-impresion', (req, res) => {
    // Aquí buscas en tu JSON o DB los pedidos con estado "pendiente"
    const pedidos = obtenerPedidosPendientes(); 
    res.json(pedidos);
});

// Ruta para marcar como impreso y que no se repita
app.post('/api/marcar-impreso/:id', (req, res) => {
    actualizarEstadoPedido(req.params.id, 'impreso');
    res.sendStatus(200);
});*/

/*app.get('/api/pedidos/pendientes', (req, res) => {
// Aquí filtras tu JSON o base de datos por los que tengan impreso: false
const pendientes = pedidos.filter(p => !p.impreso);
res.json(pendientes);
});

// 2. Endpoint para marcar como procesado
app.post('/api/pedidos/marcar-impreso/:id', (req, res) => {
const { id } = req.params;
// Buscas el pedido por ID y cambias su estado a impreso: true
marcarPedidoComoImpreso(id);
res.sendStatus(200);
});*/
///////////////////
// --- RUTAS PARA EL AGENTE DE IMPRESIÓN LOCAL ---

// 1. Endpoint para que tu PC descargue los pedidos que aún no se imprimieron
app.get('/api/pedidos/pendientes', (req, res) => {
try {
// Suponiendo que 'pedidos' es tu array global de objetos
// Filtramos solo los que tienen la propiedad 'impreso' en false o no la tienen
const pendientes = pedidos.filter(p => p.impreso === false || p.impreso === undefined);

console.log(`Agente local consultando: ${pendientes.length} pedidos pendientes.`);
res.json(pendientes);
} catch (error) {
res.status(500).json({ error: "Error al obtener pedidos" });
}
});

// 2. Endpoint para que tu PC avise que ya imprimió el ticket
app.post('/api/pedidos/marcar-impreso/:id', (req, res) => {
const { id } = req.params;

// Buscamos el pedido en tu array/base de datos
const pedidoIndex = pedidos.findIndex(p => String(p.id) === String(id));

if (pedidoIndex !== -1) {
pedidos[pedidoIndex].impreso = true; // Marcamos como impreso
console.log(`Pedido #${id} marcado como impreso correctamente.`);
res.status(200).send("Estado actualizado");
} else {
console.log(`No se encontró el pedido #${id} para marcar como impreso.`);
res.status(404).send("Pedido no encontrado");
}
});


//////////////////////////////////////////////////////////////////////////////////////////////

// Ejemplo de cuando entra un pedido nuevo
app.post('/api/crear-pedido', (req, res) => {
    const nuevoPedido = {
        id: Date.now(), // ID único
        cliente: req.body.cliente,
        productos: req.body.carrito,
        total: req.body.total,
        impreso: false // CRUCIAL: Esto indica que falta imprimir
    };
    pedidos.push(nuevoPedido); // Guardar en pedidos.json o DB...
    res.json({ success: true, id: nuevoPedido.id });
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/api/confirmar-pedido', (req, res) => {
    const nuevoPedido = req.body;

    fs.readFile(PRODUCTS_PATH, 'utf8', (err, dataProd) => {
        if (err) return res.status(500).json({ success: false, mensaje: "Error DB Productos" });
        
        let productosDB = JSON.parse(dataProd);

        // Descontar Stock
        nuevoPedido.items.forEach(itemCarrito => {
            const productoEnDB = productosDB.find(p => String(p.id) === String(itemCarrito.id));
            if (productoEnDB) {
                productoEnDB.stock = Number(productoEnDB.stock) - Number(itemCarrito.cantidad);
                productoEnDB.ventas = (Number(productoEnDB.ventas) || 0) + Number(itemCarrito.cantidad);
            }
        }); ///  esto qudo igual

// Guardar Stock Actualizado
fs.writeFile(PRODUCTS_PATH, JSON.stringify(productosDB, null, 2), (err) => {
    if (err) {
        return res.status(500).json({ success: false, mensaje: "Error actualizando stock" });
    }
    ///////////////////////////////////////////////////////////
    // Localiza esta sección dentro de app.post('/api/confirmar-pedido')
    fs.readFile(PEDIDOS_PATH, 'utf8', (err, dataPed) => {
        let pedidos = [];
        if (!err && dataPed) {
            try {
                pedidos = JSON.parse(dataPed);
            } catch (e) {
                console.error("Error parsing pedidos:", e.message);
                pedidos = [];
            }
        }
        
        // --- CAMBIO AQUÍ: Usamos el idPedido que viene del frontend -como ID DE LA BASE DE DATOS--
        const pedidoAGuardar = {
            id: nuevoPedido.idPedido || Date.now(), // Si no viene, usa Date.now por seguridad
            fecha: new Date().toISOString(),
            ...nuevoPedido
        };
        //// push
        pedidos.push(pedidoAGuardar);

        fs.writeFile(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ success: false, mensaje: "Error guardando pedido" });
            }

            // Pasamos el pedido completo (que ya tiene el idPedido) a la impresora
            imprimirTicket(nuevoPedido);
            res.status(200).json({ success: true, mensaje: "Pedido completado con éxito" });
        });
    });
});
});
    });



// --- API: ADMIN ---
/*Para que el frontend pueda guardar estos datos, necesitas una ruta genérica en tu servidor. Reemplaza la ruta de pagar que hicimos antes por esta versión más potente:

JavaScript*/
// Ruta genérica para actualizar cualquier estado del pedido (pago, envío, entrega)
/////
app.patch('/api/admin/pedidos/:id/estado', (req, res) => {
    const { id } = req.params;
    const { campo, valor, receptor, observaciones } = req.body; 

    fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false, mensaje: "Error al leer base de datos" });

        let pedidos = JSON.parse(data || "[]");
        const index = pedidos.findIndex(p => String(p.id) === String(id));

        if (index !== -1) {
            // Actualización dinámica del campo principal (pago, enviado, entregado o cancelado)
            pedidos[index][campo] = valor;
            
            // Campos adicionales según la acción
            if (receptor) pedidos[index].receptor = receptor;
            if (observaciones) pedidos[index].observaciones = observaciones;

            fs.writeFile(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2), (err) => {
                if (err) return res.status(500).json({ success: false });
                res.status(200).json({ success: true });
            });
        } else {
            res.status(404).json({ success: false, mensaje: "Pedido no encontrado" });
        }
    });
});



// Agregar un nuevo producto
app.post('/api/admin/productos/nuevo', (req, res) => {
    const nuevoProducto = req.body;

    fs.readFile(PRODUCTS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false });

        let productos = JSON.parse(data || "[]");
        productos.push(nuevoProducto); // Lo sumamos a la lista

        fs.writeFile(PRODUCTS_PATH, JSON.stringify(productos, null, 2), (err) => {
            if (err) return res.status(500).json({ success: false });
            res.status(200).json({ success: true });
        });
    });
});




/////
// Eliminar un producto
app.delete('/api/admin/productos/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(PRODUCTS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false });

        let productos = JSON.parse(data || "[]");
        // Filtramos para quitar el producto que coincida con el ID
        const nuevosProductos = productos.filter(p => String(p.id) !== String(id));

        fs.writeFile(PRODUCTS_PATH, JSON.stringify(nuevosProductos, null, 2), (err) => {
            if (err) return res.status(500).json({ success: false });
            res.status(200).json({ success: true, message: "Producto eliminado correctamente" });
        });
    });
});


// Obtener productos
app.get('/api/admin/productos', (req, res) => {
    fs.readFile(PRODUCTS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error de lectura" });
        res.json(JSON.parse(data || "[]"));
    });
});
//////////////////////////////////////////////// pedidos path


//////////////////////////////////////////////////////////////////
// Obtener historial de pedidos
app.get('/api/admin/pedidos', (req, res) => {
    fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error de lectura" });
        res.json(JSON.parse(data || "[]"));
    });
});

// Actualizar base de datos completa desde admin
app.post('/api/update-products', (req, res) => {
    try {
        const nuevosProductos = req.body;
        fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(nuevosProductos, null, 4));
        res.status(200).json({ success: true, message: "Productos actualizados" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Test de impresión manual
app.get('/api/test-print', (req, res) => {
    imprimirTicket({ cliente: "TEST", total: "100.00", items: [{cantidad: 1, title: "ITEM DE PRUEBA"}] });
    res.send("Comprueba tu impresora.");
});

// Actualizar estado de pago de un pedido
app.patch('/api/admin/pedidos/:id/pagar', (req, res) => {
    const { id } = req.params;

    fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false, mensaje: "Error al leer pedidos" });

        let pedidos = JSON.parse(data || "[]");
        // Buscamos el pedido (usamos String(id) para asegurar coincidencia)
        const index = pedidos.findIndex(p => String(p.id) === String(id));

        if (index !== -1) {
            pedidos[index].pago = "Pagado"; // Cambiamos el estado

            fs.writeFile(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2), (err) => {
                if (err) return res.status(500).json({ success: false, mensaje: "Error al guardar cambio" });
                res.status(200).json({ success: true, mensaje: "Pedido marcado como pagado" });
            });
        } else {
            res.status(404).json({ success: false, mensaje: "Pedido no encontrado" });
        }
    });
});


///////////////////////////////////// asociados
const ASOCIADOS_PATH = path.join(__dirname, 'data', 'asociados.json');

// Obtener todos los asociados
app.get('/api/admin/asociados', (req, res) => {
    fs.readFile(ASOCIADOS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error de lectura" });
        res.json(JSON.parse(data || "[]"));
    });
});
///////////////////////////////// asociado
// Alta de Asociado
/*app.post('/api/admin/asociados/nuevo', (req, res) => {
    const nuevoAsociado = req.body;
    fs.readFile(ASOCIADOS_PATH, 'utf8', (err, data) => {
        let asociados = JSON.parse(data || "[]");
        asociados.push(nuevoAsociado);
        fs.writeFile(ASOCIADOS_PATH, JSON.stringify(asociados, null, 2), (err) => {
            if (err) return res.status(500).json({ success: false });
            res.status(200).json({ success: true });
        });
    });
});*/
//////////////////////////////////
// Alta de Asociado con verificación de duplicados
app.post('/api/admin/asociados/nuevo', (req, res) => {
   // router.put('/api/admin/asociados/:dni', (req, res) => {
    //console.log("DNI recibido en parámetros:", req.params.dni);
   // console.log("Cuerpo recibido (body):", req.body); // Si sale {} o undefined, falta express.json()
//
   


    const nuevoAsociado = req.body;

    fs.readFile(ASOCIADOS_PATH, 'utf8', (err, data) => {
        let asociados = JSON.parse(data || "[]");

        // BUSCAR SI EL DNI YA EXISTE
        const existe = asociados.find(a => String(a.dni) === String(nuevoAsociado.dni));

        if (existe) {
            // Si ya existe, devolvemos un error 400 y un mensaje
            return res.status(400).json({ success: false, mensaje: "Ya esta Asociado con Anterioridad" });
        }

        // Si no existe, lo agregamos
        asociados.push(nuevoAsociado);
        fs.writeFile(ASOCIADOS_PATH, JSON.stringify(asociados, null, 2), (err) => {
            if (err) return res.status(500).json({ success: false });
            res.status(200).json({ success: true });
        });
    });
});






////////////////////////////////////////
// Baja de Asociado (usando DNI como identificador único)
app.delete('/api/admin/asociados/:dni', (req, res) => {
    const { dni } = req.params;
    fs.readFile(ASOCIADOS_PATH, 'utf8', (err, data) => {
        let asociados = JSON.parse(data || "[]");
        const nuevosAsociados = asociados.filter(a => String(a.dni) !== String(dni));
        fs.writeFile(ASOCIADOS_PATH, JSON.stringify(nuevosAsociados, null, 2), (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true });
        });
    });
});

//////////////// imprimir datos de asociado
app.post('/api/print-asociado', (req, res) => {
    const a = req.body;
    const device = new escpos.USB(VENDOR_ID, PRODUCT_ID);
    const printer = new escpos.Printer(device);

    device.open((err) => {
        printer
            .font('B').align('ct').style('b').size(1, 1)
            .text('DATOS DE ASOCIADO')
            .text('--------------------------------')
            .align('lt').style('normal').size(0, 0)
            .text(`Nombre: ${a.cliente}`)
            .text(`DNI: ${a.dni}`)
            .text(`Email: ${a.email}`)
            .text(`Preferencia: ${a.preferencia}`)
            .feed(3).cut().close();
        res.json({success: true});
    });
});
///////////////
// Actualizar Asociado (Modificación)
app.put('/api/admin/asociados/:dni', (req, res) => {
    const { dni } = req.params;
    const datosActualizados = req.body;

    fs.readFile(ASOCIADOS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false, mensaje: "Error al leer asociados" });

        let asociados = JSON.parse(data || "[]");
        const index = asociados.findIndex(a => String(a.dni) === String(dni));

        if (index !== -1) {
            // Actualizamos los datos manteniendo el DNI original o el nuevo
            asociados[index] = { ...asociados[index], ...datosActualizados };

            fs.writeFile(ASOCIADOS_PATH, JSON.stringify(asociados, null, 2), (err) => {
                if (err) return res.status(500).json({ success: false, mensaje: "Error al guardar cambios" });
                res.status(200).json({ success: true, mensaje: "Asociado actualizado con éxito" });
            });
        } else {
            res.status(404).json({ success: false, mensaje: "Asociado no encontrado" });
        }
    });
});


///////////////////////////////////////////////////////////////////
/*app.listen(3000, () => {
    console.log("🚀 Servidor corriendo en http://localhost:3000");


});*/
//////////////////////////////////////////////

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});