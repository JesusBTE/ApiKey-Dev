// Importamos Express y creamos un router
const express = require("express");
const router = express.Router();

// Importamos el controlador de cliente
const clientController = require("../controllers/clientController");

// Definimos las rutas para gestionar los clientes

//Obtener todas los clientes
router.get("/", clientController.getClients);


// Crear un nuevo cliente
router.post("/", clientController.createClient);


// Exportamos el router para que pueda ser utilizado en la aplicación principal
module.exports = router;
