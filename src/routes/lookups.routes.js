/**
 * Rutas de solo lectura para saber qué IDs usar al crear una reserva.
 *   GET /api/sedes   GET /api/servicios   GET /api/vehiculos
 */
const { Router } = require('express');
const lookups = require('../repositories/lookups.repository');

const router = Router();

router.get('/sedes', async (req, res, next) => {
  try { res.json(await lookups.listarSedes()); } catch (e) { next(e); }
});
router.get('/servicios', async (req, res, next) => {
  try { res.json(await lookups.listarServicios()); } catch (e) { next(e); }
});
router.get('/vehiculos', async (req, res, next) => {
  try { res.json(await lookups.listarVehiculos()); } catch (e) { next(e); }
});

module.exports = router;
