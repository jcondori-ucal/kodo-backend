// Repositorio de servicios: único lugar con SQL de la tabla servicios. Borrado lógico con la columna activo
const { pool } = require('../config/db');

async function listar(filtros = {}) {
  const condiciones = [];
  const valores = [];

  if (!filtros.incluirInactivos) {
    condiciones.push('activo = 1');
  }

  if (filtros.categoria !== undefined) {
    condiciones.push('categoria = ?');
    valores.push(filtros.categoria);
  }

  let consulta = 'SELECT * FROM servicios';
  if (condiciones.length > 0) consulta += ' WHERE ' + condiciones.join(' AND ');
  consulta += ' ORDER BY id';

  const [filas] = await pool.execute(consulta, valores);
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.execute('SELECT * FROM servicios WHERE id = ? AND activo = 1', [id]);
  return filas[0];
}

// Sin filtro de activo: el nombre es UNIQUE también para los servicios dados de baja
async function buscarPorNombre(nombre) {
  const [filas] = await pool.execute('SELECT id, activo FROM servicios WHERE nombre = ?', [nombre]);
  return filas[0];
}

async function crear(servicio) {
  const [resultado] = await pool.execute(
    `INSERT INTO servicios (nombre, categoria, descripcion, precio, duracion_min)
     VALUES (?, ?, ?, ?, ?)`,
    [
      servicio.nombre,
      servicio.categoria,
      servicio.descripcion,
      servicio.precio,
      servicio.duracion_min,
    ]
  );
  return resultado.insertId;
}

async function actualizar(id, servicio) {
  await pool.execute(
    `UPDATE servicios
        SET nombre = ?, categoria = ?, descripcion = ?, precio = ?, duracion_min = ?
      WHERE id = ? AND activo = 1`,
    [
      servicio.nombre,
      servicio.categoria,
      servicio.descripcion,
      servicio.precio,
      servicio.duracion_min,
      id,
    ]
  );
}

// Borrado lógico: la fila se conserva con activo = 0
async function eliminar(id) {
  const [resultado] = await pool.execute(
    'UPDATE servicios SET activo = 0 WHERE id = ? AND activo = 1',
    [id]
  );
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, buscarPorNombre, crear, actualizar, eliminar };
