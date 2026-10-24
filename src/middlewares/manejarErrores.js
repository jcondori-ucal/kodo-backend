// Manejo central de errores: toda la API responde { mensaje } o { mensaje, errores }
const HttpError = require('../utils/http-error');

const ERRORES_DE_CONEXION = [
  'ECONNREFUSED',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'PROTOCOL_CONNECTION_LOST',
];

function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: `La ruta ${req.method} ${req.originalUrl} no existe` });
}

// Lleva 4 parámetros: con 3, Express no lo reconoce como manejador de errores
// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, next) {
  if (error instanceof HttpError) {
    const cuerpo = { mensaje: error.message };
    if (error.errores) cuerpo.errores = error.errores;
    return res.status(error.status).json(cuerpo);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la solicitud no es un JSON válido' });
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensaje: 'Ya existe un registro con esos datos' });
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(404).json({ mensaje: 'Uno de los registros relacionados no existe' });
  }
  // Mensajes propios lanzados por un trigger con SIGNAL SQLSTATE '45000'
  if (error.code === 'ER_SIGNAL_EXCEPTION') {
    return res.status(400).json({ mensaje: error.sqlMessage });
  }
  if (ERRORES_DE_CONEXION.includes(error.code)) {
    console.error('[BD]', error.code, error.message);
    return res.status(503).json({
      mensaje: 'No hay conexión con la base de datos. Revisa que Docker esté levantado',
    });
  }

  // El detalle solo va a la consola: al cliente nunca se le muestra el error interno
  console.error('Error inesperado:', error);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

module.exports = { rutaNoEncontrada, manejarErrores };
