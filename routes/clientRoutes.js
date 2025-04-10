// Importamos Express y creamos un router
const express = require("express");
const router = express.Router();
const aToken = require("../middleware/authMiddleware").authenticateToken

// Importamos el controlador de cliente
const clientController = require("../controllers/clientController");

// Definimos las rutas para gestionar los clientes

//Obtener todas los clientes
router.post("/get", aToken,clientController.getClients);

// Obtener un cliente por su ID
router.post("/get/:id", aToken, clientController.getClientById);

// Crear un nuevo cliente
router.post("/", aToken,clientController.createClient);

// Actualizar un cliente por ID
router.put("/:id", aToken, clientController.updateClientById);

// Eliminar un cliente por ID
router.delete("/:id", aToken, clientController.deleteClientById);


// Exportamos el router para que pueda ser utilizado en la aplicación principal
module.exports = router;
