const admin = require("../config/config"); // Importa la configuración de Firebase Admin
const db = admin.firestore(); // Obtiene la instancia de Firestore

// Define la colección "organization" en Firestore
const userCollection = db.collection("organization");

// Exporta la colección para ser utilizada en otros módulos
module.exports = { userCollection };
