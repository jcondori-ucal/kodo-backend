/**
 * Rutas del recurso Reservas. Se montan en /api/reservas desde src/routes/index.js.
 *
 *   GET    /api/reservas          lista (filtros: ?estado=&fecha=&sede_id=&incluir_inactivos=true)
 *   GET    /api/reservas/:id      una reserva
 *   POST   /api/reservas          crea
 *   PUT    /api/reservas/:id      actualiza
 *   DELETE /api/reservas/:id      da de baja (borrado lógico)
 */
const { Router } = require('express');
const controlador = require('../controllers/reserva.controller');
const validarId = require('../middlewares/validarId');

const router = Router();

router.get('/', controlador.listar);
router.get('/:id', validarId, controlador.obtenerPorId);
router.post('/', controlador.crear);
router.put('/:id', validarId, controlador.actualizar);
router.delete('/:id', validarId, controlador.eliminar);

module.exports = router;
