
///  esto es para instalas firebase

import { db } from "./firebase.js";

import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, setDoc, updateDoc, query, where} from "firebase/firestore";

const productsCollection = collection(db, "products");

export const getAllProducts = async () => {
    try {
       const snapshot = await getDocs(productsCollection);
       return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al obtener los documentos: ", error);
    }
};    

export const getProductById = async (id) => {
    try {
        const productRef = doc(productsCollection, id); 
        const snapshot = await getDoc(productRef); 
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
     } catch (error) {
        console.error("Error al obtener el documento: ", error);
        throw error;
    }       
};

//// para filtrar productos por categoria
export const getProductsByCategory = async (category) => {
    try {
        const q = query(productsCollection, where("categories", "array-contains", category));

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Error al obtener los documentos: ", error);
        throw error;
    }
};




export const createProduct = async(data) => {
try {
    const docRef = await addDoc(productsCollection, data);
    return { id: docRef.id, ...data };
   // console.log("Documento escrito con ID: ", docRef.id);
} catch (error) {
    console.error("Error añadiendo documento: ", error);
}           
    
  //  console.log(data);
   
};  

export const deleteProduct = async (id) => {
    try {
        const productRef = doc(productsCollection, id);
        const snapshot = await getDoc(productRef);

        if (!snapshot.exists()) {
            // throw new Error("No Existe el Producto"); 
            return false;
        } 
            await deleteDoc(productRef);
            return true;

    } catch (error) {
        
        console.error("Error al eliminar el documento: ", error);
    }

};

export const updateProduct = async (id, data) => {
    try {
        const productRef = doc(productsCollection, id);
        const snapshot = await getDoc(productRef);          


        if (!snapshot.exists()) {
            return null;
        }
        await setDoc(productRef, data, { merge: true }); // actualiza los campos especificados sin sobrescribir todo el documento
        return { id, ...data };
    }       
    catch (error) {
        console.error("Error al actualizar el documento: ", error);
        throw error;
    }   
};

export const updatePatchProduct = async (id, data) => {
    try {
        const productRef = doc(productsCollection, id);
        const snapshot = await getDoc(productRef);          


        if (!snapshot.exists()) {
            return false;
        }
        await setDoc(productRef, data, { merge: true });
        // actualiza los campos especificados sin sobrescribir todo el documento
       // await updateDoc(productRef, data);  // usa updateDoc para actualizar solo los campos proporcionados
        return { id, ...data };
    }       
    catch (error) {
        console.error("Error al actualizar el documento: ", error);
        throw error;
    }   
};

