// =====================================================================
// utils/validaciones.js · Funciones de apoyo que usan todos los módulos
// Responsable: Rachel (Parte 1)
//
// Las ponemos aquí una sola vez para no repetir el mismo código
// en Sedes y en Servicios.
// =====================================================================

// Crea un error con su código HTTP. El middleware manejarErrores lo lee
// y responde al cliente con ese código y ese mensaje.
function crearError(mensaje, estado = 400, detalles = null) {
  const error = new Error(mensaje);
  error.estado = estado;
  if (detalles) error.detalles = detalles;
  return error;
}

// Convierte el :id de la URL en número y verifica que sea entero positivo.
// Ejemplo: "/api/sedes/abc" no es válido -> error 400
function convertirId(valorRecibido) {
  const numero = Number(valorRecibido);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw crearError('El id debe ser un número entero positivo', 400);
  }
  return numero;
}

// true si es un texto con contenido y no supera el máximo de caracteres
function esTextoValido(valor, maximoCaracteres) {
  return (
    typeof valor === 'string' &&
    valor.trim().length > 0 &&
    valor.trim().length <= maximoCaracteres
  );
}

// Acepta 380 o "380". Devuelve el número, o null si no es un número válido.
// (Rechaza true/false y textos vacíos, que JavaScript convertiría en 1 y 0)
function convertirNumero(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  if (typeof valor === 'string' && valor.trim() !== '') {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
  }
  return null;
}

// Acepta true/false, 1/0 y "true"/"false". Devuelve null si no es ninguno.
function convertirBooleano(valor) {
  if (valor === true || valor === 1 || valor === '1' || valor === 'true') return true;
  if (valor === false || valor === 0 || valor === '0' || valor === 'false') return false;
  return null;
}

// Revisa que el cuerpo (req.body) solo traiga campos permitidos.
// Sirve para detectar errores de tipeo, por ejemplo "duracion" en vez de "duracion_min"
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
