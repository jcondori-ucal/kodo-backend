// Modelo: representa la entidad Catalogo (vehículo nuevo) y sus reglas básicas
const MODELOS = ['Mazda2', 'Mazda3', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-90', 'BT-50', 'MX-5'];
const COMBUSTIBLES = ['gasolina', 'hibrido', 'diesel'];
const TRANSMISIONES = ['mecanica', 'automatica'];

class Catalogo {
  constructor({ id, modelo, version, anio, precio_usd, stock = 0, combustible, transmision, destacado = false }) {
    this.id = id;
    this.modelo = modelo;
    this.version = version;
    this.anio = anio;
    this.precioUsd = precio_usd;
    this.stock = stock;
    this.combustible = combustible;
    this.transmision = transmision;
    this.destacado = destacado;
  }

  // Convierte una fila de MySQL en un objeto Catalogo
  static fromRow(row) {
    return new Catalogo({
      ...row,
      precio_usd: Number(row.precio_usd), // mysql2 devuelve DECIMAL como texto
      destacado: Boolean(row.destacado), // MySQL guarda TINYINT(1) como 0/1
    });
  }

  // Devuelve un arreglo de errores; vacío si los datos son válidos
  static validar(datos) {
    const errores = [];
    const { modelo, version, anio, precio_usd, stock, combustible, transmision, destacado } = datos;

    if (!MODELOS.includes(modelo)) {
      errores.push(`modelo debe ser uno de: ${MODELOS.join(', ')}`);
    }
    if (typeof version !== 'string' || version.trim() === '') {
      errores.push('version es obligatoria');
    } else if (version.length > 60) {
      errores.push('version no debe superar 60 caracteres');
    }
    if (!Number.isInteger(anio) || anio < 1900) {
      errores.push('anio debe ser un entero válido');
    }
    if (typeof precio_usd !== 'number' || precio_usd <= 0) {
      errores.push('precio_usd debe ser un número mayor a 0');
    }
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      errores.push('stock debe ser un entero mayor o igual a 0');
    }
    if (!COMBUSTIBLES.includes(combustible)) {
      errores.push(`combustible debe ser uno de: ${COMBUSTIBLES.join(', ')}`);
    }
    if (!TRANSMISIONES.includes(transmision)) {
      errores.push(`transmision debe ser uno de: ${TRANSMISIONES.join(', ')}`);
    }
    if (destacado !== undefined && typeof destacado !== 'boolean') {
      errores.push('destacado debe ser true o false');
    }
    return errores;
  }
}

module.exports = Catalogo;
