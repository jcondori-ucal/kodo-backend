/**
 * Servicio: Reglas de Negocio para Repuestos (Kodo Motors)
 * Desacoplado de HTTP. Valida inventarios, unicidad de código y bloquea borrado con stock.
 */
const repuestosRepository = require('../repositories/repuestos.repository');
const Repuesto = require('../models/repuesto.model');
const HttpError = require('../utils/http-error');

function validarId(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new HttpError(400, 'El parámetro ID debe ser un número entero positivo');
  }
  return numero;
}

async function listar(filtros = {}) {
  return await repuestosRepository.findAll(filtros);
}

async function obtenerPorId(id) {
  const idValido = validarId(id);
  const repuesto = await repuestosRepository.findById(idValido);
  if (!repuesto) {
    throw new HttpError(404, `Repuesto con ID ${idValido} no encontrado en el inventario`);
  }
  return repuesto;
}

async function crear(datos) {
  // 1. Validar forma y campos obligatorios
  const errores = Repuesto.validar(datos, false);
  if (errores.length > 0) {
    throw new HttpError(400, 'Datos de repuesto inválidos', errores);
  }

  // 2. Regla de negocio: El código de repuesto debe ser único
  const existente = await repuestosRepository.findByCodigo(datos.codigo);
  if (existente) {
    throw new HttpError(400, `Ya existe un repuesto registrado con el código "${datos.codigo.trim().toUpperCase()}"`);
  }

  // 3. Crear en base de datos
  return await repuestosRepository.create(datos);
}

async function actualizar(id, datos) {
  const idValido = validarId(id);
  const existente = await obtenerPorId(idValido);

  const errores = Repuesto.validar(datos, true);
  if (errores.length > 0) {
    throw new HttpError(400, 'Datos de actualización inválidos', errores);
  }

  // Si actualiza código, verificar que no colisione con otro
  if (datos.codigo && datos.codigo.trim().toUpperCase() !== existente.codigo) {
    const colision = await repuestosRepository.findByCodigo(datos.codigo);
    if (colision && colision.id !== idValido) {
      throw new HttpError(400, `El código "${datos.codigo.trim().toUpperCase()}" ya pertenece a otro repuesto`);
    }
  }

  const datosCompletos = {
    codigo: datos.codigo || existente.codigo,
    nombre: datos.nombre || existente.nombre,
    modelo_compatible: datos.modelo_compatible || existente.modeloCompatible,
    stock: datos.stock !== undefined ? datos.stock : existente.stock,
    stock_minimo: datos.stock_minimo !== undefined ? datos.stock_minimo : existente.stockMinimo,
    precio: datos.precio !== undefined ? datos.precio : existente.precio,
    ubicacion: datos.ubicacion !== undefined ? datos.ubicacion : existente.ubicacion
  };

  return await repuestosRepository.update(idValido, datosCompletos);
}

async function eliminar(id) {
  const idValido = validarId(id);
  const existente = await obtenerPorId(idValido);

  // Regla de Negocio de Almacén: No eliminar si aún tiene stock físico
  if (existente.stock > 0) {
    throw new HttpError(
      400,
      `No se puede eliminar el repuesto "${existente.nombre}" porque todavía cuenta con stock disponible (${existente.stock} unidades). Ajuste el stock a 0 antes de darlo de baja.`
    );
  }

  await repuestosRepository.remove(idValido);
  return {
    mensaje: `Repuesto "${existente.nombre}" (Código: ${existente.codigo}) eliminado exitosamente del catálogo.`,
    repuestoEliminado: existente
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
