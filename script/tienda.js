let productosGlobales = [];

// 1. Función para cargar productos
/////////////

//let productosGlobales = [];

function cargarProductos() {
    // 1. Detección de entorno (Local vs GitHub)
    const isGitHub = window.location.hostname.includes('github.io');
    const repoName = window.location.pathname.split('/')[1];
    const rutaJson = isGitHub ? `/${repoName}/data/products.json` : '/data/products.json';

    fetch(rutaJson)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el JSON");
            return response.json();
        })
        .then(data => {
            const todosLosProductos = data;
            
            // 2. Intentamos obtener el filtro
            let elegidoForma = JSON.parse(localStorage.getItem('formato'));
            console.log("Criterio de búsqueda:", elegidoForma);

            // 3. Lógica de Fallback: Si no hay filtro, mostramos TODO
            if (!elegidoForma) {
                console.warn("No hay selección previa. Mostrando catálogo completo.");
                productosGlobales = todosLosProductos.filter(p => p.stock > 0);
            } else {
                // Filtramos por lo que eligió el usuario
                productosGlobales = todosLosProductos.filter(producto => 
                    producto.title.toLowerCase().includes(elegidoForma.toLowerCase()) && 
                    producto.stock > 0
                );

                // Si el filtro no arroja resultados, mostramos todo para no dejar la pantalla vacía
                if (productosGlobales.length === 0) {
                    console.log("No hay coincidencias para el filtro. Mostrando todo.");
                    productosGlobales = todosLosProductos;
                }
            }

            dibujarDatos(productosGlobales);
        })
        .catch(error => {
            console.error('Error en la carga:', error);
            // Intento final con ruta relativa simple si la absoluta falla
            fetch('../data/products.json')
                .then(r => r.json())
                .then(d => dibujarDatos(d))
                .catch(e => console.error("Error total: El archivo JSON no existe o la ruta es incorrecta."));
        });
}

// Ejecución inicial
document.addEventListener('DOMContentLoaded', cargarProductos);











///////////////////////////////////////////////////////////////////







/*function cargarProductos() {
    // 1. Detectamos la base de la URL
    // Si estamos en GitHub, el pathname incluirá el nombre de tu repositorio
    const isGitHub = window.location.hostname.includes('github.io');
    const repoName = window.location.pathname.split('/')[1];
    
    // 2. Construimos la ruta dinámica
    // En local será '/data/products.json'
    // En GitHub será '/nombre-del-repo/data/products.json'
    let rutaJson = isGitHub ? `/${repoName}/data/products.json` : '/data/products.json';

    // Si tu estructura es fija y tienda.html está siempre en /pages/, 
    // la ruta relativa '../data/products.json' debería funcionar, 
    // pero fetch suele ser más estable con rutas absolutas desde la raíz:
    
    fetch(rutaJson)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo encontrar el JSON");
            return response.json();
        })
        .then(data => {
            const todosLosProductos = data;
            let elegidoForma = JSON.parse(localStorage.getItem('formato'));

            if (elegidoForma) {
                // Filtramos por el formato guardado
                productosGlobales = todosLosProductos.filter(producto => 
                    producto.title.toLowerCase().includes(elegidoForma.toLowerCase()) && producto.stock > 0
                );
            } else {
                productosGlobales = todosLosProductos;
            }

            dibujarDatos(productosGlobales);
        })
        .catch(error => {
            console.error('Error cargando productos:', error);
            // Intento de rescate: si la ruta absoluta falla, intentamos la relativa clásica
            intentarRutaRelativa();
        });
}

function intentarRutaRelativa() {
    fetch('../data/products.json')
        dd
        .then(r => r.json())
        .then(data => dibujarDatos(data))
        .catch(e => console.error("Fallo total de rutas"));
}



/*function cargarProductos() {
    fetch('../data/products.json')
        .then(response => {
            IF(!response.ok) {
                //  throw new Error('Error al cargar productos: ' + response.status);
                return fetch('./data/products.json');
            }               

            return response;
        
        })
        .then(response => response.json())
        .then(data => {
            // Guardamos todos los productos originalmente cargados
            const todosLosProductos = data;
            
            // Traemos el criterio de filtrado del localStorage
            let elegidoForma = JSON.parse(localStorage.getItem('formato'));
            console.log("Forma elegida:", elegidoForma);

            // 2. Aplicamos el filtro AQUÍ adentro
            if (elegidoForma) {
                productosGlobales = todosLosProductos.filter(producto => 
                    producto.title.includes(elegidoForm////a) && producto.stock > 0
                );
            } else {
                productosGlobales = todosLosProductos;
            }

            console.log("Productos a mostrar:", productosGlobales);
            
            // 3. Dibujamos los datos filtrados
            dibujarDatos(productosGlobales);
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
        });
}*/
////////////////////////////////////////////////
// 2. Función que crea el HTML de un producto
function Producto(producto) {
    return `
    <div class="producto">
        <img src=${producto.image} alt="${producto.title}">
        <div class="producto-descripcion">  
            <span>${producto.title}</span>
            <span>${producto.category}: ${producto.stock}</span>
            <h3>${producto.clase}</h3>  
            <h4>$${producto.price.toFixed(2)}</h4>
           <!-- <h3>${producto.stock}</h3> -->
        </div>
        <a id="btn-agregar-${producto.id}" class="carrito" style="cursor:pointer">
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
        const boton = document.getElementById(`btn-agregar-${producto.id}`);
        if (boton) {
            boton.onclick = () => { // Usamos onclick para evitar duplicados
                agregarProductoAlCarrito(producto);
            };
        }
    });
}

// 5. Agregar al carrito
function agregarProductoAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
    const indice = carrito.findIndex(item => item.id === producto.id);

    if (indice !== -1) {
        carrito[indice].cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
    alert(`${producto.title} ${producto.category} agregado al carrito!`);
}

// Ejecución inicial
document.addEventListener('DOMContentLoaded', cargarProductos);