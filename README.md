# Kodo Motors API · Reservas y Catálogo

API REST con **Node.js, Express y MySQL** organizada por capas. Gestiona dos recursos del taller y concesionario Mazda **Kodo Motors**:

- **Reservas**: citas de taller de los clientes.
- **Catálogo**: vehículos nuevos disponibles para la venta.

Evidencia Evaluativa 2 · Curso *Fundamentos de Desarrollo Back-End* · UCAL.

## 1. Integrantes

| N.° | Integrante | Módulo | Responsabilidad |
|---|---|---|---|
| 1 | Jesús Valencia | Reservas | Estructura base, conexión a BD, servicio, controlador y rutas |
| 2 | Jefferson Mamani | Reservas | Repositorios y consultas SQL |
| 3 | Piero Batti | Reservas | Manejo central de errores, README y colección Postman |
| 4 | Edgard Huamán | Catálogo | Módulo de catálogo en 5 capas |
| 5 | (nombre) | Catálogo | (responsabilidad) |

## 2. Empresa / caso asignado

Kodo Motors, red de talleres y concesionario Mazda en Lima. La base de datos `kodo_db` es el modelo común de la clase: 14 tablas, de las cuales este backend expone `reservas` y `catalogo`.

## 3. Descripción de la solución

**Reservas** permite registrar, consultar, actualizar y eliminar citas de taller. Cada reserva se relaciona con una **sede**, un **servicio** y un **vehículo** que ya existen en la base de datos (claves foráneas). El sistema verifica que esos registros existan y que no haya dos reservas activas en la misma sede, fecha y hora.

**Catálogo** permite administrar los vehículos nuevos en venta: modelo, versión, año, precio, stock, combustible y transmisión. No se permite repetir la combinación modelo + versión + año.

## 4. Tecnologías

- Node.js 22
- Express 5
- MySQL 8 / MariaDB 10.4 (driver `mysql2`)
- dotenv
- Postman para pruebas
- Git y GitHub para el trabajo colaborativo

## 5. Arquitectura por capas

```
main.js                              → crea la app, monta rutas y middlewares
src/config/db.js                     → pool de conexiones MySQL
src/routes/                          → define las URLs y las dirige al controlador
  reserva.routes.js · catalogo.routes.js · lookups.routes.js
src/controllers/                     → recibe req, llama al servicio, responde JSON
  reserva.controller.js · catalogo.controller.js
src/services/                        → reglas de negocio y validaciones
  reserva.service.js · catalogo.service.js
src/repositories/                    → consultas SQL
  reserva.repository.js · catalogo.repository.js · lookups.repository.js
src/models/                          → forma de cada entidad, validación y mapeo de filas
  reserva.model.js · catalogo.model.js
src/middlewares/                     → errorHandler (404 y errores) y validarId
src/utils/AppError.js                → error con código HTTP
```

Flujo de una petición: **ruta → controlador → servicio → repositorio → MySQL**.

- El **controlador** no contiene reglas ni SQL: toma `req`, llama al servicio y responde.
- El **servicio** valida con el modelo y lanza `AppError(codigo, mensaje)` cuando algo falla.
- El **repositorio** es el único que ejecuta SQL.
- Todo error, de cualquier módulo, cae en `errorHandler` y se responde con el mismo formato.

## 6. Instalación

```bash
git clone https://github.com/jesus-ucal/backend-ee2-u2.git
cd backend-ee2-u2
npm install
cp .env.example .env
```

Edita `.env` si tu MySQL usa otro puerto o credenciales.

## 7. Base de datos

Los scripts están en `database/` y se ejecutan en orden:

| Archivo | Qué hace |
|---|---|
| `01_schema.sql` | Crea `kodo_db` y sus 14 tablas |
| `02_seed.sql` | Datos de ejemplo (sedes, servicios, vehículos, reservas, catálogo, etc.) |
| `00_usuario_local.sql` | Crea el usuario `kodo` para la API (solo si usas MySQL local) |

**Opción A · Docker**

```bash
docker compose up -d
```

Levanta MySQL en `localhost:3307` y Adminer en `http://localhost:8081`. Los scripts se ejecutan solos la primera vez.

**Opción B · MySQL o XAMPP instalado**

Ejecuta los tres scripts desde Workbench, phpMyAdmin o consola, y pon en `.env` el puerto de tu servidor (`3306` por defecto en MySQL; en XAMPP el que indique su `my.ini`).

## 8. Ejecución

```bash
npm run dev
```

Servidor en `http://localhost:4000`. Comprueba la conexión en `GET /api/db-check`.

## 9. Endpoints

### Reservas

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/api/reservas` | Lista reservas. Filtros: `?estado=`, `?fecha=`, `?sede_id=` | 200 |
| GET | `/api/reservas/:id` | Una reserva con sede, servicio y vehículo | 200 · 400 · 404 |
| POST | `/api/reservas` | Crea una reserva | 201 · 400 · 404 · 409 |
| PUT | `/api/reservas/:id` | Actualiza campos de una reserva | 200 · 400 · 404 · 409 |
| DELETE | `/api/reservas/:id` | Elimina una reserva | 204 · 400 · 404 |

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

### Catálogo

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/api/catalogo` | Lista vehículos del catálogo | 200 |
| GET | `/api/catalogo/:id` | Un vehículo | 200 · 400 · 404 |
| POST | `/api/catalogo` | Crea un vehículo | 201 · 400 · 409 |
| PUT | `/api/catalogo/:id` | Actualiza un vehículo | 200 · 400 · 404 · 409 |
| DELETE | `/api/catalogo/:id` | Elimina un vehículo | 204 · 400 · 404 |

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

### Apoyo

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/db-check` | Verifica la conexión a MySQL |
| GET | `/api/sedes` · `/api/servicios` · `/api/vehiculos` | Listados para conocer los IDs al crear una reserva |

### Formato de error

Todos los módulos responden los errores igual:

```json
{ "error": "Datos de reserva inválidos", "detalles": ["El campo 'fecha' es obligatorio"] }
```

## 10. Pruebas

Colecciones de Postman en `postman/`:

- `kodo-reservas.postman_collection.json`
- `kodo-catalogo.postman_collection.json`

Importar en Postman con **Import → files**, tener MySQL y el servidor corriendo, y ejecutar cada petición con **Send**.

## 11. Observaciones y problemas resueltos durante la integración

- **Conflicto de merge en `.gitignore`.** Dos integrantes editaron el archivo en ramas distintas. Se resolvió de forma interactiva en Visual Studio Code conservando las reglas de ambas ramas y se completó el merge con `git add` y `git commit`.
- **Commit en rama equivocada.** Un integrante subió su trabajo a una rama `feature/` mientras el equipo acordó trabajar en `main`. Se integró con `git merge feature/errores-y-docs` desde `main`.
- **Dos sistemas de errores.** Reservas usaba `AppError` + middleware `errorHandler` y catálogo tenía su propio `HttpError` + `responderError`. Al integrar se unificó todo en `AppError` y `next(error)`, de modo que ambos módulos responden errores con el mismo formato.
- **Dependencia de otros módulos.** Reservas necesita sedes, servicios y vehículos. En vez de construir esos tres CRUD, se usan las claves foráneas de la tabla y se verifica que el ID exista antes de insertar.
- **Puerto de MySQL distinto por máquina.** Docker usa 3307, MySQL instalado 3306 y XAMPP puede usar otro. Se parametrizó en `.env` para que cada integrante configure el suyo sin tocar código.
