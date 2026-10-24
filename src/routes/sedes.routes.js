// Rutas de sedes: se montan en /api/sedes
const { Router } = require('express');
const controladorSedes = require('../controllers/sedes.controller');
const validarId = require('../middlewares/validarId');

const enrutador = Router();

enrutador.get('/', controladorSedes.obtenerSedes);
enrutador.get('/:id', validarId, controladorSedes.obtenerSedePorId);
enrutador.post('/', controladorSedes.registrarSede);
enrutador.put('/:id', validarId, controladorSedes.modificarSede);
enrutador.delete('/:id', validarId, controladorSedes.borrarSede);

module.exports = enrutador;
