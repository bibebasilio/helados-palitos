// --- Configuración y Variables Globales ---
const cuponesValidos = {
    PROMO10: 0.1,
    BIENVENIDA: 0.15,
    VERANO26: 0.2,
    BLACKFRIDAY: 0.25,
};

document.addEventListener("DOMContentLoaded", () => {
    cargarProductosCarrito();

    // Eventos para inputs
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

// --- Funciones Principales ---

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
            tabla.innerHTML += `
            <tr>
                <td><button id="${producto.id}" class="remove-btn"><i class="far fa-times-circle"></i></button></td>
                <td><img src="${producto.image}" alt="${producto.title}" style="height: 60px;"></td>
                <td>${producto.title}</td>
                <td>${producto.category}</td>
                <td>${producto.stock}</td>
                <td>$${producto.price.toFixed(2)}</td>
                <td><input type="number" value="${producto.cantidad}" min="1" max="${producto.stock}" id="${producto.id}" class="cantidad-producto"></td>
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
            let carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
            carrito = carrito.filter((p) => String(p.id) !== String(boton.id));
            localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
            cargarProductosCarrito();
        };
    });

    document.querySelectorAll(".cantidad-producto").forEach((input) => {
        input.onchange = (e) => {
            let carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
            const producto = carrito.find((p) => String(p.id) === String(e.target.id));
            if (producto) {
                producto.cantidad = parseInt(e.target.value);
                localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
                actualizarTotales();
            }
        };
    });
}

function actualizarTotales() {
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
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
}

function validarFormulario() {
    const boton = document.getElementById("btn-finalizar");
    const faltantes = [];
    ["nombre", "direccion", "telefono"].forEach(id => {
        const el = document.getElementById(id);
        if (!el || el.value.trim() === "") faltantes.push(id);
    });
    const metodo = document.querySelector('input[name="metodo-pago"]:checked');
    if (!metodo) faltantes.push("Método de Pago");

    if (boton) {
        const esValido = faltantes.length === 0;
        boton.disabled = !esValido;
    }
    return faltantes;
}

async function enviarPedidoWhatsApp() {
    const boton = document.getElementById("btn-finalizar");
    const faltantes = validarFormulario();
    
    if (faltantes.length > 0) {
        return alert("Por favor, completa los campos: " + faltantes.join(", "));
    }

    boton.disabled = true;
    boton.innerText = "Procesando...";

    const nombre = document.getElementById("nombre").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    const finalTotalText = document.getElementById("final-total").innerText;
    const metodoPagoCheck = document.querySelector('input[name="metodo-pago"]:checked').value;
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];

    try {
        const response = await fetch("https://helados-palitos.onrender.com/api/confirmar-pedido", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: carrito,
                cliente: nombre,
                direccion: direccion,
                telefono: telefono,
                total: finalTotalText,
                impreso: false // Esto activa el agente de impresión
            }),
        });

        const resultado = await response.json();

        if (resultado.success) {
            alert("¡Pedido #" + String(resultado.nro).padStart(4, '0') + " confirmado!");
            localStorage.removeItem("carritoDeCompras");
            
            const texto = `*NUEVO PEDIDO #${resultado.nro}* %0ACliente: ${nombre} %0ATotal: ${finalTotalText}`;
            window.open(`https://wa.me/5491138461130?text=${texto}`, "_blank");
            window.location.href = "index.html";
        } else {
            throw new Error(resultado.mensaje);
        }
    } catch (err) {
        alert("Error: " + err.message);
        boton.disabled = false;
        boton.innerText = "Finalizar Pedido";
    }
}