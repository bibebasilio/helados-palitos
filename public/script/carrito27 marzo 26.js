const bar = document.getElementById("bar");
const nav = document.getElementById("navbar");
const cerrar = document.getElementById("close");

if (bar) {
bar.addEventListener("click", () => {
nav.classList.add("active");
});
}

if (cerrar) {
cerrar.addEventListener("click", (e) => {
e.preventDefault();
nav.classList.remove("active");
});
}

// 1. Configuración global
const cuponesValidos = {
PROMO10: 0.1,
BIENVENIDA: 0.15,
VERANO26: 0.2,
BLACKFRIDAY: 0.25,
};

// --- VALIDACIÓN DE BOTÓN Y MENSAJES ---
function validarFormulario() {
const nombre = document.getElementById("nombre")?.value.trim() || "";
const direccion = document.getElementById("direccion")?.value.trim() || "";
const telefono = document.getElementById("telefono")?.value.trim() || "";
const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');
const finalTotalText = document.getElementById("final-total")?.innerText || "0";
const valorFinalNum = parseFloat(finalTotalText.replace("$", "")) || 0;

const boton = document.getElementById("btn-finalizar");
const mensajeError = document.getElementById("mensaje-validacion");

let faltantes = [];

if (nombre === "") faltantes.push("Nombre");
if (direccion === "") faltantes.push("Dirección");
if (telefono === "") faltantes.push("Teléfono");
if (!metodoPago) faltantes.push("Método de Pago");
if (valorFinalNum <= 0) faltantes.push("Productos en el carrito"); if (boton) { const esValido=faltantes.length===0; //
    Solo modificamos si no está en proceso de envío if (boton.innerText !=="PROCESANDO..." ) { boton.disabled=!esValido;
    boton.style.opacity=esValido ? "1" : "0.5" ; boton.style.cursor=esValido ? "pointer" : "not-allowed" ; } if
    (mensajeError) { if (!esValido) { mensajeError.innerText="Falta completar: " + faltantes.join(", ");
                mensajeError.style.color = " orange"; mensajeError.style.display="block" ; } else {
    mensajeError.innerText="✓ Todo listo para finalizar" ; mensajeError.style.color="green" ; } } } return faltantes; }
    document.addEventListener("DOMContentLoaded", ()=> {
    cargarProductosCarrito();

    document.querySelectorAll('input[name="metodo-pago"]').forEach((radio) => {
    radio.addEventListener("change", () => {
    recalcularTodo();
    validarFormulario();
    });
    });

    ["nombre", "direccion", "telefono"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", validarFormulario);
    });
    });

    function cargarProductosCarrito() {
    // CAMBIO IMPORTANTE: Unificado a "carrito"
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const tabla = document.querySelector("#tabla_carrito");
    if (!tabla) return;

    tabla.innerHTML = "";
    let subtotalCalculado = 0;

    if (carrito.length === 0) {
    tabla.innerHTML = '<tr>
        <td colspan="8" style="text-align: center; padding: 20px;">Tu carrito está vacío.</td>
    </tr>';
    } else {
    carrito.forEach((producto) => {
    const sub = producto.price * producto.cantidad;
    subtotalCalculado += sub;
    tabla.innerHTML += `
    <tr>
        <td><button id="${producto.id}" class="remove-btn"><i class="far fa-times-circle"></i></button></td>
        <td><img src="${producto.image}" alt="${producto.title}" style="height: 60px;"></td>
        <td>${producto.title}</td>
        <td>${producto.category}</td>
        <td>${producto.stock}</td>
        <td>$${producto.price.toFixed(2)}</td>
        <td><input type="number" value="${producto.cantidad}" min="1" max="${producto.stock}" id="${producto.id}"
                class="cantidad-producto"></td>
        <td>$${sub.toFixed(2)}</td>
    </tr>`;
    });
    }

    actualizarTotalCarrito(subtotalCalculado);
    eventosFila();
    recalcularTodo();
    }

    function eventosFila() {
    document.querySelectorAll(".remove-btn").forEach((boton) => {
    boton.onclick = () => {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito = carrito.filter((p) => String(p.id) !== String(boton.id));
    localStorage.setItem("carrito", JSON.stringify(carrito));
    cargarProductosCarrito();
    };
    });

    document.querySelectorAll(".cantidad-producto").forEach((input) => {
    input.onchange = (e) => {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const producto = carrito.find((p) => String(p.id) === String(e.target.id));
    if (producto) {
    producto.cantidad = parseInt(e.target.value);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarTotales();
    }
    };
    });
    }

    function actualizarTotales() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let subtotal = 0;
    document.querySelectorAll("#tabla_carrito tr").forEach((fila) => {
    const input = fila.querySelector(".cantidad-producto");
    if (input) {
    const p = carrito.find((item) => String(item.id) === String(input.id));
    if (p) {
    const sub = p.price * p.cantidad;
    subtotal += sub;
    if (fila.cells[7]) fila.cells[7].textContent = `$${sub.toFixed(2)}`;
    }
    }
    });
    actualizarTotalCarrito(subtotal);
    recalcularTodo();
    }

    function actualizarTotalCarrito(subtotal) {
    document.querySelectorAll("#total").forEach((el) => (el.innerText = subtotal.toFixed(2)));
    }

    function recalcularTodo() {
    const totalBase = parseFloat(document.getElementById("total")?.innerText) || 0;
    const cuponInput = document.getElementById("coupon-input")?.value.trim().toUpperCase() || "";
    const metodoPagoCheck = document.querySelector('input[name="metodo-pago"]:checked');
    const metodoPago = metodoPagoCheck?.value;

    const displayDesCupon = document.getElementById("des-cupon");
    const displayDesEfectivo = document.getElementById("des-efectivo");

    let descCupon = (cuponesValidos[cuponInput] || 0) * totalBase;
    let descEfectivo = metodoPago === "efectivo" ? totalBase * 0.1 : 0;
    let costoEnvio = metodoPago === "efectivo" || !metodoPago ? 0 : totalBase * 0.23;

    if (displayDesCupon) {
    displayDesCupon.style.color = descCupon > 0 ? "red" : "";
    displayDesCupon.innerText = `-$${descCupon.toFixed(2)}`;
    }

    if (displayDesEfectivo) {
    displayDesEfectivo.style.color = descEfectivo > 0 ? "red" : "";
    displayDesEfectivo.innerText = `-$${descEfectivo.toFixed(2)}`;
    }

    const shippingEl = document.getElementById("shipping-cost");
    if (shippingEl) shippingEl.innerText = `$${costoEnvio.toFixed(2)}`;

    const final = totalBase - descCupon - descEfectivo + costoEnvio;
    const finalTotalEl = document.getElementById("final-total");
    if (finalTotalEl) finalTotalEl.innerText = `$${final.toFixed(2)}`;

    validarFormulario();
    }

    async function enviarPedidoWhatsApp() {
    const boton = document.getElementById("btn-finalizar");

    if (boton.disabled && boton.innerText === "PROCESANDO...") return;

    const faltantes = validarFormulario();
    if (faltantes.length > 0) {
    return alert("Falta completar: " + faltantes.join(", "));
    }

    boton.disabled = true;
    boton.innerText = "PROCESANDO...";
    boton.style.opacity = "0.5";

    const nombre = document.getElementById("nombre")?.value.trim();
    const direccion = document.getElementById("direccion")?.value.trim();
    const telefono = document.getElementById("telefono")?.value.trim();
    const comentario = document.getElementById("comentario")?.value.trim() || "Sin comentarios";
    const finalTotalText = document.getElementById("final-total")?.innerText || "$0";
    const subtotal = document.getElementById("total")?.innerText || "0";
    const descCupon = document.getElementById("des-cupon")?.innerText.replace("-$", "") || "0";
    const descEfectivo = document.getElementById("des-efectivo")?.innerText.replace("-$", "") || "0";
    const costoEnvio = document.getElementById("shipping-cost")?.innerText.replace("$", "") || "0";
    const metodoPagoCheck = document.querySelector('input[name="metodo-pago"]:checked');
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    try {
    const response = await fetch("/api/confirmar-pedido", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
    items: carrito,
    cliente: nombre,
    direccion: direccion,
    telefono: telefono,
    comentario: comentario,
    subtotal,
    descCupon,
    descEfectivo,
    costoEnvio,
    total: finalTotalText,
    pago: metodoPagoCheck.value,
    fecha: new Date(),
    impreso: false
    }),
    });

    const resultado = await response.json();

    if (resultado.success) {
    const nroParaWhatsApp = String(resultado.nro).padStart(3, '0');
    let productosTexto = carrito.map((p) => `• ${p.title} (x${p.cantidad})`).join("\n");

    const texto = `*--- NUEVO PEDIDO #${nroParaWhatsApp} ---*\n\n` +
    `*Cliente:* ${nombre}\n` +
    `*Dirección:* ${direccion}\n` +
    `*Teléfono:* ${telefono}\n` +
    `*Comentario:* ${comentario}\n` +
    `*Pago:* ${metodoPagoCheck.value.toUpperCase()}\n\n` +
    `*Productos:*\n${productosTexto}\n\n` +
    `*TOTAL:* ${finalTotalText}`;

    const urlWA = `https://wa.me/5491138461130?text=${encodeURIComponent(texto)}`;

    alert("¡Pedido #" + nroParaWhatsApp + " confirmado!");

    localStorage.removeItem("carrito");
    window.open(urlWA, "_blank");
    window.location.href = "index.html";
    } else {
    throw new Error(resultado.mensaje || "Error en el servidor");
    }
    } catch (err) {
    alert("Error: No se pudo conectar con el servidor Eustakio.");
    boton.disabled = false;
    boton.innerText = "FINALIZAR COMPRA";
    boton.style.opacity = "1";
    }
    }