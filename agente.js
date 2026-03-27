const usb = require('usb');
const axios = require('axios'); // Asegúrate de tener axios instalado
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// Parche USB para evitar errores
if (usb && usb.on === undefined) { usb.on = function() { return this; }; }

const VENDOR_ID = 0x1FC9;
const PRODUCT_ID = 0x2016;

// CAMBIO IMPORTANTE: Usamos localhost para tus pruebas actuales
const URL_SERVIDOR = "http://localhost:3000";

const procesandoAhora = new Set();

async function imprimirTicket(pedido) {
return new Promise((resolve) => {
try {
const device = new escpos.USB(VENDOR_ID, PRODUCT_ID);
const printer = new escpos.Printer(device);

device.open((error) => {
if (error) {
console.error("❌ Error Hardware:", error.message);
return resolve(false);
}

// --- AQUÍ ESTABA EL ERROR ---
// Cambiamos idPedido por nroPedido que es lo que manda el servidor
const nroOriginal = pedido.nroPedido || '0';
const nroFormateado = String(nroOriginal).padStart(3, '0');

console.log(`🖨️ Imprimiendo Orden #${nroFormateado}...`);

printer
.font('a')
.align('ct')
.style('b')
.size(1, 1)
.text('HELADOS EUSTAKIO')
.size(2, 2)
.text(`ORDEN: #${nroFormateado}`)
.size(1, 1)
.text('--------------------------------')
.align('lt')
.style('normal')
.size(0, 0)
.text(`Cliente: ${pedido.cliente || 'Mostrador'}`)
.text(`Direccion: ${pedido.direccion || 'N/A'}`)
.text(`Tel: ${pedido.telefono || 'N/A'}`)
.text('--------------------------------');

// Imprimir items
if (pedido.items && pedido.items.length > 0) {
pedido.items.forEach(item => {
const nombreProd = (item.title || 'Producto').substring(0, 20);
printer.text(`${item.cantidad || 1}x ${nombreProd}`);
});
}

printer
.text('--------------------------------')
.align('ct')
.style('b')
.size(1, 1)
.text(`TOTAL: $${pedido.total || 0}`)
.feed(3)
.cut()
.flush();

setTimeout(() => {
device.close();
resolve(true);
}, 2000);
});
} catch (e) {
console.error("❌ Error en impresión:", e.message);
resolve(false);
}
});
}

async function revisarPedidos() {
try {
// CAMBIO: La ruta correcta para el polling en tu index.js es /api/proximo-ticket
const res = await axios.get(`${URL_SERVIDOR}/api/proximo-ticket`);

if (res.status === 200 && res.data) {
const p = res.data;
//const idUnico = p._id; // Usamos el ID de MongoDB para no repetir

//if (procesandoAhora.has(idUnico)) return;

//procesandoAhora.add(idUnico);

// Si el ticket ya viene con texto armado del servidor, lo usamos
    // Si no, usamos la función de formateo
    
console.log("📥 Ticket recibido del servidor...");
const exito = await imprimirTicket(p);

if (exito) {
console.log(`✅ Ticket impreso con éxito.`);
}
//procesandoAhora.delete(idUnico);
}
} catch (e) {
// console.error("Error revisando pedidos:", e.message);
}
}

console.log(">>> AGENTE DE IMPRESIÓN ACTIVO <<<"); console.log("Conectado a: " + URL_SERVIDOR);

setInterval(revisarPedidos, 5000); // Revisar cada 5 segundos