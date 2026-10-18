// Controlador: recibe req, llama al servicio y responde con res
const catalogoService = require('../services/catalogo.service');
const { responderError } = require('../utils/http-error');

async function listar(req, res) {
  try {
    const catalogo = await catalogoService.listar();
    res.status(200).json(catalogo);
  } catch (error) {
    responderError(res, error);
  }
}

async function obtenerPorId(req, res) {
  try {
    const vehiculo = await catalogoService.obtenerPorId(req.params.id);
    res.status(200).json(vehiculo);
  } catch (error) {
    responderError(res, error);
  }
}

async function crear(req, res) {
  try {
    const vehiculo = await catalogoService.crear(req.body);
    res.status(201).json(vehiculo);
  } catch (error) {
    responderError(res, error);
  }
}

async function actualizar(req, res) {
  try {
    const vehiculo = await catalogoService.actualizar(req.params.id, req.body);
    res.status(200).json(vehiculo);
  } catch (error) {
    responderError(res, error);
  }
}

async function eliminar(req, res) {
  try {
    await catalogoService.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    responderError(res, error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
