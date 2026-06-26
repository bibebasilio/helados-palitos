const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// 1. SERVIR EL FRONTEND (Carpeta public)
app.use(express.static(path.join(__dirname, 'public')));

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('heladeria_eustakio');
        console.log("✅ Conectado a MongoDB Atlas");
    } catch (err) {
        console.error("❌ Error de conexión:", err);
    }
}
connectDB();

// --- 2. RUTAS DE NAVEGACIÓN (Vistas HTML) ---
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'productos.html')));
app.get('/pedidos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pedidos.html')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 3. API PÚBLICA DE PRODUCTOS (Optimizada para Multisucursal) ---
app.get('/api/productos', async (req, res) => {
    try {
        if (!db) return res.status(500).json({ error: "Base de datos no conectada" });

        // Captura el identificador de la URL
        let { localId } = req.query; 
        
        // RESPALDO LOCAL/PRODUCCIÓN: Si no viene un localId específico,
        // le asigna "centro" por defecto para evitar caídas o errores 400.
        if (!localId) {
            localId = "local_01"; 
        }

        console.log(`🔍 Filtrando productos para la sucursal: [${localId}]`);

        const productos = await db.collection('productos').find({ localId: localId }).toArray();
        res.json(productos);
    } catch (err) {
        console.error("❌ Error al obtener productos de la tienda:", err);
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// --- 4. API DE ADMINISTRACIÓN DE PRODUCTOS (Para productos.html) ---
app.get('/api/admin/productos', async (req, res) => {
    try {
        const productos = await db.collection('productos').find().toArray();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

app.post('/api/admin/productos', async (req, res) => {
    try {
        const { image, title, category, clase, price, stock } = req.body;
        await db.collection('productos').insertOne({
            image,
            title,
            category,
            clase,
            price: parseFloat(price),
            stock: parseInt(stock),
            ventas: 0,
            fechaCreacion: new Date()
        });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear producto" });
    }
});

// Ruta para guardar cambios en inventario
app.post('/api/update-products', async (req, res) => {
    try {
        const lista = req.body;
        console.log("Recibiendo actualización para", lista.length, "productos");

        for (const p of lista) {
            if (ObjectId.isValid(p.id)) {
                await db.collection('productos').updateOne(
                    { _id: new ObjectId(p.id) },
                    { $set: { 
                        image: p.image,
                        title: p.title,
                        category: p.category,
                        clase: p.clase,
                        price: parseFloat(p.price),
                        stock: parseInt(p.stock) 
                    }}
                );
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar productos" });
    }
});

app.post('/api/update-productos', async (req, res) => {
    try {
        const lista = req.body;
        console.log("Recibiendo Actualización para", lista.length, "productos");

        for (const p of lista) {
            if (p.id && ObjectId.isValid(p.id)) {
                await db.collection('productos').updateOne(
                    { _id: new ObjectId(p.id) },
                    { $set: { 
                        image: p.image,
                        title: p.title,
                        category: p.category,
                        clase: p.clase,
                        price: parseFloat(p.price),
                        stock: parseInt(p.stock)
                    }}
                );
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar productos" });
    }
});

app.post('/api/admin/update-products', async (req, res) => {
    try {
        const lista = req.body;
        for (const p of lista) {
            if (ObjectId.isValid(p._id)) {
                await db.collection('productos').updateOne(
                    { _id: new ObjectId(p._id) },
                    {
                        $set: {
                            image: p.image,
                            title: p.title,
                            category: p.category,
                            clase: p.clase, 
                            price: parseFloat(p.price),
                            stock: parseInt(p.stock)
                        }
                    }
                );
            }
        }
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error al actualizar productos" });
    }
});

app.post('/api/admin/nuevo-producto', async (req, res) => {
    try {
        const { title, price, stock } = req.body;
        const result = await db.collection('productos').insertOne({
            title,
            price: parseFloat(price),
            stock: parseInt(stock),
            ventas: 0,
            fechaCreacion: new Date()
        });
        res.json({ success: true, id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: "Error al crear producto" });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Intentando eliminar ID:", id);
        await db.collection('productos').deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (err) {
        console.error("Error al eliminar producto:", err);
        res.status(500).json({ error: "No se pudo eliminar" });
    }
});

app.delete('/api/admin/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Intentando eliminar ID:", id);
        await db.collection('productos').deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "No se pudo eliminar" });
    }
});

// --- 5. API DE PEDIDOS & DASHBOARD ---
app.get('/api/admin/pedidos', async (req, res) => {
    try {
        const pedidos = await db.collection('pedidos').find().toArray();
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

app.get('/api/pedidos', async (req, res) => {
    try {
        const pedidos = await db.collection('pedidos').find().sort({ nroPedido: -1 }).toArray();
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

const handlerCambioEstado = async (req, res) => {
    try {
        if (!db) return res.status(500).json({ success: false, mensaje: "Base de datos no conectada" });

        const { id } = req.params;
        const { campo, valor, receptor, observaciones } = req.body;
        
        console.log(`📥 Actualizando Pedido ID: ${id}. Campo: ${campo}, Valor: ${valor}`);

        let query = {};
        if (ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
        } else if (!Number.isNaN(id)) {
            query = { nroPedido: Number.parseInt(id) };
        } else {
            query = { id: id };
        }

        const fechaHoraActual = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
        let updateData = {};
        
        if (campo) updateData[campo] = valor;

        if (campo === 'enviado' || valor === 'enviado' || valor === 'Enviado') {
            updateData.fechaHoraEnvio = fechaHoraActual;
        }

        if (receptor) {
            updateData.receptor = receptor;
            updateData.fechaHoraEntrega = fechaHoraActual;
        }

        if (observaciones) {
            updateData.observaciones = `${observaciones} (${fechaHoraActual})`;
        }

        const resultado = await db.collection('pedidos').updateOne(query, { $set: updateData });
        
        if (resultado.matchedCount === 0 && !Number.isNaN(id)) {
            await db.collection('pedidos').updateOne({ nroPedido: Number.parseInt(id) }, { $set: updateData });
        }

        res.json({ success: true, mensaje: "Estado guardado con éxito" });
    } catch (error) {
        console.error("❌ Error en cambio de estado:", error);
        res.status(500).json({ success: false, mensaje: "Error interno" });
    }
};

app.patch('/api/pedidos/:id/estado', handlerCambioEstado);
app.patch('/api/admin/pedidos/:id/estado', handlerCambioEstado);

// --- 6. RUTA DEL CARRITO ---
app.post('/api/confirmar-pedido', async (req, res) => {
    try {
        const datos = req.body;
        if (!db) return res.status(500).json({ error: "DB no conectada" });

        let nroFinal;
        try {
            const cantidad = await db.collection('pedidos').countDocuments();
            nroFinal = (cantidad || 0) + 1;
        } catch (e) {
            console.warn("Error counting pedidos:", e);
            nroFinal = Math.floor(Math.random() * 1000);
        }

        const cliente = datos.cliente || "Sin Nombre";
        const total = datos.total || 0;
        const pago = datos.pago || "EFECTIVO";

        const nuevoPedido = {
            ...datos,
            nroPedido: nroFinal,
            fecha: new Date(),
            impreso: false
        };

        await db.collection('pedidos').insertOne(nuevoPedido);

        const textoParaImprimir =
            `--------------------------\n` +
            `🍦 NUEVO PEDIDO #${nroFinal}\n` +
            `--------------------------\n` +
            `Cliente: ${cliente}\n` +
            `Pago: ${pago}\n` +
            `--------------------------\n` +
            `Total: $${total}\n`;

        await db.collection('tickets_pendientes').insertOne({
            texto: textoParaImprimir,
            tipo: 'PEDIDO',
            impreso: false,
            fecha: new Date()
        });

        res.status(200).json({ success: true, nro: nroFinal });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: error.message });
    }
});

// --- 7. POLLING PARA EL AGENTE DE IMPRESIÓN ---
app.get('/api/proximo-ticket', async (req, res) => {
    try {
        const pedido = await db.collection('pedidos').findOne({ impreso: false }, { sort: { fecha: 1 } });

        if (pedido) {
            await db.collection('pedidos').updateOne(
                { _id: pedido._id },
                { $set: { impreso: true } }
            );
            res.json(pedido);
        } else {
            res.status(204).send();
        }
    } catch (err) {
        res.status(500).json({ error: "Error en polling" });
    }
});

// --- RESTAR STOCK ---
app.post('/api/productos/restar-stock', async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: "Datos de ítems inválidos" });
        }

        for (const item of items) {
            const idProducto = item._id || item.id;
            if (ObjectId.isValid(idProducto)) {
                const cantidadARestar = Number.parseInt(item.cantidad) * -1;
                await db.collection('productos').updateOne(
                    { _id: new ObjectId(idProducto) },
                    { $inc: { stock: cantidadARestar } }
                );
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: "Error interno" });
    }
});

// Inicialización del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Motor Eustakio corriendo en puerto ${PORT}`);
});