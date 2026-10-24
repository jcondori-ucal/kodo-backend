// Configuración: pool de conexiones a MySQL. Las credenciales vienen solo del .env
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // DECIMAL llega como número y no como texto
  decimalNumbers: true,
  // TINYINT(1) llega como true / false
  typeCast: (campo, siguiente) => {
    if (campo.type === 'TINY' && campo.length === 1) {
      const valor = campo.string();
      return valor === null ? null : valor === '1';
    }
    return siguiente();
  },
});

async function probarConexion() {
  const [filas] = await pool.query('SELECT DATABASE() AS base, VERSION() AS version');
  return filas[0];
}

module.exports = { pool, probarConexion };
