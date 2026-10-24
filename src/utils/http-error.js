// Error con código HTTP: los servicios lo lanzan y el middleware manejarErrores lo responde
class HttpError extends Error {
  constructor(status, mensaje, errores) {
    super(mensaje);
    this.name = 'HttpError';
    this.status = status;
    this.errores = errores;
  }
}

module.exports = HttpError;
