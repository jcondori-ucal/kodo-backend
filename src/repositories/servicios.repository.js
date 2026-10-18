const { conexion } = require('../config/db');

async function listar(filtros = {}) {
  const condiciones = [];
  const valores = [];

  if (filtros.categoria !== undefined) {
    condiciones.push('categoria = ?');
    valores.push(filtros.categoria);
  }

  if (filtros.activo !== undefined) {
    condiciones.push('activo = ?');
    valores.push(filtros.activo);
  }

  let consulta = 'SELECT * FROM servicios';
  if (condiciones.length > 0) consulta += ' WHERE ' + condiciones.join(' AND ');
  consulta += ' ORDER BY id';

  const [filas] = await conexion.execute(consulta, valores);
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await conexion.execute('SELECT * FROM servicios WHERE id = ?', [id]);
  return filas[0];
}

async function crear(servicio) {
  const [resultado] = await conexion.execute(
    `INSERT INTO servicios (nombre, categoria, descripcion, precio, duracion_min, activo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      servicio.nombre,
      servicio.categoria,
      servicio.descripcion,
      servicio.precio,
      servicio.duracion_min,
      servicio.activo,
    ]
  );
  return resultado.insertId;
}

async function actualizar(id, servicio) {
  await conexion.execute(
    `UPDATE servicios
        SET nombre = ?, categoria = ?, descripcion = ?, precio = ?, duracion_min = ?, activo = ?
      WHERE id = ?`,
    [
      servicio.nombre,
      servicio.categoria,
      servicio.descripcion,
      servicio.precio,
      servicio.duracion_min,
      servicio.activo,
      id,
    ]
  );
}

async function eliminar(id) {
  await conexion.execute('DELETE FROM servicios WHERE id = ?', [id]);
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };
