const repositorio = require('../repositories/servicios.repository');
const modelo = require('../models/servicio.model');
const { crearError } = require('../utils/validaciones');

async function listarServicios(filtros = {}) {
  const filtrosLimpios = modelo.validarFiltros(filtros);
  return repositorio.listar(filtrosLimpios);
}

async function buscarServicioPorId(id) {
  const servicio = await repositorio.buscarPorId(id);
  if (!servicio) {
    throw crearError(`No existe un servicio con id ${id}`, 404);
  }
  return servicio;
}

async function crearServicio(datos) {
  modelo.revisarCampos(datos);
  const servicioLimpio = modelo.validarServicio(datos);

  const idNuevo = await repositorio.crear(servicioLimpio);
  return buscarServicioPorId(idNuevo);
}

async function actualizarServicio(id, cambios) {
  modelo.revisarCampos(cambios);
  if (Object.keys(cambios).length === 0) {
    throw crearError('Envía al menos un campo para actualizar', 400);
  }

  const servicioActual = await buscarServicioPorId(id);

  const servicioCombinado = { ...servicioActual, ...cambios };
  const servicioLimpio = modelo.validarServicio(servicioCombinado);

  await repositorio.actualizar(id, servicioLimpio);
  return buscarServicioPorId(id);
}

async function eliminarServicio(id) {
  const servicioEliminado = await buscarServicioPorId(id);
  await repositorio.eliminar(id);
  return servicioEliminado;
}

module.exports = {
  listarServicios,
  buscarServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
};
