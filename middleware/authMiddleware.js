const admin = require("../config/config");
const { userCollection } = require("../models/organization");
const db = admin.firestore();
const jwt = require("jsonwebtoken");

exports.authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token desde el encabezado "Authorization"
    const api_key = req.body.api_key
    
    // Si no hay token, denegar el acceso
    if (!api_key) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    // // Decodificar el token sin verificarlo (para extraer el userId)
    // const decoded = jwt.decode(tokenWithoutBearer);
    //Se busca si existe un usuario con esta api_key
   
    // Buscar la secretKey en la base de datos de usuarios
    const userSnapshot = await userCollection
      .where("secretKey", "==", api_key)
      .get();

    // Si no existe una secretkey, retorna un error
    if (userSnapshot.empty) {
      return res.status(400).json({ message: "Acceso denegado" });
    }
    //busca el usuario para consultar solo de él
    const id = userSnapshot.docs[0].id;
    // Almacenar la información del usuario autenticado en la solicitud
    req.id = id;
    // Pasar al siguiente middleware o ruta
    next();
  } catch (error) {
    console.error("Error en la autenticación:", error);
    res.status(401).json({ message: "Token inválido" });
  }
};
