const { Router } = require('express');
const controladorServicios = require('../controllers/servicios.controller');

const enrutador = Router();

enrutador.get('/', controladorServicios.obtenerServicios);
enrutador.get('/:id', controladorServicios.obtenerServicioPorId);
enrutador.post('/', controladorServicios.registrarServicio);
enrutador.put('/:id', controladorServicios.modificarServicio);
enrutador.delete('/:id', controladorServicios.borrarServicio);

module.exports = enrutador;
