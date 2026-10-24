const AppError = require('../utils/AppError');

/** Comprueba que el parámetro :id de la URL sea un entero positivo. */
function validarId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new AppError(400, `El id '${req.params.id}' no es válido`));
  }
  next();
}

module.exports = validarId;
