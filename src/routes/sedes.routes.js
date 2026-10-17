// =====================================================================
// routes/sedes.routes.js · Endpoints del módulo Sedes
// Responsable: Alejandro (Parte 5)
//
// Aquí solo se dice QUÉ función atiende cada método y ruta.
// Todas empiezan con /api/sedes (se conecta en routes/index.js)
// =====================================================================
const { Router } = require('express');
const controladorSedes = require('../controllers/sedes.controller');

const enrutador = Router();

enrutador.get('/', controladorSedes.obtenerSedes);            // listar
enrutador.get('/:id', controladorSedes.obtenerSedePorId);     // consultar una
enrutador.post('/', controladorSedes.registrarSede);          // registrar
enrutador.put('/:id', controladorSedes.modificarSede);        // actualizar
enrutador.delete('/:id', controladorSedes.borrarSede);        // eliminar

module.exports = enrutador;
