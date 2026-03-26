import { db }  from "./firebase.js";

import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

const usersCollection = collection(db, "users");

export const createUser = async (email, passwordHash) => {
    try {
        /* const newUser = {
             email,
             passwordHash,
             createdAt: new Date()*/
        
        const docRef = await addDoc(usersCollection, { email, password: passwordHash, }); //  createdAt: new Date() });
        return {
            id: docRef.id, email, passwordHash
        };
    } catch (error) {
        console.error("Error creando usuario:", error);
        throw error;
    }
};

/// esto es para que no se repita el email al registrarse

export const findUserByEmail = async (email) => {
    try {
        const q = query(usersCollection, where("email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() };   
        } else {
            return null; // No se encontró ningún usuario con ese email
        }       
    } catch (error) {
        console.error("Error buscando usuario por email:", error);
        throw error;
    }

};
