async function cargarDatos() {
    const resPed = await fetch('http://localhost:3000/api/admin/pedidos');
    const pedidos = await resPed.json();
    const listaPed = document.getElementById('lista-pedidos');
    
    listaPed.innerHTML = pedidos.reverse().map(ped => `
        <div class="pedido-card" style="background:${obtenerColor(ped)}; border:1px solid #ccc; padding:10px; margin:10px; border-radius:8px;">
            <strong>Pedido #${ped.idPedido || ped.id}</strong> - <span>${ped.pago || 'PENDIENTE'}</span><br>
            👤 ${ped.cliente} | 📍 ${ped.direccion || 'Local'}<br>
            <hr>
            <button onclick="cambiarEstado('${ped.id}', 'pago', 'Pagado')">💰 Pagado</button>
            <div style="margin-top:5px; background:#f0f0f0; padding:5px;">
                🚀 Enviar: 
                <select id="t-${ped.id}"><option value="Moto">Moto</option><option value="Uber">Uber</option></select>
                <input id="c-${ped.id}" placeholder="Chofer" style="width:80px">
                <button onclick="despachar('${ped.id}')">OK</button>
            </div>
            <div style="margin-top:5px; background:#e0f0e0; padding:5px;">
                ✅ Recibido: 
                <input id="r-${ped.id}" placeholder="Quién recibe?" style="width:100px">
                <button onclick="entregar('${ped.id}')">OK</button>
            </div>
            <button onclick="cancelar('${ped.id}')" style="background:#ffcccc">❌ Cancelar</button>
            <div style="font-size:0.8em; margin-top:5px; color:#555">
                ${ped.chofer ? `🚚 Salió: ${ped.horarioAccion} (${ped.chofer})` : ''}
            </div>
        </div>
    `).join('');
}

function obtenerColor(p) {
    if (p.estado === 'Cancelado') return '#ffebee';
    if (p.estadoEntrega === 'Entregado') return '#e8f5e9';
    if (p.estadoEnvio === 'En Camino') return '#e3f2fd';
    return '#fff';
}

async function cambiarEstado(id, campo, valor, extras = {}) {
    await fetch(`http://localhost:3000/api/admin/pedidos/${id}/estado`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ campo, valor, ...extras, horarioAccion: new Date().toLocaleTimeString() })
    });
    cargarDatos();
}

function despachar(id) {
    const c = document.getElementById(`c-${id}`).value;
    const t = document.getElementById(`t-${id}`).value;
    if(!c) return alert("Nombre del chofer");
    cambiarEstado(id, 'estadoEnvio', 'En Camino', { chofer: c, transporte: t });
}

function entregar(id) {
    const r = document.getElementById(`r-${id}`).value;
    if(!r) return alert("Nombre de quien recibe");
    cambiarEstado(id, 'estadoEntrega', 'Entregado', { recibio: r });
}