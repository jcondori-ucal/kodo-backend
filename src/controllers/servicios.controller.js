// Controlador de servicios: recibe req, llama al servicio y responde; los errores van a next()
const logicaServicios = require('../services/servicios.service');

async function obtenerServicios(req, res, next) {
  try {
    const listaServicios = await logicaServicios.listarServicios(req.query);
    res.status(200).json(listaServicios);
  } catch (error) {
    next(error);
  }
}

async function obtenerServicioPorId(req, res, next) {
  try {
    const servicio = await logicaServicios.buscarServicioPorId(Number(req.params.id));
    res.status(200).json(servicio);
  } catch (error) {
    next(error);
  }
}

async function registrarServicio(req, res, next) {
  try {
    const servicioNuevo = await logicaServicios.crearServicio(req.body);
    res.status(201).json(servicioNuevo);
  } catch (error) {
    next(error);
  }
}

async function modificarServicio(req, res, next) {
  try {
    const servicioActualizado = await logicaServicios.actualizarServicio(Number(req.params.id), req.body);
    res.status(200).json(servicioActualizado);
  } catch (error) {
    next(error);
  }
}

async function borrarServicio(req, res, next) {
  try {
    await logicaServicios.eliminarServicio(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerServicios,
  obtenerServicioPorId,
  registrarServicio,
  modificarServicio,
  borrarServicio,
};
