const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- CONEXIÓN A MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error Mongo:", err));

// --- MODELO DE CONTADOR (Para IDs correlativos) ---
const contadorSchema = new mongoose.Schema({
  id: String,
  seq: Number
});
const Contador = mongoose.model('Contador', contadorSchema);

// --- MODELO DE PEDIDOS ---
const pedidoSchema = new mongoose.Schema({
  idPedido: { type: Number, unique: true },
  fecha: { type: Date, default: Date.now },
  cliente: String,
  direccion: String,
  telefono: String,
  items: Array,
  total: String,
  pago: String,
  impreso: { type: Boolean, default: false }
});
const Pedido = mongoose.model('Pedido', pedidoSchema);

// --- FUNCIÓN ATÓMICA PARA EL SIGUIENTE ID ---
async function obtenerSiguienteID(nombreContador) {
  // Busca el contador, le suma 1 y devuelve el nuevo valor
  // Si no existe, lo crea empezando en 1079 para que el primer pedido sea 1080
  const contador = await Contador.findOneAndUpdate(
    { id: nombreContador },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  
  // Si el contador es nuevo y empezó en 1, lo ajustamos a 1080
  if (contador.seq === 1) {
      contador.seq = 1080;
      await contador.save();
  }
  
  return contador.seq;
}

// --- RUTA: RECIBIR PEDIDO ---
app.post('/api/confirmar-pedido', async (req, res) => {
    try {
        // Obtenemos el ID real de la base de datos (Fuente única de verdad)
        const nuevoID = await obtenerSiguienteID('pedidoId');

        // Quitamos cualquier ID que mande el celular para que no haya errores
        const { idPedido, ...datosLimpios } = req.body;

        const nuevoPedido = new Pedido({
            ...datosLimpios,
            idPedido: nuevoID,
            impreso: false
        });

        const pedidoFinal = await nuevoPedido.save();
        
        console.log(`✅ Pedido #${pedidoFinal.idPedido} guardado y listo para imprimir.`);

        // Respondemos al celular con el ID que REALMENTE se guardó
        res.status(200).json({ 
            success: true, 
            id: pedidoFinal.idPedido 
        });

    } catch (error) {
        console.error("❌ Error al guardar:", error);
        res.status(500).json({ success: false });
    }
});

// --- RUTAS PARA LA IMPRESORA Y DASHBOARD ---
app.get('/api/pedidos/pendientes', async (req, res) => {
    try {
        const pendientes = await Pedido.find({宣 impreso: false });
        res.json(pendientes);
    } catch (error) { res.json([]); }
});

app.post('/api/pedidos/marcar-impreso/:id', async (req, res) => {
    try {
        await Pedido.findOneAndUpdate({ idPedido: parseInt(req.params.id) }, { impreso: true });
        res.send("OK");
    } catch (error) { res.status(500).send("Error"); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor Eustakio en puerto ${PORT}`));