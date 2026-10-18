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
    next(error);
  }
}

module.exports = { revisarSalud };
