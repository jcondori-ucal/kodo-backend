// =====================================================================
// controllers/servicios.controller.js · Recibe la petición y responde
// Responsable: Anthony (Parte 3)
//
// El controlador NO toca la base de datos. Solo:
//   1. lee lo que llega (req.params, req.query, req.body)
//   2. llama a la capa de servicio (servicios.service.js)
//   3. responde al cliente con res.status().json()
// Si algo falla, pasa el error a manejarErrores con next(error).
// =====================================================================
const logicaServicios = require('../services/servicios.service');
const { convertirId } = require('../utils/validaciones');

// GET /api/servicios  ->  200 con la lista (acepta ?categoria= y ?activo=)
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

// GET /api/servicios/:id  ->  200 con el servicio, o 404 si no existe
async function obtenerServicioPorId(req, res, next) {
  try {
    const idServicio = convertirId(req.params.id);
    const servicioEncontrado = await logicaServicios.buscarServicioPorId(idServicio);
    res.status(200).json({ ok: true, datos: servicioEncontrado });
  } catch (error) {
    next(error);
  }
}

// POST /api/servicios  ->  201 (creado) con el servicio nuevo
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

// PUT /api/servicios/:id  ->  200 con el servicio actualizado
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

// DELETE /api/servicios/:id  ->  200 con el servicio que se eliminó
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
