/**
 * Controlador: Gestión HTTP de Encuestas de Satisfacción (Kodo Motors)
 * Maneja req/res, captura excepciones y responde con códigos HTTP semánticos y JSON.
 */
const encuestasService = require('../services/encuestas.service');
const HttpError = require('../utils/http-error');

async function listar(req, res) {
  try {
    const filtros = {
      puntuacion: req.query.puntuacion,
      recomendaria: req.query.recomendaria
    };
    const encuestas = await encuestasService.listar(filtros);
    res.status(200).json(encuestas);
  } catch (error) {
    responderError(res, error);
  }
}

async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const encuesta = await encuestasService.obtenerPorId(id);
    res.status(200).json(encuesta);
  } catch (error) {
    responderError(res, error);
  }
}

async function crear(req, res) {
  try {
    const nueva = await encuestasService.crear(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    responderError(res, error);
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const actualizada = await encuestasService.actualizar(id, req.body);
    res.status(200).json(actualizada);
  } catch (error) {
    responderError(res, error);
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.params;
    const resultado = await encuestasService.eliminar(id);
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

  console.error('🔥 [CRÍTICO] Error interno no controlado en Encuestas:', error);
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
