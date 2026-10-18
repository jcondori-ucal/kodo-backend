/**
 * Controlador: Gestión HTTP de Repuestos (Kodo Motors)
 * Maneja req/res, captura excepciones y responde con JSON y códigos HTTP semánticos.
 */
const repuestosService = require('../services/repuestos.service');
const HttpError = require('../utils/http-error');

async function listar(req, res) {
  try {
    const filtros = {
      modelo_compatible: req.query.modelo_compatible,
      bajo_stock: req.query.bajo_stock
    };
    const repuestos = await repuestosService.listar(filtros);
    res.status(200).json(repuestos);
  } catch (error) {
    responderError(res, error);
  }
}

async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const repuesto = await repuestosService.obtenerPorId(id);
    res.status(200).json(repuesto);
  } catch (error) {
    responderError(res, error);
  }
}

async function crear(req, res) {
  try {
    const nuevo = await repuestosService.crear(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    responderError(res, error);
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const actualizado = await repuestosService.actualizar(id, req.body);
    res.status(200).json(actualizado);
  } catch (error) {
    responderError(res, error);
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.params;
    const resultado = await repuestosService.eliminar(id);
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}

function responderError(res, error) {
  if (error instanceof HttpError || error.statusCode) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      error: error.message,
      detalles: error.detalles || undefined
    });
  }

  console.error('🔥 [CRÍTICO] Error interno no controlado en Repuestos:', error);
  return res.status(500).json({
    error: 'Error interno del servidor. Por favor contacte al administrador.'
  });
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
