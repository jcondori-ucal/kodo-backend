/**
 * Error de aplicación con código HTTP.
 * Se lanza desde services/repositories y lo atrapa el middleware errorHandler.
 *
 *   throw new AppError(404, 'La reserva no existe');
 *   throw new AppError(400, 'Datos inválidos', ['fecha es obligatoria']);
 */
class AppError extends Error {
  constructor(statusCode, mensaje, detalles = undefined) {
    super(mensaje);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}

module.exports = AppError;
