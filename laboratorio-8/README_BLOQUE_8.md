# LABORATORIO 8 — Validación integral de la API Distribuidora CJ

> **Estado:** laboratorio preparado para ejecución. No se considera aprobada ninguna prueba sin resultado real y evidencia verificable.
> **Origen:** pruebas del Bloque 7 (P01–P36) y del bootstrap del administrador (BA01–BA09), adaptadas del laboratorio de la API Hospital.

## 1. Objetivo

Ejecutar y documentar pruebas funcionales, de integración, seguridad y persistencia de la API Distribuidora CJ (Node.js, Express, PostgreSQL/Supabase), comprobando API Key, JWT, RBAC, BOLA/IDOR, validaciones, restricciones SQL, transacciones y reglas de negocio de ventas.

## 2. Alcance y equivalencias

| Hospital | Distribuidora CJ |
|---|---|
| Pacientes | **Clientes** |
| Médicos | **Vendedores** |
| Consultorios | **Proveedores** |
| Citas | **Ventas** (+ `venta_detalle`) |
| Especialidades | Categorías |
| Médico ocupado / consultorio ocupado (agenda) | **Stock insuficiente / ROLLBACK de la transacción** |
| programada → confirmada → atendida | registrada → pagada → entregada |
| `/api/citas/mis-citas` | `/api/ventas/mis-ventas` |

- **P01–P36:** matriz original conservada con su numeración, adaptada a los recursos de la distribuidora.
- **BA01–BA09:** bootstrap del administrador con `npm run seed:admin`. BA08 y BA09 **solo en base de pruebas aislada**.
- **SEG-01–SEG-08:** acceso de clientes, vendedores y administradores.
- **No incluido:** CRUD nuevo, frontend, XSS/CSRF ni fuzzing.

Una prueba se aprueba solo si la solicitud, el código HTTP, el cuerpo de respuesta y el estado de los datos coinciden con lo esperado. Estados posibles: **APROBADA**, **FALLIDA**, **BLOQUEADA** o **PENDIENTE**.

## 3. Arquitectura bajo prueba

```text
Swagger / Postman
  │ X-API-Key + JWT Bearer cuando corresponda
  ▼
Express: CORS
  ▼
Routes → Validadores → JWT / RBAC / propiedad BOLA-IDOR
  ▼
Controllers → Services (consultas parametrizadas, transacciones)
  ▼
pg Pool + TLS → Supabase / PostgreSQL
  ▼
FK, UNIQUE, CHECK e índices únicos sin distinguir mayúsculas
```

RLS está habilitado, pero la conexión de servidor de `pg` no aplica políticas por usuario final: **la autorización se comprueba en los middlewares**.

## 4. Requisitos y preparación

1. `npm install`; `.env` configurado (nunca publicado).
2. Crear el administrador inicial **una sola vez**: `npm run seed:admin`.
3. Iniciar la API con `npm run dev` (ya **no** crea administradores) y abrir `http://localhost:3000/api-docs`.
4. Disponer de API Key y JWT de: administrador, cliente A, cliente B, vendedor A y vendedor B.
5. Verificar que `clientes.usuario_id` y `vendedores.usuario_id` vinculan cada cuenta con su perfil.
6. Registrar los IDs reales devueltos por la API, **sin asumir que son 1**.

### 4.1 Consultas SQL de preparación

```sql
-- Cuentas, roles y asociaciones (sin mostrar hashes)
SELECT u.id AS usuario_id, u.email, r.nombre AS rol,
       c.id AS cliente_id, v.id AS vendedor_id
FROM public.usuarios u
JOIN public.roles r ON r.id = u.rol_id
LEFT JOIN public.clientes c ON c.usuario_id = u.id
LEFT JOIN public.vendedores v ON v.usuario_id = u.id
ORDER BY u.id;

-- Ventas y propietarios
SELECT ve.id AS venta_id, ve.cliente_id, c.usuario_id AS cliente_usuario_id,
       ve.vendedor_id, v.usuario_id AS vendedor_usuario_id,
       ve.estado, ve.total, ve.fecha
FROM public.ventas ve
JOIN public.clientes c ON c.id = ve.cliente_id
JOIN public.vendedores v ON v.id = ve.vendedor_id
ORDER BY ve.id;

-- Índices y restricciones únicas
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 5. Método de ejecución

Para cada prueba: leer precondiciones, configurar `X-API-Key` y el JWT del actor indicado, ejecutar, anotar código real, mensaje, IDs y efecto en PostgreSQL. Guardar la captura en el documento Word de evidencias **sin tokens, API Keys, contraseñas ni hashes**. Si falla, documentar la causa y la corrección, y repetir la prueba.

### 5.1 Plantilla individual

```text
ID: P__ / BA__ / SEG-__
Título:
Precondiciones:
Actor / rol:
Método y endpoint:
Datos enviados:
Resultado HTTP esperado:
Resultado HTTP real:
Verificación SQL / contenido de respuesta:
Estado: PENDIENTE | APROBADA | FALLIDA | BLOQUEADA
Evidencia: Word, <ID de la prueba>
Observaciones / incidencia / corrección:
```

## 6. Matriz P01–P36

| ID | Módulo | Acción | Endpoint | Esperado | Resultado real | Evidencia |
|---|---|---|---|---|---|---|
| P01 | Usuarios | Registro válido | `POST /api/auth/registro` | 201 | Pendiente | — |
| P02 | Usuarios | Correo duplicado (otras mayúsculas) | `POST /api/auth/registro` | 409 | Pendiente | — |
| P03 | Auth | Login correcto | `POST /api/auth/login` | 200 | Pendiente | — |
| P04 | Auth | Contraseña incorrecta | `POST /api/auth/login` | 401 | Pendiente | — |
| P05 | Auth | Perfil con JWT válido | `GET /api/auth/perfil` | 200 | Pendiente | — |
| P06 | Auth | Perfil sin JWT | `GET /api/auth/perfil` | 401 | Pendiente | — |
| P07 | Auth | Pedir rol administrador en registro público | `POST /api/auth/registro` | 201 con rol **cliente** persistido | Pendiente | — |
| P08 | Clientes | Crear cliente válido | `POST /api/clientes` | 201 | Pendiente | — |
| P09 | Clientes | Listar clientes | `GET /api/clientes` | 200 | Pendiente | — |
| P10 | Clientes | Consultar por ID | `GET /api/clientes/{id}` | 200 | Pendiente | — |
| P11 | Clientes | Documento duplicado | `POST /api/clientes` | 409 | Pendiente | — |
| P12 | Clientes | PATCH válido | `PATCH /api/clientes/{id}` | 200 | Pendiente | — |
| P13 | Clientes | Asociar usuario con rol distinto de cliente | `POST /api/clientes` | 409 | Pendiente | — |
| P14 | Clientes | Eliminar cliente con ventas | `DELETE /api/clientes/{id}` | 409 | Pendiente | — |
| P15 | Vendedores | Crear vendedor activo | `POST /api/vendedores` | 201 | Pendiente | — |
| P16 | Vendedores | Documento duplicado | `POST /api/vendedores` | 409 | Pendiente | — |
| P17 | Vendedores | Listar vendedores | `GET /api/vendedores` | 200 | Pendiente | — |
| P18 | Vendedores | Asociar usuario vendedor | `PATCH /api/vendedores/{id}` | 200 | Pendiente | — |
| P19 | Vendedores | Asociar usuario de otro rol | `POST /api/vendedores` | 409 | Pendiente | — |
| P20 | Vendedores | PATCH válido | `PATCH /api/vendedores/{id}` | 200 | Pendiente | — |
| P21 | Vendedores | Eliminar vendedor con ventas | `DELETE /api/vendedores/{id}` | 409 | Pendiente | — |
| P22 | Proveedores | Crear proveedor | `POST /api/proveedores` | 201 | Pendiente | — |
| P23 | Proveedores | Nombre duplicado | `POST /api/proveedores` | 409 | Pendiente | — |
| P24 | Proveedores | Actualizar proveedor | `PUT /api/proveedores/{id}` | 200 | Pendiente | — |
| P25 | Proveedores | Eliminar con productos | `DELETE /api/proveedores/{id}` | 409 | Pendiente | — |
| P26 | Ventas | Crear venta válida | `POST /api/ventas` | 201 | Pendiente | — |
| P27 | Ventas | Vendedor inexistente | `POST /api/ventas` | 400 | Pendiente | — |
| P28 | Ventas | Vendedor inactivo | `POST /api/ventas` | 409 | Pendiente | — |
| P29 | Ventas | Stock insuficiente | `POST /api/ventas` | 400 | Pendiente | — |
| P30 | Ventas | ROLLBACK: stock sin cambios tras P29 | `GET /api/productos/{id}` | 200, stock igual | Pendiente | — |
| P31 | Ventas | registrada → pagada | `PATCH /api/ventas/{id}/estado` | 200 | Pendiente | — |
| P32 | Ventas | pagada → entregada | `PATCH /api/ventas/{id}/estado` | 200 | Pendiente | — |
| P33 | Ventas | entregada → registrada | `PATCH /api/ventas/{id}/estado` | 409 | Pendiente | — |
| P34 | BOLA/IDOR | Cliente consulta venta ajena | `GET /api/ventas/{idAjena}` | 403 | Pendiente | — |
| P35 | API Key | Acceso sin X-API-Key | `GET /api/productos` | 401 | Pendiente | — |
| P36 | Persistencia | Reiniciar la API y consultar la venta | `GET /api/ventas/{id}` | 200 y datos conservados | Pendiente | — |

**Adaptaciones:** P17 lista vendedores (la distribuidora no tiene especialidades). P29 y P30 sustituyen el control de agenda del hospital por la regla equivalente del negocio: no vender sin stock y deshacer toda la venta si una línea falla. P29 responde 400 porque la cantidad solicitada no es válida para el stock disponible.

### 6.1 Secuencia de estados P31–P33

Usar una **venta de prueba específica**, porque `entregada` no puede revertirse.

```json
{"estado":"pagada"}
```
```json
{"estado":"entregada"}
```
```json
{"estado":"registrada"}
```

## 7. Matriz SEG-01–SEG-08

Requiere dos cuentas con rol `cliente` y dos con rol `vendedor`, cada una asociada a su perfil y con ventas propias.

| ID | Actor y acción | Endpoint | Esperado | Real | Estado |
|---|---|---|---|---|---|
| SEG-01 | Cliente consulta venta propia | `GET /api/ventas/{idPropia}` | 200 | — | PENDIENTE |
| SEG-02 | Cliente consulta venta ajena | `GET /api/ventas/{idAjena}` | 403 | — | PENDIENTE |
| SEG-03 | Cliente consulta sus ventas | `GET /api/ventas/mis-ventas` | 200, solo propias | — | PENDIENTE |
| SEG-04 | Vendedor consulta sus ventas | `GET /api/ventas/mis-ventas` | 200, solo suyas | — | PENDIENTE |
| SEG-05 | Vendedor A consulta ventas del vendedor B | `GET /api/ventas/vendedor/{vendedorBId}` | 403 | — | PENDIENTE |
| SEG-06 | Vendedor A consulta venta del vendedor B | `GET /api/ventas/{ventaVendedorBId}` | 403 | — | PENDIENTE |
| SEG-07 | Vendedor intenta una operación administrativa | `PATCH /api/ventas/{id}/estado` | 403 | — | PENDIENTE |
| SEG-08 | Administrador consulta venta | `GET /api/ventas/{id}` | 200 | — | PENDIENTE |

**Nota SEG-07:** en la distribuidora el vendedor sí puede registrar ventas, pero solo a su nombre (el servidor ignora el `vendedorId` del body). La operación reservada al administrador que se prueba es el cambio de estado.

## 8. Matriz BA01–BA09

Comando: `npm run seed:admin`. El bootstrap **no** se ejecuta con `npm run dev`.

| ID | Escenario | Resultado esperado | Resultado real | Evidencia |
|---|---|---|---|---|
| BA01 | Ejecutar bootstrap con administrador existente | No inserta ni modifica usuarios | Pendiente | — |
| BA02 | Ejecutar bootstrap por segunda vez | No duplica administradores | Pendiente | — |
| BA03 | Consultar administradores antes y después | Mismos registros | Pendiente | — |
| BA04 | Iniciar sesión con el administrador existente | 200 y JWT | Pendiente | — |
| BA05 | Iniciar API sin variables `ADMIN_*` | Express arranca normalmente | Pendiente | — |
| BA06 | Consultar recurso protegido con API Key y JWT | Respuesta según RBAC | Pendiente | — |
| BA07 | Ejecutar `seed:admin` sin `ADMIN_*` | Error controlado, código de salida ≠ 0 | Pendiente | — |
| BA08 | Base **de prueba** sin administradores, bootstrap válido | Crea exactamente un administrador | Pendiente | — |
| BA09 | Base **de prueba** sin administradores, correo de un cliente existente | Rechaza la elevación de privilegios | Pendiente | — |

### 8.1 Precauciones para BA08–BA09

Usar un **segundo proyecto de Supabase** (`distribuidoracj-pruebas`) con los scripts `01` y `02`, y un archivo `.env.pruebas` que solo cambie `DATABASE_URL`:

```text
npm run seed:admin -- --env .env.pruebas
```

No borrar administradores ni vaciar tablas de la base de trabajo para simular el primer arranque.

```sql
SELECT u.id, u.email, r.nombre AS rol
FROM public.usuarios u
JOIN public.roles r ON r.id = u.rol_id
WHERE r.nombre = 'administrador'
ORDER BY u.id;
```

## 9. Evidencias y trazabilidad

Las capturas de cada prueba están en el **documento Word de evidencias**, organizadas por ID (P01–P36, SEG-01–SEG-08, BA01–BA09). Cada captura muestra la solicitud, el código HTTP y la respuesta, sin tokens, API Keys, contraseñas ni hashes.

En las matrices de este documento, la columna *Evidencia* indica la sección del Word (por ejemplo, `Word, P01`).

### 9.1 Registro de incidencias

| Incidencia | Prueba | Resultado observado | Causa confirmada | Corrección | Reprueba |
|---|---|---|---|---|---|
| INC-001 | P28 | Se podía registrar una venta con un vendedor inactivo | La regla no existía en `ventas.service.js` | Validación dentro de la transacción: 409 si `vendedores.activo = false` | PENDIENTE |
| INC-002 | BA01–BA09 | El administrador se creaba automáticamente en cada `npm run dev` | El bootstrap estaba en `app.js` | Se trasladó a `npm run seed:admin` con reglas de no elevación | PENDIENTE |
| INC-003 | BA07 | — | `database.js` recargaba `.env` y ocultaba la ausencia de `ADMIN_*` | `database.js` solo carga `.env` si `DATABASE_URL` no está definida | PENDIENTE |

## 10. Informe de cierre

| Grupo | Total | Aprobadas | Fallidas | Bloqueadas |
|---|---|---|---|---|
| P01–P36 | 36 | | | |
| SEG-01–SEG-08 | 8 | | | |
| BA01–BA09 | 9 | | | |

**Conclusión:** _(completar tras la ejecución)_