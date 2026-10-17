-- =====================================================================
-- Kodo Motors · Base de datos kodo_db (modelo común de la clase)
-- Docker ejecuta este archivo automáticamente la primera vez.
-- Sin Docker: ábrelo en MySQL Workbench y ejecútalo completo.
-- =====================================================================
CREATE DATABASE IF NOT EXISTS kodo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kodo_db;

-- ---------- Núcleo -------------------------------------------------------

--  Sedes y horarios
CREATE TABLE IF NOT EXISTS sedes (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(80)  NOT NULL UNIQUE,
  distrito         VARCHAR(60)  NOT NULL,
  direccion        VARCHAR(150) NOT NULL,
  telefono         CHAR(9)      NOT NULL,
  hora_apertura    TIME         NOT NULL,
  hora_cierre      TIME         NOT NULL,
  atiende_domingo  TINYINT(1)   NOT NULL DEFAULT 0,
  activa           TINYINT(1)   NOT NULL DEFAULT 1
);

--  Servicios «¿Qué necesita tu Mazda?»
CREATE TABLE IF NOT EXISTS servicios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL UNIQUE,
  categoria     ENUM('mantenimiento','diagnostico','frenos','neumaticos','electrico','planchado_pintura') NOT NULL,
  descripcion   VARCHAR(255) NULL,
  precio        DECIMAL(8,2) NOT NULL,
  duracion_min  INT          NOT NULL,
  activo        TINYINT(1)   NOT NULL DEFAULT 1
);

--  Contactos
CREATE TABLE IF NOT EXISTS contactos (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  telefono         CHAR(9)      NOT NULL UNIQUE,
  email            VARCHAR(120) NULL,
  acepta_whatsapp  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

--  Vehículos de los clientes
CREATE TABLE IF NOT EXISTS vehiculos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  placa        VARCHAR(7)   NOT NULL UNIQUE,
  modelo       ENUM('Mazda2','Mazda3','CX-3','CX-30','CX-5','CX-50','CX-90','BT-50','MX-5') NOT NULL,
  anio         INT          NOT NULL,
  color        VARCHAR(30)  NULL,
  kilometraje  INT          NOT NULL DEFAULT 0,
  contacto_id  INT          NOT NULL,
  CONSTRAINT fk_vehiculo_contacto FOREIGN KEY (contacto_id) REFERENCES contactos(id)
);

--  Reservas de citas
CREATE TABLE IF NOT EXISTS reservas (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  fecha        DATE         NOT NULL,
  hora         TIME         NOT NULL,
  sede_id      INT          NOT NULL,
  servicio_id  INT          NOT NULL,
  vehiculo_id  INT          NOT NULL,
  estado       ENUM('pendiente','confirmada','cancelada','atendida') NOT NULL DEFAULT 'pendiente',
  observacion  VARCHAR(255) NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reserva_sede     FOREIGN KEY (sede_id)     REFERENCES sedes(id),
  CONSTRAINT fk_reserva_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id),
  CONSTRAINT fk_reserva_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
);

--  Órdenes de servicio
CREATE TABLE IF NOT EXISTS ordenes_servicio (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id    INT          NOT NULL,
  sede_id        INT          NOT NULL,
  servicio_id    INT          NOT NULL,
  tecnico        VARCHAR(100) NOT NULL,
  km_ingreso     INT          NOT NULL,
  diagnostico    VARCHAR(255) NULL,
  costo          DECIMAL(8,2) NOT NULL DEFAULT 0,
  estado         ENUM('recibido','en_proceso','listo','entregado') NOT NULL DEFAULT 'recibido',
  fecha_ingreso  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orden_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
  CONSTRAINT fk_orden_sede     FOREIGN KEY (sede_id)     REFERENCES sedes(id),
  CONSTRAINT fk_orden_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

-- ---------- Opciones complementarias ------------------------------------

-- · Catálogo de vehículos nuevos
CREATE TABLE IF NOT EXISTS catalogo (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  modelo       ENUM('Mazda2','Mazda3','CX-3','CX-30','CX-5','CX-50','CX-90','BT-50','MX-5') NOT NULL,
  version      VARCHAR(60)   NOT NULL,
  anio         INT           NOT NULL,
  precio_usd   DECIMAL(10,2) NOT NULL,
  stock        INT           NOT NULL DEFAULT 0,
  combustible  ENUM('gasolina','hibrido','diesel') NOT NULL,
  transmision  ENUM('mecanica','automatica') NOT NULL,
  destacado    TINYINT(1)    NOT NULL DEFAULT 0,
  UNIQUE KEY uq_catalogo (modelo, version, anio)
);

-- · Pruebas de manejo
CREATE TABLE IF NOT EXISTS pruebas_manejo (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  catalogo_id  INT         NOT NULL,
  sede_id      INT         NOT NULL,
  contacto_id  INT         NOT NULL,
  fecha        DATE        NOT NULL,
  hora         TIME        NOT NULL,
  licencia     VARCHAR(12) NOT NULL,
  estado       ENUM('solicitada','confirmada','realizada','cancelada') NOT NULL DEFAULT 'solicitada',
  CONSTRAINT fk_prueba_catalogo FOREIGN KEY (catalogo_id) REFERENCES catalogo(id),
  CONSTRAINT fk_prueba_sede     FOREIGN KEY (sede_id)     REFERENCES sedes(id),
  CONSTRAINT fk_prueba_contacto FOREIGN KEY (contacto_id) REFERENCES contactos(id)
);

-- · Cotizaciones de compra
CREATE TABLE IF NOT EXISTS cotizaciones (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  contacto_id    INT           NOT NULL,
  catalogo_id    INT           NOT NULL,
  precio_lista   DECIMAL(10,2) NOT NULL,
  descuento_pct  DECIMAL(4,2)  NOT NULL DEFAULT 0,
  forma_pago     ENUM('contado','credito','leasing') NOT NULL,
  fecha_emision  DATE          NOT NULL DEFAULT (CURRENT_DATE),
  estado         ENUM('vigente','aceptada','rechazada') NOT NULL DEFAULT 'vigente',
  CONSTRAINT fk_cotizacion_contacto FOREIGN KEY (contacto_id) REFERENCES contactos(id),
  CONSTRAINT fk_cotizacion_catalogo FOREIGN KEY (catalogo_id) REFERENCES catalogo(id)
);

--  · Pagos de órdenes de servicio
CREATE TABLE IF NOT EXISTS pagos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  orden_id          INT          NOT NULL,
  monto             DECIMAL(8,2) NOT NULL,
  metodo            ENUM('tarjeta','yape','plin','transferencia','efectivo') NOT NULL,
  codigo_operacion  VARCHAR(30)  NULL UNIQUE,
  estado            ENUM('pendiente','aprobado','rechazado','reembolsado') NOT NULL DEFAULT 'pendiente',
  fecha_pago        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pago_orden FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id)
);

--  · Repuestos e inventario
CREATE TABLE IF NOT EXISTS repuestos (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  codigo             VARCHAR(20)  NOT NULL UNIQUE,
  nombre             VARCHAR(100) NOT NULL,
  modelo_compatible  ENUM('Mazda2','Mazda3','CX-3','CX-30','CX-5','CX-50','CX-90','BT-50','MX-5','Todos') NOT NULL,
  stock              INT          NOT NULL DEFAULT 0,
  stock_minimo       INT          NOT NULL DEFAULT 5,
  precio             DECIMAL(8,2) NOT NULL,
  ubicacion          VARCHAR(20)  NULL
);

--  · Encuestas de satisfacción
CREATE TABLE IF NOT EXISTS encuestas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  orden_id      INT          NOT NULL UNIQUE,
  puntuacion    INT          NOT NULL,
  recomendaria  TINYINT(1)   NOT NULL,
  comentario    VARCHAR(300) NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_encuesta_orden FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(id)
);

--  · Promociones y cupones
CREATE TABLE IF NOT EXISTS promociones (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  codigo         VARCHAR(20)  NOT NULL UNIQUE,
  descripcion    VARCHAR(150) NOT NULL,
  servicio_id    INT          NULL,
  descuento_pct  INT          NOT NULL,
  fecha_inicio   DATE         NOT NULL,
  fecha_fin      DATE         NOT NULL,
  activa         TINYINT(1)   NOT NULL DEFAULT 1,
  CONSTRAINT fk_promocion_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

--  · Recordatorios de mantenimiento
CREATE TABLE IF NOT EXISTS recordatorios (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id       INT          NOT NULL,
  servicio_id       INT          NOT NULL,
  fecha_programada  DATE         NOT NULL,
  canal             ENUM('whatsapp','llamada','email') NOT NULL,
  estado            ENUM('pendiente','enviado','agendado','descartado') NOT NULL DEFAULT 'pendiente',
  nota              VARCHAR(200) NULL,
  CONSTRAINT fk_recordatorio_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
  CONSTRAINT fk_recordatorio_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);
