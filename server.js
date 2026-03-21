const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PEDIDOS_PATH = path.join(__dirname, 'data', 'pedidosrecibidos.json');
const PRODUCTS_PATH = path.join(__dirname, 'data', 'products.json');

// --- API PARA EL AGENTE ---
app.get('/api/pedidos/pendientes', (req, res) => {
fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
if (err) return res.json([]);
const pedidos = JSON.parse(data || "[]");
// Enviamos todo lo que diga impreso: false o "false"
const pendientes = pedidos.filter(p => p.impreso === false || p.impreso === "false");
res.json(pendientes);
});
});

app.post('/api/pedidos/marcar-impreso/:id', (req, res) => {
const { id } = req.params;
fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
if (err) return res.status(500).send("Error");
let lista = JSON.parse(data || "[]");
const idx = lista.findIndex(p => String(p.idPedido || p.id) === String(id));
if (idx !== -1) {
lista[idx].impreso = true;
fs.writeFile(PEDIDOS_PATH, JSON.stringify(lista, null, 2), () => {
res.send("OK");
});
} else {
res.status(404).send("No encontrado");
}
});
});

// --- RECEPCIÓN DE PEDIDOS (Desde el Celular) ---
app.post('/api/confirmar-pedido', (req, res) => {
const nuevoPedido = req.body;

fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => {
let pedidos = JSON.parse(data || "[]");

// AUTO-INCREMENTO: Buscamos el número más alto y sumamos 1
const ultimoNro = pedidos.length > 0
? Math.max(...pedidos.map(p => parseInt(p.idPedido) || 1074))
: 1074;

const pedidoFinal = {
...nuevoPedido,
idPedido: ultimoNro + 1,
id: ultimoNro + 1,
fecha: new Date().toISOString(),
impreso: false
};

pedidos.push(pedidoFinal);
fs.writeFile(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2), (err) => {
if (err) return res.status(500).json({ success: false });
console.log(`🆕 Pedido #${pedidoFinal.idPedido} guardado.`);
res.status(200).json({ success: true, id: pedidoFinal.idPedido });
});
});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server en puerto ${PORT}`));