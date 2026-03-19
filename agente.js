/*El problema principal es que estás intentando usar GitHub Pages (bibebasilio.github.io) como si fuera un servidor de aplicaciones, pero GitHub Pages solo sirve archivos estáticos (HTML, CSS, JS de navegador). No puede ejecutar código de Node.js, no tiene una base de datos dinámica y no puede procesar los POST que envía tu script.

Para que esto funcione, el URL_SERVIDOR debe ser la dirección de tu Backend real (donde tienes el código de Express corriendo), por ejemplo en Render, Railway o un VPS.

Aquí tienes el archivo corregido y con una mejora crítica: la detección de la impresora por hardware, ya que antes mencionaste que tenías un VID/PID específico.

Agente Local Corregido (agente.js)
JavaScript8*/
const axios = require('axios');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// --- CONFIGURACIÓN ---
// IMPORTANTE: Esta URL NO puede ser la de GitHub Pages. 
// Debe ser la de tu servidor backend real (ej: https://tu-app.onrender.com)
const URL_SERVIDOR = "https://helados-palitos.onrender.com"

// Aquí ponemos los datos de tu impresora que mencionaste anteriormente
const vendorId = 0x1FC9; 
const productId = 0x2016;

async function imprimirTicket(pedido) {
    // Intentamos encontrar la impresora por sus IDs de hardware
    const device = new escpos.USB(vendorId, productId);
    const printer = new escpos.Printer(device);

    device.open(function(error) {
        if (error) {
            console.error("No se pudo abrir la impresora térmica:", error.message);
            return;
        }

        console.log(`Imprimiendo pedido #${pedido.id}...`);

        printer
            .font('a')
            .align('ct')
            .style('bu')
            .size(1, 1)
            .text('TIENDA HELADOS')
            .text('ORDEN DE PEDIDO')
            .text(`Nro: ${pedido.id}`)
            .feed()
            .align('lt')
            .text(`Cliente: ${pedido.nombre || 'Sin nombre'}`)
            .text(`WhatsApp: ${pedido.telefono || 'Sin tel'}`)
            .hr();

        // Validamos que existan productos antes de recorrer
        if (pedido.productos && Array.isArray(pedido.productos)) {
            pedido.productos.forEach(item => {
                printer.text(`${item.cantidad}x ${item.nombre} - $${item.precio}`);
            });
        }

        printer
            .hr()
            .text(`TOTAL: $${pedido.total}`)
            .feed(3)
            .cut()
            .close();
        
        console.log("Impresión finalizada.");
    });
}

async function revisarPedidos() {
    try {
        console.log("Consultando servidor por nuevos pedidos...");
        
        // El servidor debe responder con un Array de pedidos pendientes
        const response = await axios.get(`${"https://helados-palitos.onrender.com"}/api/pedidos/pendientes`);
        const pedidosNuevos = response.data;

        if (Array.isArray(pedidosNuevos) && pedidosNuevos.length > 0) {
            console.log(`Se encontraron ${pedidosNuevos.length} pedidos nuevos.`);
            
            for (const pedido of pedidosNuevos) {
                // Imprimimos
                await imprimirTicket(pedido);
                
                // Avisamos al servidor para que cambie el estado a 'impreso: true'
                await axios.post(`${"https://helados-palitos.onrender.com"}/api/pedidos/marcar-impreso/${pedido.id}`);
            }
        } else {
            console.log("No hay pedidos pendientes.");
        }
    } catch (error) {
        if (error.response) {
            console.error("Error del servidor:", error.response.status);
        } else {
            console.error("Error de red/conexión:", error.message);
        }
    }
}

// Ejecutar cada 20 segundos para no saturar
setInterval(revisarPedidos, 20000);
console.log(">>> Agente de impresión activo <<<");
console.log(`Conectado a: ${"https://helados-palitos.onrender.com"}`);