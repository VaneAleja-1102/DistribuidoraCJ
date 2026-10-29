# Base de datos — Distribuidora CJ

**Proyecto:** Sistema Distribuidora CJ
**Tecnología:** Supabase + PostgreSQL
**Módulo:** Bloque 7 — Persistencia y modelo relacional
**Estado:** esquema creado y verificado; API Express conectada y migrada a PostgreSQL.

## 1. Objetivo

Sustituir los arreglos en memoria (`src/data/*.js`) por persistencia real en PostgreSQL (Supabase), **sin perder** la autenticación (API Key + JWT), la autorización por roles (RBAC), el control de propiedad (BOLA/IDOR) ni las validaciones de Express.

## 2. Estructura del directorio

| Archivo | Responsabilidad |
|---|---|
| `01_esquema_distribuidora.sql` | Tablas, relaciones, restricciones e índices. |
| `02_roles_seguridad.sql` | Roles de negocio, RLS habilitado y `REVOKE` para `anon` y `authenticated`. |
| `03_verificacion.sql` | Consultas de verificación (roles, tablas y RLS). |
| `04_datos_iniciales.sql` | Categorías, proveedores, productos, clientes y vendedores que estaban en memoria. |
| `README.md` | Procedimiento, diseño, evidencias y próximos pasos. |

## 3. Creación del proyecto Supabase

| Opción | Configuración | Justificación |
|---|---|---|
| Nombre | `distribuidoracj` | Identifica el proyecto. |
| Contraseña de la base | Robusta y privada | No es la contraseña del administrador de la API. |
| Habilitar la API de datos | Activado | No implica acceso público: intervienen permisos SQL y RLS. |
| Exponer automáticamente nuevas tablas | Desactivado | Evita privilegios automáticos. |
| Habilitar RLS automático | Activado | Protege las tablas nuevas por defecto. |

Los roles de negocio (`administrador`, `vendedor`, `cliente`) se guardan en `public.roles` y son distintos de los roles de Supabase (`anon`, `authenticated`, `service_role`).

## 4. Orden de ejecución

> `01` y `04` no son idempotentes: no deben ejecutarse dos veces.

1. `01_esquema_distribuidora.sql` → 9 tablas.
2. `02_roles_seguridad.sql` → 3 roles y RLS en las 9 tablas.
3. `04_datos_iniciales.sql` → 3 categorías, 3 proveedores, 3 productos, 3 clientes y 2 vendedores.
4. `03_verificacion.sql` y consultas de la sección 8.

## 5. Modelo de datos

| Tabla | Finalidad | Relaciones principales |
|---|---|---|
| `roles` | Catálogo de roles de negocio. | Uno a muchos con `usuarios`. |
| `usuarios` | Cuenta, rol y estado. | `rol_id → roles.id`; `auth_user_id → auth.users.id`. |
| `categorias` | Agrupación de productos. | Uno a muchos con `productos`. |
| `proveedores` | Empresas que surten productos. | Uno a muchos con `productos`. |
| `productos` | Catálogo con precio y stock. | `categoria_id`, `proveedor_id`. |
| `clientes` | Perfil del cliente. | `usuario_id → usuarios.id` (opcional, único). |
| `vendedores` | Perfil del vendedor. | `usuario_id → usuarios.id` (opcional, único). |
| `ventas` | Encabezado de cada venta. | `cliente_id`, `vendedor_id`. |
| `venta_detalle` | Productos de cada venta. | `venta_id` (CASCADE), `producto_id`. |

**El ID del usuario no es el ID del cliente ni del vendedor:**
`usuarios.id = 8` → `clientes.usuario_id = 8` → `clientes.id = 3` → `ventas.cliente_id = 3`.

### Relaciones verificadas (10 claves foráneas)

```text
usuarios.auth_user_id       ──→ auth.users.id
usuarios.rol_id             ──→ roles.id
productos.categoria_id      ──→ categorias.id
productos.proveedor_id      ──→ proveedores.id
clientes.usuario_id         ──→ usuarios.id
vendedores.usuario_id       ──→ usuarios.id
ventas.cliente_id           ──→ clientes.id
ventas.vendedor_id          ──→ vendedores.id
venta_detalle.venta_id      ──→ ventas.id
venta_detalle.producto_id   ──→ productos.id
```

### Restricciones

- `PRIMARY KEY` (9), `FOREIGN KEY` (10), `UNIQUE` (7) y `CHECK` (10).
- `CHECK`: roles válidos, estados de venta, precio, stock y total no negativos, cantidad mayor a 0.
- `UNIQUE`: email de usuario, documento de cliente y vendedor, `usuario_id` de cada perfil (relación 1:1).
- Índices únicos sobre `LOWER(...)`: `Pinturas` y `pinturas` no pueden registrarse como distintos.
- `ON DELETE RESTRICT`: no se puede borrar una categoría o proveedor con productos, ni un cliente, vendedor o producto con ventas (la API responde 409).
- `ON DELETE CASCADE` solo en `venta_detalle`.

## 6. Roles y permisos de la API

| Operación | Administrador | Vendedor | Cliente |
|---|:---:|:---:|:---:|
| Gestionar usuarios privilegiados | Sí | No | No |
| Crear, modificar o eliminar catálogo y proveedores | Sí | No | No |
| Consultar catálogo (categorías y productos) | Sí | Sí | Sí |
| Consultar proveedores y clientes | Sí | Sí | No |
| Registrar ventas | Sí | Solo a su nombre | No |
| Consultar todas las ventas | Sí | No | No |
| Consultar sus propias ventas (`/mis-ventas`) | No aplica | Sí | Sí |
| Consultar una venta por ID | Todas | Las suyas | Las suyas |
| Cambiar estado o eliminar venta | Sí | No | No |

**Regla esencial:** `GET /api/ventas/mis-ventas` obtiene la identidad del JWT verificado y filtra desde el servidor; nunca confía en un ID enviado por el cliente.

**Registro público:** crea siempre cuentas con rol `cliente`.

## 7. Row Level Security (RLS)

RLS está habilitado en las 9 tablas, sin políticas, y `anon` y `authenticated` no tienen permisos. La API se conecta con una credencial de servidor, por eso **la autorización sigue en Express** (JWT, RBAC y BOLA). RLS todavía no aplica las reglas por cliente o vendedor.

## 8. Resultados de verificación

| # | Consulta | Resultado |
|---|---|---|
| 8.1 | Tablas | 9 |
| 8.2 | Roles | 3 activos |
| 8.3 | RLS | `true` en 9 tablas |
| 8.4 | Claves foráneas | 10 |
| 8.5 | Políticas RLS | 0 |
| 8.6 | Permisos `anon` / `authenticated` | 0 |
| 8.7 | Restricciones / índices | 36 / 27 |

## 9. Conexión con Express

- Supabase → **Connect → Direct → Transaction pooler**, puerto **6543**.
- La URI se guarda solo en `DATABASE_URL` del `.env` (nunca en el código ni en GitHub).
- TLS verificado con `certs/prod-ca-2021.crt` y `rejectUnauthorized: true`.
- Prueba: `node scripts/probar-conexion.js`.

## 10. Arquitectura

```text
Postman / Swagger
        |
        v
API Key + JWT + RBAC + BOLA
        |
        v
Routes → Validators → Controllers → Services
        |
        v
pg Pool + TLS → Supabase PostgreSQL
```

- Consultas parametrizadas (`$1, $2...`): nunca se concatenan valores en el SQL.
- Columnas `snake_case` (`categoria_id`) se exponen en `camelCase` (`categoriaId`).
- Crear una venta y cambiar su estado son **transacciones** (BEGIN / COMMIT / ROLLBACK).
- El JWT se valida contra la base: un usuario desactivado recibe 403 y uno inexistente, 401.

## 11. Evidencias y estado de avance

| Verificación | Resultado | Estado |
|---|---|---|
| Proyecto Supabase `distribuidoracj` | Creado | Confirmado |
| Nueve tablas en `public` | 9 resultados | Confirmado |
| Roles de negocio | 3 activos | Confirmado |
| RLS habilitado | `true` en 9 tablas | Confirmado |
| Relaciones FK | 10 restricciones | Confirmado |
| Ausencia de políticas públicas | 0 filas | Confirmado |
| Privilegios de `anon` y `authenticated` | 0 filas | Confirmado |
| Datos iniciales | Cargados | Confirmado |
| Conexión Node.js → PostgreSQL | Transaction pooler + TLS | Confirmado |
| Migración de services | Todos los recursos en PostgreSQL | Confirmado |
| Persistencia tras reiniciar | Admin, usuarios y ventas conservados | Confirmado |
| Supabase Auth y políticas por fila | No implementadas | Pendiente |
| Frontend React + Vite | No integrado | Pendiente |

## 12. Próximos pasos

1. Integrar Supabase Auth con una estrategia de migración definida.
2. Diseñar políticas RLS por cliente y vendedor.
3. Construir el frontend React + Vite.
4. Realizar auditoría integral.

## 13. Recomendaciones para el repositorio

- Versionar los scripts SQL y este README.
- No versionar `.env` ni cadenas de conexión.
- No volver a ejecutar `CREATE TABLE` sobre un esquema existente.
- Documentar cambios futuros como migraciones numeradas.
- No usar claves privilegiadas de Supabase en el navegador.