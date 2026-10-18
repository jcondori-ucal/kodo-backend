const { Router } = require('express');
const { revisarSalud } = require('../controllers/salud.controller');
const rutasServicios = require('./servicios.routes');
const rutasSedes = require('./sedes.routes');

const enrutador = Router();

enrutador.get('/salud', revisarSalud);

enrutador.use('/servicios', rutasServicios);
enrutador.use('/sedes', rutasSedes);

module.exports = enrutador;
