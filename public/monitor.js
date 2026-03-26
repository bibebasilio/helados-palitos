Para que funcione de forma automática en Windows usando **Node.js**, vamos a configurar un servicio que vigile la carpeta y envíe el JSON a la impresora. Esta es la opción más robusta porque, a diferencia del navegador, Node.js no requiere que tengas una pestaña abierta ni que hagas clic en botones de permiso cada vez.

### 1. Preparación del Entorno

Primero, asegúrate de tener [Node.js](https://nodejs.org/) instalado en tu Windows. Luego, abre una terminal en tu carpeta de proyecto y ejecuta:

```bash
npm init -y
npm install chokidar escpos escpos-usb

```

> **Nota para Windows:** Al igual que con Python, para que la librería `escpos-usb` funcione, es posible que necesites usar **Zadig** para reemplazar el driver de tu impresora por **LibUSB-win32**.

---

### 2. El Script de Automatización (`monitor.js`)

Crea un archivo llamado `monitor.js`. Este script detectará cambios en el JSON y enviará el comando de impresión.

```javascript
const chokidar = require('chokidar');
const fs = require('fs');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// --- CONFIGURACIÓN ---
const RUTA_JSON = 'C:/data/pedidorecibido.json';

// El monitor espera a que el archivo cambie
console.log(`Esperando pedidos en: ${RUTA_JSON}...`);

const watcher = chokidar.watch(RUTA_JSON, {
    persistent: true,
    ignoreInitial: true // No imprime el archivo viejo al arrancar
});

watcher.on('change', path => {
    console.log(`Detectado cambio en el pedido. Procesando...`);
    
    // Pequeña espera para asegurar que el archivo terminó de escribirse
    setTimeout(() => {
        imprimir(path);
    }, 500);
});

function imprimir(archivo) {
    try {
        const contenido = fs.readFileSync(archivo, 'utf8');
        const pedido = JSON.parse(contenido);

        // Detectar impresora USB
        const device = new escpos.USB(); 
        const printer = new escpos.Printer(device);

        device.open((error) => {
            if (error) {
                console.error("Error al abrir la impresora:", error);
                return;
            }

            printer
                .font('a')
                .align('ct')
                .style('bu')
                .size(1, 1)
                .text('TICKET DE COCINA')
                .feed(1)
                .align('lt')
                .text(`Cliente: ${pedido.cliente || 'General'}`)
                .text(`Fecha: ${new Date().toLocaleString()}`)
                .text('--------------------------------')
                .feed(1);

            // Listar productos
            pedido.productos.forEach(item => {
                printer.text(`${item.cantidad}x ${item.nombre}`);
            });

            printer
                .feed(2)
                .cut()
                .close();
            
            console.log("¡Impresión enviada!");
        });
    } catch (err) {
        console.error("Error procesando el JSON:", err.message);
    }
}

```

---

### 3. Automatizar el inicio en Windows (Sin código)

Como quieres que esto ocurra siempre sin abrir la consola manualmente:

1. Instala un gestor de procesos llamado **PM2**:
```bash
npm install -g pm2

```


2. Inicia tu script con PM2:
```bash
pm2 start monitor.js --name "impresora-pedidos"

```


3. Para que se inicie solo al prender la PC, instala el módulo de inicio:
```bash
npm install -g pm2-windows-startup
pm2-startup install
pm2 save

```



### Ventajas de esta solución:

* **Velocidad:** Node.js es extremadamente rápido para operaciones de entrada/salida (I/O).
* **Silencioso:** Corre en segundo plano como un servicio de Windows.
* **Escalable:** Si el formato del JSON cambia, solo editas la función `imprimir` en el JS.

**¿Te gustaría que te ayude a formatear el ticket para que incluya un código QR o el logo de tu negocio en la impresión?**