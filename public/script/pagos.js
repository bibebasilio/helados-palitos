// Configuración
const WHATSAPP_NUMBER = "54911385461130";

function finalizarCompra() {
// 1. Obtener datos del formulario (debes tener estos IDs en tu HTML)
const nombre = document.getElementById('nombre').value;
const apellido = document.getElementById('apellido').value;

if (!nombre || !apellido) {
alert("Por favor, completa tu nombre y apellido.");
return;
}

// 2. Generar número de pedido único
const nroPedido = Math.floor(Math.random() * 1000000);

// 3. Formatear los productos del carrito
// Supongamos que tu carrito es un array llamado 'carritoArticulos'
let mensajeProductos = "";
carritoArticulos.forEach(producto => {
mensajeProductos += `- ${producto.titulo} (Cant: ${producto.cantidad}) \n`;
});

// 4. Calcular Total
const total = calcularTotal(); // Tu función que suma los precios

// 5. Construir el mensaje para WhatsApp
const mensajeWhatsApp = `Hola! Mi nombre es ${nombre} ${apellido}.
*Pedido Nro:* #${nroPedido}
*Detalle:*
${mensajeProductos}
*Total:* $${total}

_Aguardo instrucciones para realizar el pago seguro._`;

// 6. Codificar URL y redireccionar
const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensajeWhatsApp)}`;

// Abrir WhatsApp en una nueva pestaña
window.open(urlWhatsApp, '_blank');
}