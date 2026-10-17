// =====================================================================
// app.js · Configuración de Express
// Responsable: Rachel (Parte 1)
//
// Aquí armamos la aplicación: middlewares, rutas y manejo de errores.
// El servidor se enciende en server.js (separado para mantener orden).
// =====================================================================
const express = require('express');
const cors = require('cors');
const rutas = require('./routes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/manejarErrores');

const app = express();

// Permite que el frontend (otra dirección, por ejemplo localhost:3000) consuma la API
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Convierte el cuerpo de las peticiones JSON en un objeto que leemos con req.body
app.use(express.json());

// Ruta de bienvenida: muestra qué endpoints tiene la API
app.get('/', (req, res) => {
  res.json({
    ok: true,
    proyecto: 'Kodo Motors API',
    modulos: ['/api/servicios', '/api/sedes'],
    salud: '/api/salud',
  });
});

// Todas las rutas del proyecto empiezan con /api
app.use('/api', rutas);

// Estos dos van AL FINAL: primero la ruta inexistente (404) y luego los errores
app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
