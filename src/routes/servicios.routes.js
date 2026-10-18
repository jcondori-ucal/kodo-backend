// =====================================================================
// routes/servicios.routes.js · Endpoints del módulo Servicios
// Responsable: Anthony (Parte 3)
//
// Aquí solo se dice QUÉ función atiende cada método y ruta.
// Todas empiezan con /api/servicios (se conecta en routes/index.js)
// =====================================================================
const { Router } = require('express');
const controladorServicios = require('../controllers/servicios.controller');

const enrutador = Router();

enrutador.get('/', controladorServicios.obtenerServicios);           // listar
enrutador.get('/:id', controladorServicios.obtenerServicioPorId);    // consultar uno
enrutador.post('/', controladorServicios.registrarServicio);         // registrar
enrutador.put('/:id', controladorServicios.modificarServicio);       // actualizar
enrutador.delete('/:id', controladorServicios.borrarServicio);       // eliminar

module.exports = enrutador;
