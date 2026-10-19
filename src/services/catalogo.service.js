// Servicio: lógica de negocio; no conoce req/res ni SQL
const catalogoRepository = require('../repositories/catalogo.repository');
const Catalogo = require('../models/catalogo.model');
const AppError = require('../utils/AppError');

async function listar() {
  return catalogoRepository.findAll();
}

async function obtenerPorId(id) {
  const catalogo = await catalogoRepository.findById(id);
  if (!catalogo) throw new AppError(404, `El vehículo del catálogo con id ${id} no existe`);
  return catalogo;
}

async function crear(datos) {
  const errores = Catalogo.validar(datos);
  if (errores.length) throw new AppError(400, 'Datos de catálogo inválidos', errores);

  // Regla de negocio: la combinación modelo + version + anio no se puede repetir
  if (await catalogoRepository.findByModeloVersionAnio(datos.modelo, datos.version, datos.anio)) {
    throw new AppError(409, 'La combinación modelo, versión y año ya existe');
  }
  return catalogoRepository.create(datos);
}

async function actualizar(id, datos) {
  const errores = Catalogo.validar(datos);
  if (errores.length) throw new AppError(400, 'Datos de catálogo inválidos', errores);

  const otro = await catalogoRepository.findByModeloVersionAnio(datos.modelo, datos.version, datos.anio);
  if (otro && otro.id !== id) {
    throw new AppError(409, 'La combinación modelo, versión y año ya existe');
  }
  const catalogo = await catalogoRepository.update(id, datos);
  if (!catalogo) throw new AppError(404, `El vehículo del catálogo con id ${id} no existe`);
  return catalogo;
}

async function eliminar(id) {
  const eliminado = await catalogoRepository.remove(id);
  if (!eliminado) throw new AppError(404, `El vehículo del catálogo con id ${id} no existe`);
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
