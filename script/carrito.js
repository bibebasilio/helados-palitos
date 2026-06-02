// --- CONFIGURACIÓN Y EVENTOS ---
const cuponesValidos = { PROMO10: 0.1, BIENVENIDA: 0.15, VERANO26: 0.2, BLACKFRIDAY: 0.25 };

document.addEventListener("DOMContentLoaded", () => {
    cargarProductosCarrito();
        

    // Eventos de navegación
    const bar = document.getElementById("bar");
    const nav = document.getElementById("navbar");
    const cerrar = document.getElementById("close");
   
   
    if (bar) bar.addEventListener("click", () => nav.classList.add("active"));
    if (cerrar) cerrar.addEventListener("click", (e) => { e.preventDefault(); nav.classList.remove("active"); });

    // Eventos de formulario
    ["nombre", "direccion", "telefono"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", validarFormulario);
    });

    document.querySelectorAll('input[name="metodo-pago"]').forEach(radio => {
        radio.addEventListener("change", () => {
            recalcularTodo();
            validarFormulario();
        });
    });
});

// --- VALIDACIÓN ---
function validarFormulario() {
    const boton = document.getElementById("btn-finalizar");
    const faltantes = [];
    ["nombre", "direccion", "telefono"].forEach(id => {
        const el = document.getElementById(id);
        if (!el || el.value.trim() === "") faltantes.push(id);
    });
    // Validar Método Pago
    if (!document.querySelector('input[name="metodo-pago"]:checked')) faltantes.push("Método de Pago");
    
 // Validar Carrito
    const totalEl = document.getElementById("final-total");
    const total = parseFloat(totalEl?.innerText.replace(/[^0-9.]/g, "")) || 0;
    if (total <= 0) faltantes.push("Carrito vacío");


     // Aplicar estado al botón
    if (boton) {
        const esValido = faltantes.length === 0;
        boton.disabled = !esValido;
        boton.style.backgroundColor = esValido ? "#25d366" : "#ccc";
    }
    return faltantes;
}

// --- LÓGICA DE CARRITO (Simplificada) ---
function cargarProductosCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
    const tabla = document.querySelector("#tabla_carrito");
    if (!tabla) return;

    tabla.innerHTML = "";
    let subtotal = 0;

    carrito.forEach(p => {
        subtotal += p.price * p.cantidad;
        tabla.innerHTML += `<tr>
            <td><button id="${p.id}" class="remove-btn"><i class="far fa-times-circle"></i></button></td>
            <td><img src="${p.image}" style="height: 60px;"></td>
            <td>${p.title}</td><td>${p.category}</td><td>${p.stock}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td><input type="number" value="${p.cantidad}" class="cantidad-producto" id="${p.id}"></td>
            <td>$${(p.price * p.cantidad).toFixed(2)}</td>
        </tr>`;
    });
    eventosFila();
    recalcularTodo();
}

function eventosFila() {
    document.querySelectorAll(".remove-btn").forEach(btn => btn.onclick = () => {
        let carrito = JSON.parse(localStorage.getItem("carritoDeCompras") || "[]");
        carrito = carrito.filter(p => String(p.id) !== String(btn.id));
        localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
        cargarProductosCarrito();
    });
    
    document.querySelectorAll(".cantidad-producto").forEach(input => input.onchange = (e) => {
        let carrito = JSON.parse(localStorage.getItem("carritoDeCompras") || "[]");
        let p = carrito.find(p => String(p.id) === String(e.target.id));
        if (p) {
            p.cantidad = parseInt(e.target.value); localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
            cargarProductosCarrito();
        }
    });
}

function recalcularTodo() {
    // Lógica de totales que ya tenías (se mantiene igual)
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras") || "[]");
    let subtotal = carrito.reduce((sum, p) => sum + (p.price * p.cantidad), 0);
    document.querySelectorAll("#total").forEach(el => el.innerText = `$${subtotal.toFixed(2)}`);
    // ... (mantén tu lógica de descuentos y envío aquí)
    onst totalBase = parseFloat(document.getElementById("total")?.innerText) || 0;
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








// --- ENVÍO WHATSAPP ---
async function enviarPedidoWhatsApp() {
    // 1. Buscamos el elemneto dom justo cuanod se necesita
    const boton = document.getElementById("btn-finalizar");

    // 2. validamos ue le boton realmente exista para evitar errors
    if (!boton) {
        console.error("El botón de finalizar no existe");
        return;
    }

    const faltantes = validarFormulario();
    if (faltantes.length > 0) {
        return alert("Por favor, completa los campos faltantes: " + faltantes.join(", "));
    }

    // 3. ahora si podemos usar la variable 'boton' localmente
    boton.disabled = true;
    boton.innerText = "Procesando...";

    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras") || "[]");
   // const nombre = document.getElementById("nombre").value;
    // ... (recoge el resto de los datos igual que antes)
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

   // Dentro de enviarPedidoWhatsApp, antes del try:
/*console.log("Enviando datos a:", "https://helados-palitos.onrender.com/api/confirmar-pedido");

try {
    const response = await fetch("https://helados-palitos.onrender.com/api/confirmar-pedido", {
        // ... opciones
    });
    console.log("Respuesta recibida:", response.status); // <--- MIRA ESTO
    // ...
} catch (err) {
    console.error("Error capturado:", err); // <--- MIRA ESTO
}*/
    try {
        const response = await fetch("https://helados-palitos.onrender.com/api/confirmar-pedido", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: carrito,
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
            impreso: false })
        });
        
        const resultado = await response.json();
        if (resultado.success) {
             //const nroReal = resultado.id;
            const nroParaWhatsApp = String(resultado.nro).padStart(4, '0');   
            
        // let productosTexto = carrito.map((p) => `• ${p.title} (x${p.cantidad})`).join("\n");
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
                  // ... (lógica de apertura de WhatsApp)
            window.location.href = "index.html";
        } else {
            alert("Error: " + resultado.mensaje);
            boton.disabled = false; // Reactivar si falla
            boton.innerText = "Finalizar Pedido";
        }
    } catch (err) {
            alert("Error de conexión");
            boton.disabled = false;
            boton.innerText = "Finalizar Pedido y Pagar por WhatsApp";
    }
}