


//////// esto no es 


////////////
let productosLocales = [];




// Cargar Productos
//const response = await fetch('http://localhost:3000/api/confirmar-pedi
const resProd = await fetch('http://localhost:3000/api/admin/productos');
productosLocales = await resProd.json();
const tbody = document.querySelector('#tabla-productos tbody');
tbody.innerHTML = productosLocales.map((p, index) => `
<tr>
    <td><input type="text" value="${p.image}" onchange="actualizarDato(${index}, 'image', this.value)"></td>
    <td><input type="text" value="${p.title}" onchange="actualizarDato(${index}, 'title', this.value)"></td>
    <td><input type="number" value="${p.price}" onchange="actualizarDato(${index}, 'price', this.value)"></td>
    <td><input type="number" value="${p.stock}" onchange="actualizarDato(${index}, 'stock', this.value)"></td>
    <td><input type="text" value="${p.category}" onchange="actualizarDato(${index}, 'category', this.value)"></td>
</tr>
`).join('');

// Cargar Pedidos
const resPed = await fetch('http://localhost:3000/api/admin/pedidos');
const listaPed = document.getElementById('lista-pedidos');
const pedidos = await resPed.json();
listaPed.innerHTML = pedidos.reverse().map(ped => `
<div class="pedido-card">
    <strong>Fecha:</strong> ${new Date(ped.fecha).toLocaleString()} | <strong>Cliente:</strong> ${ped.cliente}<br>
    <strong>Total:</strong> $${ped.total} | <strong>Tel:</strong> ${ped.telefono}<br>
    <strong>Items:</strong> ${ped.items.map(i => `${i.title} (x${i.cantidad})`).join(', ')}
</div>
`).join('') || 'No hay pedidos aún';

function actualizarDato(index, propiedad, valor) {
if (propiedad === 'price' || propiedad === 'stock') valor = Number(valor);
productosLocales[index][propiedad] = valor;
}

async function guardarCambios() {
const res = await fetch('/api/update-products', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(productosLocales)
});
const data = await res.json();
if (data.success) alert("¡Inventario actualizado correctamente!");
}

await cargarDatos();