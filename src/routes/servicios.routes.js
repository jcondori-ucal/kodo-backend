// Rutas de servicios: se montan en /api/servicios
const { Router } = require('express');
const controladorServicios = require('../controllers/servicios.controller');
const validarId = require('../middlewares/validarId');

const enrutador = Router();

enrutador.get('/', controladorServicios.obtenerServicios);
enrutador.get('/:id', validarId, controladorServicios.obtenerServicioPorId);
enrutador.post('/', controladorServicios.registrarServicio);
enrutador.put('/:id', validarId, controladorServicios.modificarServicio);
enrutador.delete('/:id', validarId, controladorServicios.borrarServicio);

module.exports = enrutador;
