/**
 * Rutas: Endpoints del recurso Encuestas (Kodo Motors)
 * Prefijo: /api/encuestas
 */
const { Router } = require('express');
const encuestasController = require('../controllers/encuestas.controller');

const router = Router();

// Handlers pasados por referencia (sin paréntesis)
router.get('/', encuestasController.listar);
router.get('/:id', encuestasController.obtenerPorId);
router.post('/', encuestasController.crear);
router.put('/:id', encuestasController.actualizar);
router.delete('/:id', encuestasController.eliminar);

module.exports = router;
