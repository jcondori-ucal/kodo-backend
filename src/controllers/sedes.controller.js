const logicaSedes = require('../services/sedes.service');
const { convertirId } = require('../utils/validaciones');

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

async function obtenerSedePorId(req, res, next) {
  try {
    const idSede = convertirId(req.params.id);
    const sedeEncontrada = await logicaSedes.buscarSedePorId(idSede);
    res.status(200).json({ ok: true, datos: sedeEncontrada });
  } catch (error) {
    next(error);
  }
}

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
