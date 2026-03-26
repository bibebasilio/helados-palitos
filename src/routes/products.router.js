import {Router} from "express"

const router = Router();

//  todas las app las reemplazo x router
/*const products = [{      // se trajo index.js provisoriamente
 */ // pasa al controlador
    
    
    router.get("/", (req, res) => {
    res.json({ message: "bienvenidos a nuestra Api Rest!" });
}); 

// rutas metodo get
import {
    getAllProducts,
    searchProducts,
    getProductById,
//aca tengo que importa create product viene de product.contollers.js
    createProduct,
    deleteProduct,
    updateProduct,
    updatePatchProduct,
        

} from "../controllers/products.controlles.js";
//----------------------------------------------------------------------
import { verifyToken } from "../middlewares/verify-token.js";

// aplico el middleware a todas las rutas definidas despues de esta linea
// router.use(verifyToken);   
//----------------------------------------------------------------------

router.get("/products", getAllProducts);
// (req, res) => {
router.get("/products/search", searchProducts);
router.get("/products/:id", getProductById);
//creamo ruta post
router.post("/products", verifyToken, createProduct);
                       //----------  
router.delete("/products/:id", deleteProduct);

router.put("/products/:id", updateProduct);
router.patch("/products/:id", updatePatchProduct);


   /* const { category } = req.query;

    if (category) {
        const productsFiltered = products.filter((item) =>
            item.categories.includes(category)
        );

        return res.json(productsFiltered);
    
    } else {
        res.json(products);
    }
});*/

//  buscamos x nombre articulo

// ruta get id

// -------
export default router;

