# KodoApp API — Entregable 3

API REST del recurso **Catálogo de Vehículos Nuevos** para **KodoApp**, construida con **Node.js + Express + MySQL** y organizada en **arquitectura por capas**.

> Documento del **Entregable 3** del proyecto integrador — Curso *Fundamentos de Desarrollo Back-End* (UCAL).

---

## 1. Datos generales del equipo

| Campo | Detalle |
|---|---|
| Proyecto | KodoApp API |
| Entregable | Entregable 3 |
| Curso | [Nombre del curso] |
| Docente | [Nombre del docente] |
| Ciclo / Sección | [Ciclo] - [Sección] |
| Fecha de entrega | [dd/mm/aaaa] |

**Integrantes:**

| N.° | Apellidos y nombres | Rol en el equipo |
|---|---|---|
| 1 | [Integrante 1] | [Rol / responsabilidad] |
| 2 | [Integrante 2] | [Rol / responsabilidad] |
| 3 | [Integrante 3] | [Rol / responsabilidad] |
| 4 | [Integrante 4] | [Rol / responsabilidad] |

---

## 2. Descripción del proyecto

**KodoApp** es un sistema para la gestión de una concesionaria de vehículos Mazda. En este entregable se implementa el backend del recurso **Catálogo de Vehículos Nuevos**, que expone una API REST para consultar, registrar, actualizar y eliminar los vehículos disponibles en el catálogo.

El backend sigue el patrón repositorio con capas bien diferenciadas (rutas → controladores → servicios → repositorios → modelos), garantizando que la lógica de negocio y el acceso a datos queden desacoplados y sean fáciles de mantener y probar.

---

## 3. Objetivos

**Objetivo general**

- Implementar el CRUD completo del recurso `catalogo` mediante una API REST con arquitectura por capas, usando Node.js, Express y MySQL.

**Objetivos específicos**

- Definir el modelo `Catalogo` con validación de tipos de sus campos.
- Implementar consultas SQL puras con `pool.query` en la capa de repositorio.
- Aplicar reglas de negocio (validación de ID y clave única `modelo + version + anio`) en la capa de servicio.
- Exponer los endpoints GET, POST, PUT y DELETE a través de rutas y controladores.
- Documentar y automatizar las pruebas de los endpoints con una colección de Postman.

---

## 4. Alcance del entregable

- CRUD completo del recurso `catalogo`.
- Validaciones de entrada y manejo centralizado de errores HTTP.
- Base de datos `kodo_db` con la tabla `catalogo` y datos de ejemplo.
- Colección de Postman con aserciones automatizadas de *status code*.
- **Fuera de alcance:** autenticación, frontend y los demás recursos del sistema.

---

## 5. Tecnologías y herramientas

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución del backend |
| Express | Framework HTTP y enrutamiento |
| MySQL 8.4 | Base de datos relacional |
| mysql2 | Driver con pool de conexiones (`mysql2/promise`) |
| dotenv | Manejo de variables de entorno |
| Docker Compose | Contenedor de MySQL y Adminer |
| Postman | Pruebas manuales y automatizadas de la API |
| Git / GitHub | Control de versiones y trabajo colaborativo |

---

## 6. Arquitectura por capas del backend

```text
Cliente (Postman)
   │  HTTP + JSON
   ▼
routes/        → asocia método + URL con un controlador
controllers/   → lee req (params, body) y responde con res.status().json()
services/      → reglas de negocio (validar, 404, clave única → 409)
repositories/  → consultas SQL con el pool de mysql2
models/        → entidad (Catalogo): fromRow() y validar()
config/db.js   → pool de conexiones (mysql2/promise + dotenv)
   │
   ▼
MySQL (contenedor)
```

```text
backend-ee2-u2/
├── database/
│   ├── 01_schema.sql       # CREATE DATABASE / CREATE TABLE
│   └── 02_seed.sql         # registros de prueba
├── src/
│   ├── config/db.js        # pool de MySQL
│   ├── models/catalogo.model.js
│   ├── repositories/catalogo.repository.js
│   ├── services/catalogo.service.js
│   ├── controllers/catalogo.controller.js
│   ├── routes/catalogo.routes.js
│   └── utils/http-error.js # HttpError + responderError
├── main.js                 # punto de entrada (monta /api/catalogo)
├── postman_collection.json
├── docker-compose.yml
└── .env copy.example
```

---

## 7. Modelo de base de datos y recurso `catalogo`

Tabla `catalogo` (vehículos nuevos):

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INT, PK, AUTO_INCREMENT | Identificador del vehículo |
| `modelo` | ENUM | Mazda2, Mazda3, CX-3, CX-30, CX-5, CX-50, CX-90, BT-50, MX-5 |
| `version` | VARCHAR(60) | Nombre de la versión |
| `anio` | INT | Año del modelo |
| `precio_usd` | DECIMAL(10,2) | Precio en dólares |
| `stock` | INT | Unidades disponibles |
| `combustible` | ENUM | gasolina, hibrido, diesel |
| `transmision` | ENUM | mecanica, automatica |
| `destacado` | TINYINT(1) | 1 si está destacado, 0 si no |

**Restricción de negocio:** clave única `uq_catalogo (modelo, version, anio)` — no se permite duplicar la combinación.

---

## 8. Endpoints del recurso `catalogo`

Base: `http://localhost:4000/api/catalogo`

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| GET | `/api/catalogo` | Listar vehículos | 200 lista |
| GET | `/api/catalogo/:id` | Obtener por ID | 200 · 400 id inválido · 404 |
| POST | `/api/catalogo` | Crear vehículo | 201 · 400 datos inválidos · 409 duplicado |
| PUT | `/api/catalogo/:id` | Actualizar vehículo | 200 · 400 · 404 · 409 |
| DELETE | `/api/catalogo/:id` | Eliminar vehículo | 204 · 404 |

**Ejemplo de body (POST/PUT):**

```json
{
  "modelo": "CX-90",
  "version": "3.3 Turbo Premium",
  "anio": 2026,
  "precio_usd": 57990.00,
  "stock": 4,
  "combustible": "gasolina",
  "transmision": "automatica",
  "destacado": false
}
```

---

## 9. Instalación, configuración y ejecución

**Requisitos:** Docker Desktop, Node.js 18+ y Postman.

```bash
# 1. Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd backend-ee2-u2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp ".env copy.example" .env
# Editar .env si es necesario (PORT=4000, DB_PORT=3307, etc.)

# 4. Levantar la base de datos MySQL
docker compose up -d

# 5. Iniciar la API
npm run dev
```

- API: `http://localhost:4000`
- MySQL (Workbench): `localhost:3307`
- Adminer (visor web): `http://localhost:8081`

**Importar la colección de Postman:** importar `postman_collection.json` y ejecutar las peticiones en orden (1 → 5). La variable `baseUrl` apunta a `http://localhost:4000`.

---

## 10. Pruebas realizadas, conclusiones y observaciones

**Pruebas con Postman (colección `postman_collection.json`)**

| N.° | Petición | Status esperado |
|---|---|---|
| 1 | GET Listar vehículos | 200 |
| 2 | GET Obtener vehículo por ID (1) | 200 |
| 3 | POST Crear nuevo vehículo | 201 |
| 4 | PUT Actualizar vehículo por ID (1) | 200 |
| 5 | DELETE Eliminar vehículo (4) | 204 |

Cada petición incluye un script en la pestaña **Tests** que valida automáticamente el `status code` de la respuesta.

**Conclusiones**

- [Conclusión 1: p. ej. la arquitectura por capas facilitó separar validaciones, lógica y acceso a datos.]
- [Conclusión 2: p. ej. las aserciones de Postman permiten verificar el CRUD de forma repetible.]
- [Conclusión 3: p. ej. el uso de un pool de conexiones mejora el rendimiento frente a conexiones individuales.]

**Observaciones**

- **Conflicto de merge resuelto (`.gitignore`):** durante la integración de las ramas del equipo se produjo un **Merge Conflict** en el archivo `.gitignore`, ya que dos integrantes agregaron reglas distintas en la misma zona del archivo. El conflicto se resolvió de forma **interactiva en Visual Studio Code**, usando el editor de fusiones (`Accept Incoming` / `Accept Current` / `Accept Both`) para conservar las reglas de **ambas** ramas. El `.gitignore` final quedó así:

  ```gitignore
  .env
  .xd
  node_modules/
  ```

  Tras la resolución se guardó el archivo, se marcó como resuelto (`git add .gitignore`) y se completó el merge. **Lección aprendida:** coordinar qué archivos de configuración toca cada integrante y revisar los conflictos antes de confirmar.
- [Otras observaciones del equipo.]
- [Observación sobre el DELETE y la integridad referencial: si el vehículo tiene registros relacionados (pruebas de manejo o cotizaciones), MySQL rechazará el borrado por la clave foránea.]

---

_Documento generado para el Entregable 3 — KodoApp API._

---

# Anexo: API de Reservas (Kodo Motors)

API REST con Node.js, Express y MySQL organizada por capas. Gestiona las **reservas de citas** del taller Kodo Motors (concesionario Mazda).

## Integrantes

| Integrante | Responsabilidad |
|---|---|
| (nombre) | Repositorio de reservas y consultas SQL |
| (nombre) | Rutas, controlador y servicio de reservas |
| (nombre) | Manejo de errores, pruebas, README y ficha técnica |
| (nombre) | Módulo de catálogo |
| (nombre) | Módulo de catálogo |

## Empresa / caso asignado

Kodo Motors, red de talleres y concesionario Mazda en Lima. La base de datos `kodo_db` es el modelo común de la clase.

## Descripción de la solución

El módulo de reservas permite registrar, consultar, actualizar y eliminar citas de taller. Cada reserva se relaciona con una **sede**, un **servicio** y un **vehículo** ya existentes en la base de datos (claves foráneas). El sistema valida que esos registros existan y que no haya dos reservas activas en la misma sede, fecha y hora.

## Tecnologías

- Node.js 22
- Express 5
- MySQL 8 (driver `mysql2`)
- dotenv
- Postman para pruebas

## Arquitectura por capas

```
main.js                        → crea la app, monta rutas y middlewares
src/config/db.js               → pool de conexiones MySQL
src/routes/                    → define las URLs y las dirige al controlador
src/controllers/               → recibe req, llama al servicio, responde JSON
src/services/                  → reglas de negocio y validaciones
src/repositories/              → consultas SQL
src/models/reserva.model.js    → forma de una reserva, validación y mapeo
src/middlewares/               → errores centralizados y validación de :id
src/utils/AppError.js          → error con código HTTP
```

Flujo de una petición: **ruta → controlador → servicio → repositorio → MySQL**.

## Instalación

```bash
git clone https://github.com/jesus-ucal/backend-ee2-u2.git
cd backend-ee2-u2
npm install
cp .env.example .env
```

Edita `.env` si tu MySQL usa otro puerto o credenciales.

## Base de datos

**Opción A · Docker**

```bash
docker compose up -d
```

Levanta MySQL en `localhost:3307` y Adminer en `http://localhost:8081`. Los scripts de `database/` se ejecutan solos la primera vez.

**Opción B · MySQL instalado localmente**

Ejecuta en orden `database/01_schema.sql` y `database/02_seed.sql` (Workbench o consola) y pon `DB_PORT=3306` en `.env`. Crea el usuario de la API si no existe:

```sql
CREATE USER IF NOT EXISTS 'kodo'@'localhost' IDENTIFIED BY 'kodo123';
GRANT ALL PRIVILEGES ON kodo_db.* TO 'kodo'@'localhost';
FLUSH PRIVILEGES;
```

## Ejecución

```bash
npm run dev
```

Servidor en `http://localhost:4000`. Comprueba la conexión en `GET /api/db-check`.

## Endpoints principales

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| GET | `/api/reservas` | Lista reservas. Filtros: `?estado=`, `?fecha=`, `?sede_id=` | 200 |
| GET | `/api/reservas/:id` | Una reserva con sede, servicio y vehículo | 200 / 404 |
| POST | `/api/reservas` | Crea una reserva | 201 / 400 / 404 / 409 |
| PUT | `/api/reservas/:id` | Actualiza campos de una reserva | 200 / 400 / 404 / 409 |
| DELETE | `/api/reservas/:id` | Elimina una reserva | 204 / 404 |
| GET | `/api/sedes` `/api/servicios` `/api/vehiculos` | Listados de apoyo para conocer los IDs | 200 |

Cuerpo de `POST /api/reservas`:

```json
{
  "fecha": "2026-10-22",
  "hora": "11:00",
  "sede_id": 1,
  "servicio_id": 2,
  "vehiculo_id": 3,
  "observacion": "opcional"
}
```

Errores siempre en formato `{ "error": "mensaje", "detalles": [...] }`.

La colección de Postman está en `postman/kodo-reservas.postman_collection.json`.

## Observaciones y problemas resueltos

- **Conflicto de merge en `.gitignore`**: dos integrantes editaron el mismo archivo en ramas distintas. Se resolvió manualmente conservando `.env` y `node_modules/`, y se acordó que `main.js` lo edita una sola persona.
- **Dependencia de otros módulos**: reservas necesita sedes, servicios y vehículos. En vez de construir esos tres CRUD, se usan las claves foráneas de la tabla y se verifica que el ID exista antes de insertar.
- **Puerto de MySQL**: en equipos con MySQL instalado se usa 3306; con Docker, 3307. Se parametrizó en `.env`.
