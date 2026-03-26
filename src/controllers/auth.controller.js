import bcrypt from "bcrypt";

import jwt from "jsonwebtoken"; // - ver si lo uso despues

import { createUser, findUserByEmail } from "../models/user.js";    

export const register = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ message: "Email y contrasena requeridos" });
        // Lógica para registrar un nuevo usuario
    };
    
    const existingUser = await findUserByEmail(email); // verifico si existe el email
    if (existingUser) {
        return res.status(409).json({ message: "El email ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10); // 10 es el numero de rondas de salting

    // console.log(email, password, passwordHash); // lo saco y pongo
    
    const user = await createUser(email, passwordHash); 
    if (!user) {
        return res.status(500).json({ message: "Error al crear el usuario" });
    }   
    res.status(201).json({ id: user.id, email: user.email });
};

/// aca empieza login
export const login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(422).json({ message: "Email y contrasena requeridos" });
        // Lógica para registrar un nuevo usuario
    };
    const user = await findUserByEmail(email); // verifico si existe el email
    if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
    }
    //////////////////////////////// valizacion contrasena
    const valid = await bcrypt.compare(password, user.password); // comparo contrasena
    if (!valid) {
        return res.status(401).json({ message: "Credenciales inválidas" });
    }
////////////////////////////////// generacion token JWT
    const token = jwt.sign(  // genero el token UUID
        { userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" }  // el token dura 1 hora o lo que yo quiera
    ); 

    return res.status(200).json({ message: "Login exitoso", token }); //  envio el token al cliente


    

   // res.status(200).json({ message: "Login exitoso" });
};
