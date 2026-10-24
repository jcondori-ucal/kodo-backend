// Repositorio: única capa que habla con MySQL
const pool = require('../config/db');
const Catalogo = require('../models/catalogo.model');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM catalogo ORDER BY id');
  return rows.map(Catalogo.fromRow);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM catalogo WHERE id = ?', [id]);
  return rows.length ? Catalogo.fromRow(rows[0]) : null;
}

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
    'UPDATE catalogo SET modelo = ?, version = ?, anio = ?, precio_usd = ?, stock = ?, combustible = ?, transmision = ?, destacado = ? WHERE id = ?',
    [modelo, version, anio, precio_usd, stock, combustible, transmision, destacado, id]
  );
  return result.affectedRows ? findById(id) : null;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM catalogo WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByModeloVersionAnio, create, update, remove };
