// Entrada de la API: carga el .env, prueba la conexión con MySQL y recién entonces escucha
require('dotenv').config({ quiet: true });

const app = require('./app');
const { probarConexion } = require('./config/db');

const puerto = Number(process.env.PORT) || 4000;

async function iniciarServidor() {
  try {
    const infoBase = await probarConexion();
    console.log(`✔ Conectado a MySQL ${infoBase.version} · base de datos: ${infoBase.base}`);
  } catch (error) {
    console.error('✘ No se pudo conectar a MySQL:', error.code || error.message);
    console.error('  ¿Levantaste la base de datos? Ejecuta: docker compose up -d');
    process.exit(1);
  }

  const servidor = app.listen(puerto, () => {
    console.log(`✔ API de Kodo Motors en http://localhost:${puerto}`);
  });

  servidor.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`✘ El puerto ${puerto} ya está ocupado. Cambia PORT en el .env o cierra el otro proceso`);
    } else {
      console.error('✘ Error al iniciar el servidor:', error);
    }
    process.exit(1);
  });
}

iniciarServidor();
