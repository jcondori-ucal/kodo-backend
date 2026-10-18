const repositorio = require('../repositories/sedes.repository');
const modelo = require('../models/sede.model');
const { crearError } = require('../utils/validaciones');

async function listarSedes(filtros = {}) {
  const filtrosLimpios = modelo.validarFiltros(filtros);
  return repositorio.listar(filtrosLimpios);
}

async function buscarSedePorId(id) {
  const sede = await repositorio.buscarPorId(id);
  if (!sede) {
    throw crearError(`No existe una sede con id ${id}`, 404);
  }
  return sede;
}

async function crearSede(datos) {
  modelo.revisarCampos(datos);
  const sedeLimpia = modelo.validarSede(datos);

  const idNuevo = await repositorio.crear(sedeLimpia);
  return buscarSedePorId(idNuevo);
}

async function actualizarSede(id, cambios) {
  modelo.revisarCampos(cambios);
  if (Object.keys(cambios).length === 0) {
    throw crearError('Envía al menos un campo para actualizar', 400);
  }

  const sedeActual = await buscarSedePorId(id);

  const sedeCombinada = { ...sedeActual, ...cambios };
  const sedeLimpia = modelo.validarSede(sedeCombinada);

  await repositorio.actualizar(id, sedeLimpia);
  return buscarSedePorId(id);
}

async function eliminarSede(id) {
  const sedeEliminada = await buscarSedePorId(id);
  await repositorio.eliminar(id);
  return sedeEliminada;
}

module.exports = {
  listarSedes,
  buscarSedePorId,
  crearSede,
  actualizarSede,
  eliminarSede,
};
