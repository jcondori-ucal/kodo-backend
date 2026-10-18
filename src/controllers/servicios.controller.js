const logicaServicios = require('../services/servicios.service');
const { convertirId } = require('../utils/validaciones');

async function obtenerServicios(req, res, next) {
  try {
    const listaServicios = await logicaServicios.listarServicios(req.query);
    res.status(200).json({
      ok: true,
      total: listaServicios.length,
      datos: listaServicios,
    });
  } catch (error) {
    next(error);
  }
}

async function obtenerServicioPorId(req, res, next) {
  try {
    const idServicio = convertirId(req.params.id);
    const servicioEncontrado = await logicaServicios.buscarServicioPorId(idServicio);
    res.status(200).json({ ok: true, datos: servicioEncontrado });
  } catch (error) {
    next(error);
  }
}

async function registrarServicio(req, res, next) {
  try {
    const servicioNuevo = await logicaServicios.crearServicio(req.body);
    res.status(201).json({
      ok: true,
      mensaje: 'Servicio registrado correctamente',
      datos: servicioNuevo,
    });
  } catch (error) {
    next(error);
  }
}

async function modificarServicio(req, res, next) {
  try {
    const idServicio = convertirId(req.params.id);
    const servicioActualizado = await logicaServicios.actualizarServicio(idServicio, req.body);
    res.status(200).json({
      ok: true,
      mensaje: 'Servicio actualizado correctamente',
      datos: servicioActualizado,
    });
  } catch (error) {
    next(error);
  }
}

async function borrarServicio(req, res, next) {
  try {
    const idServicio = convertirId(req.params.id);
    const servicioEliminado = await logicaServicios.eliminarServicio(idServicio);
    res.status(200).json({
      ok: true,
      mensaje: 'Servicio eliminado correctamente',
      datos: servicioEliminado,
    });
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
