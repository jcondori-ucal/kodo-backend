/**
 * Configuración de Express (Arquitectura Base)
 * Integrante 1: Servidor HTTP, Middlewares y Enrutador inicial.
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// Manejador global para rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({
    error: `Ruta "${req.method} ${req.originalUrl}" no encontrada en la API de Kodo Motors`
  });
});

module.exports = app;
