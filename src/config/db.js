// =====================================================================
// config/db.js · Conexión a la base de datos MySQL
// Responsable: Rachel (Parte 1)
//
// Usamos un "pool": un grupo de conexiones abiertas que se reutilizan.
// Así no abrimos y cerramos una conexión nueva en cada petición.
// =====================================================================
const mysql = require('mysql2/promise');

const conexion = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'kodo',
  password: process.env.DB_PASSWORD || 'kodo123',
  database: process.env.DB_NAME || 'kodo_db',
  waitForConnections: true, // si todas están ocupadas, la petición espera su turno
  connectionLimit: 10,      // máximo de conexiones abiertas a la vez
  decimalNumbers: true,     // DECIMAL llega como número (380) y no como texto ("380.00")

  // TINYINT(1) en MySQL es un sí/no. Lo convertimos a true/false
  // para que el JSON de respuesta sea más claro: "activa": true
  typeCast: (campo, siguiente) => {
    if (campo.type === 'TINY' && campo.length === 1) {
      const valor = campo.string();
      return valor === null ? null : valor === '1';
    }
    return siguiente();
  },
});

// Comprueba que MySQL responde y devuelve el nombre de la base y su versión.
// La usamos al arrancar el servidor y en la ruta GET /api/salud
async function probarConexion() {
  const [filas] = await conexion.query('SELECT DATABASE() AS base, VERSION() AS version');
  return filas[0];
}

module.exports = { conexion, probarConexion };
