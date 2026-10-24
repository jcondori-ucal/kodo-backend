/**
 * Rutas: Endpoints del recurso Repuestos (Kodo Motors)
 * Prefijo: /api/repuestos
 */
const { Router } = require('express');
const repuestosController = require('../controllers/repuestos.controller');

const router = Router();

// Handlers pasados por referencia (sin paréntesis)
router.get('/', repuestosController.listar);
router.get('/:id', repuestosController.obtenerPorId);
router.post('/', repuestosController.crear);
router.put('/:id', repuestosController.actualizar);
router.delete('/:id', repuestosController.eliminar);

module.exports = router;
