const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 1. Servir archivos estáticos (La alacena de los HTML)
app.use(express.static(path.join(__dirname, 'public')));

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

// 2. Conexión a la base de datos centralizada
async function connectDB() {
try {
await client.connect();
// Usamos la base donde están tus productos de ayer
db = client.db('heladeria_eustakio');
console.log("✅ Servidor Eustakio: Conectado a MongoDB Atlas");
} catch (err) {
console.error("❌ Error de conexión:", err);
}
}
connectDB();

// --- 3. RUTAS DE NAVEGACIÓN ---
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'productos.html')));
app.get('/pedidos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pedidos.html')));

// --- 4. RUTA DEL CARRITO (EL TRASPLANTE) ---
app.post('/api/confirmar-pedido', async (req, res) => {
try {
const datos = req.body;

// Creamos el pedido para la base de datos
const nuevoPedido = {
...datos,
fecha: new Date(),
impreso: false,
pago: datos.pago || 'pendiente'
};

const result = await db.collection('pedidos').insertOne(nuevoPedido);

// 🖨️ AGREGAR A COLA DE IMPRESIÓN AUTOMÁTICAMENTE
// Esto hace que el agente.js lo detecte y lo imprima
await db.collection('tickets_pendientes').insertOne({
texto: `🍦 NUEVO PEDIDO #${result.insertedId.toString().slice(-4)}\nCliente: ${datos.cliente}\nTotal:
${datos.total}\n------------------\n`,
tipo: 'PEDIDO',
impreso: false,
fecha: new Date()
});

res.status(200).json({ success: true, id: result.insertedId });
console.log("🛒 Pedido recibido y enviado a impresión");
} catch (error) {
console.error("❌ Error en carrito:", error);
res.status(500).json({ success: false });
}
});

// --- 5. API DE PRODUCTOS (GESTIÓN) ---
app.get('/api/admin/productos', async (req, res) => {
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
res.status(500).json({ error: "Error al actualizar" });
}
});

// --- 6. POLLING PARA EL AGENTE DE IMPRESIÓN ---
app.get('/api/agente/proximo-ticket', async (req, res) => {
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
res.status(500).json({ error: "Error en polling" });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Motor Eustakio Único en puerto ${PORT}`));
