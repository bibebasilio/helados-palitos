const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- 1. CONEXIÓN A MONGODB ---
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Conectado a MongoDB Atlas"))
.catch(err => console.error("❌ Error Mongo:", err));

// --- 2. MODELO DE DATOS (Integrado aquí para evitar errores de ruta) ---
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


//////////////////////////////////
app.post('/api/confirmar-pedido', async (req, res) => {
    try {
        // 1. Buscamos el último ID real en MongoDB para que sea la ÚNICA fuente de verdad
        const ultimoPedido = await Pedido.findOne().sort({ idPedido: -1 });
        const nuevoID = ultimoPedido ? ultimoPedido.idPedido + 1 : 1077;

        // 2. Limpiamos cualquier ID que mande el celular para que no "contamine"
        const { idPedido, ...restoDelPedido } = req.body;

        const nuevoPedido = new Pedido({
            ...restoDelPedido,
            idPedido: nuevoID, // Forzamos el ID calculado por el servidor
            impreso: false
        });

        // 3. Guardamos y esperamos a que termine
        const pedidoGuardado = await nuevoPedido.save();
        
        console.log(`✅ Pedido #${pedidoGuardado.idPedido} guardado con éxito.`);

        // 4. LE RESPONDEMOS AL CELULAR EL ID QUE ACABAMOS DE GUARDAR
        res.status(200).json({ 
            success: true, 
            id: pedidoGuardado.idPedido // Enviamos el ID real de la base de datos
        });
    } catch (error) {
        console.error("❌ Error en el servidor:", error);
        res.status(500).json({ success: false });
    }
});



/////////////////////////////////////
// --- 3. RUTAS CORREGIDAS ---

/*app.post('/api/confirmar-pedido', async (req, res) => {
    try {
        // 1. Buscamos el último ID real en MongoDB para que se la Unica Fuente
        const ultimo = await Pedido.findOne().sort({ idPedido: -1 });
        const nuevoID = ultimo ? ultimo.idPedido + 1 : 1077;

        // 2. Extraemos los datos del cuerpo, PERO ignoramos el idPedido que mande el celu
        const { idPedido, ...datosSinID } = req.body; 

        const nuevoPedido = new Pedido({
            ...datosSinID,   // Usamos los productos, nombre, etc.
            idPedido: nuevoID, // Forzamos el ID correlativo real
            impreso: false
        });

        await nuevoPedido.save();
        console.log(`🆕 Pedido #${nuevoID} guardado en Mongo.`);
        
        // 3. Respondemos al celular con el ID REAL
        res.status(200).json({ success: true, id: nuevoID });
    } catch (error) {
        console.error("❌ Error al guardar pedido:", error);
        res.status(500).json({ success: false });
    }
});*/


/////////////////////////////////////////////////////////
/*// --- 3. RUTAS ---

// Recibir pedido del celular
app.post('/api/confirmar-pedido', async (req, res) => {
try {
const ultimo = await Pedido.findOne().sort({ idPedido: -1 });
const nuevoID = ultimo ? ultimo.idPedido + 1 : 1077;

const nuevoPedido = new Pedido({
...req.body,
idPedido: nuevoID,
impreso: false
});

await nuevoPedido.save();
console.log(`🆕 Pedido #${nuevoID} guardado en Mongo.`);
res.status(200).json({ success: true, id: nuevoID });
} catch (error) {
console.error("Error:", error);
res.status(500).json({ success: false });
}
});*/

// Pedidos para el agente (impresora)
app.get('/api/pedidos/pendientes', async (req, res) => {
try {
const pendientes = await Pedido.find({ impreso: false });
res.json(pendientes);
} catch (error) {
res.json([]);
}
});

// Marcar como impreso
app.post('/api/pedidos/marcar-impreso/:id', async (req, res) => {
try {
const { id } = req.params;
await Pedido.findOneAndUpdate({ idPedido: parseInt(id) }, { impreso: true });
res.send("OK");
} catch (error) {
res.status(500).send("Error");
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server en puerto ${PORT}`));