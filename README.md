# Kodo Motors · API de Reservas

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
