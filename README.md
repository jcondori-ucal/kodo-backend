# KODO MOTORS - API REST POR CAPAS (EE2)
## Módulos Asignados: 11. Repuestos y 12. Encuestas
> **Curso:** Fundamentos de Desarrollo Back-End  
> **Evaluación:** Evidencia Evaluativa 2 (EE2)  
> **Arquitectura:** N-Capas (Routes, Controllers, Services, Repositories, Models, Config)  
> **Persistencia:** MySQL Relacional con Pool de Conexiones (`mysql2/promise`)  

---

## 1. Nombre del Proyecto
**Kodo Motors Backend API** — Sistema de Gestión de Inventario de Piezas/Repuestos y Encuestas de Satisfacción de Clientes.

---

## 2. Integrantes del Equipo (5 Integrantes)
| # | Integrante | Rol / Módulo Asignado | Rama en GitHub |
|---|---|---|---|
| 1 | **[Tú - Líder Backend]** | Arquitectura Base, Servidor Express y Connection Pool MySQL | `feature/arquitectura-y-db` |
| 2 | **[Integrante 2]** | Módulo Repuestos: Modelo de Dominio y Repositorio SQL | `feature/repuestos-persistencia` |
| 3 | **[Integrante 3]** | Módulo Repuestos: Reglas de Negocio, Controlador y Rutas | `feature/repuestos-api` |
| 4 | **[Integrante 4]** | Módulo Encuestas: Modelo de Dominio y Repositorio con JOIN | `feature/encuestas-persistencia` |
| 5 | **[Integrante 5]** | Módulo Encuestas: Reglas de Negocio, Rutas, Pruebas Postman y Documentación | `feature/encuestas-qa-docs` |

---

## 3. Empresa Aliada / Caso Empresarial Asignado
- **Empresa:** **KODO MOTORS S.A.C.**
- **Contexto del Negocio:** Concesionaria automotriz autorizada de Mazda dedicada a la venta de vehículos, servicio de taller mecánico y comercialización de repuestos originales.
- **Problemática Atendida:** Controlar el stock de piezas de recambio (evitando quiebres de inventario mediante alertas de stock mínimo) y medir la satisfacción de los clientes tras recibir sus autos del taller, asegurando que solo se encueste a quienes ya se les entregó su orden de servicio.

---

## 4. Descripción Breve de la Solución
Desarrollo de una API REST profesional modularizada en capas:
- **Módulo 11 (Repuestos):** Catálogo de repuestos originales compatibles por modelo Mazda, alertas de stock mínimo y restricción de eliminación si hay existencias físicas.
- **Módulo 12 (Encuestas):** Registro de métricas de satisfacción (1 a 5 estrellas y recomendación) vinculado a las órdenes de servicio entregadas, impidiendo duplicidad de encuestas por orden.

---

## 5. Tecnologías Utilizadas
- **Runtime:** Node.js (v18+)
- **Framework Web:** Express.js 4.x
- **Base de Datos:** MySQL 8.x
- **Driver de BD:** `mysql2/promise` (Connection Pooling)
- **Seguridad y Configuración:** `dotenv`, `cors`
- **Herramientas de Desarrollo:** Docker & Docker Compose, Nodemon, Postman, Git & GitHub

---

## 6. Instrucciones de Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/kodo-api.git
   cd kodo-api
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

---

## 7. Instrucciones de Ejecución

### Opción 1: Con Docker Compose (Recomendada)
1. Levantar MySQL y Adminer:
   ```bash
   docker compose up -d
   ```
   *(Docker creará la base de datos `kodo_db` y ejecutará los scripts de `database/` automáticamente en el puerto 3307)*.
2. Levantar la API en Node.js:
   ```bash
   npm run dev
   ```

### Opción 2: Sin Docker (MySQL Local en tu PC)
1. Abre MySQL Workbench y ejecuta en orden:
   - `database/01_schema.sql`
   - `database/02_seed.sql`
2. En tu archivo `.env`, cambia `DB_PORT=3306` (o el puerto de tu MySQL local) y pon tu contraseña de `root`.
3. Ejecuta la API:
   ```bash
   npm run dev
   ```

La API estará activa en: `http://localhost:4000`.

---

## 8. Endpoints Principales de la API

### Módulo 11: Repuestos (`/api/repuestos`)
| Método | Endpoint | Descripción | Códigos HTTP |
|---|---|---|---|
| **GET** | `/api/repuestos` | Lista repuestos (Filtros: `?modelo_compatible=CX-5`, `?bajo_stock=true`) | 200 OK |
| **GET** | `/api/repuestos/:id` | Detalle de un repuesto por su ID | 200 OK, 400, 404 |
| **POST** | `/api/repuestos` | Registra una nueva pieza en almacén (código único) | 201 Created, 400 |
| **PUT** | `/api/repuestos/:id` | Actualiza stock, precio o ubicación | 200 OK, 400, 404 |
| **DELETE** | `/api/repuestos/:id` | Da de baja una pieza (solo permitido si `stock == 0`) | 200 OK, 400, 404 |

### Módulo 12: Encuestas (`/api/encuestas`)
| Método | Endpoint | Descripción | Códigos HTTP |
|---|---|---|---|
| **GET** | `/api/encuestas` | Lista todas las encuestas con datos del técnico | 200 OK |
| **GET** | `/api/encuestas/:id` | Detalle de una encuesta por su ID | 200 OK, 400, 404 |
| **POST** | `/api/encuestas` | Registra encuesta (solo si orden está `'entregado'`) | 201 Created, 400, 404 |
| **PUT** | `/api/encuestas/:id` | Actualiza calificación o comentario de la encuesta | 200 OK, 400, 404 |
| **DELETE** | `/api/encuestas/:id` | Elimina una encuesta del sistema | 200 OK, 400, 404 |

---

## 9. Instrucciones de Base de Datos
- **Motor:** MySQL 8.x
- **Nombre de Base de Datos:** `kodo_db`
- **Archivos SQL incluidos:**
  - `database/01_schema.sql`: Creación de todas las tablas relacionales y llaves foráneas.
  - `database/02_seed.sql`: Carga de datos de prueba (sedes, servicios, órdenes, repuestos y encuestas).
- **Visor Web de BD (Adminer):** Si usas Docker, abre `http://localhost:8081` (Servidor: `mysql`, Usuario: `kodo`, Clave: `kodo123`, Base de datos: `kodo_db`).

---

## 10. Observaciones y Problemas Resueltos durante la Integración (Trabajo Colaborativo)
1. **Resolución de Conflicto de Merge en `src/app.js`:**
   - *Incidencia:* Los encargados de enrutar Repuestos y Encuestas modificaron simultáneamente `app.js` agregando sus respectivas rutas, generando un conflicto de merge en Git.
   - *Solución:* El equipo se reunió por llamada, resolvió las marcas de conflicto en VS Code conservando ambos módulos y realizó las pruebas de arranque con `npm run dev` antes de hacer el commit de integración.
2. **Validación de Integridad Relacional en Encuestas:**
   - *Incidencia:* Al registrar encuestas se intentaban calificar órdenes en proceso o inexistentes, provocando errores 500 de MySQL por llave foránea.
   - *Solución:* Se implementó la verificación previa en `encuestas.service.js` que comprueba que la orden exista y tenga estado `'entregado'`, retornando un error controlado `400 Bad Request`.
3. **Casteo de Decimales en Precios de Repuestos:**
   - *Incidencia:* El driver `mysql2` enviaba el precio como String (`"260.00"`).
   - *Solución:* Se normalizó en el modelo `Repuesto.fromRow()` aplicando `Number(row.precio)`.
