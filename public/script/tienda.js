let productosGlobales = [];

// En tu index.js actual:
const { localId } = req.query; 
if (!localId) {
    return res.status(400).json({ error: "Falta el identificador de sucursal (localId)" });
}

// 1. Función para cargar productos desde la Base de Datos (API)
/*async function cargarProductos() {
try
// Definimos la URL de tu API.
// Si el frontend y backend están en el mismo dominio (Render), basta con '/api/productos'
const urlAPI = '/api/productos';

const response = await fetch(urlAPI);
if (!response.ok) throw new Error("Error al conectar con la base de datos");

const todosLosProductos = await response.json();*/

// EN TIENDA.JS (Automatización de Sucursal)
async function cargarProductos() {
    try {
        // 1. Detectamos automáticamente dónde está parado el usuario
        // Si el dominio es "eustakio-centro.onrender.com", extrae "centro"
        const host = window.location.hostname; 
        let sucursal = "local_01"; // Por defecto si estás en localhost
        
        if (host.includes("onrender.com")) {
            // Ejemplo: "eustakio-norte.onrender.com" -> ["eustakio", "norte"] -> "norte"
            const partes = host.split('.')[0].split('-');
            if (partes.length > 1) {
                sucursal = partes[1]; // "norte", "centro", etc.
            }
        }
        
        // 2. Apuntamos a la API relativa (sin poner http://localhost:3000)
        // Al dejarla relativa, el frontend le pega al mismo Render donde está alojado
        const urlAPI = `/api/productos?localId=${sucursal}`;
        
        const response = await fetch(urlAPI);
        if (!response.ok) throw new Error("Error al conectar con la base de datos");

        const todosLosProductos = await response.json();
        console.log(`Datos recibidos para la sucursal [${sucursal}]:`, todosLosProductos);

// 2. Obtener filtro del localStorage
let elegidoForma = JSON.parse(localStorage.getItem('formato'));
console.log("Criterio de búsqueda:", elegidoForma);

// 3. Lógica de Filtrado y Stock
if (!elegidoForma) {
// Si no hay filtro, mostramos los que tengan stock > 0
productosGlobales = todosLosProductos.filter(p => p.stock > 0);
} else {
// Filtramos por título y stock
productosGlobales = todosLosProductos.filter(producto =>
producto.title.toLowerCase().includes(elegidoForma.toLowerCase()) &&
producto.stock > 0
);

// Fallback: si no hay coincidencias con el filtro, mostrar todo lo disponible
if (productosGlobales.length === 0) {
productosGlobales = todosLosProductos.filter(p => p.stock > 0);
}
}

dibujarDatos(productosGlobales);

} catch (error) {
console.error('Error cargando desde la DB:', error);
// Opcional: Podrías intentar cargar el JSON local como respaldo (fallback)
}
}

// 2. Función que crea el HTML de un producto (Mantenemos tu estructura)
function Producto(producto) {
return `
<div class="producto">
    <img src="${producto.image}" alt="${producto.title}">
    <div class="producto-descripcion">
        <span>${producto.title}</span>
        <span>${producto.category}: ${producto.stock}</span>
        <h3>${producto.clase || ''}</h3>
        <h4>$${producto.price.toFixed(2)}</h4>
    </div>
    <a id="btn-agregar-${producto.id || producto._id}" class="carrito" style="cursor:pointer">
        <i class="fal fa-shopping-cart"></i>
    </a>
</div>
`;
}

// 3. Función que inserta los productos en el DOM
function dibujarDatos(datos) {
const contenedor = document.querySelector('.productos-container');
if (contenedor) {
const filas = datos.map(obj => Producto(obj));
contenedor.innerHTML = filas.join('');
adjuntarEventosCarrito();
} else {
console.error("No se encontró el contenedor .productos-container");
}
}

// 4. Adjuntar eventos a los botones
function adjuntarEventosCarrito() {
productosGlobales.forEach(producto => {
// MongoDB usa _id por defecto, ajustamos para que funcione con ambos
const idBoton = producto.id || producto._id;
const boton = document.getElementById(`btn-agregar-${idBoton}`);
if (boton) {
boton.onclick = () => {
agregarProductoAlCarrito(producto);
};
}
});
}

// 5. Agregar al carrito
function agregarProductoAlCarrito(producto) {
let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
const idProducto = producto.id || producto._id;
const indice = carrito.findIndex(item => (item.id || item._id) === idProducto);

if (indice !== -1) {
carrito[indice].cantidad++;
} else {
carrito.push({ ...producto, cantidad: 1 });
}

localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
alert(`${producto.title} agregado al carrito!`);
}

// Ejecución inicial
document.addEventListener('DOMContentLoaded', cargarProductos);