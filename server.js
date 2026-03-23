const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Conectado a MongoDB Atlas"))
.catch(err => console.error("❌ Error Mongo:", err));

const pedidoSchema = new mongoose.Schema({
idPedido: { type: Number, unique: true },
fecha: { type: Date, default: Date.now },
cliente: String,
direccion: String,
items: Array,
subtotal: String,
total: String,
pago: { type: String, default: 'pendiente' },
impreso: { type: Boolean, default: false }
});

const Pedido = mongoose.model('Pedido', pedidoSchema);
//////////////////////////////////////////////////////////
JavaScript
// 1. Crear un esquema para el contador
const contadorSchema = new mongoose.Schema({
id: String,
seq: Number
});
const Contador = mongoose.model('Contador', contadorSchema);

// 2. Función para obtener el siguiente ID (Ponla antes de tus rutas)
async function obtenerSiguienteID(nombreContador) {
const contador = await Contador.findOneAndUpdate(
{ id: nombreContador },
{ $inc: { seq: 1 } },
{ new: true, upsert: true } // Si no existe, lo crea
);
return contador.seq;
}

// 3. Tu ruta actualizada
app.post('/api/confirmar-pedido', async (req, res) => {
try {
// Obtenemos el ID de forma segura y atómica
const nuevoID = await obtenerSiguienteID('pedidoId');

const { idPedido, ...datosLimpios } = req.body;
const nuevoPedido = new Pedido({
...datosLimpios,
idPedido: nuevoID,
impreso: false
});

const pedidoFinal = await nuevoPedido.save();

res.status(200).json({
success: true,
id: pedidoFinal.idPedido
});
} catch (error) {
console.error("Error:", error);
res.status(500).json({ success: false });
}
});

//////////////////////////////////////////////////////////////////////
/*// --- RUTA CRÍTICA: CONFIRMAR PEDIDO ---
app.post('/api/confirmar-pedido', async (req, res) => {
try {
// 1. Buscar el último ID en la base de datos
const ultimo = await Pedido.findOne().sort({ idPedido: -1 });

// Si no hay pedidos, empezamos en 1080 (o el que gustes)
const nuevoID = ultimo ? ultimo.idPedido + 1 : 1080;

// 2. Limpiar datos del body
const { idPedido, ...datosLimpios } = req.body;

const nuevoPedido = new Pedido({
...datosLimpios,
idPedido: nuevoID,
impreso: false
});

// 3. Guardar y esperar confirmación de DB
const pedidoFinal = await nuevoPedido.save();

console.log(`✅ Pedido Guardado en DB: #${pedidoFinal.idPedido}`);

// 4. Responder con el ID real guardado
return res.status(200).json({
success: true,
id: pedidoFinal.idPedido
});

} catch (error) {
console.error("❌ Error:", error);
res.status(500).json({ success: false, error: error.message });
}
});*/

// Rutas para la impresora
app.get('/api/pedidos/pendientes', async (req, res) => {
const pendientes = await Pedido.find({ impreso: false });
res.json(pendientes);
});

app.post('/api/pedidos/marcar-impreso/:id', async (req, res) => {
await Pedido.findOneAndUpdate({ idPedido: parseInt(req.params.id) }, { impreso: true });
res.send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server corriendo en puerto ${PORT}`));