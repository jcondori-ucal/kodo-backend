-- =====================================================================
-- Kodo Motors · Datos de ejemplo
-- =====================================================================
USE kodo_db;

INSERT INTO sedes (id, nombre, distrito, direccion, telefono, hora_apertura, hora_cierre, atiende_domingo) VALUES
 (1, 'Kodo Surquillo',  'Surquillo',  'Av. República de Panamá 4550', '014445566', '08:00', '18:00', 0),
 (2, 'Kodo La Molina',  'La Molina',  'Av. La Molina 1120',           '013487788', '08:30', '17:30', 1),
 (3, 'Kodo San Miguel', 'San Miguel', 'Av. La Marina 2300',           '015661122', '09:00', '18:00', 0);

INSERT INTO servicios (id, nombre, categoria, descripcion, precio, duracion_min) VALUES
 (1, 'Mantenimiento 10 000 km',      'mantenimiento', 'Cambio de aceite, filtros y revisión de 30 puntos', 380.00, 120),
 (2, 'Diagnóstico computarizado',    'diagnostico',   'Escaneo de fallas con equipo Mazda',               150.00,  60),
 (3, 'Cambio de pastillas de freno', 'frenos',        'Pastillas delanteras originales',                  290.00,  90),
 (4, 'Alineamiento y balanceo',      'neumaticos',    'Alineamiento 3D y balanceo de 4 ruedas',           120.00,  60),
 (5, 'Revisión de batería',          'electrico',     'Prueba de carga y bornes',                          60.00,  30);

-- Carlos (2) no acepta WhatsApp ni tiene email: sirve para probar reglas
INSERT INTO contactos (id, nombre, telefono, email, acepta_whatsapp) VALUES
 (1, 'Lucía Ramírez',  '987654321', 'lucia.ramirez@mail.com', 1),
 (2, 'Carlos Huamán',  '912345678', NULL,                     0),
 (3, 'Andrea Paredes', '955123456', 'andrea.p@mail.com',      1);

INSERT INTO vehiculos (id, placa, modelo, anio, color, kilometraje, contacto_id) VALUES
 (1, 'ABC-123', 'CX-5',   2022, 'Rojo Soul',    28500, 1),
 (2, 'BXD-456', 'Mazda3', 2020, 'Gris Machine', 61200, 2),
 (3, 'CKM-789', 'CX-30',  2024, 'Blanco',        9800, 3),
 (4, 'DLP-321', 'BT-50',  2021, 'Azul',         45300, 1);

INSERT INTO reservas (id, fecha, hora, sede_id, servicio_id, vehiculo_id, estado) VALUES
 (1, '2026-10-20', '09:00', 1, 1, 1, 'confirmada'),
 (2, '2026-10-20', '10:30', 1, 2, 2, 'pendiente'),
 (3, '2026-10-20', '09:00', 2, 4, 3, 'pendiente');

-- Órdenes 1 y 2 entregadas (encuestas), orden 1 cuesta S/ 380 (pagos)
INSERT INTO ordenes_servicio (id, vehiculo_id, sede_id, servicio_id, tecnico, km_ingreso, costo, estado, fecha_ingreso) VALUES
 (1, 1, 1, 1, 'Jorge Salas', 28500, 380.00, 'entregado',  '2026-10-10 09:00:00'),
 (2, 2, 1, 3, 'Rosa Díaz',   61200, 290.00, 'entregado',  '2026-10-12 10:30:00'),
 (3, 4, 2, 2, 'Jorge Salas', 45300, 150.00, 'listo',      '2026-10-14 08:30:00'),
 (4, 3, 3, 4, 'Iván Torres',  9800, 120.00, 'en_proceso', '2026-10-15 11:00:00'),
 (5, 1, 2, 5, 'Rosa Díaz',   28900,  60.00, 'recibido',   '2026-10-16 09:30:00');

-- El CX-50 (5) tiene stock 0: sin unidad de exhibición
INSERT INTO catalogo (id, modelo, version, anio, precio_usd, stock, combustible, transmision, destacado) VALUES
 (1, 'Mazda2', '1.5 Core MT',             2026, 17990.00, 6, 'gasolina', 'mecanica',   0),
 (2, 'Mazda3', '2.0 Sport Grand Touring', 2026, 27490.00, 3, 'gasolina', 'automatica', 1),
 (3, 'CX-30',  '2.0 Prime',               2026, 26990.00, 4, 'gasolina', 'automatica', 0),
 (4, 'CX-5',   '2.5 Signature AWD',       2026, 39990.00, 2, 'gasolina', 'automatica', 1),
 (5, 'CX-50',  '2.5 Hybrid AWD',          2026, 44990.00, 0, 'hibrido',  'automatica', 1),
 (6, 'BT-50',  '3.0 4x4 High',            2026, 38490.00, 5, 'diesel',   'mecanica',   0);

INSERT INTO pruebas_manejo (id, catalogo_id, sede_id, contacto_id, fecha, hora, licencia, estado) VALUES
 (1, 4, 1, 1, '2026-10-20', '10:00', 'Q12345678', 'confirmada'),
 (2, 2, 1, 3, '2026-10-20', '09:00', 'Q87654321', 'solicitada');

INSERT INTO cotizaciones (id, contacto_id, catalogo_id, precio_lista, descuento_pct, forma_pago, fecha_emision, estado) VALUES
 (1, 2, 4, 39990.00, 5.00, 'credito', '2026-10-15', 'vigente'),
 (2, 1, 2, 27490.00, 0.00, 'contado', '2026-10-01', 'aceptada');

-- Orden 1: ya se pagaron S/ 200 de S/ 380
INSERT INTO pagos (id, orden_id, monto, metodo, codigo_operacion, estado, fecha_pago) VALUES
 (1, 1, 200.00, 'yape',     'YP-0001', 'aprobado', '2026-10-10 12:00:00'),
 (2, 2, 290.00, 'efectivo', NULL,      'aprobado', '2026-10-12 17:00:00');

-- El filtro de aceite está por debajo del mínimo (alerta)
INSERT INTO repuestos (id, codigo, nombre, modelo_compatible, stock, stock_minimo, precio, ubicacion) VALUES
 (1, 'PE01-14-302', 'Filtro de aceite',        'Todos',  2, 10,  45.00, 'A-01'),
 (2, 'KD1Y-33-28Z', 'Pastillas delanteras',    'CX-5',   8,  4, 260.00, 'B-03'),
 (3, 'BP4K-33-23Z', 'Pastillas delanteras',    'Mazda3', 3,  4, 230.00, 'B-04'),
 (4, 'PY8W-13-Z40', 'Filtro de aire',          'CX-5',  12,  5,  85.00, 'A-02');

-- La orden 1 ya tiene encuesta; la orden 2 (entregada) no
INSERT INTO encuestas (id, orden_id, puntuacion, recomendaria, comentario) VALUES
 (1, 1, 5, 1, 'Atención rápida y muy amable');

INSERT INTO promociones (id, codigo, descripcion, servicio_id, descuento_pct, fecha_inicio, fecha_fin, activa) VALUES
 (1, 'MAZDA20',   '20 % en mantenimiento 10 000 km', 1,    20, '2026-10-01', '2026-12-31', 1),
 (2, 'FRENOS15',  '15 % en cambio de pastillas',     3,    15, '2026-09-01', '2026-09-30', 1),
 (3, 'KODO10',    '10 % en todos los servicios',     NULL, 10, '2026-10-01', '2026-11-30', 1);

INSERT INTO recordatorios (id, vehiculo_id, servicio_id, fecha_programada, canal, estado) VALUES
 (1, 1, 1, '2026-10-20', 'whatsapp', 'pendiente'),
 (2, 3, 4, '2026-11-05', 'email',    'pendiente');
