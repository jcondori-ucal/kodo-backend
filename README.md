![Kodo Motors](assets/banner.png)

# KODO MOTORS - API REST POR CAPAS (EE2)
## Módulos asignados: 11. Repuestos y 12. Encuestas
> **Curso:** Fundamentos de Desarrollo Back-End - UCAL  
> **Evaluación:** Evidencia Evaluativa 2 (EE2)  
> **Arquitectura:** por capas (Routes, Controllers, Services, Repositories, Models, Config)  
> **Persistencia:** MySQL 8.4 con pool de conexiones (`mysql2/promise`)  

---

## 1. Nombre del Proyecto
**Kodo Motors Backend API** — Gestión del inventario de repuestos y de las encuestas de satisfacción de los clientes del taller.

---

## 2. Integrantes del Equipo (5 integrantes)
| # | Integrante | Rol / Módulo asignado | Rama en GitHub |
|---|---|---|---|
| 1 | **Ivan Hermilio Mera Ibarguen** | Arquitectura base, Express y pool MySQL | `feature/arquitectura-y-db` |
| 2 | **Geraldo Fair Jaramillo Florida** | Repuestos: modelo y repositorio SQL | `feature/repuestos-persistencia` |
| 3 | **Sharmili Luzmer Soncco Lupa** | Repuestos: servicio, controlador y rutas | `feature/repuestos-api` |
| 4 | **Adso Martin Obregon Gutierrez** | Encuestas: modelo y repositorio con JOIN | `feature/encuestas-persistencia` |
| 5 | **Lenin David Mamani Sarmiento** | Encuestas: servicio, controlador, rutas, Postman y documentación | `feature/encuestas-qa-docs` |

---

## 3. Empresa Aliada / Caso Empresarial Asignado
- **Empresa:** Kodo Motors
- **Contexto del negocio:** empresa limeña especializada en vehículos Mazda, con tres líneas de trabajo: venta de vehículos, servicio de taller y venta de repuestos.
- **Problemática atendida:** controlar el stock de repuestos (con una alerta cuando una pieza llega a su stock mínimo) y medir la satisfacción de los clientes del taller, encuestando solo a quienes ya recibieron su vehículo.

---

## 4. Descripción Breve de la Solución
API REST organizada en capas:
- **Módulo 11 (Repuestos):** catálogo de repuestos por modelo Mazda compatible, alerta de bajo stock y bloqueo de la eliminación mientras quede stock.
- **Módulo 12 (Encuestas):** registro de la puntuación (1 a 5) y de si el cliente recomendaría el taller, vinculado a una orden de servicio entregada, con una sola encuesta por orden.

### 4.1 Estructura del proyecto
```
Kodo-motor-Grupo1-4/
├── database/
│   ├── 01_schema.sql        # tablas de kodo_db y llaves foráneas
│   └── 02_seed.sql          # datos de prueba
├── postman/                 # colección de pruebas de los dos módulos
├── src/
│   ├── index.js             # arranca el servidor y prueba la conexión a MySQL
│   ├── app.js               # Express: cors, express.json(), rutas y 404 global
│   ├── config/db.js         # pool de conexiones mysql2/promise
│   ├── routes/              # capa de rutas: asocia cada verbo HTTP a un controlador
│   ├── controllers/         # capa HTTP: lee req, responde JSON y traduce errores a códigos
│   ├── services/            # capa de negocio: reglas de Repuestos y Encuestas
│   ├── repositories/        # capa de datos: consultas SQL parametrizadas
│   ├── models/              # capa de dominio: forma del dato y validaciones
│   └── utils/http-error.js  # error con código HTTP que lanzan los servicios
├── docker-compose.yml       # MySQL 8.4 y Adminer
├── .env.example
└── package.json
```

### 4.2 Reglas de negocio
| Módulo | Regla | Respuesta si no se cumple |
|---|---|---|
| Repuestos | `alertaBajoStock` es `true` cuando `stock <= stock_minimo` | Se informa en cada repuesto devuelto |
| Repuestos | El `codigo` es único (se guarda en mayúsculas) | 400 |
| Repuestos | No se elimina un repuesto con `stock > 0` | 400 |
| Repuestos | `precio` mayor a 0; `stock` y `stock_minimo` enteros mayores o iguales a 0 | 400 |
| Encuestas | La orden de servicio debe existir | 404 |
| Encuestas | Solo se encuestan órdenes en estado `'entregado'` | 400 |
| Encuestas | Una sola encuesta por orden | 400 |
| Encuestas | `puntuacion` es un entero de 1 a 5 | 400 |
| Ambos | El `:id` de la URL debe ser un entero positivo | 400 |
| Ambos | El `:id` no existe | 404 |

Los errores se responden con el formato `{ "error": "...", "detalles": [...] }`; `detalles` solo aparece en los errores de validación de campos. Un error no controlado responde 500.

---

## 5. Tecnologías Utilizadas
- **Runtime:** Node.js 18 o superior
- **Framework web:** Express 4.21
- **Base de datos:** MySQL 8.4 (imagen Docker `mysql:8.4`)
- **Driver de BD:** `mysql2` 3.12 (`mysql2/promise`, pool de conexiones)
- **Configuración:** `dotenv`, `cors`
- **Herramientas de desarrollo:** Docker y Docker Compose, Adminer, Nodemon, Postman, Git y GitHub

---

## 6. Instrucciones de Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/luzmers/Kodo-motor-Grupo1-4.git
   cd Kodo-motor-Grupo1-4
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear el archivo `.env` a partir de `.env.example`:
   ```bash
   # Git Bash, macOS o Linux
   cp .env.example .env
   ```
   ```bat
   :: Windows CMD o PowerShell
   copy .env.example .env
   ```
   El `.env` no se sube a GitHub (está en `.gitignore`).

---

## 7. Instrucciones de Ejecución

### Opción 1: con Docker Compose (recomendada)
Solo la base de datos corre en Docker; la API se ejecuta en su máquina con npm.

1. Levantar MySQL y Adminer:
   ```bash
   docker compose up -d
   ```
   MySQL 8.4 queda disponible en el puerto **3307** del host (para no chocar con un MySQL local). Docker crea la base `kodo_db` y ejecuta los archivos de `database/` en orden alfabético.
2. Levantar la API:
   ```bash
   npm run dev      # con nodemon, se reinicia al guardar
   # o
   npm start        # node src/index.js
   ```

### Opción 2: sin Docker (MySQL local)
1. En MySQL Workbench ejecutar, en este orden:
   - `database/01_schema.sql` (crea la base `kodo_db` y sus tablas)
   - `database/02_seed.sql`
2. En el `.env`, ajustar `DB_PORT` (normalmente `3306`), `DB_USER` y `DB_PASSWORD` a los de su MySQL local.
3. Levantar la API:
   ```bash
   npm run dev
   ```

La API queda disponible en `http://localhost:4000` (puerto definido por `PORT` en el `.env`). `GET /` responde un JSON de bienvenida con las rutas de los dos módulos.

---

## 8. Endpoints Principales de la API

### Módulo 11: Repuestos (`/api/repuestos`)
| Método | Endpoint | Descripción | Códigos HTTP |
|---|---|---|---|
| **GET** | `/api/repuestos` | Lista los repuestos. Filtros opcionales: `?modelo_compatible=CX-5` y `?bajo_stock=true` (solo los que tienen `stock <= stock_minimo`) | 200 |
| **GET** | `/api/repuestos/:id` | Detalle de un repuesto | 200, 400, 404 |
| **POST** | `/api/repuestos` | Registra un repuesto. Obligatorios: `codigo`, `nombre`, `modelo_compatible`, `precio`. Opcionales: `stock` (0 por defecto), `stock_minimo` (5 por defecto), `ubicacion` | 201, 400 |
| **PUT** | `/api/repuestos/:id` | Actualiza solo los campos enviados; si cambia el `codigo`, valida que no lo tenga otro repuesto | 200, 400, 404 |
| **DELETE** | `/api/repuestos/:id` | Elimina el repuesto solo si su `stock` es 0 | 200, 400, 404 |

`modelo_compatible` acepta: `Mazda2`, `Mazda3`, `CX-3`, `CX-30`, `CX-5`, `CX-50`, `CX-90`, `BT-50`, `MX-5`, `Todos`.

Con los datos de prueba, `GET /api/repuestos?bajo_stock=true` devuelve los repuestos 1 (filtro de aceite, stock 2 de mínimo 10) y 3 (pastillas Mazda3, stock 3 de mínimo 4). Todos los repuestos del seed tienen stock, así que para probar el DELETE primero se pone `stock` en 0 con un PUT.

**Ejemplo: `POST /api/repuestos`**
```json
{
  "codigo": "km-buj-001",
  "nombre": "Bujía de iridio",
  "modelo_compatible": "CX-30",
  "stock": 3,
  "stock_minimo": 4,
  "precio": 55.5,
  "ubicacion": "C-01"
}
```
Respuesta esperada `201 Created` (el `id` es 5 sobre una base recién creada):
```json
{
  "id": 5,
  "codigo": "KM-BUJ-001",
  "nombre": "Bujía de iridio",
  "modeloCompatible": "CX-30",
  "stock": 3,
  "stockMinimo": 4,
  "precio": 55.5,
  "ubicacion": "C-01",
  "alertaBajoStock": true
}
```
Si se envía de nuevo el mismo `codigo`, responde `400` con `Ya existe un repuesto registrado con el código "KM-BUJ-001"`.

### Módulo 12: Encuestas (`/api/encuestas`)
| Método | Endpoint | Descripción | Códigos HTTP |
|---|---|---|---|
| **GET** | `/api/encuestas` | Lista las encuestas con `detallesOrden` (`tecnico`, `costo`, `estado`) obtenido por LEFT JOIN con `ordenes_servicio`. Filtros opcionales: `?puntuacion=5` y `?recomendaria=true` (o `1`; cualquier otro valor filtra las que no recomendarían) | 200 |
| **GET** | `/api/encuestas/:id` | Detalle de una encuesta, también con `detallesOrden` | 200, 400, 404 |
| **POST** | `/api/encuestas` | Registra una encuesta. Obligatorios: `orden_id`, `puntuacion`, `recomendaria`. Opcional: `comentario` (máx. 300 caracteres) | 201, 400, 404 |
| **PUT** | `/api/encuestas/:id` | Actualiza `puntuacion`, `recomendaria` o `comentario`; la orden asociada no cambia | 200, 400, 404 |
| **DELETE** | `/api/encuestas/:id` | Elimina la encuesta y devuelve un mensaje de confirmación con la encuesta eliminada | 200, 400, 404 |

`recomendaria` se envía como booleano JSON (`true` / `false`) o como número (`1` / `0`).

**Ejemplo: `POST /api/encuestas`** sobre la orden 2, que en los datos de prueba está entregada y todavía no tiene encuesta:
```json
{
  "orden_id": 2,
  "puntuacion": 4,
  "recomendaria": true,
  "comentario": "Buen trabajo con los frenos"
}
```
Respuesta esperada `201 Created` (el `id` es 2 sobre una base recién creada; `createdAt` es la fecha y hora del registro):
```json
{
  "id": 2,
  "ordenId": 2,
  "puntuacion": 4,
  "recomendaria": true,
  "comentario": "Buen trabajo con los frenos",
  "createdAt": "<fecha y hora del registro>",
  "detallesOrden": {
    "tecnico": "Rosa Díaz",
    "costo": 290,
    "estado": "entregado"
  }
}
```
Casos de error con los mismos datos de prueba:
- Repetir el POST con `orden_id: 2` → `400`, la orden ya cuenta con una encuesta.
- `orden_id: 3` (estado `listo`) → `400`, solo se admiten órdenes en estado `entregado`.
- `orden_id: 99` → `404`, la orden de servicio no existe.
- `puntuacion: 6` → `400`, con el detalle `El campo "puntuacion" es obligatorio y debe ser un número entero entre 1 y 5`.

---

## 9. Instrucciones de Base de Datos
- **Motor:** MySQL 8.4
- **Base de datos:** `kodo_db`
- **Archivos SQL incluidos:**
  - `database/01_schema.sql`: crea la base y todas las tablas con sus llaves foráneas (incluye `repuestos` y `encuestas`).
  - `database/02_seed.sql`: datos de prueba (sedes, servicios, contactos, vehículos, órdenes de servicio, repuestos, una encuesta, entre otros).
- **Importante:** Docker ejecuta los `.sql` de `database/` **solo la primera vez**, cuando el volumen `kodo_mysql_data` está vacío. Si se modifica un `.sql` o se quiere volver a los datos de prueba, hay que borrar el volumen (se pierden los datos):
  ```bash
  docker compose down -v && docker compose up -d
  ```
- **Conexión desde Workbench u otro cliente:** `localhost`, puerto `3307`, usuario `kodo`, clave `kodo123`.
- **Visor web (Adminer):** con Docker, abrir `http://localhost:8081` e ingresar con servidor `mysql`, usuario `kodo`, clave `kodo123` y base de datos `kodo_db`.

---

## Pruebas (Postman y reporte QAS)
- **Colección:** `Kodo Motors · QA EE2`, con 32 casos (R-01 a R-18 de repuestos y E-01 a E-14 de encuestas), organizados en carpetas GET, POST, PUT y DELETE. Cada caso trae tests que verifican el código HTTP y el mensaje real.
- **Ejecución:** `docker compose down -v && docker compose up -d`, luego `npm run dev`, y en Postman *Run collection*. R-08 y E-04 guardan el id creado en `{{repuestoId}}` y `{{encuestaId}}` para que R-16 y E-13 eliminen ese mismo registro.
- **Resultado (17/10/2026, MySQL 8.4 en Docker):** 32 casos, 32 conformes y 0 no conformes.
- **Reporte:** *TEAM 01 - Plantilla pruebas QAS - Repuestos y Encuestas* (formato UCAL-TECH E-QA-001), con la petición, el resultado esperado, el resultado obtenido y la captura de cada caso.

---

## 10. Observaciones y Problemas Resueltos durante la Integración
1. **Precios DECIMAL como texto:** `mysql2` devuelve las columnas `DECIMAL` como texto (`"45.00"`). El modelo `Repuesto.fromRow()` las convierte con `Number(row.precio)`, así la API responde `45` como número.
2. **`stock_minimo` de 0 convertido en 5:** el repositorio guardaba el valor con `Number(stock_minimo) || 5`, y como `0` es falso en JavaScript, un `stock_minimo` de 0 se registraba como 5. Se corrigió con `Number(stock_minimo ?? 5)`, que solo usa 5 cuando el campo no se envía. Verificado contra MySQL.
3. **Historial de `main` reorganizado:** el historial de `main` se reorganizó para que cada integrante suba su capa desde su propia rama mediante Pull Request.

4. **Rama sin historial común con `main`:** `feature/encuestas-qa-docs` se subió desde un clon anterior a la reorganización del historial. GitHub no permite abrir un Pull Request entre ramas sin un commit común. La solución es crear la rama desde `origin/main` actualizado y subir allí los archivos, sin usar `push --force`.
5. **JSON mal formado devolvía HTML:** un body como `{"codigo": "MAL"` hacía que Express respondiera una página HTML 400, con el stack y rutas del disco. Se corrige con un middleware de error de 4 parámetros en `app.js`, que responde `400 {"error": "El cuerpo de la solicitud no es un JSON válido"}`.
6. **Acentos del seed (`AtenciÃ³n`, `Rosa DÃ­az`):** el contenedor ejecuta `02_seed.sql` con `character_set_client = latin1`, y el texto UTF-8 se guarda doblemente codificado. Lo que entra por la API se guarda bien. Se corrige agregando `SET NAMES utf8mb4;` al inicio de los scripts SQL.
