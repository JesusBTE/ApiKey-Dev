const admin = require("../config/config");
const db = admin.firestore();
const collection = db.collection("Client");

class Client {
  /**
   * Crea un nuevo cliente en la base de datos.
   * @param {Object} clientData - Datos del cliente.
   * @returns {Object} - Mensaje de éxito o error.
   */
  static async createClient(clientData) {
    try {
      // Lista de campos obligatorios para crear un cliente
      const requiredFields = [
        "legal_name",
        "tax_id",
        "tax_system",
        "email",
        "phone",
        "default_invoice_use",
        "address",
      ];

      // Validar que todos los campos obligatorios estén presentes en los datos del cliente
      for (const field of requiredFields) {
        if (!clientData[field]) {
          throw new Error(`El campo ${field} es obligatorio.`);
        }
      }

      // Lista de campos obligatorios dentro del objeto "address"
      const addressFields = [
        "street",
        "exterior",
        "neighborhood",
        "city",
        "municipality",
        "zip",
        "state",
        "country",
      ];

      // Validar que la dirección contenga todos los campos requeridos
      for (const field of addressFields) {
        if (!clientData.address[field]) {
          throw new Error(`El campo address.${field} es obligatorio.`);
        }
      }

      // Generar una API Key única para el cliente
      const apiKey = Client.generateApiKey();

      // Crear un nuevo documento en Firestore con un ID único
      const newClientRef = collection.doc();
      await newClientRef.set({
        id: newClientRef.id, // Se almacena el ID generado automáticamente
        apiKey, // Se guarda la API Key generada
        ...clientData, // Se almacenan los datos del cliente
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Se agrega la fecha de creación
      });

      // Devolver mensaje de éxito con el ID del cliente y su API Key generada
      return {
        success: true,
        message: "Cliente creado correctamente",
        id: newClientRef.id,
        apiKey,
      };
    } catch (error) {
      console.error("Error al crear cliente:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Genera una API Key única para cada cliente.
   * @returns {string} - API Key generada aleatoriamente.
   */
  static generateApiKey() {
    // Genera una cadena de 30 caracteres aleatorios usando base 36
    return [...Array(30)].map(() => Math.random().toString(36)[2]).join("");
  }
}

// Exportar la clase para ser utilizada en otras partes del sistema
module.exports = Client;
