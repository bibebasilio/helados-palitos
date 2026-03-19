let productosLocales = [];

// Función para determinar el color visual de la tarjeta
function obtenerColorEstado(ped) {
if (ped.estado === 'Cancelado') return '#ffebee'; // Rojo
if (ped.estadoEntrega === 'Entregado') return '#e8f5e9'; // Verde
if (ped.estadoEnvio === 'En Camino') return '#e3f2fd'; // Azul
return '#ffffff'; // Blanco
}

// Carga inicial de datos
async function cargarDatos() {
try {
// Cargar Stock
const resProd = await fetch('http://localhost:3000/api/admin/productos');
productosLocales = await resProd.json();
renderizarTabla();

// Cargar Pedidos
const resPed = await fetch('http://localhost:3000/api/admin/pedidos');
const pedidos = await resPed.json();
renderizarPedidos(pedidos);

} catch (error) {
console.error("Error al cargar:", error);
}
}

function renderizarTabla() {
const tbody = document.querySelector('#tabla-productos tbody');
if (!tbody) return;
tbody.innerHTML = productosLocales.map((p, index) => `
<tr>
    <td><input type="text" value="${p.title}" onchange="actualizarDatoLocal(${index}, 'title', this.value)"></td>
    <td><input type="number" value="${p.price}" onchange="actualizarDatoLocal(${index}, 'price', this.value)"></td>
    <td><input type="number" value="${p.stock}" onchange="actualizarDatoLocal(${index}, 'stock', this.value)"></td>
    <td><button onclick="eliminarProducto('${p.id}')">🗑️</button></td>
</tr>
`).join('');
}

function renderizarPedidos(pedidos) {
const listaPed = document.getElementById('lista-pedidos');
if (!listaPed) return;

listaPed.innerHTML = pedidos.reverse().map(ped => `
<div class="pedido-card"
    style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:10px; background:${obtenerColorEstado(ped)}; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <div style="display:flex; justify-content:space-between">
        <strong>#${ped.idPedido || ped.id}</strong>
        <span style="font-weight:bold; color:${ped.pago === 'Pagado' ? 'green' : 'orange'}">${ped.pago ||
            'PENDIENTE'}</span>
    </div>
    <p>👤 ${ped.cliente} | 📍 ${ped.direccion || 'Local'}</p>
    <hr>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        <button onclick="actualizarEstado('${ped.id}', 'pago', 'Pagado')"
            style="grid-column:span 2; background:#4CAF50; color:white; padding:8px; border:none; cursor:pointer">MARCAR
            PAGADO</button>

        <div style="border:1px solid #ccc; padding:5px">
            <small>🚀 ENVÍO</small>
            <select id="t-${ped.id}">
                <option value="Moto">Moto</option>
                <option value="Uber">Uber</option>
            </select>
            <input type="text" id="c-${ped.id}" placeholder="Chofer" style="width:70px">
            <button onclick="enviarPedido('${ped.id}')">OK</button>
        </div>

        <div style="border:1px solid #ccc; padding:5px">
            <small>✅ ENTREGA</small>
            <input type="text" id="r-${ped.id}" placeholder="Quién recibió?" style="width:100px">
            <button onclick="entregarPedido('${ped.id}')">OK</button>
        </div>

        <div style="grid-column:span 2; border:1px solid #ffcdd2; padding:5px">
            <small>❌ CANCELAR</small>
            <input type="text" id="m-${ped.id}" placeholder="Motivo...">
            <button onclick="cancelarPedido('${ped.id}')" style="background:red; color:white">ANULAR</button>
        </div>
    </div>

    <div style="font-size:0.75em; margin-top:10px; color:#555">
        ${ped.chofer ? `🚚 ${ped.horarioAccion}: Salió en ${ped.transporte} con ${ped.chofer}<br>` : ''}
        ${ped.recibio ? `🏠 ${ped.horarioAccion}: Recibido por ${ped.recibio}<br>` : ''}
        ${ped.motivoCancelacion ? `🚫 ${ped.horarioAccion}: ${ped.motivoCancelacion}` : ''}
    </div>
</div>
`).join('');
}

// FUNCIONES DE ACCIÓN
async function actualizarEstado(id, campo, valor, extras = {}) {
const res = await fetch(`http://localhost:3000/api/admin/pedidos/${id}/estado`, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ campo, valor, ...extras, horarioAccion: new Date().toLocaleTimeString() })
});
if (res.ok) cargarDatos();
}

function enviarPedido(id) {
const chofer = document.getElementById(`c-${id}`).value;
const transporte = document.getElementById(`t-${id}`).value;
if (!chofer) return alert("Falta nombre del chofer");
actualizarEstado(id, 'estadoEnvio', 'En Camino', { chofer, transporte });
}

function entregarPedido(id) {
const recibio = document.getElementById(`r-${id}`).value;
if (!recibio) return alert("Falta quién recibió");
actualizarEstado(id, 'estadoEntrega', 'Entregado', { recibio });
}

function cancelarPedido(id) {
const motivo = document.getElementById(`m-${id}`).value;
if (!motivo) return alert("Escribe el motivo");
actualizarEstado(id, 'estado', 'Cancelado', { motivoCancelacion: motivo });
}

function actualizarDatoLocal(index, propiedad, valor) {
if (propiedad === 'price' || propiedad === 'stock') valor = Number(valor);
productosLocales[index][propiedad] = valor;
}

async function guardarCambiosInventario() {
const res = await fetch('http://localhost:3000/api/update-products', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(productosLocales)
});
if (res.ok) alert("Stock actualizado");
}

document.addEventListener('DOMContentLoaded', cargarDatos);