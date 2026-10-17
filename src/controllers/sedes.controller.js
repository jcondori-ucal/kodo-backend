// =====================================================================
// controllers/sedes.controller.js · Recibe la petición y responde
// Responsable: Alejandro (Parte 5)
//
// El controlador NO toca la base de datos. Solo:
//   1. lee lo que llega (req.params, req.query, req.body)
//   2. llama a la capa de servicio (sedes.service.js)
//   3. responde al cliente con res.status().json()
// Si algo falla, pasa el error a manejarErrores con next(error).
// =====================================================================
const logicaSedes = require('../services/sedes.service');
const { convertirId } = require('../utils/validaciones');

// GET /api/sedes  ->  200 con la lista (acepta ?distrito= y ?activa=)
async function obtenerSedes(req, res, next) {
  try {
    const listaSedes = await logicaSedes.listarSedes(req.query);
    res.status(200).json({
      ok: true,
      total: listaSedes.length,
      datos: listaSedes,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/sedes/:id  ->  200 con la sede, o 404 si no existe
async function obtenerSedePorId(req, res, next) {
  try {
    const idSede = convertirId(req.params.id);
    const sedeEncontrada = await logicaSedes.buscarSedePorId(idSede);
    res.status(200).json({ ok: true, datos: sedeEncontrada });
  } catch (error) {
    next(error);
  }
}

// POST /api/sedes  ->  201 (creado) con la sede nueva
async function registrarSede(req, res, next) {
  try {
    const sedeNueva = await logicaSedes.crearSede(req.body);
    res.status(201).json({
      ok: true,
      mensaje: 'Sede registrada correctamente',
      datos: sedeNueva,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/sedes/:id  ->  200 con la sede actualizada
async function modificarSede(req, res, next) {
  try {
    const idSede = convertirId(req.params.id);
    const sedeActualizada = await logicaSedes.actualizarSede(idSede, req.body);
    res.status(200).json({
      ok: true,
      mensaje: 'Sede actualizada correctamente',
      datos: sedeActualizada,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/sedes/:id  ->  200 con la sede que se eliminó
async function borrarSede(req, res, next) {
  try {
    const idSede = convertirId(req.params.id);
    const sedeEliminada = await logicaSedes.eliminarSede(idSede);
    res.status(200).json({
      ok: true,
      mensaje: 'Sede eliminada correctamente',
      datos: sedeEliminada,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerSedes,
  obtenerSedePorId,
  registrarSede,
  modificarSede,
  borrarSede,
};
