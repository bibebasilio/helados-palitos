
let tipo = ''
let elegido = [];

const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const cerrar = document.getElementById('close');

if (bar) {
bar.addEventListener('click', () => {
nav.classList.add('active')
})
}

if (cerrar) {
cerrar.addEventListener('click', (e) => {
e.preventDefault();
nav.classList.remove('active')
})
}

let forma = []
///////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
    const productos = document.querySelectorAll('.producto');

    productos.forEach(producto => {
        producto.addEventListener("click", (e) => {
            // Buscamos el atributo data-formato en el div padre
            const formatoElegido = e.currentTarget.getAttribute('data-formato');
            
            if (formatoElegido) {
                localStorage.setItem('formato', JSON.stringify(formatoElegido));
                console.log("Guardado en local:", formatoElegido);
                // El enlace del HTML se encargará de llevarte a tienda.html
            }
        });
    });
});

//////////////////////////////////////

// Esta ruta la consultará tu PC cada 15 segundos
app.get('/api/pedidos/pendientes', (req, res) => {
    const pendientes = pedidos.filter(p => p.impreso === false);
    res.json(pendientes);
});

// Esta ruta la llamará tu PC después de que la térmica saque el papel
app.post('/api/pedidos/marcar-impreso/:id', (req, res) => {
    const { id } = req.params;
    const pedido = pedidos.find(p => p.id == id);
    
    if (pedido) {
        pedido.impreso = true; // Lo marcamos para que no se duplique
        console.log(`Pedido ${id} marcado como impreso.`);
        res.status(200).send("OK");
    } else {
        res.status(404).send("Pedido no encontrado");
    }
});


////////////////////////////////////////////



/*document.getElementById('btn-verde').addEventListener('click', () => {
    //const forma = document.getElementsByClassName('producto')
     let ele = "Tabletas x 2Uns"; 
    alert("Elegiste " + ele + "!!!!");
    //alert("¡Botón verde presionado!");
      const productos = document.querySelectorAll('.producto');

        // Corregido: forEach (con 'a')
        productos.forEach(producto => {
            producto.addEventListener("click", (e) => {
                // Usamos e.currentTarget para asegurarnos de obtener el elemento 
                // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
                const formatoElegido = e.currentTarget.dataset.formato;
                //  console.log("formato seleccionado:", formatoElegido);
                console.log(elegido, "elegido");
                elegido.push(formatoElegido);
                localStorage.setItem('formato', JSON.stringify(formatoElegido));
    
                
            });
        });
    return
});

document.getElementById('btn-rojo').addEventListener('click', () => {
   let ele = "Gourmet x 3Uns "; 
    alert("Elegiste " + ele + "!!!!");
  //  alert("¡Botón  rojo presionado!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido1 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido1);
        elegido.push(formatoElegido1);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido1));
        return
        //formatoElegido = "                    "
    });
});
   
                        });*/

/*document.getElementById('btn-rojo').addEventListener('click', () => {
    console.log("Hiciste clic en el botón rojo");
});*/

/*document.getElementById('btn-azul').addEventListener('click', () => {
   // alert("¡Botón  azul presionado!");
 let ele = "Lolitas"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        return
    });
});
});


document.getElementById('btn-ambar').addEventListener('click', () => {
    // alert("¡Botón  ambar presionado!");
 let ele = "Pinito"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
                
    });
});
});


document.getElementById('btn-marron').addEventListener('click', () => {
   // alert("¡Botón  marron presionado!");
 let ele = "Palitos"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
        
    });
});
});


document.getElementById('btn-negro').addEventListener('click', () => {
    let ele = "Palito Bombon"; 
    alert("Elegiste " + ele + "!!!!");

    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});

document.getElementById('btn-metal').addEventListener('click', () => {
   // alert("¡Botón  metal presionado!");
   let ele = "Palito Granizado"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});


document.getElementById('btn-amarillo').addEventListener('click', () => {
    //alert("¡Botón amarillo presionado!");
 let ele = "Vasito 1 Bocha"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});

document.getElementById('btn-naranja').addEventListener('click', () => {
    //alert("¡Botón naranja presionado!");
     let ele = "Vasito Base Rellena"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});

document.getElementById('btn-blanco').addEventListener('click', () => {
    //alert("¡Botón blanco presionado!");
     let ele = "Cilindro"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});

document.getElementById('btn-gris').addEventListener('click', () => {
   // alert("¡Botón gris presionado!");
 let ele = "Drill"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});

document.getElementById('btn-celeste').addEventListener('click', () => {
   // alert("¡Botón celeste presionado!");
     let ele = "Rellenos"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});

document.getElementById('btn-turquesa').addEventListener('click', () => {
   // alert("¡Botón turquesa presionado!");
    let ele = "Mega";
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});

document.getElementById('btn-lila').addEventListener('click', () => {
    //alert("¡Botón lila presionado!");
 let ele = "Pote Boutique x 10Uns"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});


document.getElementById('btn-opaco').addEventListener('click', () => {
    //alert("¡Botón opaco presionado!");
      let ele = "Especiales"; 
    alert("Elegiste " + ele + "!!!!");
    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});


document.getElementById('btn-aclaro').addEventListener('click', () => {
    // alert("¡Botón aclaro presionado!");
     let ele = "Eventos"; 
    alert("Elegiste " + ele + "!!!!");

    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});
document.getElementById('btn-oro').addEventListener('click', () => {
    //alert("¡Botón oro presionado!");
          let ele = "Ofertas "; 
    alert("Elegiste " + ele + "!!!!");


    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});










//ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo*/
const formatoElegido = "                         ";
const formatoElegido1 = "                           ";
const formatoElegido2 = "                           ";


/*const btnVerde = document.getElementById('btn-verde');
const btnRojo = document.getElementById('btn-rojo');
const btnAzul = document.getElementById('btn-azul');
//-------------------------------------   verde ---
/*if (btnVerde) {
    btnVerde.addEventListener('click', () => {
        const productos = document.querySelectorAll('.producto');

        // Corregido: forEach (con 'a')
        productos.forEach(producto => {
            producto.addEventListener("click", (e) => {
                // Usamos e.currentTarget para asegurarnos de obtener el elemento 
                // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
                const formatoElegido = e.currentTarget.dataset.formato;
                //  console.log("formato seleccionado:", formatoElegido);
                console.log(elegido, "elegido");
                elegido.push(formatoElegido);
                localStorage.setItem('formato', JSON.stringify(formatoElegido));
                
            });
        });
    });
};*/
//------------------------------ rojo
       // const tipo = "Tabletas"; // Tu lógica
/*if (btnRojo) {
    btnRojo.addEventListener('click', () => {
const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido1 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido1);
        elegido.push(formatoElegido1);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido1));
        //formatoElegido = "                    "
    });
});
       // const tipo = "Gourmet"; // Tu lógica aquí
    });
}*/
/////// oro ofertas
/* aca document.getElementById('btn-naranja').addEventListener('click', () => {
    alert("¡Botón naranja presionado!");

    const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});
});

//-------------------------------- azul
if (btnAzul) {
    btnAzul.addEventListener('click', () => {
const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido2 = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido2);
        elegido.push(formatoElegido2);
        console.log(elegido, "elegido");
        localStorage.setItem('formato', JSON.stringify(formatoElegido2));
        
    });
});    
      //  const tipo = "Lolita"; // Tu lógica aquí
    });
}


//console.log(tipo);


/*const productos = document.querySelectorAll('.producto');

// Corregido: forEach (con 'a')
productos.forEach(producto => {
    producto.addEventListener("click", (e) => {
        // Usamos e.currentTarget para asegurarnos de obtener el elemento 
        // que tiene el listener, incluso si haces clic en un hijo (como un <span> o <img>)
        const formatoElegido = e.currentTarget.dataset.formato;
        console.log("formato seleccionado:", formatoElegido);
        elegido.push(formatoElegido);
        console.log(elegido, "elegido")
        formatoElegido = "                    "
    });
});

/*const tipoDiv = miDiv.dataset.tipo;
console.log(tipoDiv, "div seleccionado");

elegido.push(tipoDiv);
console.log(elegido, "array formatos");*/

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active')
    })
}

if (cerrar) {
    cerrar.addEventListener('click', (e) => {
        e.preventDefault();
        nav.classList.remove('active')
    })
}