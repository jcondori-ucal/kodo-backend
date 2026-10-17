// =====================================================================
// controllers/salud.controller.js · Verifica que la API y MySQL respondan
// Responsable: Rachel (Parte 1)
// Ruta: GET /api/salud  (sirve para mostrar la conexión en la exposición)
// =====================================================================
const { probarConexion } = require('../config/db');

async function revisarSalud(req, res, next) {
  try {
    const infoBase = await probarConexion();
    res.status(200).json({
      ok: true,
      mensaje: 'API y base de datos funcionando',
      base_de_datos: infoBase.base,
      version_mysql: infoBase.version,
      hora_servidor: new Date().toISOString(),
    });
  } catch (error) {
    next(error); // si MySQL no responde, manejarErrores devuelve 503
  }
}

module.exports = { revisarSalud };
