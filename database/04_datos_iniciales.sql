-- =====================================================================
-- BLOQUE 7 — Datos iniciales (los mismos que teníamos en src/data/)
-- Ejecutar UNA sola vez, después de 01 y 02.
-- Los clientes y vendedores históricos quedan con usuario_id NULL:
-- no inventamos asociaciones con usuarios.
-- =====================================================================
BEGIN;

INSERT INTO public.categorias (nombre, descripcion) VALUES
    ('Pinturas', 'Productos de pinturas'),
    ('Lijas',    'Producto para alisar, limpiar superficies'),
    ('Tinner',   'Producto para limpiar');

INSERT INTO public.proveedores (nombre, telefono, email) VALUES
    ('Pintuco',   '3001234567', 'pintuco@gmail.com'),
    ('Pintuland', '3109876543', 'pintuland@gmail.com'),
    ('LijasCol',  '3109876543', 'lijas@gmail.com');

INSERT INTO public.productos (nombre, precio, stock, categoria_id, proveedor_id)
SELECT p.nombre, p.precio, p.stock, c.id, pr.id
FROM (VALUES
    ('Caneca pintura',     250000, 10, 'Pinturas', 'Pintuco'),
    ('Galon Pintura Mate',  50000,  5, 'Pinturas', 'Pintuland'),
    ('Lija 180 roja',        1800, 20, 'Lijas',    'LijasCol')
) AS p(nombre, precio, stock, categoria, proveedor)
JOIN public.categorias  c  ON c.nombre  = p.categoria
JOIN public.proveedores pr ON pr.nombre = p.proveedor;

INSERT INTO public.clientes (nombre, documento, email, telefono, direccion) VALUES
    ('Ferretería El Tornillo', '900100200',  'tornillo@email.com', '3001112233', 'Calle 10 # 5-20'),
    ('Pedro Gómez',            '1001001002', 'pedro@email.com',    '3012223344', 'Carrera 7 # 12-40'),
    ('Construcciones Llano',   '900300400',  'llano@email.com',    '3023334455', 'Av. Principal # 3-15');

INSERT INTO public.vendedores (nombre, documento, telefono) VALUES
    ('Carlos Rodríguez', '1020304050', '3105556677'),
    ('Marta Pérez',      '1020304051', '3106667788');

COMMIT;

-- Comprobar
SELECT p.id, p.nombre, p.precio, p.stock,
       c.nombre AS categoria, pr.nombre AS proveedor
FROM public.productos p
JOIN public.categorias  c  ON c.id  = p.categoria_id
JOIN public.proveedores pr ON pr.id = p.proveedor_id
ORDER BY p.id;