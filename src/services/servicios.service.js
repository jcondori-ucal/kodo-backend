const { conexion } = require('../config/db');
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

async function listarServicios(filtros = {}) {
  const condiciones = [];
  const valores = [];

  if (filtros.categoria !== undefined) {
    if (!CATEGORIAS_PERMITIDAS.includes(filtros.categoria)) {
      throw crearError(`categoria debe ser una de: ${CATEGORIAS_PERMITIDAS.join(', ')}`, 400);
    }
    condiciones.push('categoria = ?');
    valores.push(filtros.categoria);
  }

  if (filtros.activo !== undefined) {
    const activo = convertirBooleano(filtros.activo);
    if (activo === null) throw crearError('El filtro activo debe ser true o false', 400);
    condiciones.push('activo = ?');
    valores.push(activo ? 1 : 0);
  }

  let consulta = 'SELECT * FROM servicios';
  if (condiciones.length > 0) consulta += ' WHERE ' + condiciones.join(' AND ');
  consulta += ' ORDER BY id';

  const [filas] = await conexion.execute(consulta, valores);
  return filas;
}

async function buscarServicioPorId(id) {
  const [filas] = await conexion.execute('SELECT * FROM servicios WHERE id = ?', [id]);
  if (filas.length === 0) {
    throw crearError(`No existe un servicio con id ${id}`, 404);
  }
  return filas[0];
}

async function crearServicio(datos) {
  revisarCamposPermitidos(datos, CAMPOS_PERMITIDOS);
  const servicioLimpio = validarServicio(datos);

  const [resultado] = await conexion.execute(
    `INSERT INTO servicios (nombre, categoria, descripcion, precio, duracion_min, activo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      servicioLimpio.nombre,
      servicioLimpio.categoria,
      servicioLimpio.descripcion,
      servicioLimpio.precio,
      servicioLimpio.duracion_min,
      servicioLimpio.activo,
    ]
  );

  return buscarServicioPorId(resultado.insertId);
}

async function actualizarServicio(id, cambios) {
  revisarCamposPermitidos(cambios, CAMPOS_PERMITIDOS);
  if (Object.keys(cambios).length === 0) {
    throw crearError('Envía al menos un campo para actualizar', 400);
  }

  const servicioActual = await buscarServicioPorId(id);

  const servicioCombinado = { ...servicioActual, ...cambios };
  const servicioLimpio = validarServicio(servicioCombinado);

  await conexion.execute(
    `UPDATE servicios
        SET nombre = ?, categoria = ?, descripcion = ?, precio = ?, duracion_min = ?, activo = ?
      WHERE id = ?`,
    [
      servicioLimpio.nombre,
      servicioLimpio.categoria,
      servicioLimpio.descripcion,
      servicioLimpio.precio,
      servicioLimpio.duracion_min,
      servicioLimpio.activo,
      id,
    ]
  );

  return buscarServicioPorId(id);
}

async function eliminarServicio(id) {
  const servicioEliminado = await buscarServicioPorId(id);
  await conexion.execute('DELETE FROM servicios WHERE id = ?', [id]);
  return servicioEliminado;
}

module.exports = {
  listarServicios,
  buscarServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
};
