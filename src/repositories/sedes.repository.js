const { conexion } = require('../config/db');

async function listar(filtros = {}) {
  const condiciones = [];
  const valores = [];

  if (filtros.distrito !== undefined) {
    condiciones.push('distrito = ?');
    valores.push(filtros.distrito);
  }

  if (filtros.activa !== undefined) {
    condiciones.push('activa = ?');
    valores.push(filtros.activa);
  }

  let consulta = 'SELECT * FROM sedes';
  if (condiciones.length > 0) consulta += ' WHERE ' + condiciones.join(' AND ');
  consulta += ' ORDER BY id';

  const [filas] = await conexion.execute(consulta, valores);
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await conexion.execute('SELECT * FROM sedes WHERE id = ?', [id]);
  return filas[0];
}

async function crear(sede) {
  const [resultado] = await conexion.execute(
    `INSERT INTO sedes (nombre, distrito, direccion, telefono, hora_apertura, hora_cierre, atiende_domingo, activa)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sede.nombre,
      sede.distrito,
      sede.direccion,
      sede.telefono,
      sede.hora_apertura,
      sede.hora_cierre,
      sede.atiende_domingo,
      sede.activa,
    ]
  );
  return resultado.insertId;
}

async function actualizar(id, sede) {
  await conexion.execute(
    `UPDATE sedes
        SET nombre = ?, distrito = ?, direccion = ?, telefono = ?,
            hora_apertura = ?, hora_cierre = ?, atiende_domingo = ?, activa = ?
      WHERE id = ?`,
    [
      sede.nombre,
      sede.distrito,
      sede.direccion,
      sede.telefono,
      sede.hora_apertura,
      sede.hora_cierre,
      sede.atiende_domingo,
      sede.activa,
      id,
    ]
  );
}

async function eliminar(id) {
  await conexion.execute('DELETE FROM sedes WHERE id = ?', [id]);
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };
