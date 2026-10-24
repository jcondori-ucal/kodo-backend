/**
 * Ruta de solo lectura para saber qué vehiculo_id usar al crear una reserva.
 *   GET /api/vehiculos
 * Sedes y servicios ya tienen su CRUD en /api/sedes y /api/servicios.
 */
const { Router } = require('express');
const lookups = require('../repositories/lookups.repository');

const router = Router();

router.get('/vehiculos', async (req, res, next) => {
  try { res.json(await lookups.listarVehiculos()); } catch (e) { next(e); }
});

module.exports = router;
