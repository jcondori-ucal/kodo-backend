function crearError(mensaje, estado = 400, detalles = null) {
  const error = new Error(mensaje);
  error.estado = estado;
  if (detalles) error.detalles = detalles;
  return error;
}

function convertirId(valorRecibido) {
  const numero = Number(valorRecibido);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw crearError('El id debe ser un número entero positivo', 400);
  }
  return numero;
}

function esTextoValido(valor, maximoCaracteres) {
  return (
    typeof valor === 'string' &&
    valor.trim().length > 0 &&
    valor.trim().length <= maximoCaracteres
  );
}

function convertirNumero(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  if (typeof valor === 'string' && valor.trim() !== '') {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
  }
  return null;
}

function convertirBooleano(valor) {
  if (valor === true || valor === 1 || valor === '1' || valor === 'true') return true;
  if (valor === false || valor === 0 || valor === '0' || valor === 'false') return false;
  return null;
}

function revisarCamposPermitidos(datos, camposPermitidos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw crearError('El cuerpo de la solicitud debe ser un objeto JSON', 400);
  }
  const camposDesconocidos = Object.keys(datos).filter(
    (campo) => !camposPermitidos.includes(campo)
  );
  if (camposDesconocidos.length > 0) {
    throw crearError('La solicitud tiene campos no permitidos', 400, {
      campos_no_permitidos: camposDesconocidos,
      campos_permitidos: camposPermitidos,
    });
  }
}

module.exports = {
  crearError,
  convertirId,
  esTextoValido,
  convertirNumero,
  convertirBooleano,
  revisarCamposPermitidos,
};
