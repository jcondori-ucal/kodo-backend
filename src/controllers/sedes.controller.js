// Controlador de sedes: recibe req, llama al servicio y responde; los errores van a next()
const logicaSedes = require('../services/sedes.service');

async function obtenerSedes(req, res, next) {
  try {
    const listaSedes = await logicaSedes.listarSedes(req.query);
    res.status(200).json(listaSedes);
  } catch (error) {
    next(error);
  }
}

async function obtenerSedePorId(req, res, next) {
  try {
    const sede = await logicaSedes.buscarSedePorId(Number(req.params.id));
    res.status(200).json(sede);
  } catch (error) {
    next(error);
  }
}

async function registrarSede(req, res, next) {
  try {
    const sedeNueva = await logicaSedes.crearSede(req.body);
    res.status(201).json(sedeNueva);
  } catch (error) {
    next(error);
  }
}

async function modificarSede(req, res, next) {
  try {
    const sedeActualizada = await logicaSedes.actualizarSede(Number(req.params.id), req.body);
    res.status(200).json(sedeActualizada);
  } catch (error) {
    next(error);
  }
}

async function borrarSede(req, res, next) {
  try {
    await logicaSedes.eliminarSede(Number(req.params.id));
    res.status(204).send();
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
