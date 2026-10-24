/**
 * Excepción HTTP personalizada para estandarizar respuestas de error en la API.
 */
class HttpError extends Error {
  constructor(statusCode, message, detalles = null) {
    super(message);
    this.statusCode = statusCode;
    this.detalles = detalles;
    this.name = 'HttpError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = HttpError;
