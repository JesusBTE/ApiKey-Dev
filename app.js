// Importamos Express para crear el servidor
const express = require("express");
const app = express();

// Importamos las rutas de clientes
const clientRoutes = require("./routes/clientRoutes");
const authRoutes = require("./routes/authRoutes");

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Definimos la ruta base para la API de Clientes
app.use("/apiV1/client", clientRoutes);

// Definimos la ruta base para la Autenticación

app.use("/apiV1/auth", authRoutes);

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Definimos el puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 3001;

// Iniciamos el servidor y mostramos un mensaje en la consola
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
