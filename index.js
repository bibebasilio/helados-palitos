const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// 1. SERVIR EL FRONTEND (Carpeta public)
// Esto hace que cuando entres a la URL, busque los archivos en /public
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

// --- 2. RUTAS DE NAVEGACIÓN (Para que carguen tus HTML) ---
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'productos.html')));
app.get('/pedidos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pedidos.html')));

// --- 3. API DE PRODUCTOS (Lo que usa productos.html) ---
app.get('/api/admin/productos', async (req, res) => {
    try {
        const productos = await db.collection('productos').find().toArray();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

app.post('/api/admin/update-products', async (req, res) => {
    try {
        const lista = req.body;
        for (const p of lista) {
            if (ObjectId.isValid(p._id)) {
                await db.collection('productos').updateOne(
                    { _id: new ObjectId(p._id) },
                    { $set: { title: p.title, price: p.price, stock: p.stock } }
                );
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar" });
    }
});
// Eliminar producto (Botón 🗑️)
app.delete('/api/admin/productos/:id', async (req, res) => {
try {
const { id } = req.params;
await db.collection('productos').deleteOne({ _id: new ObjectId(id) });
res.json({ success: true });
} catch (err) {
res.status(500).json({ error: "Error al eliminar" });
}
});

// Crear nuevo producto (Botón Confirmar Alta)
app.post('/api/admin/nuevo-producto', async (req, res) => {
try {
const nuevo = req.body;
const result = await db.collection('productos').insertOne({
title: nuevo.title,
price: parseFloat(nuevo.price),
stock: parseInt(nuevo.stock),
ventas: 0,
fechaCreacion: new Date()
});
res.json({ success: true, id: result.insertedId });
} catch (err) {
res.status(500).json({ error: "Error al crear producto" });
}
});




// Ruta para el Dashboard (Ventas de hoy, etc.)
app.get('/api/admin/pedidos', async (req, res) => {
    try {
        const pedidos = await db.collection('pedidos').find().toArray();
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

// ... (Aquí conservá tu ruta de confirmar-pedido y polling de tickets que ya tenías)

// --- 4. RUTA DEL CARRITO (Confirmar Pedido con número correlativo) ---
app.post('/api/confirmar-pedido', async (req, res) => {
try {
const datos = req.body;
console.log("📥 Datos recibidos del carrito:", datos);

// 1. Verificación de seguridad de la DB
if (!db) {
console.error("❌ La base de datos no está conectada aún");
return res.status(500).json({ error: "DB no conectada" });
}

// 2. Conteo de pedidos con "Fallback" (si falla el conteo, usa un ID corto)
let nroFinal;
try {
const cantidad = await db.collection('pedidos').countDocuments();
nroFinal = (cantidad || 0) + 1;
} catch (e) {
nroFinal = Math.floor(Math.random() * 1000); // Plan B: número aleatorio
}

// 3. Crear el objeto con valores asegurados (Evitamos el undefined aquí)
const cliente = datos.cliente || "Sin Nombre";
const total = datos.total || 0;
const pago = datos.pago || "EFECTIVO";

const nuevoPedido = {
...datos,
nroPedido: nroFinal,
fecha: new Date(),
impreso: false
};

// 4. Guardar en Pedidos
await db.collection('pedidos').insertOne(nuevoPedido);

// 5. Construir el TEXTO DEL TICKET (Aquí es donde salía el error)
// Usamos la variable nroFinal que definimos arriba, NO una propiedad del objeto
const textoParaImprimir =
`--------------------------\n` +
`🍦 NUEVO PEDIDO #${nroFinal}\n` +
`--------------------------\n` +
`Cliente: ${cliente}\n` +
`Pago: ${pago}\n` +
`--------------------------\n` +
`Total: $${total}\n`;

// 6. Enviar a la cola de impresión
await db.collection('tickets_pendientes').insertOne({
texto: textoParaImprimir,
tipo: 'PEDIDO',
impreso: false,
fecha: new Date()
});

console.log(`✅ EXITO: Pedido #${nroFinal} procesado.`);
res.status(200).json({ success: true, nro: nroFinal });

} catch (error) {
console.error("❌ ERROR CRITICO:", error);
res.status(500).json({ success: false, mensaje: error.message });
}
});



///---------
/*app.post('/api/confirmar-pedido', async (req, res) => {
try {
const datos = req.body;

// 1. Lógica ultra-segura para el número de pedido
const cantidadPedidos = await db.collection('pedidos').countDocuments();
// Si no hay pedidos, empezamos en 1. Si hay, sumamos 1.
const nroPedido = (cantidadPedidos || 0) + 1;

// 2. Preparamos el objeto con valores por defecto por si el frontend no los envía
const nuevoPedido = {
cliente: datos.cliente || "Cliente Anónimo",
direccion: datos.direccion || "Retira en Local",
telefono: datos.telefono || "-",
comentario: datos.comentario || "-",
pago: datos.pago || "EFECTIVO",
total: datos.total || 0,
items: datos.items || [],
nroPedido: nroPedido,
fecha: new Date(),
impreso: false
};

await db.collection('pedidos').insertOne(nuevoPedido);

// 3. Formateamos el ticket para el agente (Usando nroPedido directamente)
const textoTicket = `--------------------------\n` +
`🍦 NUEVO PEDIDO #${nroPedido}\n` +
`--------------------------\n` +
`Cliente: ${nuevoPedido.cliente}\n` +
`Dirección: ${nuevoPedido.direccion}\n` +
`Teléfono: ${nuevoPedido.telefono}\n` +
`Pago: ${nuevoPedido.pago}\n` +
`--------------------------\n` +
`Total: $${nuevoPedido.total}\n`;

await db.collection('tickets_pendientes').insertOne({
texto: textoTicket,
tipo: 'PEDIDO',
impreso: false,
fecha: new Date()
});

console.log(`✅ Pedido #${nroPedido} guardado correctamente.`);
res.status(200).json({ success: true, nro: nroPedido });

} catch (error) {
console.error("❌ Error en confirmar-pedido:", error);
res.status(500).json({ success: false, error: error.message });
}
});


////-------
/*app.post('/api/confirmar-pedido', async (req, res) => {
try {
const datos = req.body;

// Contamos cuántos pedidos hay para generar el siguiente número (Ej: 7)
const cantidadPedidos = await db.collection('pedidos').countDocuments();
const nroPedido = cantidadPedidos + 1;

// Guardamos el pedido con su número simple
const nuevoPedido = {
...datos,
nroPedido: nroPedido,
fecha: new Date(),
impreso: false,
pago: datos.pago || 'pendiente'
};

const result = await db.collection('pedidos').insertOne(nuevoPedido);

// Creamos el ticket para el agente.js con el número #7
await db.collection('tickets_pendientes').insertOne({
texto: `--------------------------\n` +
`🍦 NUEVO PEDIDO #${nroPedido}\n` +
`--------------------------\n` +
`Cliente: ${datos.cliente || 'Sin nombre'}\n` +
`Dirección: ${datos.direccion || 'No especificada'}\n` +
`Teléfono: ${datos.telefono || '-'}\n` +
`Pago: ${datos.pago || 'EFECTIVO'}\n` +
`--------------------------\n` +
`Total: $${datos.total}\n`,
tipo: 'PEDIDO',
impreso: false,
fecha: new Date()
});

console.log(`✅ Pedido #${nroPedido} registrado y enviado a impresión.`);
res.status(200).json({ success: true, nro: nroPedido });

} catch (error) {
console.error("❌ Error al procesar pedido:", error);
res.status(500).json({ success: false });
}
});*/

// --- 5. RUTAS DE PEDIDOS ---
app.get('/api/pedidos', async (req, res) => {
try {
// Los traemos ordenados por el número de pedido
const pedidos = await db.collection('pedidos').find().sort({ nroPedido: -1 }).toArray();
res.json(pedidos);
} catch (err) {
res.status(500).json({ error: "Error al obtener pedidos" });
}
});

app.patch('/api/pedidos/:id/estado', async (req, res) => {
const { id } = req.params;
const { campo, valor } = req.body;
try {
// Intentamos actualizar por ID de MongoDB o por nroPedido
const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { nroPedido: parseInt(id) };
await db.collection('pedidos').updateOne(query, { $set: { [campo]: valor } });
res.json({ success: true });
} catch (error) {
res.status(500).json({ mensaje: "Error al actualizar" });
}
});



// --- '''''''''''''''''''''''''''6. API DE PRODUCTOS ---
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
// --- 7. POLLING PARA EL AGENTE DE IMPRESIÓN (CORREGIDO) ---
app.get('/api/proximo-ticket', async (req, res) => {
try {
// En lugar de buscar en tickets_pendientes, buscamos directamente en pedidos
// que todavía no hayan sido impresos.
const pedido = await db.collection('pedidos')
.findOne({ impreso: false }, { sort: { fecha: 1 } });

if (pedido) {
// Lo marcamos como impreso para que no se repita
await db.collection('pedidos').updateOne(
{ _id: pedido._id },
{ $set: { impreso: true } }
);

// Enviamos el pedido completo (con nroPedido, cliente, items, etc.)
res.json(pedido);
} else {
res.status(204).send();
}
} catch (err) {
res.status(500).json({ error: "Error en polling" });
}
});

//-----------------------------------
/*-app.get('/api/proximo-ticket', async (req, res) => {
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
});*/
///////////////////
// --- 3. API DE PRODUCTOS (Lo que usa productos.html) ---
app.get('/api/admin/productos', async (req, res) => {
try {
const productos = await db.collection('productos').find().toArray();
res.json(productos);
} catch (err) {
res.status(500).json({ error: "Error al obtener productos" });
}
});

async function crearProducto() {
const title = document.getElementById('new-title').value;
const price = document.getElementById('new-price').value;
const stock = document.getElementById('new-stock').value;

const res = await fetch('/api/admin/nuevo-producto', {
method: 'POST',
headers: {'Content-Type': 'application/json'},
body: JSON.stringify({ title, price, stock })
});

if (res.ok) {
alert("¡Helado creado con éxito!");
location.reload(); // Recarga para ver el nuevo producto en la tabla
}
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Motor Eustakio corriendo en puerto ${PORT}`);
});