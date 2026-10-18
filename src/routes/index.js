// =====================================================================
// routes/index.js · Punto de entrada de todas las rutas bajo /api
// Responsable: Rachel (Parte 1)
//
// Cada módulo tiene su propio archivo de rutas y se conecta aquí.
// =====================================================================
const { Router } = require('express');
const { revisarSalud } = require('../controllers/salud.controller');
const rutasServicios = require('./servicios.routes');

const enrutador = Router();

// GET /api/salud -> comprueba la conexión con MySQL
enrutador.get('/salud', revisarSalud);

// ---- Módulos del equipo (cada integrante agrega su línea aquí) ----
enrutador.use('/servicios', rutasServicios); // CRUD de Servicios (Anthony)

module.exports = enrutador;
