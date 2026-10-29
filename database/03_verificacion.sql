-- =====================================================================
-- BLOQUE 7 — Verificación del esquema
-- Ejecutar cada consulta por separado y guardar captura como evidencia.
-- =====================================================================

-- 1. Roles (esperado: 3 filas activas)
SELECT id, nombre, activo
FROM public.roles
ORDER BY id;

-- 2. Tablas (esperado: 9 filas)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'roles',
    'usuarios',
    'categorias',
    'proveedores',
    'productos',
    'clientes',
    'vendedores',
    'ventas',
    'venta_detalle'
  )
ORDER BY table_name;

-- 3. RLS (esperado: 9 filas con rls_habilitado = true)
SELECT
    relname AS tabla,
    relrowsecurity AS rls_habilitado
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname IN (
    'roles',
    'usuarios',
    'categorias',
    'proveedores',
    'productos',
    'clientes',
    'vendedores',
    'ventas',
    'venta_detalle'
  )
ORDER BY relname;

-- 4. Claves foráneas (esperado: 10 filas)
SELECT
    conrelid::regclass AS tabla,
    conname AS restriccion,
    confrelid::regclass AS tabla_referenciada
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace = 'public'::regnamespace
ORDER BY tabla, restriccion;

-- 5. Políticas RLS (esperado en esta fase: 0 filas)
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Permisos de anon y authenticated (esperado: 0 filas)
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'roles',
    'usuarios',
    'categorias',
    'proveedores',
    'productos',
    'clientes',
    'vendedores',
    'ventas',
    'venta_detalle'
  )
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;