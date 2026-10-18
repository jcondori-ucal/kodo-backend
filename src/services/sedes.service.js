const { conexion } = require('../config/db');
const {
  crearError,
  esTextoValido,
  convertirBooleano,
  revisarCamposPermitidos,
} = require('../utils/validaciones');

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

const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const FORMATO_TELEFONO = /^\d{9}$/;

function completarHora(hora) {
  return hora.length === 5 ? `${hora}:00` : hora;
}

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

  if (typeof datos.telefono !== 'string' || !FORMATO_TELEFONO.test(datos.telefono)) {
    errores.push('telefono debe ser texto de 9 dígitos, por ejemplo "014445566"');
  }

  const horaAperturaValida =
    typeof datos.hora_apertura === 'string' && FORMATO_HORA.test(datos.hora_apertura);
  const horaCierreValida =
    typeof datos.hora_cierre === 'string' && FORMATO_HORA.test(datos.hora_cierre);

  if (!horaAperturaValida) errores.push('hora_apertura debe tener formato HH:MM, por ejemplo "08:00"');
  if (!horaCierreValida) errores.push('hora_cierre debe tener formato HH:MM, por ejemplo "18:00"');

  if (horaAperturaValida && horaCierreValida) {
    if (completarHora(datos.hora_apertura) >= completarHora(datos.hora_cierre)) {
      errores.push('hora_apertura debe ser menor que hora_cierre');
    }
  }

  const atiendeDomingo =
    datos.atiende_domingo === undefined ? false : convertirBooleano(datos.atiende_domingo);
  if (atiendeDomingo === null) errores.push('atiende_domingo debe ser true o false');

  const activa = datos.activa === undefined ? true : convertirBooleano(datos.activa);
  if (activa === null) errores.push('activa debe ser true o false');

  if (errores.length > 0) {
    throw crearError('Datos de la sede no válidos', 400, errores);
  }

  return {
    nombre: datos.nombre.trim(),
    distrito: datos.distrito.trim(),
    direccion: datos.direccion.trim(),
    telefono: datos.telefono,
    hora_apertura: completarHora(datos.hora_apertura),
    hora_cierre: completarHora(datos.hora_cierre),
    atiende_domingo: atiendeDomingo ? 1 : 0,
    activa: activa ? 1 : 0,
  };
}

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

  let consulta = 'SELECT * FROM sedes';
  if (condiciones.length > 0) consulta += ' WHERE ' + condiciones.join(' AND ');
  consulta += ' ORDER BY id';

  const [filas] = await conexion.execute(consulta, valores);
  return filas;
}

async function buscarSedePorId(id) {
  const [filas] = await conexion.execute('SELECT * FROM sedes WHERE id = ?', [id]);
  if (filas.length === 0) {
    throw crearError(`No existe una sede con id ${id}`, 404);
  }
  return filas[0];
}

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

  return buscarSedePorId(resultado.insertId);
}

async function actualizarSede(id, cambios) {
  revisarCamposPermitidos(cambios, CAMPOS_PERMITIDOS);
  if (Object.keys(cambios).length === 0) {
    throw crearError('Envía al menos un campo para actualizar', 400);
  }

  const sedeActual = await buscarSedePorId(id);

  const sedeCombinada = { ...sedeActual, ...cambios };
  const sedeLimpia = validarSede(sedeCombinada);

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
