// Controlador: recibe req, llama al servicio y responde con res.
// Los errores se pasan a next() y los atiende el middleware errorHandler.
const catalogoService = require('../services/catalogo.service');

async function listar(req, res, next) {
  try {
    const catalogo = await catalogoService.listar();
    res.status(200).json(catalogo);
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const vehiculo = await catalogoService.obtenerPorId(Number(req.params.id));
    res.status(200).json(vehiculo);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const vehiculo = await catalogoService.crear(req.body);
    res.status(201).json(vehiculo);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const vehiculo = await catalogoService.actualizar(Number(req.params.id), req.body);
    res.status(200).json(vehiculo);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await catalogoService.eliminar(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
