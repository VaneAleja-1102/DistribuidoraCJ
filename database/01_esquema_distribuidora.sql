-- =====================================================================
-- BLOQUE 7 — Esquema relacional de Distribuidora CJ (Supabase / PostgreSQL)
-- Ejecutar UNA sola vez en SQL Editor sobre un proyecto nuevo.
-- =====================================================================
BEGIN;

-- ========================================
-- ROLES
-- ========================================
CREATE TABLE public.roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT ck_roles_nombre
    CHECK (
        nombre IN (
            'administrador',
            'vendedor',
            'cliente'
        )
    )
);

-- ========================================
-- USUARIOS
-- ========================================
CREATE TABLE public.usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    auth_user_id UUID UNIQUE
        REFERENCES auth.users(id)
        ON DELETE RESTRICT,

    rol_id BIGINT NOT NULL
        REFERENCES public.roles(id)
        ON DELETE RESTRICT,

    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash TEXT,

    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_usuarios_nombre
        CHECK (LENGTH(TRIM(nombre)) >= 3)
);

-- ========================================
-- CATEGORIAS
-- ========================================
CREATE TABLE public.categorias (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300) NOT NULL DEFAULT '',

    CONSTRAINT ck_categorias_nombre
        CHECK (LENGTH(TRIM(nombre)) >= 2)
);

-- ========================================
-- PROVEEDORES
-- ========================================
CREATE TABLE public.proveedores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL DEFAULT '',
    email VARCHAR(150) NOT NULL DEFAULT '',

    CONSTRAINT ck_proveedores_nombre
        CHECK (LENGTH(TRIM(nombre)) >= 2)
);

-- ========================================
-- PRODUCTOS
-- ========================================
CREATE TABLE public.productos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    categoria_id BIGINT NOT NULL
        REFERENCES public.categorias(id)
        ON DELETE RESTRICT,

    proveedor_id BIGINT NOT NULL
        REFERENCES public.proveedores(id)
        ON DELETE RESTRICT,

    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(12, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT ck_productos_precio
        CHECK (precio >= 0),

    CONSTRAINT ck_productos_stock
        CHECK (stock >= 0)
);

-- ========================================
-- CLIENTES  (equivale a PACIENTES)
-- ========================================
CREATE TABLE public.clientes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    usuario_id BIGINT UNIQUE
        REFERENCES public.usuarios(id)
        ON DELETE RESTRICT,

    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL DEFAULT '',
    telefono VARCHAR(30) NOT NULL DEFAULT '',
    direccion VARCHAR(150) NOT NULL DEFAULT ''
);

-- ========================================
-- VENDEDORES  (equivale a MEDICOS)
-- ========================================
CREATE TABLE public.vendedores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    usuario_id BIGINT UNIQUE
        REFERENCES public.usuarios(id)
        ON DELETE RESTRICT,

    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(15) NOT NULL UNIQUE,
    telefono VARCHAR(30) NOT NULL DEFAULT '',
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ========================================
-- VENTAS  (equivale a CITAS)
-- ========================================
CREATE TABLE public.ventas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    cliente_id BIGINT NOT NULL
        REFERENCES public.clientes(id)
        ON DELETE RESTRICT,

    vendedor_id BIGINT NOT NULL
        REFERENCES public.vendedores(id)
        ON DELETE RESTRICT,

    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    estado VARCHAR(20) NOT NULL
        DEFAULT 'registrada',

    total NUMERIC(14, 2) NOT NULL DEFAULT 0,

    CONSTRAINT ck_ventas_estado
    CHECK (
        estado IN (
            'registrada',
            'pagada',
            'entregada',
            'anulada'
        )
    ),

    CONSTRAINT ck_ventas_total
        CHECK (total >= 0)
);

-- ========================================
-- DETALLE DE VENTA  (productos de cada venta)
-- ========================================
CREATE TABLE public.venta_detalle (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    venta_id BIGINT NOT NULL
        REFERENCES public.ventas(id)
        ON DELETE CASCADE,

    producto_id BIGINT NOT NULL
        REFERENCES public.productos(id)
        ON DELETE RESTRICT,

    nombre_producto VARCHAR(150) NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL,

    CONSTRAINT ck_detalle_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT ck_detalle_precio
        CHECK (precio_unitario >= 0)
);

-- ========================================
-- ÍNDICES DE RELACIONES
-- ========================================
CREATE INDEX idx_usuarios_rol
    ON public.usuarios(rol_id);

CREATE INDEX idx_productos_categoria
    ON public.productos(categoria_id);

CREATE INDEX idx_productos_proveedor
    ON public.productos(proveedor_id);

CREATE INDEX idx_ventas_cliente
    ON public.ventas(cliente_id);

CREATE INDEX idx_ventas_vendedor
    ON public.ventas(vendedor_id);

CREATE INDEX idx_ventas_fecha
    ON public.ventas(fecha);

CREATE INDEX idx_detalle_venta
    ON public.venta_detalle(venta_id);

CREATE INDEX idx_detalle_producto
    ON public.venta_detalle(producto_id);

-- ========================================
-- PREVENIR DUPLICADOS SIN DISTINGUIR MAYÚSCULAS
-- (evita "Pinturas" y "pinturas" como registros distintos)
-- ========================================
CREATE UNIQUE INDEX uq_usuarios_email_ci
    ON public.usuarios (LOWER(email));

CREATE UNIQUE INDEX uq_categorias_nombre_ci
    ON public.categorias (LOWER(nombre));

CREATE UNIQUE INDEX uq_proveedores_nombre_ci
    ON public.proveedores (LOWER(nombre));

COMMIT;