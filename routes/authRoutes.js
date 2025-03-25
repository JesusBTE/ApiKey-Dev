// Importamos Express y creamos un router
const express = require("express");
const router = express.Router();

// Importamos el controlador de  autorización
const authController = require("../controllers/authController");

// Definimos las rutas para gestionar el registro 

router.post("/register", authController.register);

router.post("/key", authController.getKey)

router.post("/newkey", authController.updateSecretKey )

router.put("/", authController.updateUser)

router.delete("/", authController.deleteUser)
// Exportamos el router para que pueda ser utilizado en la aplicación principal

module.exports = router;
