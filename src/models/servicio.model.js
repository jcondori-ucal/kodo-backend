const {
  crearError,
  esTextoValido,
  convertirNumero,
  convertirBooleano,
  revisarCamposPermitidos,
} = require('../utils/validaciones');

const CATEGORIAS_PERMITIDAS = [
  'mantenimiento',
  'diagnostico',
  'frenos',
  'neumaticos',
  'electrico',
  'planchado_pintura',
];

const CAMPOS_PERMITIDOS = ['nombre', 'categoria', 'descripcion', 'precio', 'duracion_min', 'activo'];

const PRECIO_MAXIMO = 999999.99;

function revisarCampos(datos) {
  revisarCamposPermitidos(datos, CAMPOS_PERMITIDOS);
}

function validarServicio(datos) {
  const errores = [];

  if (!esTextoValido(datos.nombre, 100)) {
    errores.push('nombre es obligatorio y debe tener máximo 100 caracteres');
  }

  if (!CATEGORIAS_PERMITIDAS.includes(datos.categoria)) {
    errores.push(`categoria debe ser una de: ${CATEGORIAS_PERMITIDAS.join(', ')}`);
  }

  const tieneDescripcion =
    datos.descripcion !== undefined && datos.descripcion !== null && datos.descripcion !== '';
  if (tieneDescripcion && !esTextoValido(datos.descripcion, 255)) {
    errores.push('descripcion debe ser texto de máximo 255 caracteres');
  }

  const precio = convertirNumero(datos.precio);
  if (precio === null || precio <= 0 || precio > PRECIO_MAXIMO) {
    errores.push(`precio debe ser un número mayor que 0 y menor o igual a ${PRECIO_MAXIMO}`);
  }

  const duracionMinutos = convertirNumero(datos.duracion_min);
  if (duracionMinutos === null || !Number.isInteger(duracionMinutos) || duracionMinutos <= 0) {
    errores.push('duracion_min debe ser un número entero de minutos mayor que 0');
  }

  const activo = datos.activo === undefined ? true : convertirBooleano(datos.activo);
  if (activo === null) {
    errores.push('activo debe ser true o false');
  }

  if (errores.length > 0) {
    throw crearError('Datos del servicio no válidos', 400, errores);
  }

  return {
    nombre: datos.nombre.trim(),
    categoria: datos.categoria,
    descripcion: tieneDescripcion ? datos.descripcion.trim() : null,
    precio: Math.round(precio * 100) / 100,
    duracion_min: duracionMinutos,
    activo: activo ? 1 : 0,
  };
}

function validarFiltros(filtros = {}) {
  const filtrosLimpios = {};

  if (filtros.categoria !== undefined) {
    if (!CATEGORIAS_PERMITIDAS.includes(filtros.categoria)) {
      throw crearError(`categoria debe ser una de: ${CATEGORIAS_PERMITIDAS.join(', ')}`, 400);
    }
    filtrosLimpios.categoria = filtros.categoria;
  }

  if (filtros.activo !== undefined) {
    const activo = convertirBooleano(filtros.activo);
    if (activo === null) throw crearError('El filtro activo debe ser true o false', 400);
    filtrosLimpios.activo = activo ? 1 : 0;
  }

  return filtrosLimpios;
}

module.exports = {
  CATEGORIAS_PERMITIDAS,
  CAMPOS_PERMITIDOS,
  PRECIO_MAXIMO,
  revisarCampos,
  validarServicio,
  validarFiltros,
};
