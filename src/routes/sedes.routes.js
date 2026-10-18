const { Router } = require('express');
const controladorSedes = require('../controllers/sedes.controller');

const enrutador = Router();

enrutador.get('/', controladorSedes.obtenerSedes);
enrutador.get('/:id', controladorSedes.obtenerSedePorId);
enrutador.post('/', controladorSedes.registrarSede);
enrutador.put('/:id', controladorSedes.modificarSede);
enrutador.delete('/:id', controladorSedes.borrarSede);

module.exports = enrutador;
