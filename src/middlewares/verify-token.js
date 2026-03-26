import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {// Middleware para verificar el token JWT
    const authHeader = req.headers.authorization; // Obtener el encabezado de autorización
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }
    try {
         
        const token = authHeader.split(" ")[1]; // Extraer el token del encabezado
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar y decodificar el token
        req.user = decoded; // Almacenar la información del usuario en la solicitud
        next(); // Continuar al siguiente middleware o ruta
    } catch (error) {
        return res.status(401).json({ message: "Token inválido" });
    }   

};
