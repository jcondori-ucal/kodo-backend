// Error con código HTTP: los servicios lo lanzan y los controladores lo responden
class HttpError extends Error {
  constructor(status, mensaje, errores) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

function responderError(res, error) {
  if (error instanceof HttpError) {
    const cuerpo = { mensaje: error.message };
    if (error.errores) cuerpo.errores = error.errores;
    return res.status(error.status).json(cuerpo);
  }
  console.error(error);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

module.exports = { HttpError, responderError };
