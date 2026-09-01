// --- CONFIGURACIÓN ---
const cuponesValidos = { PROMO10: 0.1, BIENVENIDA: 0.15, VERANO26: 0.2, BLACKFRIDAY: 0.25 };

document.addEventListener("DOMContentLoaded", () => {
    cargarProductosCarrito();
    
    // Listeners de inputs y radio buttons
    ["nombre", "direccion", "telefono"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", validarFormulario);
    });
    document.querySelectorAll('input[name="metodo-pago"]').forEach(radio => {
        radio.addEventListener("change", () => { recalcularTodo(); validarFormulario(); });
    });
    document.getElementById("coupon-input")?.addEventListener("input", () => { recalcularTodo(); validarFormulario(); });
    
    // Botón Finalizar
    document.getElementById("btn-finalizar")?.addEventListener("click", enviarPedidoWhatsApp);
});

// --- LÓGICA DE VALIDACIÓN ---
function validarFormulario() {
    const campos = ["nombre", "direccion", "telefono"];
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');
    const finalTotalEl = document.getElementById("final-total");
    const valorFinalNum = parseFloat(finalTotalEl?.innerText.replace(/[^0-9.]/g, "")) || 0;
    const boton = document.getElementById("btn-finalizar");
    const mensajeError = document.getElementById("mensaje-validacion");
    
    let faltantes = [];

    // Validar campos de texto
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
            el.style.border = "2px solid #ff4d4d"; // Rojo
            faltantes.push(id);
        } else {
            el.style.border = "1px solid #ccc"; // Normal
        }
    });

    // Validar Pago
    if (!metodoPago) faltantes.push("Método de Pago");

    // Validar Productos
    if (valorFinalNum <= 0) faltantes.push("Productos");

    const esValido = faltantes.length === 0;
    
    if (boton) {
        boton.disabled = !esValido;
        boton.style.opacity = esValido ? "1" : "0.5";
        boton.style.cursor = esValido ? "pointer" : "not-allowed";
    }

    if (mensajeError) {
        mensajeError.style.display = "block";
        mensajeError.innerText = esValido ? "✓ Todo listo" : "Falta completar: " + faltantes.join(", ");
        mensajeError.style.color = esValido ? "green" : "#ff4d4d";
    }

    return faltantes;
}

// --- LÓGICA DE CÁLCULOS ---
function recalcularTodo() {
    const totalBase = parseFloat(document.getElementById("total")?.innerText.replace(/[^0-9.]/g, "")) || 0;
    const cuponInput = document.getElementById("coupon-input")?.value.trim().toUpperCase() || "";
    const metodoPagoCheck = document.querySelector('input[name="metodo-pago"]:checked');
    const metodoPago = metodoPagoCheck?.value;

    let descCupon = (cuponesValidos[cuponInput] || 0) * totalBase;
    let descEfectivo = metodoPago === "efectivo" ? totalBase * 0.1 : 0;
    let costoEnvio = (metodoPago === "efectivo" || !metodoPago) ? 0 : totalBase * 0.23;

    document.getElementById("des-cupon") && (document.getElementById("des-cupon").innerText = `-$${descCupon.toFixed(2)}`);
    document.getElementById("des-efectivo") && (document.getElementById("des-efectivo").innerText = `-$${descEfectivo.toFixed(2)}`);
    document.getElementById("shipping-cost") && (document.getElementById("shipping-cost").innerText = `$${costoEnvio.toFixed(2)}`);

    const final = totalBase - descCupon - descEfectivo + costoEnvio;
    if (document.getElementById("final-total")) document.getElementById("final-total").innerText = `$${final.toFixed(2)}`;
}

function actualizarTotales() {
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
    let subtotalGeneral = 0;
    document.querySelectorAll("#tabla_carrito tr").forEach((fila) => {
        const input = fila.querySelector(".cantidad-producto");
        if (input) {
            const p = carrito.find(item => String(item._id || item.id) === String(input.id));
            if (p) {
                p.cantidad = parseInt(input.value) || 1;
                const subFila = p.price * p.cantidad;
                subtotalGeneral += subFila;
                if (fila.cells[7]) fila.cells[7].textContent = `$${subFila.toFixed(2)}`;
            }
        }
    });
    localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
    document.querySelectorAll("#total").forEach(el => el.innerText = subtotalGeneral.toFixed(2));
    recalcularTodo();
    validarFormulario();
}

function cargarProductosCarrito() {
     const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
    const tabla = document.querySelector("#tabla_carrito");
    if (!tabla) return;

    tabla.innerHTML = "";
    let subtotalCalculado = 0;

    if (carrito.length === 0) {
        tabla.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Tu carrito está vacío.</td></tr>';
    } else {
        carrito.forEach((producto) => {
            const sub = producto.price * producto.cantidad;
            subtotalCalculado += sub;
            const idReal = producto._id || producto.id;

            tabla.innerHTML += `
            <tr>
                <td><button id="${idReal}" class="remove-btn"><i class="far fa-times-circle"></i></button></td>
                <td><img src="${producto.image}" alt="${producto.title}" style="height: 60px;"></td>
                <td>${producto.title}</td>
                <td>${producto.category}</td>
                <td>${producto.stock}</td>
                <td>$${producto.price.toFixed(2)}</td>
                <td><input type="number" value="${producto.cantidad}" min="1" max="${producto.stock}" id="${idReal}"
                        class="cantidad-producto"></td>
                <td>$${sub.toFixed(2)}</td>
            </tr>`;
        });
    }

    actualizarTotalCarrito(subtotalCalculado);
    eventosFila();
    recalcularTodo();




    // ... (Tu función original de carga de HTML, solo asegúrate de llamar a actualizarTotales() al final)
   // actualizarTotales();
    //eventosFila();
}

function eventosFila() {
    document.querySelectorAll(".remove-btn").forEach(btn => btn.onclick = () => {
        let c = JSON.parse(localStorage.getItem("carritoDeCompras") || "[]");
        c = c.filter(p => String(p._id || p.id) !== String(btn.id));
        localStorage.setItem("carritoDeCompras", JSON.stringify(c));
        cargarProductosCarrito();
    });
    document.querySelectorAll(".cantidad-producto").forEach(input => input.oninput = actualizarTotales);
}

// --- WHATSAPP (MANTEN TU FUNCIÓN ACTUAL AQUÍ) ---
async function enviarPedidoWhatsApp() {
    const faltantes = validarFormulario();
    if (faltantes.length > 0) return alert("Falta completar: " + faltantes.join(", "));// Se detiene si falta algo
    
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
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];

    // ... (El resto de tu lógica de fetch y WhatsApp)
      try {
        // Cambiado a la URL local (http://localhost:3000) para pruebas en tu entorno de desarrollo
        const servidorBase = "http://localhost:3000";

        // 1. Enviamos el pedido a la base de datos
        const responsePedido = await fetch(`${servidorBase}/api/confirmar-pedido`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: carrito,
                cliente: nombre,
                direccion: direccion,
                telefono: telefono,
                subtotal,
                descCupon,
                descEfectivo,
                costoEnvio,
                total: finalTotalText,
                pago: "pendiente",
                enviado: "pendiente",
                entregado: "pendiente",
                cancelado: "No",
                impreso: false
            }),
        });

        const resultadoPedido = await responsePedido.json();

        if (resultadoPedido.success) {
            
            // 2. NUEVO PASO: Hacemos el descuento del Stock en MongoDB Atlas
            console.log("Descontando stock en MongoDB...");
            const responseStock = await fetch(`${servidorBase}/api/productos/restar-stock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: carrito })
            });

            const resultadoStock = await responseStock.json();
            if (!resultadoStock.success) {
                console.warn("Advertencia: El pedido se guardó pero no se pudo actualizar el stock.");
            }

            // 3. Flujo original de WhatsApp
            const nroParaWhatsApp = String(resultadoPedido.nro).padStart(4, '0');   
            let productosTexto = carrito.map(p => `• ${p.title} ${p.category} (x${p.cantidad})`).join('\n');
                
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
            localStorage.removeItem("carritoDeCompras");
            window.open(urlWA, "_blank");
            window.location.href = "index.html";
        } else {
            alert("Error al procesar el pedido: " + resultadoPedido.mensaje);
        }
    } catch (err) {
        console.error("Error en la conexión:", err);
        alert("Error de conexión con el servidor Eustakio.");
    }
    
    
   
}
/*¿Por qué esto debería funcionar ahora?
Limpieza: Eliminé las funciones repetidas y los bloques comentados que causaban errores de sintaxis (como ese node suelto en tu código).

Validación Robusta: El validarFormulario() ahora se llama en cada paso. Si el usuario no ha seleccionado método de pago, faltantes contendrá "Método de Pago", el botón se pondrá .disabled = true y el mensaje de error aparecerá en rojo.

Botón: Al seleccionar el método de pago, el evento change dispara validarFormulario(), que recalcula faltantes. Al estar vacío, boton.disabled pasa a false automáticamente.

Flujo: Asegúrate de que tu botón en el HTML no tenga un atributo disabled inicial, o que sea disabled por defecto en el HTML.*/