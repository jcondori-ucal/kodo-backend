// =====================================================================
// services/sedes.service.js · Lógica de negocio del módulo Sedes
// Responsable: Omar (Parte 4)
//
// Esta capa es la única que habla con MySQL para la tabla "sedes".
// Valida los datos, arma las consultas SQL y devuelve los resultados.
// No sabe nada de req ni res: eso es trabajo del controlador.
// =====================================================================
const { conexion } = require('../config/db');
const {
  crearError,
  esTextoValido,
  convertirBooleano,
  revisarCamposPermitidos,
} = require('../utils/validaciones');

// Campos que el cliente puede enviar en POST y PUT (el id lo pone MySQL)
const CAMPOS_PERMITIDOS = [
  'nombre',
  'distrito',
  'direccion',
  'telefono',
  'hora_apertura',
  'hora_cierre',
  'atiende_domingo',
  'activa',
];

// Hora en formato 24 h: "08:00" o "08:00:00"
const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

// Teléfono de exactamente 9 dígitos (la columna es CHAR(9))
const FORMATO_TELEFONO = /^\d{9}$/;

// Convierte "08:00" en "08:00:00" para comparar y guardar siempre igual
function completarHora(hora) {
  return hora.length === 5 ? `${hora}:00` : hora;
}

// ---------------------------------------------------------------------
// Revisa una sede completa y devuelve los datos limpios listos para
// guardar. Si hay errores, los junta todos y lanza un solo error 400.
// ---------------------------------------------------------------------
function validarSede(datos) {
  const errores = [];

  if (!esTextoValido(datos.nombre, 80)) {
    errores.push('nombre es obligatorio y debe tener máximo 80 caracteres');
  }
  if (!esTextoValido(datos.distrito, 60)) {
    errores.push('distrito es obligatorio y debe tener máximo 60 caracteres');
  }
  if (!esTextoValido(datos.direccion, 150)) {
    errores.push('direccion es obligatoria y debe tener máximo 150 caracteres');
  }

  // Lo pedimos como texto para no perder el 0 inicial de los fijos (014445566)
  if (typeof datos.telefono !== 'string' || !FORMATO_TELEFONO.test(datos.telefono)) {
    errores.push('telefono debe ser texto de 9 dígitos, por ejemplo "014445566"');
  }

  const horaAperturaValida =
    typeof datos.hora_apertura === 'string' && FORMATO_HORA.test(datos.hora_apertura);
  const horaCierreValida =
    typeof datos.hora_cierre === 'string' && FORMATO_HORA.test(datos.hora_cierre);

  if (!horaAperturaValida) errores.push('hora_apertura debe tener formato HH:MM, por ejemplo "08:00"');
  if (!horaCierreValida) errores.push('hora_cierre debe tener formato HH:MM, por ejemplo "18:00"');

  // Regla de negocio: la sede debe abrir antes de cerrar
  // (con el mismo formato HH:MM:SS, comparar textos funciona como comparar horas)
  if (horaAperturaValida && horaCierreValida) {
    if (completarHora(datos.hora_apertura) >= completarHora(datos.hora_cierre)) {
      errores.push('hora_apertura debe ser menor que hora_cierre');
    }
  }

  // Ambos son opcionales: por defecto no atiende domingo y está activa
  const atiendeDomingo =
    datos.atiende_domingo === undefined ? false : convertirBooleano(datos.atiende_domingo);
  if (atiendeDomingo === null) errores.push('atiende_domingo debe ser true o false');

  const activa = datos.activa === undefined ? true : convertirBooleano(datos.activa);
  if (activa === null) errores.push('activa debe ser true o false');

  if (errores.length > 0) {
    throw crearError('Datos de la sede no válidos', 400, errores);
  }

  // Datos limpios: sin espacios sobrantes y con los tipos correctos
  return {
    nombre: datos.nombre.trim(),
    distrito: datos.distrito.trim(),
    direccion: datos.direccion.trim(),
    telefono: datos.telefono,
    hora_apertura: completarHora(datos.hora_apertura),
    hora_cierre: completarHora(datos.hora_cierre),
    atiende_domingo: atiendeDomingo ? 1 : 0, // MySQL guarda TINYINT(1) como 1 o 0
    activa: activa ? 1 : 0,
  };
}

// ---------------------------------------------------------------------
// GET /api/sedes  ·  Lista todas, con filtros opcionales:
//   /api/sedes?distrito=Surquillo
//   /api/sedes?activa=true
// ---------------------------------------------------------------------
async function listarSedes(filtros = {}) {
  const condiciones = [];
  const valores = [];

  if (filtros.distrito !== undefined) {
    if (!esTextoValido(filtros.distrito, 60)) {
      throw crearError('El filtro distrito no es válido', 400);
    }
    condiciones.push('distrito = ?');
    valores.push(filtros.distrito.trim());
  }

  if (filtros.activa !== undefined) {
    const activa = convertirBooleano(filtros.activa);
    if (activa === null) throw crearError('El filtro activa debe ser true o false', 400);
    condiciones.push('activa = ?');
    valores.push(activa ? 1 : 0);
  }

  // Los "?" se reemplazan por los valores de forma segura (evita inyección SQL)
  let consulta = 'SELECT * FROM sedes';
  if (condiciones.length > 0) consulta += ' WHERE ' + condiciones.join(' AND ');
  consulta += ' ORDER BY id';

  const [filas] = await conexion.execute(consulta, valores);
  return filas;
}

// ---------------------------------------------------------------------
// GET /api/sedes/:id  ·  Busca una. Si no existe -> error 404
// ---------------------------------------------------------------------
async function buscarSedePorId(id) {
  const [filas] = await conexion.execute('SELECT * FROM sedes WHERE id = ?', [id]);
  if (filas.length === 0) {
    throw crearError(`No existe una sede con id ${id}`, 404);
  }
  return filas[0];
}

// ---------------------------------------------------------------------
// POST /api/sedes  ·  Registra una nueva y la devuelve ya guardada
// ---------------------------------------------------------------------
async function crearSede(datos) {
  revisarCamposPermitidos(datos, CAMPOS_PERMITIDOS);
  const sedeLimpia = validarSede(datos);

  const [resultado] = await conexion.execute(
    `INSERT INTO sedes (nombre, distrito, direccion, telefono, hora_apertura, hora_cierre, atiende_domingo, activa)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sedeLimpia.nombre,
      sedeLimpia.distrito,
      sedeLimpia.direccion,
      sedeLimpia.telefono,
      sedeLimpia.hora_apertura,
      sedeLimpia.hora_cierre,
      sedeLimpia.atiende_domingo,
      sedeLimpia.activa,
    ]
  );

  // insertId es el id que MySQL generó con AUTO_INCREMENT
  return buscarSedePorId(resultado.insertId);
}

// ---------------------------------------------------------------------
// PUT /api/sedes/:id  ·  Actualiza. Se puede enviar solo lo que cambia
// (por ejemplo solo el teléfono); el resto se mantiene como estaba.
// ---------------------------------------------------------------------
async function actualizarSede(id, cambios) {
  revisarCamposPermitidos(cambios, CAMPOS_PERMITIDOS);
  if (Object.keys(cambios).length === 0) {
    throw crearError('Envía al menos un campo para actualizar', 400);
  }

  // 1. Traemos la sede actual (si no existe, aquí sale el 404)
  const sedeActual = await buscarSedePorId(id);

  // 2. Mezclamos lo actual con los cambios y validamos el resultado completo
  const sedeCombinada = { ...sedeActual, ...cambios };
  const sedeLimpia = validarSede(sedeCombinada);

  // 3. Guardamos
  await conexion.execute(
    `UPDATE sedes
        SET nombre = ?, distrito = ?, direccion = ?, telefono = ?,
            hora_apertura = ?, hora_cierre = ?, atiende_domingo = ?, activa = ?
      WHERE id = ?`,
    [
      sedeLimpia.nombre,
      sedeLimpia.distrito,
      sedeLimpia.direccion,
      sedeLimpia.telefono,
      sedeLimpia.hora_apertura,
      sedeLimpia.hora_cierre,
      sedeLimpia.atiende_domingo,
      sedeLimpia.activa,
      id,
    ]
  );

  return buscarSedePorId(id);
}

// ---------------------------------------------------------------------
// DELETE /api/sedes/:id  ·  Elimina y devuelve el registro borrado.
// Si la sede tiene reservas u órdenes, MySQL no deja borrarla
// (llave foránea) y manejarErrores responde 409.
// ---------------------------------------------------------------------
async function eliminarSede(id) {
  const sedeEliminada = await buscarSedePorId(id);
  await conexion.execute('DELETE FROM sedes WHERE id = ?', [id]);
  return sedeEliminada;
}

module.exports = {
  listarSedes,
  buscarSedePorId,
  crearSede,
  actualizarSede,
  eliminarSede,
};
