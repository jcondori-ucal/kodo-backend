/**
 * Rutas del recurso Catálogo. Se montan en /api/catalogo desde src/routes/index.js.
 *
 *   GET    /api/catalogo          lista (?incluir_inactivos=true muestra también los de baja)
 *   GET    /api/catalogo/:id      un vehículo
 *   POST   /api/catalogo          crea
 *   PUT    /api/catalogo/:id      actualiza
 *   DELETE /api/catalogo/:id      da de baja (borrado lógico)
 */
const { Router } = require('express');
const catalogoController = require('../controllers/catalogo.controller');
const validarId = require('../middlewares/validarId');

const router = Router();

router.get('/', catalogoController.listar);
router.get('/:id', validarId, catalogoController.obtenerPorId);
router.post('/', catalogoController.crear);
router.put('/:id', validarId, catalogoController.actualizar);
router.delete('/:id', validarId, catalogoController.eliminar);

module.exports = router;
