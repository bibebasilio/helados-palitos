async function guardarAsociado(event) {
    event.preventDefault();
    const dni = document.getElementById('dni').value;
    
    if (dni.length < 7) return alert("DNI demasiado corto");

    const datos = {
        cliente: document.getElementById('nombre').value,
        dni: dni,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        sexo: document.getElementById('genero').value,
        fechanacimiento: document.getElementById('fecha-nacimiento').value,
        preferencia: document.getElementById('programa').value,
        fecha: new Date().toISOString()
    };

    const idEditando = document.getElementById('editando_dni')?.value;
    const url = idEditando ? `http://localhost:3000/api/admin/asociados/${idEditando}` : `http://localhost:3000/api/admin/asociados/nuevo`;
    
    const res = await fetch(url, {
        method: idEditando ? 'PUT' : 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datos)
    });

    const data = await res.json();
    if (res.ok) {
        alert("¡Éxito!");
        window.location.href = "../index.html";
    } else {
        alert(data.mensaje || "Error al guardar");
    }
}