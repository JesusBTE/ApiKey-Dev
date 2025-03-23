const { userCollection } = require("../models/organization");
const admin = require("../config/config");
const db = admin.firestore();
const collection = db.collection("client");
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
      clients: [],
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
    res.status(422).json({ message: "Error al procesar la contraseña" });
  }
};

exports.getKey = async (req, res) => {
  // Extraer los datos del cuerpo de la solicitud
  const { username, password } = req.body;

  // Verificar que ambos campos sean proporcionados
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Se requieren usuario y contraseña" });
  }

  try {
    // Buscar el usuario en Firestore
    const userSnapshot = await userCollection
      .where("username", "==", username)
      .get();

    // Si no se encuentra el usuario, retorna un error
    if (userSnapshot.empty) {
      return res.status(404).json({ message: "Credenciales incorrectas" });
    }

    // Obtener el primer documento que coincide con la consulta
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Si la contraseña es válida, devolver la secretKey
    res.status(200).json({
      message: "Clave secreta obtenida correctamente",
      secretKey: userData.secretKey,
    });
  } catch (error) {
    console.error("Error al obtener la clave secreta:", error);

    // Respuesta de error en caso de fallos
    return res.status(400).json({
      message:
        "Error en la solicitud. Verifica los datos e inténtalo de nuevo.",
    });
  }
};

exports.updateSecretKey = async (req, res) => {
  // Extraer los datos del cuerpo de la solicitud
  const { username, password } = req.body;

  // Verificar que ambos campos sean proporcionados
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Se requieren usuario y contraseña" });
  }

  try {
    // Buscar el usuario en Firestore
    const userSnapshot = await userCollection
      .where("username", "==", username)
      .get();

    // Si no se encuentra el usuario, retorna un error
    if (userSnapshot.empty) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener el primer documento que coincide con la consulta
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar una nueva clave secreta única
    const newSecretKey = crypto.randomBytes(32).toString("hex");

    // Actualizar la secretKey en Firestore
    await userCollection.doc(userDoc.id).update({
      secretKey: newSecretKey,
    });

    // Respuesta exitosa con la nueva secretKey
    res.status(200).json({
      message: "Clave secreta actualizada correctamente",
      secretKey: newSecretKey,
    });
  } catch (error) {
    console.error("Error al actualizar la clave secreta:", error);

    // Respuesta de error en caso de fallos en el servidor
    return res.status(409).json({
      message:
        "No se pudo actualizar la clave secreta. Por favor, intenta de nuevo más tarde.",
    });
  }
};

exports.updateUser = async (req, res) => {
  // Extraer los datos del cuerpo de la solicitud
  const { username, password, newUsername, newPassword } = req.body;

  // Verificar que los campos requeridos sean proporcionados
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Se requieren usuario y contraseña actuales" });
  }

  // if (!newUsername || !newPassword) {
  //   return res
  //     .status(400)
  //     .json({ message: "Se requieren usuario y contraseña nuevas" });
  // }
  try {
    // Buscar el usuario en Firestore
    const userSnapshot = await userCollection
      .where("username", "==", username)
      .get();

    // Si no se encuentra el usuario, retorna un error
    if (userSnapshot.empty) {
      return res.status(404).json({ message: "Credenciales incorrectas" });
    }

    // Obtener el primer documento que coincide con la consulta
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Verificar si el nuevo nombre de usuario ya está en uso
    if (newUsername) {
      const newUsernameSnapshot = await userCollection
        .where("username", "==", newUsername)
        .get();

      // Si ya existe un usuario con el nuevo nombre de usuario, retorna un error
      if (!newUsernameSnapshot.empty) {
        return res
          .status(400)
          .json({ message: "El nombre de usuario ya está en uso" });
      }
    }

    // Generar una nueva clave secreta única
    const newSecretKey = crypto.randomBytes(32).toString("hex");

    // Encriptar la nueva contraseña (si se proporciona)
    const hashedNewPassword = newPassword
      ? await bcrypt.hash(newPassword, 10)
      : userData.password;

    // Actualizar los campos en Firestore
    const updateData = {
      secretKey: newSecretKey, // Siempre se actualiza la secretKey
      password: hashedNewPassword, // Actualiza la contraseña si se proporciona
    };

    // Si se proporciona un nuevo nombre de usuario, actualizarlo
    if (newUsername) {
      updateData.username = newUsername;
    }

    await userCollection.doc(userDoc.id).update(updateData);

    // Respuesta exitosa con la nueva secretKey
    res.status(200).json({
      message: "Usuario actualizado correctamente",
      secretKey: newSecretKey,
    });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);

    // Respuesta de error en caso de fallos
    res.status(422).json({ message: "No se pudo actualizar el usuario" });
  }
};

exports.deleteUser = async (req, res) => {
  // Extraer los datos del cuerpo de la solicitud
  const { username, password } = req.body;

  // Verificar que los campos requeridos sean proporcionados
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Se requieren usuario y contraseña" });
  }

  try {
    // Buscar el usuario en Firestore
    const userSnapshot = await userCollection
      .where("username", "==", username)
      .get();

    // Si no se encuentra el usuario, retorna un error
    if (userSnapshot.empty) {
      return res.status(404).json({ message: "Credenciales Incorrectas" });
    }

    // Obtener el primer documento que coincide con la consulta
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales Incorrectas" });
    }

    // Obtener la lista de clientes asociados al usuario
    const userClients = userData.clients || [];

    // Eliminar todos los clientes asociados al usuario
    if (userClients.length > 0) {
      const batch = db.batch(); // Usar un batch para eliminar en lote
      userClients.forEach((clientId) => {
        const clientRef = collection.doc(clientId);
        batch.delete(clientRef);
      });
      await batch.commit(); // Ejecutar el batch
    }

    // Eliminar el usuario
    await userCollection.doc(userDoc.id).delete();

    // Respuesta exitosa
    res
      .status(200)
      .json({ message: "Usuario y clientes eliminados correctamente" });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);

    // Respuesta de error en caso de fallos
    res.status(422).json({ message: "No se pudo eliminar el usuario" });
  }
};
