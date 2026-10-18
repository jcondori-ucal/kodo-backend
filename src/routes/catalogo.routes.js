// Rutas: asocian método HTTP + URL con una función del controlador
const { Router } = require('express');
const catalogoController = require('../controllers/catalogo.controller');

const router = Router();

router.get('/', catalogoController.listar);
router.get('/:id', catalogoController.obtenerPorId);
router.post('/', catalogoController.crear);
router.put('/:id', catalogoController.actualizar);
router.delete('/:id', catalogoController.eliminar);

module.exports = router;
