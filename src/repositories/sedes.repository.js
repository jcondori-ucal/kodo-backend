// Repositorio de sedes: único lugar con SQL de la tabla sedes. Borrado lógico con la columna activa
const { pool } = require('../config/db');

async function listar(filtros = {}) {
  const condiciones = [];
  const valores = [];

  if (!filtros.incluirInactivos) {
    condiciones.push('activa = 1');
  }

  if (filtros.distrito !== undefined) {
    condiciones.push('distrito = ?');
    valores.push(filtros.distrito);
  }

  let consulta = 'SELECT * FROM sedes';
  if (condiciones.length > 0) consulta += ' WHERE ' + condiciones.join(' AND ');
  consulta += ' ORDER BY id';

  const [filas] = await pool.execute(consulta, valores);
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.execute('SELECT * FROM sedes WHERE id = ? AND activa = 1', [id]);
  return filas[0];
}

// Sin filtro de activa: el nombre es UNIQUE también para las sedes dadas de baja
async function buscarPorNombre(nombre) {
  const [filas] = await pool.execute('SELECT id, activa FROM sedes WHERE nombre = ?', [nombre]);
  return filas[0];
}

async function crear(sede) {
  const [resultado] = await pool.execute(
    `INSERT INTO sedes (nombre, distrito, direccion, telefono, hora_apertura, hora_cierre, atiende_domingo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      sede.nombre,
      sede.distrito,
      sede.direccion,
      sede.telefono,
      sede.hora_apertura,
      sede.hora_cierre,
      sede.atiende_domingo,
    ]
  );
  return resultado.insertId;
}

async function actualizar(id, sede) {
  await pool.execute(
    `UPDATE sedes
        SET nombre = ?, distrito = ?, direccion = ?, telefono = ?,
            hora_apertura = ?, hora_cierre = ?, atiende_domingo = ?
      WHERE id = ? AND activa = 1`,
    [
      sede.nombre,
      sede.distrito,
      sede.direccion,
      sede.telefono,
      sede.hora_apertura,
      sede.hora_cierre,
      sede.atiende_domingo,
      id,
    ]
  );
}

// Borrado lógico: la fila se conserva con activa = 0
async function eliminar(id) {
  const [resultado] = await pool.execute(
    'UPDATE sedes SET activa = 0 WHERE id = ? AND activa = 1',
    [id]
  );
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, buscarPorNombre, crear, actualizar, eliminar };
