const admin = require("../config/config");
const db = admin.firestore();
const jwt = require("jsonwebtoken");

exports.authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token desde el encabezado "Authorization"
    const token = req.header("Authorization");

    // Si no hay token, denegar el acceso
    if (!token) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // Remover el prefijo "Bearer " del token
    const tokenWithoutBearer = token.replace("Bearer ", "");

    // Decodificar el token sin verificarlo (para extraer el userId)
    const decoded = jwt.decode(tokenWithoutBearer);

    // Verificar si el token fue decodificado correctamente y tiene un userId válido
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Obtener el usuario desde Firestore usando el userId extraído del token
    const userRef = db.collection("users").doc(decoded.userId);
    const userDoc = await userRef.get();

    // Si el usuario no existe en la base de datos, denegar el acceso
    if (!userDoc.exists) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Obtener la clave secreta única del usuario almacenada en Firestore
    const userData = userDoc.data();
    const userSecretKey = userData.secretKey; // Clave secreta del usuario

    // Verificar el token usando la clave secreta del usuario
    const verified = jwt.verify(tokenWithoutBearer, userSecretKey);

    // Almacenar la información del usuario autenticado en la solicitud
    req.user = verified;

    // Pasar al siguiente middleware o ruta
    next();
  } catch (error) {
    console.error("Error en la autenticación:", error);
    res.status(401).json({ message: "Token inválido" });
  }
};
