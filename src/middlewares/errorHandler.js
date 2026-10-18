const AppError = require('../utils/AppError');

/** 404 para rutas que no existen. Va después de todas las rutas. */
function noEncontrado(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/** Manejador central de errores. Va al final de todo en main.js. */
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  // Errores propios con código HTTP
  if (error instanceof AppError) {
    const cuerpo = { error: error.message };
    if (error.detalles) cuerpo.detalles = error.detalles;
    return res.status(error.statusCode).json(cuerpo);
  }

  // JSON mal formado en el body
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
  }

  // Errores de MySQL más comunes
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'La sede, servicio o vehículo indicado no existe' });
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: 'No se puede eliminar: el registro está en uso' });
  }
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }
  if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('[DB]', error.message);
    return res.status(503).json({ error: 'No se pudo conectar a la base de datos' });
  }

  console.error('[ERROR]', error);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { noEncontrado, errorHandler };
