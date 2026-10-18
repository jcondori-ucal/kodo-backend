require('dotenv').config({ quiet: true });

const app = require('./app');
const { probarConexion } = require('./config/db');

const puerto = Number(process.env.PORT) || 4000;

async function iniciarServidor() {
  try {

    const infoBase = await probarConexion();
    console.log(`✔ Conectado a MySQL ${infoBase.version} · base de datos: ${infoBase.base}`);

    app.listen(puerto, () => {
      console.log(`✔ API de Kodo Motors en http://localhost:${puerto}`);
    });
  } catch (error) {
    console.error('✘ No se pudo conectar a MySQL:', error.code || error.message);
    console.error('  ¿Levantaste la base de datos? Ejecuta: docker compose up -d');
    process.exit(1);
  }
}

iniciarServidor();
