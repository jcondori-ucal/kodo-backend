/**
 * Consultas de solo lectura sobre las tablas de las que depende Reservas.
 * Sedes y servicios tienen su propio CRUD; aquí solo se verifica que el ID exista
 * y esté activo antes de guardar una reserva (borrado lógico).
 */
const { pool } = require('../config/db');

// tabla y columna son constantes de este archivo, nunca datos del usuario
async function existeActivo(tabla, columnaActiva, id) {
  const [rows] = await pool.query(
    `SELECT id FROM ${tabla} WHERE id = ? AND ${columnaActiva} = 1 LIMIT 1`,
    [id],
  );
  return rows.length > 0;
}

async function existeVehiculo(id) {
  const [rows] = await pool.query('SELECT id FROM vehiculos WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0;
}

const existeSede = (id) => existeActivo('sedes', 'activa', id);
const existeServicio = (id) => existeActivo('servicios', 'activo', id);

/** Listado simple para que el cliente sepa qué vehiculo_id usar al crear una reserva. */
async function listarVehiculos() {
  const [rows] = await pool.query('SELECT id, placa, modelo, anio, contacto_id FROM vehiculos ORDER BY placa');
  return rows;
}

module.exports = {
  existeSede,
  existeServicio,
  existeVehiculo,
  listarVehiculos,
};
