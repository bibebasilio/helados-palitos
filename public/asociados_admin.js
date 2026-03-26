document.addEventListener('DOMContentLoaded', cargarAsociados);

// Base URL para evitar repeticiones (ajústala si es necesario)
const API_URL = 'http://localhost:3000/api/admin/asociados';

async function cargarAsociados() {
    try {
        const res = await fetch(API_URL);
        const asociados = await res.json();

        const tabla = document.getElementById('tabla-asociados');
        if (!tabla) return; 

        tabla.innerHTML = '';
        asociados.forEach(a => {
            tabla.innerHTML += `
            <tr>
                <td>${a.cliente}</td>
                <td>${a.dni}</td>
                <td>${a.email}</td>
                <td>${a.telefono}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="prepararEdicion('${a.dni}')" title="Editar">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarAsociado('${a.dni}')" title="Eliminar">❌</button>
                    <button class="btn btn-sm btn-info" onclick="imprimirAsociado('${a.dni}')" title="Imprimir Ticket">🖨️</button>
                </td>
            </tr>`;
        });
    } catch (error) {
        console.error("Error al cargar asociados:", error);
    }
}

async function guardarAsociado(event) {
    event.preventDefault();

    // Verificamos si estamos editando (mirando el campo oculto)
    const dniEditando = document.getElementById('editando_dni').value;
    const esEdicion = dniEditando !== "";

    const datos = {
        cliente: document.getElementById('nombre').value,
        dni: document.getElementById('dni').value,
        email: document.getElementById('email').value,
        direccion: document.getElementById('direccion').value,
        sexo: document.getElementById('genero').value,
        telefono: document.getElementById('telefono').value,
        fechanacimiento: document.getElementById('fecha-nacimiento').value,
        preferencia: document.getElementById('programa').value,
        fecha: new Date().toISOString(),
        cantidadpedidos: 0
    };

    // Definimos URL y Método según la acción
    const url = esEdicion ? `${API_URL}/${dniEditando}` : `${API_URL}/nuevo`;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datos)
        });

        const result = await res.json();
        
        if (res.ok) {
            alert(esEdicion ? "¡Asociado actualizado!" : "¡Asociado guardado con éxito!");
            cancelarEdicion(); // Limpia el form y resetea botones
            cargarAsociados(); // Recarga la tabla
        } else {
            alert("Error: " + (result.mensaje || "No se pudo procesar la solicitud"));
        }
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

async function prepararEdicion(dni) {
    try {
        // Buscamos los datos actuales del socio
        const res = await fetch(API_URL);
        const asociados = await res.json();
        const socio = asociados.find(a => String(a.dni) === String(dni));

        if (!socio) return alert("No se encontraron los datos del socio");

        // Llenamos el formulario
        document.getElementById('nombre').value = socio.cliente;
        document.getElementById('dni').value = socio.dni;
        document.getElementById('email').value = socio.email;
        document.getElementById('telefono').value = socio.telefono || "";
        document.getElementById('direccion').value = socio.direccion || "";
        document.getElementById('genero').value = socio.sexo || "Masculino";
        document.getElementById('fecha-nacimiento').value = socio.fechanacimiento || "";
        document.getElementById('programa').value = socio.preferencia || "";

        // Activamos modo edición en el UI
        document.getElementById('editando_dni').value = socio.dni;
        
        const btnSubmit = document.querySelector('#formAsociarse button[type="submit"]');
        btnSubmit.innerText = "🔄 Actualizar Socio";
        btnSubmit.className = "btn btn-warning";
        
        // Mostramos el botón de cancelar (si existe en tu HTML)
        const btnCancel = document.getElementById('btn-cancelar');
        if(btnCancel) btnCancel.style.display = "inline-block";

        // Scroll suave hacia el formulario para que el usuario sepa que está editando
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Error al preparar edición:", error);
    }
}

function cancelarEdicion() {
    const form = document.getElementById('formAsociarse');
    if(form) form.reset();

    document.getElementById('editando_dni').value = "";
    
    const btnSubmit = document.querySelector('#formAsociarse button[type="submit"]');
    btnSubmit.innerText = "💾 Guardar Socio";
    btnSubmit.className = "btn btn-success";

    const btnCancel = document.getElementById('btn-cancelar');
    if(btnCancel) btnCancel.style.display = "none";
}

async function eliminarAsociado(dni) {
    if(!confirm("¿Seguro que desea eliminar este asociado?")) return;
    try {
        const res = await fetch(`${API_URL}/${dni}`, { method: 'DELETE' });
        if (res.ok) {
            cargarAsociados();
        } else {
            alert("No se pudo eliminar el registro.");
        }
    } catch (error) {
        console.error("Error al eliminar asociado:", error);
        alert("Error al conectar con el servidor para eliminar");
    }
}

async function imprimirAsociado(dni) {
    try {
        const res = await fetch(API_URL);
        const asociados = await res.json();
        const asociado = asociados.find(a => String(a.dni) === String(dni));

        if (!asociado) return alert("Asociado no encontrado");

        const printRes = await fetch('http://localhost:3000/api/print-asociado', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(asociado)
        });

        if (printRes.ok) alert("Imprimiendo...");
    } catch (error) {
        console.error("Error al imprimir asociado:", error);
        alert("Error de conexión con la impresora");
    }
}