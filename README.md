# Kodo Motors API · kodo-motor-backend

![Kodo Motors](assets/banner.png)

API REST por capas de Kodo Motors con Node.js, Express y MySQL. Integra en un solo backend los
módulos que desarrollaron tres equipos del curso **Fundamentos de Desarrollo Back-End** (UCAL,
Evidencia Evaluativa 2): sedes, servicios, catálogo de vehículos, reservas, repuestos y encuestas.

## Contenido

1. [Nombre del proyecto](#1-nombre-del-proyecto)
2. [Integrantes del equipo](#2-integrantes-del-equipo)
3. [Empresa aliada](#3-empresa-aliada)
4. [Descripción de la solución](#4-descripción-de-la-solución)
5. [Tecnologías utilizadas](#5-tecnologías-utilizadas)
6. [Instalación](#6-instalación)
7. [Ejecución](#7-ejecución)
8. [Endpoints principales](#8-endpoints-principales)
9. [Base de datos](#9-base-de-datos)
10. [Observaciones y problemas resueltos durante la integración](#10-observaciones-y-problemas-resueltos-durante-la-integración)

---

## 1. Nombre del proyecto

**kodo-motor-backend** — API REST de Kodo Motors.

## 2. Integrantes del equipo

El proyecto une el trabajo de tres equipos. El historial de git conserva los commits originales
de cada uno (ver [Trabajo colaborativo](#trabajo-colaborativo-en-github)).

| Equipo | Integrante | Módulo | Responsabilidad |
|---|---|---|---|
| E03 | Felipe Reyes Ingunza | Sedes y Servicios | Base del proyecto en `main` y revisión de los pull requests |
| E03 | Rachel Duarte | Servicios | Capa de servicio; conexión a MySQL; fusión de los tres repositorios |
| E03 | Omar Vargas | Sedes | Capa de servicio |
| E03 | Anthony | Sedes y Servicios | Controladores y rutas |
| E03 | Alejandro | Sedes y Servicios | Controladores y rutas; resolución del conflicto en `routes/index.js` |
| u2 | Jesús Valencia | Reservas | Estructura base, conexión a BD, servicio, controlador y rutas |
| u2 | Jefferson Mamani | Reservas | Repositorios y consultas SQL |
| u2 | Piero Batti | Reservas | Manejo central de errores, README y colección Postman |
| u2 | Edgard Huamán | Catálogo | Rutas y controlador |
| u2 | José Jacinto | Catálogo | Servicio y repositorio |
| u2 | Heimer Quispe | Catálogo | Modelos y colección Postman |
| Grupo1-4 | Ivan Hermilio Mera Ibarguen | Repuestos y Encuestas | Arquitectura base, Express y pool MySQL |
| Grupo1-4 | Geraldo Fair Jaramillo Florida | Repuestos | Modelo y repositorio SQL |
| Grupo1-4 | Sharmili Luzmer Soncco Lupa | Repuestos | Servicio, controlador y rutas |
| Grupo1-4 | Adso Martin Obregon Gutierrez | Encuestas | Modelo y repositorio con JOIN |
| Grupo1-4 | Lenin David Mamani Sarmiento | Encuestas | Servicio, controlador, rutas, Postman y documentación |

## 3. Empresa aliada

**Kodo Motors**, empresa limeña especializada en vehículos Mazda, con tres líneas de trabajo:
venta de vehículos, servicio de taller y venta de repuestos.

## 4. Descripción de la solución

Un backend que gestiona la información de las tres líneas del negocio sobre una sola base de
datos (`kodo_db`, modelo común de la clase):

| Recurso | Qué gestiona | Reglas principales |
|---|---|---|
| Sedes | Locales: distrito, dirección, teléfono y horario | Nombre único; teléfono de 9 dígitos; apertura antes del cierre |
| Servicios | Trabajos del taller: categoría, precio y duración | Nombre único; categorías cerradas |
| Catálogo | Vehículos Mazda nuevos en venta | Modelo + versión + año no se repite |
| Reservas | Citas de taller por sede, servicio y vehículo | Sin dos reservas vigentes en la misma sede, fecha y hora; sede y servicio activos |
| Repuestos | Inventario con alerta de bajo stock | Código único; no se da de baja con stock disponible |
| Encuestas | Satisfacción del cliente por orden de servicio | Solo órdenes entregadas; una encuesta por orden |

**Borrado lógico en todo el proyecto.** Ningún registro se elimina de la base. `DELETE` marca el
registro como dado de baja (`activo = 0`, o `activa = 0` en sedes) y desde ese momento la API lo
trata como inexistente. Así se conserva el historial de Kodo Motors.

### Arquitectura por capas

```
Postman ──HTTP──▶ src/app.js ──▶ routes/      (método + URL; validarId en /:id)
                                   │
                                   ▼
                                 controllers/  (lee req, responde res; errores a next)
                                   │
                                   ▼
                                 services/     (reglas de negocio; lanza HttpError)
                                   │
                                   ▼
                                 repositories/ (único lugar con SQL; placeholders ?)
                                   │
                                   ▼
                                 config/db.js ──▶ MySQL kodo_db (Docker)

Cualquier error ──▶ middlewares/manejarErrores.js ──▶ { "mensaje": "...", "errores": [...] }
```

### Estructura de carpetas

```
kodo-motor-backend/
├── database/
│   ├── 01_schema.sql          # 14 tablas de kodo_db, trigger de encuestas
│   └── 02_seed.sql            # datos de ejemplo
├── postman/
│   └── kodo-motor-backend.postman_collection.json
├── src/
│   ├── server.js              # entrada: prueba MySQL y levanta la API
│   ├── app.js                 # CORS, JSON, rutas, 404 y errores
│   ├── config/db.js           # pool de mysql2/promise
│   ├── routes/                # un archivo por recurso + index.js
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middlewares/           # validarId, manejarErrores
│   └── utils/                 # HttpError, validaciones
├── test-suite.js              # npm test
├── docker-compose.yml         # MySQL 8.4 y Adminer
└── .env.example               # qué variables hay que definir (sin credenciales)
```

## 5. Tecnologías utilizadas

| Tecnología | Versión | Para qué se usa |
|---|---|---|
| Node.js | 18 o superior | Ejecuta JavaScript en el servidor |
| Express | 5.2 | Servidor HTTP, rutas y middlewares |
| mysql2 | 3.24 | Pool de conexiones y consultas con placeholders |
| dotenv | 17.4 | Lee el archivo `.env` |
| cors | 2.8 | Permite que un frontend en otra dirección consuma la API |
| MySQL | 8.4 | Base de datos relacional, en un contenedor Docker |
| Docker Compose | — | Levanta MySQL y Adminer |
| nodemon | 3.1 | Reinicia la API al guardar cambios |
| Postman | — | Pruebas de los endpoints |

## 6. Instalación

Requisitos: Node.js 18+, Docker Desktop abierto y Git.

```bash
git clone https://github.com/rachelduarte/kodo-motor-backend.git
cd kodo-motor-backend
npm install
```

Crear el archivo `.env` a partir de la plantilla y **reemplazar cada texto por su valor real**
(el usuario y la contraseña de MySQL los elige cada integrante; no se suben a GitHub):

```bash
cp .env.example .env
```

En Windows (cmd): `copy .env.example .env`.

## 7. Ejecución

```bash
docker compose up -d      # levanta MySQL (puerto 3307) y Adminer (puerto 8081)
npm run dev               # levanta la API en http://localhost:4000
```

La consola debe mostrar:

```
✔ Conectado a MySQL 8.4.x · base de datos: kodo_db
✔ API de Kodo Motors en http://localhost:4000
```

Comprobación rápida: `GET http://localhost:4000/api/salud`.

| Comando | Para qué |
|---|---|
| `npm run dev` | API con reinicio automático |
| `npm start` | API sin nodemon |
| `npm test` | 30 pruebas automáticas, sin necesidad de base de datos |
| `npm run bd:levantar` / `bd:detener` | Levanta o detiene MySQL |
| `npm run bd:reiniciar` | Borra la base y la vuelve a crear desde `database/` |

## 8. Endpoints principales

Base: `http://localhost:4000/api`. Todos los recursos siguen el mismo contrato.

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/<recurso>` | 200 · arreglo de registros activos. `?incluir_inactivos=true` incluye los dados de baja |
| GET | `/<recurso>/:id` | 200 · el registro · 400 id inválido · 404 no existe o está dado de baja |
| POST | `/<recurso>` | 201 · el registro creado · 400 datos inválidos · 409 valor único repetido |
| PUT | `/<recurso>/:id` | 200 · el registro actualizado · 400 · 404 · 409 |
| DELETE | `/<recurso>/:id` | 204 sin cuerpo (borrado lógico) · 404 si no existe o ya estaba de baja |

| Recurso | Ruta | Filtros del listado |
|---|---|---|
| Sedes | `/api/sedes` | `distrito` |
| Servicios | `/api/servicios` | `categoria` |
| Catálogo | `/api/catalogo` | — |
| Reservas | `/api/reservas` | `estado`, `fecha`, `sede_id` |
| Repuestos | `/api/repuestos` | `modelo_compatible`, `bajo_stock=true` |
| Encuestas | `/api/encuestas` | `puntuacion`, `recomendaria` |
| Vehículos (solo lectura) | `GET /api/vehiculos` | — para saber qué `vehiculo_id` usar en una reserva |
| Salud | `GET /api/salud` | — estado de la API y de la base |

Formato de error, igual en toda la API:

```json
{ "mensaje": "Datos de reserva inválidos", "errores": ["El campo 'fecha' es obligatorio"] }
```

La bandera de baja (`activo` / `activa`) **no se envía** en `POST` ni `PUT`: solo cambia con `DELETE`.

**Pruebas:** importar `postman/kodo-motor-backend.postman_collection.json` en Postman
(*Import → files*) y ejecutar la colección completa (*Run collection*) con la base recién creada.
Cada carpeta tiene casos positivos y negativos con su prueba automática del código HTTP.

## 9. Base de datos

- **Motor:** MySQL 8.4 en Docker. Se publica en `localhost:3307` para no chocar con un MySQL instalado.
- **Creación automática:** al primer `docker compose up -d`, el contenedor ejecuta `database/01_schema.sql`
  y `database/02_seed.sql` en ese orden.
- **Volver a crearla desde cero** (borra los datos de prueba): `npm run bd:reiniciar`.
  Es necesario si se cambia un `.sql`, porque los scripts solo corren con el volumen vacío.
- **Ver los datos:** Adminer en `http://localhost:8081` (servidor `mysql`, usuario y contraseña
  los de `DB_USER` y `DB_PASSWORD` del `.env`) o MySQL Workbench en `localhost:3307`.
- **Columnas del borrado lógico:** `sedes.activa`, y `activo` en `servicios`, `catalogo`, `reservas`,
  `repuestos` y `encuestas`. Evidencia: después de un `DELETE`, `SELECT * FROM <tabla> WHERE id = ...`
  sigue mostrando la fila, con la bandera en 0.

**Sin Docker (MySQL instalado):** ejecutar `01_schema.sql` y `02_seed.sql` en Workbench y crear
el usuario de la API con los valores que se pondrán en el `.env`:

```sql
CREATE USER 'usuario_de_la_api'@'localhost' IDENTIFIED BY 'contraseña_que_elijas';
GRANT ALL PRIVILEGES ON kodo_db.* TO 'usuario_de_la_api'@'localhost';
```

En ese caso, en el `.env`: `DB_PORT=3306` (o el puerto de tu MySQL).

## 10. Observaciones y problemas resueltos durante la integración

### Al fusionar los tres repositorios

| Problema | Causa | Solución |
|---|---|---|
| Dos rutas `GET /api/sedes` y `GET /api/servicios` | u2 las tenía como consulta de apoyo y E03 como CRUD completo | Se dejó el CRUD de E03; de los lookups de u2 quedó solo `GET /api/vehiculos` |
| Tres formatos de respuesta y de error | `{ ok, datos }` en E03, `{ error }` en u2 y Grupo1-4 | Un solo contrato: JSON plano en éxitos, `{ mensaje, errores }` en errores, un `HttpError` y un manejador central |
| Dos repositorios borraban registros de verdad | `DELETE FROM` en sedes, servicios, catálogo y reservas | Borrado lógico en los seis recursos; columna `activo` nueva en `catalogo` y `reservas` |
| Una baja se podía revertir con `PUT` | En E03, `activa`/`activo` eran campos editables | La bandera salió de los campos permitidos; solo cambia con `DELETE` |
| Express 4 en Grupo1-4 y Express 5 en los demás | Cada equipo instaló una versión | Todo el proyecto en Express 5; las rutas de Grupo1-4 no necesitaron cambios |
| Choques al unir los historiales | Los tres repos tenían `README.md`, `package.json`, `db.js`, `.env.example`… | `git merge --allow-unrelated-histories` resolviendo cada archivo; se conservan los commits de todos |
| Contraseña de clase en `.env.example`, `db.js` y `docker-compose.yml` | Valores por defecto para que funcionara sin configurar | `.env.example` solo con texto descriptivo; `docker-compose.yml` exige cada variable con `${VAR:?}` |
| El trigger de encuestas se creaba con `latin1` | `01_schema.sql` no tenía `SET NAMES utf8mb4` | Se agregó al inicio del esquema; además `.gitattributes` fuerza fin de línea LF en los `.sql` |
| Contenedor `kodo_mysql` ya en uso | Los repos anteriores usaban el mismo nombre de contenedor | Detener el contenedor del repo anterior (`docker compose down` en su carpeta) antes de levantar este |

### Heredados de cada equipo

- **E03:** conflicto de merge en `src/routes/index.js` (dos integrantes agregaron rutas en las mismas líneas);
  `DECIMAL` llegaba como texto y `TINYINT(1)` como 0/1 (se resolvió con `decimalNumbers` y `typeCast` en `db.js`);
  el teléfono perdía el 0 inicial (se exige como texto de 9 dígitos).
- **u2:** conflicto de merge en `.gitignore`; un commit en una rama distinta a la acordada; reservas y catálogo
  tenían dos sistemas de errores; cada PC usaba un puerto de MySQL distinto (se parametrizó en `.env`).
- **Grupo1-4:** `stock_minimo` de 0 se guardaba como 5 (`||` en lugar de `??`); JSON mal formado devolvía una
  página HTML con rutas del disco; tildes mal guardadas en el seed; rama sin historial común con `main`;
  borrado lógico y trigger para que solo se encuesten órdenes entregadas.

### Trabajo colaborativo en GitHub

- `main` contiene los commits de los tres repositorios originales unidos por merge, no copiados.
  `git shortlog -sne` muestra a cada autor (`.mailmap` agrupa a quienes usaron dos correos).
- Las ramas que no llegaron a `main` en sus repos originales se conservan como
  `historial/u2/archivo-reservas`, `historial/u2/jeff` y `historial/g14/feature/encuestas-qa-docs`.
- Cada paso de la fusión es un commit aparte con el formato `[TAG] módulo: descripción`.
