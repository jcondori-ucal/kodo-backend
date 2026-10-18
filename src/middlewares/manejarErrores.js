function rutaNoEncontrada(req, res) {
  res.status(404).json({
    ok: false,
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe`,
  });
}

function manejarErrores(error, req, res, next) {

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El JSON enviado está mal escrito' });
  }

  if (error.estado) {
    const respuesta = { ok: false, mensaje: error.message };
    if (error.detalles) respuesta.detalles = error.detalles;
    return res.status(error.estado).json(respuesta);
  }

  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe un registro con ese nombre. El nombre debe ser único',
      });
    case 'ER_ROW_IS_REFERENCED_2':
      return res.status(409).json({
        ok: false,
        mensaje:
          'No se puede eliminar porque tiene reservas, órdenes u otros registros asociados. ' +
          'Puedes desactivarlo con PUT en lugar de eliminarlo',
      });
    case 'ECONNREFUSED':
    case 'ER_ACCESS_DENIED_ERROR':
    case 'ER_BAD_DB_ERROR':
    case 'PROTOCOL_CONNECTION_LOST':
      return res.status(503).json({
        ok: false,
        mensaje: 'No hay conexión con la base de datos. Revisa que Docker esté levantado',
      });
    default:
      break;
  }

  console.error('Error inesperado:', error);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
}

module.exports = { rutaNoEncontrada, manejarErrores };
