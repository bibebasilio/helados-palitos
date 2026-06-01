const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// 1. SERVIR EL FRONTEND
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

// --- 2. RUTAS DE NAVEGACIÓN ---
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'productos.html')));
app.get('/pedidos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pedidos.html')));

// --- 3. API DE PRODUCTOS ---
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await db.collection('productos').find().toArray();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

// --- 4. API DE ADMINISTRACIÓN DE PRODUCTOS ---
app.get('/api/admin/productos', async (req, res) => {
    try {
        const productos = await db.collection('productos').find().toArray();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

// Actualizar Inventario (con todos los campos)
app.post('/api/update-products', async (req, res) => {
    try {
        const lista = req.body;
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
        res.status(500).json({ error: "Error" });
    }
});

// Alta de Nuevo Producto
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
        res.status(500).json({ error: "Error" });
    }
});

app.delete('/api/admin/productos/:id', async (req, res) => {
    try {
        await db.collection('productos').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "No se pudo eliminar" });
    }
});

// --- 5. API DE PEDIDOS ---
app.get('/api/admin/pedidos', async (req, res) => {
    const pedidos = await db.collection('pedidos').find().toArray();
    res.json(pedidos);
});

app.patch('/api/admin/pedidos/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { campo, valor, receptor, observaciones } = req.body;
        let updateData = { [campo]: valor };
        
        if (receptor) updateData.receptor = receptor;
        if (observaciones) updateData.observaciones = observaciones;

        await db.collection('pedidos').updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

// --- 6. OTRAS RUTAS (Confirmar, tickets, stock) ---
/*app.post('/api/confirmar-pedido', async (req, res) => {
    await db.collection('pedidos').insertOne({ ...req.body, fecha: new Date(), impreso: false });
    res.status(200).json({ success: true });
});*/
app.post('/api/confirmar-pedido', async (req, res) => {
    try {
        // 1. Buscamos el último pedido para saber qué número sigue
        const ultimoPedido = await db.collection('pedidos').find().sort({ nro: -1 }).limit(1).toArray();
        const nuevoNro = ultimoPedido.length > 0 ? (ultimoPedido[0].nro || 0) + 1 : 1;

        // 2. Insertamos el pedido con el nuevo número
        const nuevoPedido = { 
            ...req.body, 
            nro: nuevoNro, 
            fecha: new Date(), 
            impreso: false 
        };
        
        await db.collection('pedidos').insertOne(nuevoPedido);

        // 3. Respondemos con el número para que el frontend pueda seguir
        res.status(200).json({ success: true, nro: nuevoNro });
    } catch (err) {
        res.status(500).json({ success: false, mensaje: "Error al guardar el pedido" });
    }
});


app.post('/api/productos/restar-stock', async (req, res) => {
    for (const item of req.body.items) {
        await db.collection('productos').updateOne({ _id: new ObjectId(item._id) }, { $inc: { stock: -parseInt(item.cantidad) } });
    }
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor en puerto ${PORT}`));