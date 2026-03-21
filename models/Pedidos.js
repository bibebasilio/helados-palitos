const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
idPedido: { type: Number, unique: true }, // El nro de orden que ve el cliente
fecha: { type: Date, default: Date.now },
cliente: String,
direccion: String,
items: Array,
subtotal: String,
total: String,
pago: { type: String, default: 'pendiente' },
impreso: { type: Boolean, default: false }
});

module.exports = mongoose.model('Pedido', pedidoSchema);
2. Corregir el server.js (La parte de confirmar pedido)
Reemplazamos la lectura del JSON por una consulta a MongoDB. Esto asegura que el idPedido siempre sea el siguiente al
más alto que exista en la base de datos:

JavaScript
const Pedido = require('./models/Pedido'); // Importamos el modelo

app.post('/api/confirmar-pedido', async (req, res) => {
try {
// 1. Buscamos el pedido con el ID más alto
const ultimoPedido = await Pedido.findOne().sort({ idPedido: -1 });

// 2. Si no hay pedidos, empezamos en 1070, si hay, sumamos 1
const nuevoID = ultimoPedido ? ultimoPedido.idPedido + 1 : 1070;

const nuevoPedido = new Pedido({
...req.body,
idPedido: nuevoID,
impreso: false
});

// 3. Guardamos en MongoDB
await nuevoPedido.save();

console.log(`🆕 Pedido #${nuevoID} guardado en MongoDB.`);
res.status(200).json({ success: true, id: nuevoID });
} catch (error) {
console.error("Error al guardar pedido:", error);
res.status(500).json({ success: false });
}
});