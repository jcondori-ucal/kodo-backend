const mysql = require('mysql2/promise');

const conexion = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'kodo',
  password: process.env.DB_PASSWORD || 'kodo123',
  database: process.env.DB_NAME || 'kodo_db',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,

  typeCast: (campo, siguiente) => {
    if (campo.type === 'TINY' && campo.length === 1) {
      const valor = campo.string();
      return valor === null ? null : valor === '1';
    }
    return siguiente();
  },
});

async function probarConexion() {
  const [filas] = await conexion.query('SELECT DATABASE() AS base, VERSION() AS version');
  return filas[0];
}

module.exports = { conexion, probarConexion };
