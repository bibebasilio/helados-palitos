const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 1. Servir archivos estáticos (Carpeta donde están tus HTML)
app.use(express.static(path.join(__dirname, 'public')));

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

// 2. Conexión a la base de datos
async function connectDB() {
try {
await client.connect();
db = client.db('heladeria_eustakio');
console.log("✅ Servidor Eustakio: Conectado a MongoDB Atlas");
} catch (err) {
console.error("❌ Error de conexión:", err);
}
}
connectDB();

// --- 3. RUTAS DE NAVEGACIÓN (Para entrar desde el navegador) ---
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'productos.html')));
app.get('/pedidos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pedidos.html')));

// Agrega esto en index.js para que "/" cargue el index.html de la raíz
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});
// Por si acaso, esta también por si escribes /index.html
app.get('/index.html', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});


// --- 4. RUTA DEL CARRITO (Confirmar Pedido) ---
app.post('/api/confirmar-pedido', async (req, res) => {
try {
const datos = req.body;
const nuevoPedido = {
...datos,
fecha: new Date(),
impreso: false,
pago: datos.pago || 'pendiente'
};

const result = await db.collection('pedidos').insertOne(nuevoPedido);

// Agregar a cola de impresión para el agente.js
await db.collection('tickets_pendientes').insertOne({
texto: `🍦 NUEVO PEDIDO #${result.insertedId.toString().slice(-4)}\nCliente: ${datos.cliente}\nTotal:
${datos.total}\n------------------\n`,
tipo: 'PEDIDO',
impreso: false,
fecha: new Date()
});

res.status(200).json({ success: true, id: result.insertedId });
console.log("🛒 Pedido recibido y enviado a cola de impresión");
} catch (error) {
console.error("❌ Error en carrito:", error);
res.status(500).json({ success: false });
}
});

// --- 5. RUTAS DE PEDIDOS (Para pedidos.html) ---
app.get('/api/admin/pedidos', async (req, res) => {
try {
const pedidos = await db.collection('pedidos').find().toArray();
res.json(pedidos);
} catch (err) {
res.status(500).json({ error: "Error al obtener pedidos" });
}
});

// Actualizar estado (Pagado/Cancelado)
app.patch('/api/admin/pedidos/:id/estado', async (req, res) => {
const { id } = req.params;
const { campo, valor, observaciones } = req.body;

try {
const updateData = { [campo]: valor };
if (observaciones) updateData.observaciones = observaciones;

const result = await db.collection('pedidos').findOneAndUpdate(
{ id: id },
{ $set: updateData },
{ returnDocument: 'after' }
);

if (result) {
res.json({ success: true, pedido: result });
} else {
res.status(404).json({ mensaje: "Pedido no encontrado" });
}
} catch (error) {
console.error("❌ Error al actualizar estado:", error);
res.status(500).json({ mensaje: "Error al actualizar" });
}
});

// --- 6. API DE PRODUCTOS (Para productos.html) ---
app.get('/api/productos', async (req, res) => {
try {
const productos = await db.collection('productos').find().toArray();
res.json(productos);
} catch (err) {
res.status(500).json({ error: "Error al obtener productos" });
}
});

app.post('/api/update-products', async (req, res) => {
try {
const lista = req.body;
for (const p of lista) {
await db.collection('productos').updateOne(
{ _id: new ObjectId(p._id) },
{ $set: { title: p.title, price: p.price, stock: p.stock } }
);
}
res.json({ success: true });
} catch (err) {
res.status(500).json({ error: "Error al actualizar productos" });
}
});

// --- 7. POLLING PARA EL AGENTE DE IMPRESIÓN ---
app.get('/api/proximo-ticket', async (req, res) => {
try {
const ticket = await db.collection('tickets_pendientes')
.findOne({ impreso: false }, { sort: { fecha: 1 } });

if (ticket) {
await db.collection('tickets_pendientes').updateOne(
{ _id: ticket._id }, { $set: { impreso: true } }
);
res.json(ticket);
} else {
res.status(204).send();
}
} catch (err) {
res.status(500).json({ error: "Error en polling de tickets" });
}
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
console.log(`🚀 Motor Eustakio Único corriendo en puerto ${PORT}`);
});