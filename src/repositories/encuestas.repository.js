/**
 * Repositorio: Acceso a Datos de Encuestas (Kodo Motors)
 * Consultas SQL parametrizadas e integración con ordenes_servicio con soporte de Soft Delete.
 */
const { pool } = require('../config/db');
const Encuesta = require('../models/encuesta.model');

async function findAll({ puntuacion, recomendaria, incluir_inactivos } = {}) {
  let sql = `
    SELECT e.*, o.tecnico, o.costo, o.estado AS orden_estado
    FROM encuestas e
    LEFT JOIN ordenes_servicio o ON e.orden_id = o.id
    WHERE 1=1
  `;
  const params = [];

  // Soft Delete: por defecto solo listar encuestas activas
  if (incluir_inactivos !== 'true' && incluir_inactivos !== true) {
    sql += ' AND e.activo = 1';
  }

  if (puntuacion) {
    sql += ' AND e.puntuacion = ?';
    params.push(Number(puntuacion));
  }

  if (recomendaria !== undefined && recomendaria !== '') {
    sql += ' AND e.recomendaria = ?';
    params.push(recomendaria === 'true' || recomendaria === '1' ? 1 : 0);
  }

  sql += ' ORDER BY e.id ASC';

  const [rows] = await pool.query(sql, params);
  return rows.map((row) => {
    const encuesta = Encuesta.fromRow(row);
    if (row.tecnico) {
      encuesta.detallesOrden = {
        tecnico: row.tecnico,
        costo: Number(row.costo),
        estado: row.orden_estado
      };
    }
    return encuesta;
  });
}

async function findById(id, { incluir_inactivos = false } = {}) {
  let sql = `
    SELECT e.*, o.tecnico, o.costo, o.estado AS orden_estado
    FROM encuestas e
    LEFT JOIN ordenes_servicio o ON e.orden_id = o.id
    WHERE e.id = ?
  `;
  const params = [id];

  if (!incluir_inactivos) {
    sql += ' AND e.activo = 1';
  }

  const [rows] = await pool.query(sql, params);
  if (rows.length === 0) return null;

  const encuesta = Encuesta.fromRow(rows[0]);
  if (rows[0].tecnico) {
    encuesta.detallesOrden = {
      tecnico: rows[0].tecnico,
      costo: Number(rows[0].costo),
      estado: rows[0].orden_estado
    };
  }
  return encuesta;
}

async function findByOrdenId(ordenId) {
  const [rows] = await pool.query('SELECT * FROM encuestas WHERE orden_id = ?', [ordenId]);
  if (rows.length === 0) return null;
  return Encuesta.fromRow(rows[0]);
}

/**
 * Consulta la orden de servicio para verificar existencia y estado antes de registrar encuesta
 */
async function findOrdenServicioById(ordenId) {
  const [rows] = await pool.query('SELECT * FROM ordenes_servicio WHERE id = ?', [ordenId]);
  if (rows.length === 0) return null;
  return rows[0];
}

async function create({ orden_id, puntuacion, recomendaria, comentario = null }) {
  const [result] = await pool.query(
    `INSERT INTO encuestas (orden_id, puntuacion, recomendaria, comentario, activo)
     VALUES (?, ?, ?, ?, 1)`,
    [
      Number(orden_id),
      Number(puntuacion),
      recomendaria === true || recomendaria === 1 || recomendaria === '1' ? 1 : 0,
      comentario ? comentario.trim() : null
    ]
  );

  return await findById(result.insertId);
}

async function update(id, { puntuacion, recomendaria, comentario }) {
  await pool.query(
    `UPDATE encuestas
     SET puntuacion = ?, recomendaria = ?, comentario = ?
     WHERE id = ? AND activo = 1`,
    [
      Number(puntuacion),
      recomendaria === true || recomendaria === 1 || recomendaria === '1' ? 1 : 0,
      comentario ? comentario.trim() : null,
      id
    ]
  );

  return await findById(id);
}

/**
 * Soft Delete: En lugar de DELETE físico, actualiza 'activo' a 0
 */
async function remove(id) {
  const [result] = await pool.query('UPDATE encuestas SET activo = 0 WHERE id = ? AND activo = 1', [id]);
  return result.affectedRows > 0;
}

/**
 * Reactivación lógica de encuesta
 */
async function restore(id) {
  const [result] = await pool.query('UPDATE encuestas SET activo = 1 WHERE id = ? AND activo = 0', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByOrdenId,
  findOrdenServicioById,
  create,
  update,
  remove,
  restore
};
