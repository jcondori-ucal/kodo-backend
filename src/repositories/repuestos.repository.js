/**
 * Repositorio: Acceso a Datos de Repuestos (Kodo Motors)
 * Consultas SQL parametrizadas mediante mysql2 pool.
 */
const { pool } = require('../config/db');
const Repuesto = require('../models/repuesto.model');

async function findAll({ modelo_compatible, bajo_stock } = {}) {
  let sql = 'SELECT * FROM repuestos WHERE 1=1';
  const params = [];

  if (modelo_compatible) {
    sql += ' AND modelo_compatible = ?';
    params.push(modelo_compatible);
  }

  if (bajo_stock === 'true' || bajo_stock === true) {
    sql += ' AND stock <= stock_minimo';
  }

  sql += ' ORDER BY id ASC';

  const [rows] = await pool.query(sql, params);
  return rows.map((row) => Repuesto.fromRow(row));
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM repuestos WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return Repuesto.fromRow(rows[0]);
}

async function findByCodigo(codigo) {
  const [rows] = await pool.query('SELECT * FROM repuestos WHERE codigo = ?', [codigo.trim().toUpperCase()]);
  if (rows.length === 0) return null;
  return Repuesto.fromRow(rows[0]);
}

async function create({ codigo, nombre, modelo_compatible, stock = 0, stock_minimo = 5, precio, ubicacion = null }) {
  const [result] = await pool.query(
    `INSERT INTO repuestos (codigo, nombre, modelo_compatible, stock, stock_minimo, precio, ubicacion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      codigo.trim().toUpperCase(),
      nombre.trim(),
      modelo_compatible,
      Number(stock) || 0,
      Number(stock_minimo ?? 5), // ?? y no ||: un stock_minimo de 0 es válido
      Number(precio),
      ubicacion ? ubicacion.trim() : null
    ]
  );

  return await findById(result.insertId);
}

async function update(id, { codigo, nombre, modelo_compatible, stock, stock_minimo, precio, ubicacion }) {
  await pool.query(
    `UPDATE repuestos
     SET codigo = ?, nombre = ?, modelo_compatible = ?, stock = ?, stock_minimo = ?, precio = ?, ubicacion = ?
     WHERE id = ?`,
    [
      codigo.trim().toUpperCase(),
      nombre.trim(),
      modelo_compatible,
      Number(stock),
      Number(stock_minimo),
      Number(precio),
      ubicacion ? ubicacion.trim() : null,
      id
    ]
  );

  return await findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM repuestos WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByCodigo,
  create,
  update,
  remove
};
