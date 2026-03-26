import { Router } from "express";   

import { register, login } from "../controllers/auth.controller.js";

const router = Router();

router.post('/register', register);
    // Lógica para registrar un nuevo usuario
router.post('/login', login); 


export default router;