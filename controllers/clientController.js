const admin = require("../config/config");
const db = admin.firestore();
const collection = db.collection("client");

class ClientController {
  static async createClient(req, res) {
    try {
      // Extraer la API Key desde el body
      const { api_key, ...clientData } = req.body;

      // Verificar que la API Key esté presente en el body
      if (!api_key) {
        return res.status(400).json({ message: "API Key requerida." });
      }


      // Crea un nuevo documento en la colección "client"
      const newClientRef = collection.doc();
      await newClientRef.set({
        id: newClientRef.id, // ID generado automáticamente
        ...clientData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res
        .status(201)
        .json({ message: "Cliente creado correctamente", id: newClientRef.id });
    } catch (error) {
      console.error("Error al crear cliente:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async getClients(req, res) {
    try {
      // Extraer la API Key desde el body
      const { api_key } = req.body;

      // Verificar que la API Key esté presente en el body
      if (!api_key) {
        return res.status(400).json({ message: "API Key requerida." });
      }

      // Obtener todos los clientes de la colección "client"
      const snapshot = await collection.get();
      const clients = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(clients);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

// Exportamos la clase para que pueda ser utilizada en las rutas
module.exports = ClientController;
