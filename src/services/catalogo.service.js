// Servicio: lógica de negocio; no conoce req/res ni SQL
const catalogoRepository = require('../repositories/catalogo.repository');
const Catalogo = require('../models/catalogo.model');
const { HttpError } = require('../utils/http-error');

function validarId(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new HttpError(400, 'El id debe ser un entero positivo');
  }
  return numero;
}

async function listar() {
  return catalogoRepository.findAll();
}

async function obtenerPorId(id) {
  const catalogo = await catalogoRepository.findById(validarId(id));
  if (!catalogo) throw new HttpError(404, 'Vehículo del catálogo no encontrado');
  return catalogo;
}

async function crear(datos) {
  const errores = Catalogo.validar(datos);
  if (errores.length) throw new HttpError(400, 'Datos inválidos', errores);

  // Regla de negocio: la combinación modelo + version + anio no se puede repetir
  if (await catalogoRepository.findByModeloVersionAnio(datos.modelo, datos.version, datos.anio)) {
    throw new HttpError(409, 'La combinación modelo, versión y año ya existe');
  }
  return catalogoRepository.create(datos);
}

async function actualizar(id, datos) {
  const idValido = validarId(id);
  const errores = Catalogo.validar(datos);
  if (errores.length) throw new HttpError(400, 'Datos inválidos', errores);

  const otro = await catalogoRepository.findByModeloVersionAnio(datos.modelo, datos.version, datos.anio);
  if (otro && otro.id !== idValido) {
    throw new HttpError(409, 'La combinación modelo, versión y año ya existe');
  }
  const catalogo = await catalogoRepository.update(idValido, datos);
  if (!catalogo) throw new HttpError(404, 'Vehículo del catálogo no encontrado');
  return catalogo;
}

async function eliminar(id) {
  const eliminado = await catalogoRepository.remove(validarId(id));
  if (!eliminado) throw new HttpError(404, 'Vehículo del catálogo no encontrado');
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
