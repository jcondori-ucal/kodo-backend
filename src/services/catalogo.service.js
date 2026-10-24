// Servicio: lógica de negocio; no conoce req/res ni SQL
const catalogoRepository = require('../repositories/catalogo.repository');
const Catalogo = require('../models/catalogo.model');
const HttpError = require('../utils/http-error');
const { incluyeInactivos } = require('../utils/validaciones');

async function listar(filtros = {}) {
  return catalogoRepository.findAll({ incluirInactivos: incluyeInactivos(filtros.incluir_inactivos) });
}

async function obtenerPorId(id) {
  const catalogo = await catalogoRepository.findById(id);
  if (!catalogo) throw new HttpError(404, `El vehículo del catálogo con id ${id} no existe`);
  return catalogo;
}

// Regla de negocio: la combinación modelo + version + anio no se puede repetir,
// ni siquiera con un vehículo dado de baja (la tabla tiene UNIQUE)
async function verificarCombinacionLibre(datos, idActual = null) {
  const otro = await catalogoRepository.findByModeloVersionAnio(datos.modelo, datos.version, datos.anio);
  if (!otro || otro.id === idActual) return;
  if (otro.activo) {
    throw new HttpError(409, 'La combinación modelo, versión y año ya existe');
  }
  throw new HttpError(409, `La combinación modelo, versión y año pertenece a un vehículo dado de baja (id ${otro.id})`);
}

async function crear(datos) {
  const errores = Catalogo.validar(datos);
  if (errores.length) throw new HttpError(400, 'Datos de catálogo inválidos', errores);

  await verificarCombinacionLibre(datos);
  return catalogoRepository.create(datos);
}

async function actualizar(id, datos) {
  const errores = Catalogo.validar(datos);
  if (errores.length) throw new HttpError(400, 'Datos de catálogo inválidos', errores);

  await verificarCombinacionLibre(datos, id);
  const catalogo = await catalogoRepository.update(id, datos);
  if (!catalogo) throw new HttpError(404, `El vehículo del catálogo con id ${id} no existe`);
  return catalogo;
}

async function eliminar(id) {
  const eliminado = await catalogoRepository.remove(id);
  if (!eliminado) throw new HttpError(404, `El vehículo del catálogo con id ${id} no existe`);
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
