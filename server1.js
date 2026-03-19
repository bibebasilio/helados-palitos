const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PRODUCTS_PATH = path.join(__dirname, 'data', 'products.json');
const PEDIDOS_PATH = path.join(__dirname, 'data', 'pedidosrecibidos.json');

// --- RUTAS DE PRODUCTOS ---
app.get('/api/admin/productos', (req, res) => {
fs.readFile(PRODUCTS_PATH, 'utf8', (err, data) => {
if (err) return res.status(500).json({ error: "Error de lectura" });
res.json(JSON.parse(data || "[]"));
});
});

app.post('/api/update-products', (req, res) => {
try {
const nuevosProductos = req.body;
fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(nuevosProductos, null, 2));
res.status(200).json({ success: true });
} catch (error) {
res.status(500).json({ success: false, message: error.message });
}
});

// --- RUTAS DE PEDIDOS ---
app.get('/api/admin/pedidos', (req, res) => {
fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
if (err) return res.status(500).json({ error: "Error de lectura" });
res.json(JSON.parse(data || "[]"));
});
});

// RUTA DINÁMICA: Actualiza cualquier estado (pago, envío, entrega, cancelación)
app.patch('/api/admin/pedidos/:id/estado', (req, res) => {
const { id } = req.params;
const { campo, valor, ...datosExtra } = req.body;

fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
if (err) return res.status(500).json({ success: false });

let pedidos = JSON.parse(data || "[]");
const index = pedidos.findIndex(p => String(p.id) === String(id));

if (index !== -1) {
// Actualización del estado principal
pedidos[index][campo] = valor;

// Si es una cancelación, también actualizamos el estado general para el color
if (campo === 'estado' && valor === 'Cancelado') {
pedidos[index].estado = 'Cancelado';
}

// Mezclamos datos extra (chofer, receptor, motivo, horario)
Object.assign(pedidos[index], datosExtra);

fs.writeFile(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2), (err) => {
if (err) return res.status(500).json({ success: false });
res.status(200).json({ success: true });
});
} else {
res.status(404).json({ success: false, mensaje: "Pedido no encontrado" });
}
});
});

//app.listen(3000, () => console.log("🚀 Servidor en http://localhost:3000"));

