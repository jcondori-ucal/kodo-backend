// Repositorio: única capa que habla con MySQL. Borrado lógico con la columna activo
const { pool } = require('../config/db');
const Catalogo = require('../models/catalogo.model');

async function findAll({ incluirInactivos = false } = {}) {
  const where = incluirInactivos ? '' : 'WHERE activo = 1';
  const [rows] = await pool.query(`SELECT * FROM catalogo ${where} ORDER BY id`);
  return rows.map(Catalogo.fromRow);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM catalogo WHERE id = ? AND activo = 1', [id]);
  return rows.length ? Catalogo.fromRow(rows[0]) : null;
}

// Sin filtro de activo: la combinación es UNIQUE también para los vehículos dados de baja
async function findByModeloVersionAnio(modelo, version, anio) {
  const [rows] = await pool.query(
    'SELECT * FROM catalogo WHERE modelo = ? AND version = ? AND anio = ?',
    [modelo, version, anio]
  );
  return rows.length ? Catalogo.fromRow(rows[0]) : null;
}

async function create({ modelo, version, anio, precio_usd, stock = 0, combustible, transmision, destacado = false }) {
  const [result] = await pool.query(
    'INSERT INTO catalogo (modelo, version, anio, precio_usd, stock, combustible, transmision, destacado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [modelo, version, anio, precio_usd, stock, combustible, transmision, destacado]
  );
  return findById(result.insertId);
}

async function update(id, { modelo, version, anio, precio_usd, stock = 0, combustible, transmision, destacado = false }) {
  const [result] = await pool.query(
    'UPDATE catalogo SET modelo = ?, version = ?, anio = ?, precio_usd = ?, stock = ?, combustible = ?, transmision = ?, destacado = ? WHERE id = ? AND activo = 1',
    [modelo, version, anio, precio_usd, stock, combustible, transmision, destacado, id]
  );
  return result.affectedRows ? findById(id) : null;
}

// Borrado lógico: la fila se conserva con activo = 0
async function remove(id) {
  const [result] = await pool.query('UPDATE catalogo SET activo = 0 WHERE id = ? AND activo = 1', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByModeloVersionAnio, create, update, remove };
