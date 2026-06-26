const bar = document.getElementById("bar");
const nav = document.getElementById("navbar");
const cerrar = document.getElementById("close");



// 1. Configuración global
const cuponesValidos = {
PROMO10: 0.1,
BIENVENIDA: 0.15,
VERANO26: 0.2,
BLACKFRIDAY: 0.25,
};
// --- LÓGICA DE VALIDACIÓN ---
function validarFormulario() {
    // Definimos los campos obligatorios y sus IDs
    const campos = [
        { id: "nombre", nombre: "Nombre" },
        { id: "direccion", nombre: "Dirección" },
        { id: "telefono", nombre: "Teléfono" }
    ];

    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');
    const finalTotalEl = document.getElementById("final-total");
    const valorFinalNum = Number.parseFloat(finalTotalEl?.innerText.replaceAll(/[^0-9.]/g, "")) || 0;

    const boton = document.getElementById("btn-finalizar");
    const mensajeError = document.getElementById("mensaje-validacion");

    const faltantes = [];

    // Validamos campos de texto
    campos.forEach(campo => {
        const el = document.getElementById(campo.id);
        if (!el) return; // Salvaguarda por si no existe el elemento

        if (!el.value.trim()) {
            faltantes.push(campo.nombre);
            el.style.border = "2px solid #ff4d4d"; // Borde rojo de error
            el.classList.add("input-error");
        } else {
            el.style.border = "1px solid #ccc";    // Borde normal
            el.classList.remove("input-error");
        }
    });

    // Validar método de pago
    const contenedorPago = document.querySelector('.metodo-pago-container'); 
    if (!metodoPago) {
        faltantes.push("Método de Pago");
        if (contenedorPago) contenedorPago.style.color = "#ff4d4d";
    } else if (contenedorPago) {
        contenedorPago.style.color = "inherit";
    }

    if (valorFinalNum <= 0) {
        faltantes.push("Productos en el carrito");
    }

    // Actualizar UI del botón y mensajes
    if (boton) {
        const esValido = faltantes.length === 0;
        
        // IMPORTANTE: NO usamos boton.disabled para que el evento click responda 
        // y pueda saltar el alert si el usuario intenta clickear a ciegas.
        boton.style.opacity = esValido ? "1" : "0.7";
        boton.style.cursor = "pointer"; 
        
        if (mensajeError) {
            mensajeError.style.display = "block";
            mensajeError.innerText = esValido ? "✓ Todo listo para finalizar" : "Falta completar: " + faltantes.join(", ");
            mensajeError.style.color = esValido ? "green" : "#ff4d4d";
        }
    }
    return faltantes;
}

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













// --- VALIDACIÓN DE BOTÓN Y MENSAJES ---
/*function validarFormulario() {/*
    const campos = [
        { id: "nombre", label: "Nombre" },
        { id: "direccion", label: "Dirección" },
        { id: "telefono", label: "Teléfono" },
        { id: "comentario", label: "Comentario" },
    ];

    const faltantes = campos.reduce((lista, campo) => {
        const valor = document.getElementById(campo.id)?.value.trim() || "";
        if (!valor) lista.push(campo.label);
        return lista;
    }, []);

    if (!document.querySelector('input[name="metodo-pago"]:checked')) {
        faltantes.push("Método de Pago");
    }

    const finalTotalText = document.getElementById("final-total")?.innerText || "0";
    const valorFinalNum = Number.parseFloat(finalTotalText.replace("$", "")) || 0;
    if (valorFinalNum <= 0) faltantes.push("Productos en el carrito");

    const boton = document.getElementById("btn-finalizar");
    const mensajeError = document.getElementById("mensaje-validacion");
    const esValido = faltantes.length === 0;

    if (!boton) {
        if (mensajeError && !esValido) {
            mensajeError.innerText = "Falta completar: " + faltantes.join(", ");
            mensajeError.style.color = "orange";
            mensajeError.style.display = "block";
        }
        return faltantes;
    }*/

    /*boton.disabled = !esValido;
    boton.style.opacity = esValido ? "1" : "0.5";
    boton.style.cursor = esValido ? "pointer" : "not-allowed";

    if (!mensajeError) return faltantes;

    mensajeError.innerText = esValido
        ? "✓ Todo listo para finalizar"
        : "Falta completar: " + faltantes.join(", ");
    mensajeError.style.color = esValido ? "green" : "orange";
    mensajeError.style.display = "block";

    return faltantes;
}
           
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
    });*/

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

    function eventosFila() {
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

/*    document.querySelectorAll(".cantidad-producto").forEach((input) => {
    input.onchange = (e) => {
    let carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
    const producto = carrito.find((p) => String(p.id) === String(e.target.id));
    if (producto) {
    producto.cantidad = Number.parseInt(e.target.value);
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


// --- LÓGICA DE CÁLCULOS ---
    function recalcularTodo() {
    const totalBase = Number.parseFloat(document.getElementById("total")?.innerText) || 0;
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
//////
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
//////////////////////////////////////



/*async function confirmarPedidoEnServidor() {
    // Obtenemos el carrito real desde el localStorage
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
    
    // Obtenemos los valores de los inputs (ajusta los IDs si tus inputs tienen otros IDs)
    const nombre = document.getElementById("nombre")?.value || "Anónimo";
    const totalFinal = document.getElementById("final-total")?.innerText.replace("$", "") || 0;
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked')?.value || "EFECTIVO";

    const datosPedido = {
        cliente: nombre,
        total: parseFloat(totalFinal),
        pago: metodoPago,
        items: carrito
    };

    try {
        const response = await fetch('/api/confirmar-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });

        const data = await response.json();

        if (data.success) {
            alert(`¡Pedido confirmado! Nro: ${data.nro}`);
            
            // Restar stock
            await fetch('/api/productos/restar-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: carrito })
            });

            localStorage.removeItem("carritoDeCompras");
            window.location.reload(); 
        } else {
            alert("Error al guardar el pedido: " + (data.mensaje || "Error desconocido"));
        }
    } catch (error) {
        console.error('Error al confirmar pedido:', error);
        alert('Hubo un problema de conexión con el servidor.');
    }
}*/


///////
/*async function confirmarPedidoEnServidor() {
    // 1. Preparamos los datos tal como los espera tu index.js
    const datosPedido = {
        cliente: document.getElementById('nombre-cliente')?.value || "Anónimo", // Ajusta el ID según tu HTML
        total: carrito.reduce((acc, item) => acc + (item.price * item.cantidad), 0),
        pago: "EFECTIVO", // O el valor que selecciones en tu formulario
        items: carrito
    };

    try {
        // 2. Llamada al endpoint que ya tienes creado en index.js
        const response = await fetch('/api/confirmar-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });

        const data = await response.json();

        if (data.success) {
            alert(`Pedido confirmado! Nro: ${data.nro}`);
            
            // 3. Opcional: Llamar también a la ruta de restar stock que creaste en index.js
            await fetch('/api/productos/restar-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: carrito })
            });

            localStorage.removeItem('carrito');
            location.reload(); 
        }
    } catch (error) {
        console.error('Error al confirmar pedido:', error);
    }
}*/

///////
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
                producto.cantidad = Number.parseInt(input.value) || 0;
                
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
    const total = Number.parseFloat(subtotal) || 0;
    // Seleccionamos todos los elementos con id="total" y actualizamos
    document.querySelectorAll("#total").forEach((el) => {
        el.innerText = total.toFixed(2);
    });
}
////////////
/*function actualizarTotalCarrito(subtotal) {
      document.querySelectorAll("#total").forEach((el) => (el.innerText = subtotal.toFixed(2)));
    
}*/



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
 // 1. Enviamos el pedido a la base de datos
    try {
        const response = await fetch("https://helados-palitos.onrender.com/api/confirmar-pedido", {
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

    const resultado = await response.json();

    if (resultado.success)  {

        // 2. NUEVO PASO: Hacemos el descuento del Stock en MongoDB Atlas
            console.log("Descontando stock en MongoDB...");
            //const responseStock = await fetch(`${servidorBase}/api/productos/restar-stock`, {
            const responseStock = await fetch("https://helados-palitos.onrender.com/api/productos/restar-stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: carrito })
        });

        const resultadoStock = await responseStock.json();
        if (!resultadoStock.success) {
            console.warn("Advertencia: El pedido se guardó pero no se pudo actualizar el stock.");
        }

        // 3. Flujo original de WhatsApp... (el resto del código queda igual)

💡 Un detalle extra para evitar que se dupliquen funciones

Noté que en el archivo tenés la función actualizarTotales() duplicada y repetida abajo, y lo mismo con el evento DOMContentLoaded. No te va a romper el código porque JavaScript usa la última definición, pero para que tu archivo quede bien limpio y profesional cuando lo subas a producción, te recomiendo borrar las líneas comentadas o las funciones repetidas.

Haciendo ese cambio en la URL del stock, guardá el archivo, ejecutá el git add, git commit y git push como hicimos antes, ¡y ya va a pasar directo a abrir el WhatsApp sin colgarse!
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: carrito })
            });

            const resultadoStock = await responseStock.json();
            if (!resultadoStock.success) {
                console.warn("Advertencia: El pedido se guardó pero no se pudo actualizar el stock.");
            }



         // 3. Flujo original de WhatsApp
        //const nroReal = resultado.id;
        const nroParaWhatsApp = String(resultado.nro).padStart(4, '0');   
        
   // let productosTexto = carrito.map((p) => `• ${p.title} (x${p.cantidad})`).join("\n");
    let productosTexto = carrito.map(p => `• ${p.title} ${p.category} (x${p.cantidad})`).join('\n');
        
        const texto = `*=== Presione el botón VERDE !! ===*\n` +
    `*para confirmar el pedido por WhatsApp ........*\n\n` +
    `*--- NUEVO PEDIDO ---*\n` + 
    `*   -- # ${ nroParaWhatsApp } --  *\n\n` +
    `*Cliente:* ${nombre}\n` +
    `*Dirección:* ${direccion}\n` +
    `*Teléfono:* ${telefono}\n` +
    `*Comentario:* ${comentario}\n\n` +
    `*Pago:* ${metodoPagoCheck.value.toUpperCase()}\n\n` +
    `*Productos:*\n${productosTexto}\n\n` +
    `*TOTAL:* ${finalTotalText}`;

    const urlWA = `https://wa.me/5491138461130?text=${encodeURIComponent(texto)}`;

    alert("¡Pedido #" + nroParaWhatsApp + " confirmado!");
    localStorage.removeItem("carritoDeCompras");
    window.open(urlWA, "_blank");
    window.location.href = "../index.html";
    } else {
    alert("Error: " + resultado.mensaje);
    }
    } catch (err) {
    alert("Error de conexión con el servidor Eustakio.");
    }
    }