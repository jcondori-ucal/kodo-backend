/**
 * Consultas de solo lectura sobre las tablas de las que depende Reservas.
 * No hacemos CRUD de sedes, servicios ni vehículos: solo verificamos
 * que el ID exista antes de guardar (las foreign keys de la tabla reservas).
 */
const pool = require('../config/db');

async function existeEn(tabla, id) {
  const [rows] = await pool.query(`SELECT id FROM ${tabla} WHERE id = ? LIMIT 1`, [id]);
  return rows.length > 0;
}

const existeSede = (id) => existeEn('sedes', id);
const existeServicio = (id) => existeEn('servicios', id);
const existeVehiculo = (id) => existeEn('vehiculos', id);

/** Listados simples para que el cliente sepa qué IDs usar. */
async function listarSedes() {
  const [rows] = await pool.query('SELECT id, nombre, distrito FROM sedes WHERE activa = 1 ORDER BY nombre');
  return rows;
}

async function listarServicios() {
  const [rows] = await pool.query('SELECT id, nombre, categoria, precio, duracion_min FROM servicios WHERE activo = 1 ORDER BY nombre');
  return rows;
}

async function listarVehiculos() {
  const [rows] = await pool.query('SELECT id, placa, modelo, anio, contacto_id FROM vehiculos ORDER BY placa');
  return rows;
}

module.exports = {
  existeSede,
  existeServicio,
  existeVehiculo,
  listarSedes,
  listarServicios,
  listarVehiculos,
};
