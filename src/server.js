// =====================================================================
// server.js · Archivo principal: enciende el servidor
// Responsable: Rachel (Parte 1)
// Ejecutar: npm run dev  (o npm start)
// =====================================================================

// 1. Cargamos las variables del archivo .env ANTES que todo lo demás,
//    porque db.js las necesita para conectarse a MySQL
require('dotenv').config({ quiet: true });

const app = require('./app');
const { probarConexion } = require('./config/db');

const puerto = Number(process.env.PORT) || 4000;

async function iniciarServidor() {
  try {
    // 2. Antes de abrir el puerto, comprobamos que MySQL responde
    const infoBase = await probarConexion();
    console.log(`✔ Conectado a MySQL ${infoBase.version} · base de datos: ${infoBase.base}`);

    // 3. Abrimos el puerto y la API queda escuchando peticiones
    app.listen(puerto, () => {
      console.log(`✔ API de Kodo Motors en http://localhost:${puerto}`);
    });
  } catch (error) {
    console.error('✘ No se pudo conectar a MySQL:', error.code || error.message);
    console.error('  ¿Levantaste la base de datos? Ejecuta: docker compose up -d');
    process.exit(1); // cerramos: sin base de datos la API no sirve
  }
}

iniciarServidor();
