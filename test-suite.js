/**
 * Suite de Pruebas de Verificación Automatizada (Kodo Motors)
 * Valida:
 * 1. Confirmación de CERO sentencias "DELETE FROM" (Soft Delete garantizado)
 * 2. Restricción estricta de encuestas únicamente para órdenes en estado "entregado"
 * 3. Bloqueo de eliminación de repuestos con stock > 0
 * 4. Eliminación lógica (soft delete) en Repuestos y Encuestas (activo = false)
 * 5. Ausencia de contraseñas por defecto en db.js
 */

const fs = require('fs');
const path = require('path');
const Repuesto = require('./src/models/repuesto.model');
const Encuesta = require('./src/models/encuesta.model');
const repuestosService = require('./src/services/repuestos.service');
const encuestasService = require('./src/services/encuestas.service');
const repuestosRepository = require('./src/repositories/repuestos.repository');
const encuestasRepository = require('./src/repositories/encuestas.repository');

const resultados = [];

function registrarPrueba(codigo, descripcion, paso, esperado, obtenido) {
  resultados.push({ codigo, descripcion, paso, esperado, obtenido });
  const icono = paso ? '✅ PASS' : '❌ FAIL';
  console.log(`${icono} [${codigo}] ${descripcion}`);
  if (!paso) {
    console.error(`   Esperado: ${esperado}`);
    console.error(`   Obtenido: ${obtenido}`);
  }
}

async function ejecutarSuite() {
  console.log('===============================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS DE CALIDAD (QA) - KODO MOTORS');
  console.log('===============================================================\n');

  // --- SECCIÓN 1: VERIFICACIÓN DE QUE NO SE USE "DELETE FROM" (SQL) ---
  console.log('🔍 1. Verificación de Código Fuente (Auditoría Anti-Hard Delete)...');
  
  function scanDirForHardDelete(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let hallazgos = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        hallazgos = hallazgos.concat(scanDirForHardDelete(fullPath));
      } else if (entry.name.endsWith('.js')) {
        const text = fs.readFileSync(fullPath, 'utf8');
        const matches = text.match(/DELETE\s+FROM/gi);
        if (matches) {
          hallazgos.push({ file: fullPath, matches });
        }
      }
    }
    return hallazgos;
  }

  const hardDeletes = scanDirForHardDelete(path.join(__dirname, 'src'));
  registrarPrueba(
    'CP-01',
    'Confirmación de ausencia total de sentencias SQL "DELETE FROM" en src/',
    hardDeletes.length === 0,
    '0 sentencias DELETE FROM en el backend',
    `${hardDeletes.length} sentencias encontradas`
  );

  // --- SECCIÓN 2: AUDITORÍA DE SEGURIDAD EN DB.JS ---
  console.log('\n🔒 2. Auditoría de Seguridad de Credenciales (db.js)...');
  const dbJsContent = fs.readFileSync(path.join(__dirname, 'src/config/db.js'), 'utf8');
  const tieneClaveQuemada = dbJsContent.includes("'kodo123'") || dbJsContent.includes('"kodo123"');
  registrarPrueba(
    'CP-02',
    'Confirmación de que db.js no contiene contraseñas por defecto quemadas',
    !tieneClaveQuemada,
    'Sin contraseñas por defecto en db.js',
    tieneClaveQuemada ? 'Contraseña quemada detectada' : 'Limpio y seguro'
  );

  // --- SECCIÓN 3: PRUEBAS DE REGLAS DE NEGOCIO - REPUESTOS (SOFT DELETE) ---
  console.log('\n📦 3. Reglas de Negocio de Repuestos (Soft Delete)...');

  // Guardar métodos originales para restaurarlos al final
  const origRepFindById = repuestosRepository.findById;
  const origRepRemove = repuestosRepository.remove;
  const origEncFindById = encuestasRepository.findById;
  const origEncRemove = encuestasRepository.remove;
  const origEncFindOrden = encuestasRepository.findOrdenServicioById;
  const origEncFindByOrden = encuestasRepository.findByOrdenId;
  const origEncCreate = encuestasRepository.create;

  // CP-03: Bloqueo de eliminación si stock > 0
  repuestosRepository.findById = async () => new Repuesto({
    id: 10,
    codigo: 'TST-001',
    nombre: 'Filtro Test',
    modelo_compatible: 'CX-5',
    stock: 4,
    stock_minimo: 2,
    precio: 80,
    activo: 1
  });

  try {
    await repuestosService.eliminar(10);
    registrarPrueba('CP-03', 'Bloquear baja de repuesto si aún cuenta con stock > 0', false, 'Error 400', 'Permitió eliminar');
  } catch (err) {
    registrarPrueba(
      'CP-03',
      'Bloquear baja de repuesto si aún cuenta con stock > 0',
      err.statusCode === 400 && err.message.includes('stock disponible'),
      'HTTP 400 con advertencia de stock',
      `HTTP ${err.statusCode}: ${err.message}`
    );
  }

  // CP-04: Soft delete permitido cuando stock == 0
  repuestosRepository.findById = async () => new Repuesto({
    id: 11,
    codigo: 'TST-002',
    nombre: 'Bujía Test',
    modelo_compatible: 'Mazda3',
    stock: 0,
    stock_minimo: 2,
    precio: 35,
    activo: 1
  });

  let repuestoActualizadoSoftDelete = false;
  repuestosRepository.remove = async (id) => {
    repuestoActualizadoSoftDelete = true;
    return true;
  };

  const resRepSoftDelete = await repuestosService.eliminar(11);
  registrarPrueba(
    'CP-04',
    'Ejecución exitosa de Soft Delete en repuesto con stock 0 (activo pasa a false)',
    repuestoActualizadoSoftDelete && resRepSoftDelete.repuestoEliminado.activo === false,
    'activo=false y llamada a soft delete',
    `llamado=${repuestoActualizadoSoftDelete}, activo=${resRepSoftDelete.repuestoEliminado.activo}`
  );

  // --- SECCIÓN 4: REGLAS DE NEGOCIO - ENCUESTAS (SOLO ORDEN ENTREGADA) ---
  console.log('\n📋 4. Reglas de Negocio de Encuestas (Orden Entregada)...');

  // CP-05: Rechazo de encuesta con orden en estado 'en_proceso'
  encuestasRepository.findOrdenServicioById = async () => ({ id: 20, estado: 'en_proceso' });
  encuestasRepository.findByOrdenId = async () => null;

  try {
    await encuestasService.crear({ orden_id: 20, puntuacion: 5, recomendaria: true });
    registrarPrueba('CP-05', 'Rechazar encuesta para orden en estado "en_proceso"', false, 'HTTP 400', 'Permitió crear');
  } catch (err) {
    registrarPrueba(
      'CP-05',
      'Rechazar encuesta para orden en estado "en_proceso"',
      err.statusCode === 400 && err.message.includes('entregado'),
      'HTTP 400 indicando orden no entregada',
      `HTTP ${err.statusCode}: ${err.message}`
    );
  }

  // CP-06: Rechazo de encuesta con orden en estado 'listo'
  encuestasRepository.findOrdenServicioById = async () => ({ id: 21, estado: 'listo' });
  try {
    await encuestasService.crear({ orden_id: 21, puntuacion: 4, recomendaria: true });
    registrarPrueba('CP-06', 'Rechazar encuesta para orden en estado "listo"', false, 'HTTP 400', 'Permitió crear');
  } catch (err) {
    registrarPrueba(
      'CP-06',
      'Rechazar encuesta para orden en estado "listo"',
      err.statusCode === 400 && err.message.includes('entregado'),
      'HTTP 400 indicando orden no entregada',
      `HTTP ${err.statusCode}: ${err.message}`
    );
  }

  // CP-07: Rechazo de encuesta con orden inexistente
  encuestasRepository.findOrdenServicioById = async () => null;
  try {
    await encuestasService.crear({ orden_id: 999, puntuacion: 5, recomendaria: true });
    registrarPrueba('CP-07', 'Rechazar encuesta para orden inexistente (404)', false, 'HTTP 404', 'Permitió crear');
  } catch (err) {
    registrarPrueba(
      'CP-07',
      'Rechazar encuesta para orden inexistente (404)',
      err.statusCode === 404,
      'HTTP 404',
      `HTTP ${err.statusCode}: ${err.message}`
    );
  }

  // CP-08: Aceptación de encuesta para orden en estado 'entregado'
  encuestasRepository.findOrdenServicioById = async () => ({ id: 22, estado: 'entregado' });
  encuestasRepository.findByOrdenId = async () => null;
  encuestasRepository.create = async (datos) => new Encuesta({
    id: 1,
    orden_id: datos.orden_id,
    puntuacion: datos.puntuacion,
    recomendaria: datos.recomendaria,
    comentario: datos.comentario || null,
    activo: 1
  });

  const nuevaEncuesta = await encuestasService.crear({ orden_id: 22, puntuacion: 5, recomendaria: true, comentario: 'Excelente' });
  registrarPrueba(
    'CP-08',
    'Aceptar y registrar encuesta cuando la orden está en estado "entregado"',
    nuevaEncuesta && nuevaEncuesta.ordenId === 22 && nuevaEncuesta.activo === true,
    'Encuesta creada con orden 22 y activo=true',
    `Creada ordenId=${nuevaEncuesta?.ordenId}, activo=${nuevaEncuesta?.activo}`
  );

  // CP-09: Rechazar encuesta duplicada para la misma orden
  encuestasRepository.findByOrdenId = async () => new Encuesta({ id: 1, orden_id: 22, puntuacion: 5, recomendaria: true, activo: 1 });
  try {
    await encuestasService.crear({ orden_id: 22, puntuacion: 5, recomendaria: true });
    registrarPrueba('CP-09', 'Rechazar registro de segunda encuesta para la misma orden', false, 'HTTP 400', 'Permitió duplicar');
  } catch (err) {
    registrarPrueba(
      'CP-09',
      'Rechazar registro de segunda encuesta para la misma orden',
      err.statusCode === 400 && err.message.includes('ya cuenta con una encuesta'),
      'HTTP 400 por duplicidad',
      `HTTP ${err.statusCode}: ${err.message}`
    );
  }

  // --- SECCIÓN 5: SOFT DELETE EN ENCUESTAS ---
  console.log('\n🗑️ 5. Soft Delete en Encuestas...');

  encuestasRepository.findById = async () => new Encuesta({
    id: 30,
    orden_id: 22,
    puntuacion: 5,
    recomendaria: true,
    activo: 1
  });

  let encuestaActualizadaSoftDelete = false;
  encuestasRepository.remove = async (id) => {
    encuestaActualizadaSoftDelete = true;
    return true;
  };

  const resEncSoftDelete = await encuestasService.eliminar(30);
  registrarPrueba(
    'CP-10',
    'Ejecución exitosa de Soft Delete en encuestas (activo pasa a false sin DELETE físico)',
    encuestaActualizadaSoftDelete && resEncSoftDelete.encuestaEliminada.activo === false,
    'activo=false y llamada a soft delete',
    `llamado=${encuestaActualizadaSoftDelete}, activo=${resEncSoftDelete.encuestaEliminada.activo}`
  );

  // Restaurar repositorios originales
  repuestosRepository.findById = origRepFindById;
  repuestosRepository.remove = origRepRemove;
  encuestasRepository.findById = origEncFindById;
  encuestasRepository.remove = origEncRemove;
  encuestasRepository.findOrdenServicioById = origEncFindOrden;
  encuestasRepository.findByOrdenId = origEncFindByOrden;
  encuestasRepository.create = origEncCreate;

  // Resumen final
  console.log('\n===============================================================');
  const aprobadas = resultados.filter((r) => r.paso).length;
  const fallidas = resultados.filter((r) => !r.paso).length;
  console.log(`📊 RESUMEN: ${aprobadas} Aprobadas, ${fallidas} Fallidas de un total de ${resultados.length} pruebas.`);
  if (fallidas === 0) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
  } else {
    console.error('⚠️ Se detectaron fallas en las pruebas.');
  }
  console.log('===============================================================\n');
}

ejecutarSuite().catch(console.error);

