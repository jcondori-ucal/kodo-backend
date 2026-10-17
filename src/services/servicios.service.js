// =====================================================================
// services/servicios.service.js · Lógica de negocio del módulo Servicios
// Responsable: Rachel (Parte 2)
//
// Esta capa es la única que habla con MySQL para la tabla "servicios".
// Valida los datos, arma las consultas SQL y devuelve los resultados.
// No sabe nada de req ni res: eso es trabajo del controlador.
// =====================================================================
const { conexion } = require('../config/db');
const {
  crearError,
  esTextoValido,
  convertirNumero,
  convertirBooleano,
  revisarCamposPermitidos,
} = require('../utils/validaciones');

// Valores que acepta la columna ENUM "categoria" en la base de datos
const CATEGORIAS_PERMITIDAS = [
  'mantenimiento',
  'diagnostico',
  'frenos',
  'neumaticos',
  'electrico',
  'planchado_pintura',
];

// Campos que el cliente puede enviar en POST y PUT (el id lo pone MySQL)
const CAMPOS_PERMITIDOS = ['nombre', 'categoria', 'descripcion', 'precio', 'duracion_min', 'activo'];

// DECIMAL(8,2) admite como máximo 999999.99
const PRECIO_MAXIMO = 999999.99;

// ---------------------------------------------------------------------
// Revisa un servicio completo y devuelve los datos limpios listos para
// guardar. Si hay errores, los junta todos y lanza un solo error 400.
// ---------------------------------------------------------------------
function validarServicio(datos) {
  const errores = [];

  if (!esTextoValido(datos.nombre, 100)) {
    errores.push('nombre es obligatorio y debe tener máximo 100 caracteres');
  }

  if (!CATEGORIAS_PERMITIDAS.includes(datos.categoria)) {
    errores.push(`categoria debe ser una de: ${CATEGORIAS_PERMITIDAS.join(', ')}`);
  }

  // La descripción es opcional: puede venir vacía o null
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

  // "activo" es opcional: si no llega, el servicio se crea activo
  const activo = datos.activo === undefined ? true : convertirBooleano(datos.activo);
  if (activo === null) {
    errores.push('activo debe ser true o false');
  }

  if (errores.length > 0) {
    throw crearError('Datos del servicio no válidos', 400, errores);
  }

  // Datos limpios: sin espacios sobrantes y con los tipos correctos
  return {
    nombre: datos.nombre.trim(),
    categoria: datos.categoria,
    descripcion: tieneDescripcion ? datos.descripcion.trim() : null,
    precio: Math.round(precio * 100) / 100, // redondeamos a 2 decimales
    duracion_min: duracionMinutos,
    activo: activo ? 1 : 0, // MySQL guarda TINYINT(1) como 1 o 0
  };
}

// ---------------------------------------------------------------------
// GET /api/servicios  ·  Lista todos, con filtros opcionales:
//   /api/servicios?categoria=frenos
//   /api/servicios?activo=true
// ---------------------------------------------------------------------
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

  // Los "?" se reemplazan por los valores de forma segura (evita inyección SQL)
  let consulta = 'SELECT * FROM servicios';
  if (condiciones.length > 0) consulta += ' WHERE ' + condiciones.join(' AND ');
  consulta += ' ORDER BY id';

  const [filas] = await conexion.execute(consulta, valores);
  return filas;
}

// ---------------------------------------------------------------------
// GET /api/servicios/:id  ·  Busca uno. Si no existe -> error 404
// ---------------------------------------------------------------------
async function buscarServicioPorId(id) {
  const [filas] = await conexion.execute('SELECT * FROM servicios WHERE id = ?', [id]);
  if (filas.length === 0) {
    throw crearError(`No existe un servicio con id ${id}`, 404);
  }
  return filas[0];
}

// ---------------------------------------------------------------------
// POST /api/servicios  ·  Registra uno nuevo y lo devuelve ya guardado
// ---------------------------------------------------------------------
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

  // insertId es el id que MySQL generó con AUTO_INCREMENT
  return buscarServicioPorId(resultado.insertId);
}

// ---------------------------------------------------------------------
// PUT /api/servicios/:id  ·  Actualiza. Se puede enviar solo lo que cambia
// (por ejemplo solo el precio); el resto se mantiene como estaba.
// ---------------------------------------------------------------------
async function actualizarServicio(id, cambios) {
  revisarCamposPermitidos(cambios, CAMPOS_PERMITIDOS);
  if (Object.keys(cambios).length === 0) {
    throw crearError('Envía al menos un campo para actualizar', 400);
  }

  // 1. Traemos el servicio actual (si no existe, aquí sale el 404)
  const servicioActual = await buscarServicioPorId(id);

  // 2. Mezclamos lo actual con los cambios y validamos el resultado completo
  const servicioCombinado = { ...servicioActual, ...cambios };
  const servicioLimpio = validarServicio(servicioCombinado);

  // 3. Guardamos
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

// ---------------------------------------------------------------------
// DELETE /api/servicios/:id  ·  Elimina y devuelve el registro borrado.
// Si el servicio tiene reservas u órdenes, MySQL no deja borrarlo
// (llave foránea) y manejarErrores responde 409.
// ---------------------------------------------------------------------
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
