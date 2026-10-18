/**
 * Modelo de Dominio: Repuesto (Kodo Motors)
 * Representa piezas y repuestos automotrices del inventario.
 */
class Repuesto {
  static MODELOS_PERMITIDOS = [
    'Mazda2', 'Mazda3', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-90', 'BT-50', 'MX-5', 'Todos'
  ];

  constructor({
    id,
    codigo,
    nombre,
    modelo_compatible,
    stock = 0,
    stock_minimo = 5,
    precio,
    ubicacion = null
  }) {
    this.id = id ? Number(id) : undefined;
    this.codigo = codigo ? String(codigo).trim().toUpperCase() : '';
    this.nombre = nombre ? String(nombre).trim() : '';
    this.modeloCompatible = modelo_compatible;
    this.stock = Number(stock);
    this.stockMinimo = Number(stock_minimo);
    this.precio = Number(precio);
    this.ubicacion = ubicacion ? String(ubicacion).trim() : null;
    this.alertaBajoStock = this.stock <= this.stockMinimo;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Repuesto({
      id: row.id,
      codigo: row.codigo,
      nombre: row.nombre,
      modelo_compatible: row.modelo_compatible,
      stock: row.stock,
      stock_minimo: row.stock_minimo,
      precio: Number(row.precio), // Convertir DECIMAL de mysql2 a Number
      ubicacion: row.ubicacion
    });
  }

  static validar(datos, esActualizacion = false) {
    const errores = [];

    // 1. Código
    if (!esActualizacion || datos.codigo !== undefined) {
      if (!datos.codigo || typeof datos.codigo !== 'string' || datos.codigo.trim().length < 3) {
        errores.push('El campo "codigo" es obligatorio y debe tener al menos 3 caracteres');
      }
    }

    // 2. Nombre
    if (!esActualizacion || datos.nombre !== undefined) {
      if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
        errores.push('El campo "nombre" es obligatorio y no puede estar vacío');
      }
    }

    // 3. Modelo Compatible
    if (!esActualizacion || datos.modelo_compatible !== undefined) {
      if (!Repuesto.MODELOS_PERMITIDOS.includes(datos.modelo_compatible)) {
        errores.push(`El campo "modelo_compatible" debe ser uno de: ${Repuesto.MODELOS_PERMITIDOS.join(', ')}`);
      }
    }

    // 4. Precio
    if (!esActualizacion || datos.precio !== undefined) {
      const precioNum = Number(datos.precio);
      if (datos.precio === undefined || isNaN(precioNum) || precioNum <= 0) {
        errores.push('El campo "precio" es obligatorio y debe ser un número mayor a 0');
      }
    }

    // 5. Stock
    if (datos.stock !== undefined) {
      const stockNum = Number(datos.stock);
      if (isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
        errores.push('El campo "stock" debe ser un número entero mayor o igual a 0');
      }
    }

    // 6. Stock Mínimo
    if (datos.stock_minimo !== undefined) {
      const minNum = Number(datos.stock_minimo);
      if (isNaN(minNum) || !Number.isInteger(minNum) || minNum < 0) {
        errores.push('El campo "stock_minimo" debe ser un número entero mayor o igual a 0');
      }
    }

    return errores;
  }
}

module.exports = Repuesto;
