/**
 * Servicio: Reglas de Negocio para Encuestas de Satisfacción (Kodo Motors)
 * Valida estado de la orden de servicio ('entregado') e impide encuestas duplicadas.
 */
const encuestasRepository = require('../repositories/encuestas.repository');
const Encuesta = require('../models/encuesta.model');
const HttpError = require('../utils/http-error');

function validarId(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new HttpError(400, 'El parámetro ID debe ser un número entero positivo');
  }
  return numero;
}

async function listar(filtros = {}) {
  return await encuestasRepository.findAll(filtros);
}

async function obtenerPorId(id) {
  const idValido = validarId(id);
  const encuesta = await encuestasRepository.findById(idValido);
  if (!encuesta) {
    throw new HttpError(404, `Encuesta con ID ${idValido} no encontrada`);
  }
  return encuesta;
}

async function crear(datos) {
  // 1. Validar forma del dato (puntuación de 1 a 5, recomendaria booleano)
  const errores = Encuesta.validar(datos, false);
  if (errores.length > 0) {
    throw new HttpError(400, 'Datos de encuesta inválidos', errores);
  }

  const ordenId = Number(datos.orden_id);

  // 2. Regla de Negocio: La orden de servicio debe existir
  const orden = await encuestasRepository.findOrdenServicioById(ordenId);
  if (!orden) {
    throw new HttpError(404, `No se puede registrar la encuesta: La orden de servicio #${ordenId} no existe`);
  }

  // 3. Regla de Negocio Crítica: Solo se encuesta si el servicio ya fue ENTREGADO al cliente
  if (orden.estado !== 'entregado') {
    throw new HttpError(
      400,
      `No se puede encuestar la orden #${ordenId} porque su estado es "${orden.estado}". Solo se admiten encuestas para órdenes con estado "entregado".`
    );
  }

  // 4. Regla de Negocio: Cada orden de servicio solo puede tener una única encuesta (evitar duplicidad)
  const encuestaExistente = await encuestasRepository.findByOrdenId(ordenId);
  if (encuestaExistente) {
    throw new HttpError(400, `La orden de servicio #${ordenId} ya cuenta con una encuesta de satisfacción registrada (ID: ${encuestaExistente.id})`);
  }

  return await encuestasRepository.create(datos);
}

async function actualizar(id, datos) {
  const idValido = validarId(id);
  const existente = await obtenerPorId(idValido);

  const errores = Encuesta.validar(datos, true);
  if (errores.length > 0) {
    throw new HttpError(400, 'Datos de actualización de encuesta inválidos', errores);
  }

  const datosCompletos = {
    puntuacion: datos.puntuacion !== undefined ? datos.puntuacion : existente.puntuacion,
    recomendaria: datos.recomendaria !== undefined ? datos.recomendaria : existente.recomendaria,
    comentario: datos.comentario !== undefined ? datos.comentario : existente.comentario
  };

  return await encuestasRepository.update(idValido, datosCompletos);
}

async function eliminar(id) {
  const idValido = validarId(id);
  const existente = await obtenerPorId(idValido);

  await encuestasRepository.remove(idValido);
  return {
    mensaje: `Encuesta #${idValido} (Orden #${existente.ordenId}) eliminada exitosamente.`,
    encuestaEliminada: existente
  };
}

module.exports = {
  validarId,
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
