// Middleware de ruta: verifica que :id sea un entero positivo antes de llegar al controlador
const HttpError = require('../utils/http-error');

function validarId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new HttpError(400, 'El id debe ser un número entero positivo'));
  }
  next();
}

module.exports = validarId;
