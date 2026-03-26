/*import { getProducts , getProductById, createProduct } from "../ssrvices/products.service.js";*/
import productService  from  "../services/products.service.js";    



export const getProducts = (req, res) => {
    res.json(productService.getProducts()); 
    
};
     
export const getProductById = (req, res) => {
    const { id } = req.params;
    const product = productService.getProductById(id);
    
    if (!product) {
        return res.status(404).json({ error: "Product not found" }); 
    } 
    res.json(product); 

};

export const createProduct = (req, res) => {
    if (typeof req.body.name !== 'string' || typeof req.body.price !== 'number'|| typeof req.body.name === undefined  ) {
        return res.status(400).json({ error: "Invalid product data --- El Nombre es OBLIGATORIO" }); // Validate request body
    }   
    const { name, price } = req.body; // Extract name and price from request body
    
    const product = productService.createProduct(name, price);

    res.status(201).json(product); // Respond with the created product  
};  



export const deleteProduct = (req, res) => {
    const { id } = req.params;
    const product = productService.getProductById(id);      
    if (!product) {
        return res.status(404).json({ error: "Product not found" }); 
    }
    productService.deleteProduct(id);
    res.status(204).send();
};
export const updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    const product = productService.getProductById(id);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    const updatedProduct = productService.updateProduct(id, name, price);
    res.json(updatedProduct);
};

