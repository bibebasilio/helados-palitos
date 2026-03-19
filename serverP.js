const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// Parche Node v22+
const usb = require('usb');
if (usb && usb.on === undefined) { usb.on = function() { return this; }; }

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Rutas de Archivos
const PRODUCTS_PATH = path.join(__dirname, 'data', 'products.json');
const PEDIDOS_PATH = path.join(__dirname, 'data', 'pedidosrecibidos.json');
const ASOCIADOS_PATH = path.join(__dirname, 'data', 'asociados.json');

const VENDOR_ID = 0x1FC9;
const PRODUCT_ID = 0x2016;

// --- FUNCIÓN IMPRESIÓN ---
const imprimirTicket = (pedido) => {
    try {
        const device = new escpos.USB(VENDOR_ID, PRODUCT_ID);
        if (device.device && typeof device.device.on !== 'function') { device.device.on = function() { return this; }; }
        const printer = new escpos.Printer(device);

        device.open((err) => {
            if (err) return console.error('❌ Error impresora:', err.message);
            printer
                .font('B').align('ct').style('b').size(1, 1).text('NUEVO PEDIDO')
                .text(`ORDEN: #${pedido.idPedido || 'N/A'}`).text('--------------------------------')
                .font('A').align('lt').style('normal').size(0, 0)
                .text(`Cliente: ${pedido.cliente || 'Mostrador'}`)
                .text(`Fecha: ${new Date().toLocaleString()}`);

            if (pedido.items) {
                pedido.items.forEach(item => {
                    printer.text(`${item.cantidad}x ${item.title.substring(0,20)} $${(item.cantidad * item.price).toFixed(2)}`);
                });
            }

            printer.font('B').align('ct').size(1, 1).text('--------------------------------')
                .text(`TOTAL: ${pedido.total}`).feed(3).cut().close();
        });
    } catch (e) { console.error("❌ Fallo impresión:", e.message); }
};

// --- RUTAS PRODUCTOS ---
app.get('/api/admin/productos', (req, res) => {
    fs.readFile(PRODUCTS_PATH, 'utf8', (err, data) => res.json(JSON.parse(data || "[]")));
});

app.post('/api/update-products', (req, res) => {
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

// --- RUTAS PEDIDOS ---
app.post('/api/confirmar-pedido', (req, res) => {
    const nuevoPedido = req.body;
    // 1. Descontar Stock
    const productosDB = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
    nuevoPedido.items.forEach(item => {
        const p = productosDB.find(prod => String(prod.id) === String(item.id));
        if (p) { p.stock -= item.cantidad; p.ventas = (p.ventas || 0) + item.cantidad; }
    });
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(productosDB, null, 2));

    // 2. Guardar Pedido
    const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_PATH, 'utf8') || "[]");
    const pedidoAGuardar = { id: nuevoPedido.idPedido || Date.now(), fecha: new Date().toISOString(), ...nuevoPedido };
    pedidos.push(pedidoAGuardar);
    fs.writeFileSync(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2));

    imprimirTicket(nuevoPedido);
    res.json({ success: true });
});

app.get('/api/admin/pedidos', (req, res) => {
    fs.readFile(PEDIDOS_PATH, 'utf8', (err, data) => res.json(JSON.parse(data || "[]")));
});

app.patch('/api/admin/pedidos/:id/estado', (req, res) => {
    const { id } = req.params;
    const { campo, valor, ...extras } = req.body;
    let pedidos = JSON.parse(fs.readFileSync(PEDIDOS_PATH, 'utf8'));
    const idx = pedidos.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
        pedidos[idx][campo] = valor;
        Object.assign(pedidos[idx], extras);
        fs.writeFileSync(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2));
        return res.json({ success: true });
    }
    res.status(404).send();
});

// --- RUTAS ASOCIADOS ---
app.get('/api/admin/asociados', (req, res) => {
    fs.readFile(ASOCIADOS_PATH, 'utf8', (err, data) => res.json(JSON.parse(data || "[]")));
});

app.post('/api/admin/asociados/nuevo', (req, res) => {
    const nuevo = req.body;
    let asociados = JSON.parse(fs.readFileSync(ASOCIADOS_PATH, 'utf8') || "[]");
    if (asociados.find(a => String(a.dni) === String(nuevo.dni))) {
        return res.status(400).json({ success: false, mensaje: "Ya esta Asociado con Anterioridad" });
    }
    asociados.push(nuevo);
    fs.writeFileSync(ASOCIADOS_PATH, JSON.stringify(asociados, null, 2));
    res.json({ success: true });
});

app.put('/api/admin/asociados/:dni', (req, res) => {
    let asociados = JSON.parse(fs.readFileSync(ASOCIADOS_PATH, 'utf8'));
    const idx = asociados.findIndex(a => String(a.dni) === String(req.params.dni));
    if (idx !== -1) {
        asociados[idx] = { ...asociados[idx], ...req.body };
        fs.writeFileSync(ASOCIADOS_PATH, JSON.stringify(asociados, null, 2));
        return res.json({ success: true });
    }
    res.status(404).send();
});

app.delete('/api/admin/asociados/:dni', (req, res) => {
    let asociados = JSON.parse(fs.readFileSync(ASOCIADOS_PATH, 'utf8'));
    asociados = asociados.filter(a => String(a.dni) !== String(req.params.dni));
    fs.writeFileSync(ASOCIADOS_PATH, JSON.stringify(asociados, null, 2));
    res.json({ success: true });
});

app.listen(3000, () => console.log("🚀 Servidor en http://localhost:3000"));