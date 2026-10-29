-- =====================================================================
-- BLOQUE 7 — Roles de negocio y seguridad inicial
-- Ejecutar UNA sola vez, después de 01.
-- =====================================================================
BEGIN;

INSERT INTO public.roles
    (nombre, descripcion)
VALUES
    (
        'administrador',
        'Gestiona usuarios, catálogo, proveedores y ventas'
    ),
    (
        'vendedor',
        'Consulta clientes y proveedores; registra y consulta sus ventas'
    ),
    (
        'cliente',
        'Consulta el catálogo y sus propias compras'
    );

-- Activar RLS desde el principio.
-- Todavía no creamos políticas de acceso directo.
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta_detalle ENABLE ROW LEVEL SECURITY;

-- Impedir acceso directo de los roles de API
-- mientras diseñamos las políticas definitivas.
REVOKE ALL ON TABLE
    public.roles,
    public.usuarios,
    public.categorias,
    public.proveedores,
    public.productos,
    public.clientes,
    public.vendedores,
    public.ventas,
    public.venta_detalle
FROM anon, authenticated;

COMMIT;