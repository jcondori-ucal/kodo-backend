/**
 * Configuración de Express (Arquitectura Base)
 * Integrante 1: Servidor HTTP, Middlewares y Enrutador inicial.
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const repuestosRoutes = require('./routes/repuestos.routes');
const encuestasRoutes = require('./routes/encuestas.routes');

const app = express();

// Middlewares globales
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// Endpoint raíz de bienvenida y diagnóstico
app.get('/', (req, res) => {
  res.status(200).json({
    empresa: 'KODO MOTORS',
    proyecto: 'API REST por Capas (EE2)',
    version: '1.0.0',
    estado: 'Servidor Express Inicializado',
    modulosAsignados: [
      '11. Repuestos (/api/repuestos)',
      '12. Encuestas (/api/encuestas)'
    ]
  });
});

// Montaje de las rutas por módulo
app.use('/api/repuestos', repuestosRoutes);
app.use('/api/encuestas', encuestasRoutes);

// Manejador global para rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({
    error: `Ruta "${req.method} ${req.originalUrl}" no encontrada en la API de Kodo Motors`
  });
});

// Manejador de errores: lleva 4 parámetros; con 3 Express no lo reconoce como tal.
// Atrapa el JSON mal formado del body, que si no responde una página HTML.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
