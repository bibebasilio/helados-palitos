// --- CONFIGURACIÓN Y SELECTORES ---
const bar = document.getElementById("bar");
const nav = document.getElementById("navbar");
const cerrar = document.getElementById("close");

const cuponesValidos = {
    PROMO10: 0.1,
    BIENVENIDA: 0.15,
    VERANO26: 0.2,
    BLACKFRIDAY: 0.25,
};

// --- EVENTOS DE NAVEGACIÓN ---
if (bar) bar.addEventListener("click", () => nav.classList.add("active"));
if (cerrar) cerrar.addEventListener("click", (e) => {
    e.preventDefault();
    nav.classList.remove("active");
});

// --- LÓGICA DE VALIDACIÓN ---
///////////////////////////
    function validarFormulario() {
    // Definimos los campos obligatorios y sus IDs
    const campos = [
        { id: "nombre", nombre: "Nombre" },
        { id: "direccion", nombre: "Dirección" },
        { id: "telefono", nombre: "Teléfono" }
    ];

    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');
    const finalTotalEl = document.getElementById("final-total");
    const valorFinalNum = parseFloat(finalTotalEl?.innerText.replace(/[^0-9.]/g, "")) || 0;

    const boton = document.getElementById("btn-finalizar");
    const mensajeError = document.getElementById("mensaje-validacion");

    const faltantes = [];

    // Validamos campos de texto
    campos.forEach(campo => {
        const el = document.getElementById(campo.id);
        if (!el.value.trim()) {
            faltantes.push(campo.nombre);
            el.classList.toggle("input-error", !el.value.trim());
        } else {
            el.style.border = "1px solid #ccc";    // Borde normal
        }
    });
    // Validar método de pago (resaltamos el contenedor si existe)
    const contenedorPago = document.querySelector('.metodo-pago-container'); // Asegúrate de tener esta clase o ajusta el selector
    if (!metodoPago) {
        faltantes.push("Método de Pago");
        if(contenedorPago) contenedorPago.style.color = "#ff4d4d";
    } else if(contenedorPago) {
        contenedorPago.style.color = "inherit";
    }

    if (valorFinalNum <= 0) faltantes.push("Productos en el carrito");

    // Actualizar botón y mensaje
    if (boton) {
        const esValido = faltantes.length === 0;
        boton.disabled = !esValido;
        boton.style.opacity = esValido ? "1" : "0.5";
        
        if (mensajeError) {
            mensajeError.style.display = "block";
            mensajeError.innerText = esValido ? "✓ Todo listo" : "Falta completar: " + faltantes.join(", ");
            mensajeError.style.color = esValido ? "green" : "#ff4d4d";
        }
    }
    return faltantes;
}

/////////////////////////////////////
/*function validarFormulario() {
    const nombre = document.getElementById("nombre")?.value.trim() || "";
    const direccion = document.getElementById("direccion")?.value.trim() || "";
    const telefono = document.getElementById("telefono")?.value.trim() || "";
    // const comentario = document.getElementById("comentario")?.value.trim() || ""; // Nota: ¿es obligatorio? Si no, quítalo de la validación
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');
    
    // Obtenemos el total, limpiando símbolos para evitar errores de NaN
    const finalTotalEl = document.getElementById("final-total");
    const valorFinalNum = parseFloat(finalTotalEl?.innerText.replace(/[^0-9.]/g, "")) || 0;

    const boton = document.getElementById("btn-finalizar");
    const mensajeError = document.getElementById("mensaje-validacion");

    const faltantes = [];
    if (!nombre) faltantes.push("Nombre");
    if (!direccion) faltantes.push("Dirección");
    if (!telefono) faltantes.push("Teléfono");
    if (!metodoPago) faltantes.push("Método de Pago");
    if (valorFinalNum <= 0) faltantes.push("Productos en el carrito");
// Si comentario no es obligatorio, coméntalo o quita esta línea:
    //if (!comentario) faltantes.push("Comentario"); 

    if (boton) {
        const esValido = faltantes.length === 0;
        boton.disabled = !esValido;
        boton.style.opacity = esValido ? "1" : "0.5";
        boton.style.cursor = esValido ? "pointer" : "not-allowed";
        
        if (mensajeError) {
            mensajeError.style.display = "block";
            if (esValido) {
                mensajeError.innerText = "✓ Todo listo para finalizar";
                mensajeError.style.color = "green";
            } else {
                mensajeError.innerText = "Falta completar: " + faltantes.join(", ");
                mensajeError.style.color = "orange";
            }
        }
    }
    return faltantes;
}*/

// --- LÓGICA DE CÁLCULOS ---
function recalcularTodo() {
    const totalBase = parseFloat(document.getElementById("total")?.innerText.replace(/[^0-9.]/g, "")) || 0;
    const cuponInput = document.getElementById("coupon-input")?.value.trim().toUpperCase() || "";
    const metodoPagoCheck = document.querySelector('input[name="metodo-pago"]:checked');
    const metodoPago = metodoPagoCheck?.value;

    const displayDesCupon = document.getElementById("des-cupon");
    const displayDesEfectivo = document.getElementById("des-efectivo");

    let descCupon = (cuponesValidos[cuponInput] || 0) * totalBase;
    let descEfectivo = metodoPago === "efectivo" ? totalBase * 0.1 : 0;
    let costoEnvio = (metodoPago === "efectivo" || !metodoPago) ? 0 : totalBase * 0.23;

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

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    cargarProductosCarrito();

    // Eventos de cambios
    document.querySelectorAll('input[name="metodo-pago"]').forEach(radio => {
        radio.addEventListener("change", () => {
            recalcularTodo();
            validarFormulario();
        });
    });

    ["nombre", "direccion", "telefono", "comentario"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", validarFormulario);
    });

    document.getElementById("coupon-input")?.addEventListener("input", () => {
        recalcularTodo();
        validarFormulario();
    });

    const btnFinalizar = document.getElementById("btn-finalizar");
    if (btnFinalizar) btnFinalizar.onclick = enviarPedidoWhatsApp;
});

// --- FUNCIONES AUXILIARES (Tu lógica existente se mantiene igual) ---
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
    
}
////////
    function eventosFila() {
    // Manejo de eliminar producto
    document.querySelectorAll(".remove-btn").forEach((boton) => {
        boton.onclick = () => {
            let carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
            carrito = carrito.filter((p) => String(p._id || p.id) !== String(boton.id));
            localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
            cargarProductosCarrito();
        };
    });

    // Manejo de cambio de cantidad (usamos 'input' para respuesta instantánea)
    document.querySelectorAll(".cantidad-producto").forEach((input) => {
        input.oninput = () => {
            actualizarTotales();
        };
    });
}

//////////////////
/*function eventosFila() {
        document.querySelectorAll(".remove-btn").forEach((boton) => {
        boton.onclick = () => {
            let carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
            carrito = carrito.filter((p) => String(p._id || p.id) !== String(boton.id));
            localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
            cargarProductosCarrito();
        };
    });

    document.querySelectorAll(".cantidad-producto").forEach((input) => {
        input.onchange = (e) => {
            let carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
            const producto = carrito.find((p) => String(p._id || p.id) === String(e.target.id));
            if (producto) {
                producto.cantidad = parseInt(e.target.value);
                localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
                actualizarTotales();
            }
        };
    });
   
}*/
/*function actualizarTotales() { 
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
    let subtotal = 0;
    document.querySelectorAll("#tabla_carrito tr").forEach((fila) => {
        const input = fila.querySelector(".cantidad-producto");
        if (input) {
            const p = carrito.find((item) => String(item._id || item.id) === String(input.id));
            if (p) {
                const sub = p.price * p.cantidad;
                subtotal += sub;
                if (fila.cells[7]) fila.cells[7].textContent = `$${sub.toFixed(2)}`;
            }
        }
    });

    // Asegúrate de llamar a esto al cambiar cantidades
    actualizarTotalCarrito(); // Calcula subtotal
    recalcularTodo(); 
    validarFormulario();
}*/
//////////////////
    // --- LÓGICA DE ACTUALIZACIÓN ---

function actualizarTotales() {
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
    let subtotalGeneral = 0;
    
    // Iteramos sobre las filas para recalcular el subtotal
    document.querySelectorAll("#tabla_carrito tr").forEach((fila) => {
        const input = fila.querySelector(".cantidad-producto");
        if (input) {
            const producto = carrito.find((p) => String(p._id || p.id) === String(input.id));
            if (producto) {
                // Actualizamos la cantidad en el objeto del carrito
                producto.cantidad = parseInt(input.value) || 0;
                
                // Calculamos el subtotal de esta fila
                const subFila = producto.price * producto.cantidad;
                subtotalGeneral += subFila;
                
                // Actualizamos el texto en la celda correspondiente (índice 7)
                if (fila.cells[7]) {
                    fila.cells[7].textContent = `$${subFila.toFixed(2)}`;
                }
            }
        }
    });

    // Guardamos el estado actualizado en localStorage
    localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));

    // Actualizamos el DOM y recalculamos totales generales
    actualizarTotalCarrito(subtotalGeneral); 
    recalcularTodo(); 
    validarFormulario();
}

function actualizarTotalCarrito(subtotal) {
    // Si subtotal no llega, forzamos a 0
    const total = subtotal || 0;
    // Seleccionamos todos los elementos con id="total" y actualizamos
    document.querySelectorAll("#total").forEach((el) => {
        el.innerText = total.toFixed(2);
    });
}
////////////
/*function actualizarTotalCarrito(subtotal) {
      document.querySelectorAll("#total").forEach((el) => (el.innerText = subtotal.toFixed(2)));
    
}*/
///////////
async function enviarPedidoWhatsApp() {
     const faltantes = validarFormulario();
    if (faltantes.length > 0) {
        return alert("Falta completar: " + faltantes.join(", "));
    }

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
/*¿Qué se ha optimizado?
Independencia: recalcularTodo() y validarFormulario() ahora trabajan en orden pero sin llamarse una a la otra de forma redundante, eliminando el "bucle" que causaba que el total no se viera reflejado al instante.

Limpieza de datos: Se agregó .replace(/[^0-9.]/g, "") al leer los totales. Esto soluciona el error donde $100.00 no se podía convertir a número.

Orden de ejecución: Al cargar el DOM, primero se calcula todo y luego se valida, asegurando que el botón btn-finalizar arranque en el estado correcto (deshabilitado o habilitado) según si hay productos y campos completos.

¿Te funcionó correctamente con estos ajustes al probar la selección de pago?*/