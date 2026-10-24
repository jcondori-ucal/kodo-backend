/**
 * Rutas: Endpoints del recurso Encuestas (Kodo Motors)
 * Prefijo: /api/encuestas · DELETE es borrado lógico
 */
const { Router } = require('express');
const encuestasController = require('../controllers/encuestas.controller');
const validarId = require('../middlewares/validarId');

const router = Router();

// Handlers pasados por referencia (sin paréntesis)
router.get('/', encuestasController.listar);
router.get('/:id', validarId, encuestasController.obtenerPorId);
router.post('/', encuestasController.crear);
router.put('/:id', validarId, encuestasController.actualizar);
router.delete('/:id', validarId, encuestasController.eliminar);

module.exports = router;
