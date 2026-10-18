/**
 * Controlador de Reservas: recibe la petición, llama al servicio y responde JSON.
 * No contiene reglas de negocio ni SQL.
 */
const servicio = require('../services/reserva.service');

async function listar(req, res, next) {
  try {
    const reservas = await servicio.listar(req.query);
    res.status(200).json(reservas);
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const reserva = await servicio.obtenerPorId(Number(req.params.id));
    res.status(200).json(reserva);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const reserva = await servicio.crear(req.body);
    res.status(201).json(reserva);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const reserva = await servicio.actualizar(Number(req.params.id), req.body);
    res.status(200).json(reserva);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await servicio.eliminar(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
