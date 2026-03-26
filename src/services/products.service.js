const products = [
{ id: 1, name: "Product 1", price: 100 },
{ id: 2, name: "Product 2", price: 200 },
{ id: 3, name: "Product 3", price: 300 },
];


const getProducts = () => products;

const getProductById = (id) => {
    return products.find((p) => p.id == id);
}

const createProduct = (name, price) => {
    const product = {
      id: Math.max(...products.map(p => p.id)) + 1,
      name,
      price,
    };
    products.push(product);
    return product;
};

const deleteProduct = (id) => {
    const index = products.findIndex((p) => p.id == id);
    if (index !== -1) {
        products.splice(index, 1);
    }
};      

const updateProduct = (id, name, price) => {
    const product = products.find((p) => p.id == id);
    if (product) {
        product.name = name;
        product.price = price;
    }
    return product;
};      



export default {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct   
};
