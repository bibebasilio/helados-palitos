let productosGlobales = [];

// 1. Función para cargar productos desde la Base de Datos (API)
async function cargarProductos() {
    try {
        // Apuntamos al backend local (Node.js) en el puerto 3000 para desarrollo
        const urlAPI = 'http://localhost:3000/api/productos';
        
        const response = await fetch(urlAPI);
        if (!response.ok) throw new Error("Error al conectar con la base de datos");

        const todosLosProductos = await response.json();
        console.log("1. Datos recibidos de MongoDB:", todosLosProductos);

        // 2. Obtener filtro del localStorage
        let elegidoForma = JSON.parse(localStorage.getItem('formato'));

        // 3. Lógica de Filtrado y Stock
        if (!elegidoForma) {
            productosGlobales = todosLosProductos.filter(p => p.stock > 0);
        } else {
            productosGlobales = todosLosProductos.filter(producto =>
                producto.title && producto.title.toLowerCase().includes(elegidoForma.toLowerCase()) &&
                producto.stock > 0
            );

            if (productosGlobales.length === 0) {
                productosGlobales = todosLosProductos.filter(p => p.stock > 0);
            }
        }

        dibujarDatos(productosGlobales);

    } catch (error) {
        console.error('Error cargando desde la DB:', error);
    }
}

// 2. Función que crea el HTML de un producto (Usa _id de MongoDB)
function Producto(producto) {
    const idReal = producto._id || producto.id;
    
    return `
    <div class="producto">
        <img src="${producto.image}" alt="${producto.title}">
        <div class="producto-descripcion">
            <span>${producto.title}</span>
            <span class="stock-info">${producto.category} - Stock: ${producto.stock}</span>
            <h3>${producto.clase || ''}</h3>
            <h4>$${producto.price.toFixed(2)}</h4>
        </div>
        <a id="btn-agregar-${idReal}" class="carrito" style="cursor:pointer">
            <i class="fal fa-shopping-cart"></i>
        </a>
    </div>
    `;
}

// 3. Función que inserta los productos en el DOM
function dibujarDatos(datos) {
    const contenedor = document.querySelector('.productos-container');
    if (contenedor) {
        if (datos.length === 0) {
            contenedor.innerHTML = `<p>No hay productos disponibles con stock.</p>`;
            return;
        }
        const filas = datos.map(obj => Producto(obj));
        contenedor.innerHTML = filas.join('');
        adjuntarEventosCarrito();
    } else {
        console.error("No se encontró el contenedor '.productos-container'");
    }
}

// 4. Adjuntar eventos a los botones
function adjuntarEventosCarrito() {
    productosGlobales.forEach(producto => {
        const idBoton = producto._id || producto.id;
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
    const idProducto = producto._id || producto.id;
    const indice = carrito.findIndex(item => (item._id || item.id) === idProducto);

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