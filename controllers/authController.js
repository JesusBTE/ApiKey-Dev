const { userCollection } = require("../models/organization");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.register = async (req, res) => {
  // Extraer los datos del cuerpo de la solicitud
  const { username, password } = req.body;

  // Verificar que ambos campos sean proporcionados
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Se requieren usuario y contraseña" });
  }

  try {
    // Buscar si el usuario ya existe en Firestore
    const userSnapshot = await userCollection
      .where("username", "==", username)
      .get();

    // Si ya existe un usuario con el mismo nombre, retorna un error
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Encripta la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(password, 10);

    // Genera una clave secreta única para el usuario
    const uniqueSecretKey = crypto.randomBytes(32).toString("hex");

    // Estructura del nuevo usuario a registrar en Firestore
    const newUser = {
      username,
      password: hashedPassword, // Guarda la contraseña cifrada
      secretKey: uniqueSecretKey, // Guarda la clave secreta única
    };

    // Agregar el nuevo usuario a la colección en Firestore
    await userCollection.add(newUser);

    // Respuesta de éxito con la clave secreta generada
    res.status(201).json({
      message: "Usuario registrado correctamente",
      secretKey: uniqueSecretKey,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    // Respuesta de error en caso de fallos en el servidor
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
