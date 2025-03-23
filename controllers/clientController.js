const admin = require("../config/config");
const db = admin.firestore();
const collection = db.collection("client");
const { userCollection } = require("../models/organization");

class ClientController {
  static async createClient(req, res) {
    try {
      // Extraer la API Key desde el body
      const { ...clientData } = req.body;
      // Extraer el ID del usuario desde la solicitud
      const id = req.id;
      if (!id) {
        return res
          .status(400)
          .json({ message: "ID de usuario no proporcionado" });
      }
      // Referencia al documento del usuario
      const userRef = userCollection.doc(id);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      // Crear un nuevo documento en la colección "client"
      const newClientRef = collection.doc();
      await newClientRef.set({
        id: newClientRef.id, // ID generado automáticamente
        ...clientData, // Datos del cliente que vienen del body o de otra fuente
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Fecha de creación
      });

      // Añadir el ID del nuevo cliente al array de clientes del usuario
      await userRef.update({
        clients: admin.firestore.FieldValue.arrayUnion(newClientRef.id),
      });

      // Respuesta exitosa
      res
        .status(201)
        .json({
          message: "Cliente creado correctamente",
          id: newClientRef.id,
          ...clientData,
        });
    } catch (error) {
      console.error("Error al crear cliente:", error);
      res.status(400).json({ message: "Error al procesar la solicitud" });
    }
  }

  static async getClients(req, res) {
    try {
      const id = req.id;
      if (!id) {
        return res
          .status(400)
          .json({ message: "ID de usuario no proporcionado" });
      }
      // Referencia al documento del usuario
      const userRef = userCollection.doc(id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      // Obtener el arreglo de IDs de clientes del usuario
      const userClients = userDoc.data().clients || [];

      if (userClients.length === 0) {
        return res.status(200).json([]);
      }
      // Obtener los documentos de los clientes que pertenecen al usuario
      const clientsSnapshot = await collection
        .where(admin.firestore.FieldPath.documentId(), "in", userClients)
        .get();

      if (clientsSnapshot.empty) {
        return res.status(404).json({ message: "No se encontraron clientes" });
      }

      // Mapear los documentos a un arreglo de clientes
      const clients = clientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Respuesta exitosa
      res.status(200).json(clients);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      res.status(400).json({ message: "Error al recuperar los clientes" });
    }
  }
}
// Exportamos la clase para que pueda ser utilizada en las rutas
module.exports = ClientController;
