const express = require('express');
const mongoose = require('mongoose');
const productoRoutes = require('./routes/productoRoutes');

const app = express();
app.use(express.json()); // Necesario para leer JSON del front

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/tu_base_de_datos');

// Usar rutas
app.use('/api/productos', productoRoutes);

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));