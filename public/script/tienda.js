let productosGlobales = [];

// 1. Función para cargar productos desde la Base de Datos (API)
async function cargarProductos() {
try {
// Definimos la URL de tu API.
// Si el frontend y backend están en el mismo dominio (Render), basta con '/api/productos'
const urlAPI = '/api/productos';

const response = await fetch(urlAPI);
if (!response.ok) throw new Error("Error al conectar con la base de datos");

const todosLosProductos = await response.json();

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