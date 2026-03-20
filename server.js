//🛠️ Archivo server.js Corregido
//JavaScript
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Rutas de archivos (se adaptan si es local o Render)
const PRODUCTS_PATH = path.join(__dirname, 'data', 'products.json');
const PEDIDOS_PATH = path.join(__dirname, 'data', 'pedidosrecibidos.json');

// --- RUTAS PARA EL AGENTE DE IMPRESIÓN ---

// 1. El Agente (local) llama aquí para ver qué hay nuevo (en Render o Local)
app.get('/api/pedidos/pendientes', (req, res) => {
    fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "No se pudo leer la base de datos" });

        try {
            const todosLosPedidos = JSON.parse(data || "[]");
            // Filtramos: solo lo que NO esté impreso
            const pendientes = todosLosPedidos.filter(p => p.impreso === false || p.impreso === undefined);
            
            console.log(`📋 Consulta de pendientes: ${pendientes.length} encontrados.`);
            res.json(pendientes);
        } catch (e) {
            res.status(500).json({ error: "Error al procesar JSON" });
        }
    });
});

// 2. El Agente llama aquí para avisar que ya imprimió
app.post('/api/pedidos/marcar-impreso/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error de lectura");

        try {
            let listaPedidos = JSON.parse(data || "[]");
            // Buscamos por idPedido o por id (según cómo venga del frente)
            const index = listaPedidos.findIndex(p => String(p.idPedido || p.id) === String(id));

            if (index !== -1) {
                listaPedidos[index].impreso = true; 
                
                fs.writeFile(PEDIDOS_PATH, JSON.stringify(listaPedidos, null, 2), (err) => {
                    if (err) return res.status(500).send("Error al guardar");
                    console.log(`✅ Pedido #${id} marcado como IMPRESO.`);
                    res.status(200).send("Estado actualizado");
                });
            } else {
                res.status(404).send("Pedido no encontrado");
            }
        } catch (e) {
            res.status(500).send("Error procesando JSON");
        }
    });
});

// --- RUTA DE CONFIRMACIÓN DE PEDIDO (Desde Web o PC) ---

app.post('/api/confirmar-pedido', (req, res) => {
    const nuevoPedido = req.body;

    // 1. Actualizar Stock
    fs.readFile(PRODUCTS_PATH, 'utf8', (err, dataProd) => {
        if (err) return res.status(500).json({ success: false, mensaje: "Error DB Productos" });
        
        let productosDB = JSON.parse(dataProd || "[]");
        if (nuevoPedido.items) {
            nuevoPedido.items.forEach(itemCarrito => {
                const productoEnDB = productosDB.find(p => String(p.id) === String(itemCarrito.id));
                if (productoEnDB) {
                    productoEnDB.stock = Number(productoEnDB.stock) - Number(itemCarrito.cantidad);
                    productoEnDB.ventas = (Number(productoEnDB.ventas) || 0) + Number(itemCarrito.cantidad);
                }
            });
        }
// Guardamos los cambios en productos.json 
        fs.writeFile(PRODUCTS_PATH, JSON.stringify(productosDB, null, 2), (err) => {
            if (err) return res.status(500).json({ success: false, mensaje: "Error Stock" });

            // 2. Guardar el Pedido para el Agente
            fs.readFile(PEDIDOS_PATH, 'utf8', (err, dataPed) => {
                let pedidos = JSON.parse(dataPed || "[]");
                
                const pedidoAGuardar = {
                    ...nuevoPedido,
                    id: nuevoPedido.idPedido || Date.now(),
                    fecha: new Date().toISOString(),
                    impreso: false // <--- CRUCIAL para que el Agente lo vea
                };

                pedidos.push(pedidoAGuardar);

                fs.writeFile(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2), (err) => {
                    if (err) return res.status(500).json({ success: false });
                    
                    console.log(`🆕 Nuevo pedido recibido: #${pedidoAGuardar.id}. Esperando impresión...`);
                    res.status(200).json({ success: true, id: pedidoAGuardar.id });
                });
            });
        });
    });
});

// --- OTROS ENDPOINTS (Admin, Asociados, etc) ---

/*app.get('/api/admin/pedidos', (req, res) => {
    fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Error" });
        res.json(JSON.parse(data || "[]"));
    });
});*/
///////////////////////////////////////////
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




/////////////////////////////////////
// (Agregá aquí tus otras rutas de asociados y productos que ya tenías)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en puerto ${PORT}`);
});