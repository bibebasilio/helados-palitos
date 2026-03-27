const axios = require('axios');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const usb = require('usb');

// Parche USB para evitar errores de eventos
if (usb && usb.on === undefined) { usb.on = function() { return this; }; }

const VENDOR_ID = 0x1FC9;
const PRODUCT_ID = 0x2016;
const URL_RENDER = "https://helados-palitos.onrender.com";

// Memoria temporal para evitar doble impresión
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

// --- FORMATEO DE NÚMERO A 3 DÍGITOS (001, 010, 100) ---
const nroOriginal = pedido.idPedido || '0';
const nroFormateado = String(nroOriginal).padStart(3, '0');

console.log(`🖨️ Imprimiendo Orden #${nroFormateado}...`);

printer
.font('a')
.align('ct')
.style('b')
.size(1, 1)
.text('HELADOS EUSTAKIO') // Nombre de tu heladería
.size(2, 2) // Número más grande
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

(pedido.items || []).forEach(item => {
// Limita el nombre del producto para que no se amontone
const nombreProd = item.title.substring(0, 20);
printer.text(`${item.cantidad}x ${nombreProd}`);
});

printer
.text('--------------------------------')
.align('ct')
.style('b')
.size(1, 1)
.text(`TOTAL: ${pedido.total}`)
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
const res = await axios.get(`${URL_RENDER}/api/pedidos/pendientes`);
const pendientes = res.data;

for (const p of pendientes) {
const id = p.idPedido;
if (procesandoAhora.has(id)) continue;

procesandoAhora.add(id);
const exito = await imprimirTicket(p);

if (exito) {
// Avisamos a la nube que ya se imprimió
await axios.post(`${URL_RENDER}/api/pedidos/marcar-impreso/${id}`);
console.log(`✅ Pedido #${id} finalizado en impresora.`);
}
procesandoAhora.delete(id);
}
} catch (e) {
// Silenciamos el log de "buscando conexión" para no llenar la terminal
}
}

console.log(">>> AGENTE DE IMPRESIÓN ACTIVO <<<"); console.log("Conectado a: " + URL_RENDER);

// Revisa cada 10 segundos para ser un poquito más rápido
setInterval(revisarPedidos, 10000);