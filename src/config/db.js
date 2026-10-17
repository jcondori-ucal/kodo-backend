/**
 * Configuración del Pool de Conexiones a MySQL usando mysql2/promise
 * Parámetros alineados con kodo_db y docker-compose.yml
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'kodo',
  password: process.env.DB_PASSWORD || 'kodo123',
  database: process.env.DB_NAME || 'kodo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ [MySQL] Conectado exitosamente a "${process.env.DB_NAME || 'kodo_db'}" en el puerto ${process.env.DB_PORT || 3307}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`⚠️ [MySQL] No se pudo conectar a la base de datos (${error.code || error.message}) en puerto ${process.env.DB_PORT || 3307}`);
    console.error('👉 Tip: Si usas Docker ejecuta "docker compose up -d" en la carpeta kodo-api; si usas MySQL local ajusta DB_PORT en el archivo .env');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
