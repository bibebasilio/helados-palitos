//  todas las app las reemplazo x router
// los productos pasaron al modelo archivo Product.js

// importo de modelo los productos
import * as Model  from "../models/Product.js";

// agregamos el async xq getAllProducts es async en products.js 
export const getAllProducts = async (req, res) => {
    // viene de productsroute.js
    const { category } = req.query;

    /// coloco await xq getAllProducts es async en products.js
    //const products = await Model.getAllProducts(); // lo paso abajo xq si viene category hago otro llamado

    if (category) {
        const productsByCategory = await Model.getProductsByCategory(category);
        //console.log(productsByCategory.length);

       return res.json(productsByCategory);
    
    
    }
    const products = await Model.getAllProducts();

    res.json(products);
};


export const searchProducts = async (req, res) => {
    const { name } = req.query;
   
    if (!name) {
        return res.status(400).json({ error: " El nombre es requerido" });
    }
    
const products = await Model.getAllProducts();

    const productsFiltered = products.filter((item) => item.name.toLowerCase().includes(name.toLowerCase())
    );

    if (!productsFiltered) {

        return res.status(404).json({ error: " No se econtraron Productos" });
    }
    res.json(productsFiltered);
};



export const getProductById = async (req, res) => {
    // quito el parseInt xq en firebase el id es string
    const id =(req.params.id);

    // const product = products.find((item) => item.id == id); cambiamos por model
    const product = await Model.getProductById(id);
   // //const product = Model.getPtroductById(id);
    
    if (!product) {
        
        res.status(404).json({ error: "No Existe el Producto" });
    }

    res.json(product);
};

//creo funcinon porq voy a exportar
// aca en req recibo el curpo de la peticion
export const createProduct = async (req, res) => {
    const { name, price, categories } = req.body;

    const product = await Model.createProduct({ name, price, categories });//
    // aca iria la logica para guardar en la base de datos

    console.log("Producto creado:", { name, price, categories });   
    // res.send("ok");
    res.status(201).json(product);
};

export const deleteProduct = async (req, res) => {
    const id = req.params.id;       
    // logica para eliminar el producto de la base de datos
    // por ejemplo, llamar a una función del modelo para eliminar el producto
    console.log(`Producto con ID ${id} eliminado`);
    res.json({ message: `Producto con ID ${id} eliminado` });


    const deleted = await Model.deleteProduct(id);
    if (!deleted) {
        return res.status(404).json({ error: "No Existe el Producto" });
    }   
    res.json({ message: "Producto eliminado correctamente" });
};

export const updateProduct = async (req, res) => {
    const id = req.params.id;
    const { name, price, categories } = req.body; 

    if (!name || !price || !categories) {
        return res.status(400).json({ error: "Faltan datos para actualizar el producto" });
    }           
    
    const updatedProduct = await Model.updateProduct(id, { name, price, categories });

    if (!updatedProduct) {
        return res.status(404).json({ error: "No Existe el Producto" });
    }
    res.json(updatedProduct);
};          

export const updatePatchProduct = async (req, res) => {
    const { id } = req.params;

    const data = {};

     if (req.body.name !== undefined) data.name = req.body.name;
     if (req.body.price !== undefined) data.price = req.body.price;
    if (req.body.categories !== undefined) data.categories = req.body.categories;  

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "Faltan datos para actualizar el producto" });
    }     
    
    const { name, price, categories } = req.body;
    
      if (!name || !price || !categories) {
        return res.status(400).json({ error: "Faltan datos para actualizar el producto" });
    }
    
    const updatedProduct = await Model.updatePatchProduct(id, { data });

    if (!updatedProduct) {
        return res.status(404).json({ error: "No Existe el Producto" });
    }
    res.json(updatedProduct);
};
//  buscamos x nombre articulo
// ruta get id
// -------



