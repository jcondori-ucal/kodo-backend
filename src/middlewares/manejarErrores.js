// =====================================================================
// middlewares/manejarErrores.js · Respuestas de error en un solo lugar
// Responsable: Rachel (Parte 1)
//
// Todos los controladores hacen next(error) cuando algo falla.
// Aquí decidimos qué código HTTP y qué mensaje recibe el cliente.
// =====================================================================

// Se ejecuta cuando nadie atendió la ruta (por ejemplo GET /api/autos)
function rutaNoEncontrada(req, res) {
  res.status(404).json({
    ok: false,
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe`,
  });
}

// Express reconoce un middleware de errores porque recibe 4 parámetros
// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, next) {
  // 1. El cliente envió un JSON mal escrito (falta una coma, una comilla, etc.)
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El JSON enviado está mal escrito' });
  }

  // 2. Errores que creamos nosotros con crearError (validaciones, 404, etc.)
  if (error.estado) {
    const respuesta = { ok: false, mensaje: error.message };
    if (error.detalles) respuesta.detalles = error.detalles;
    return res.status(error.estado).json(respuesta);
  }

  // 3. Errores que devuelve MySQL
  switch (error.code) {
    case 'ER_DUP_ENTRY': // se repite un campo UNIQUE (el nombre)
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe un registro con ese nombre. El nombre debe ser único',
      });
    case 'ER_ROW_IS_REFERENCED_2': // otra tabla usa este registro (llave foránea)
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

  // 4. Cualquier otro error inesperado: lo mostramos en la terminal
  //    y al cliente le damos un mensaje genérico (sin detalles internos)
  console.error('Error inesperado:', error);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
}

module.exports = { rutaNoEncontrada, manejarErrores };
