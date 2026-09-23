-- ============================================================
-- OPCIONAL · Tolerancia a errores de escritura
--
-- Solo si 00-verificar.sql mostró pg_trgm como disponible.
-- Sin esto la tienda funciona igual, pero "refrijeradora" devuelve cero
-- resultados en vez de encontrar refrigeradoras.
--
-- Si da error de permisos, se deja así: no es un bloqueo.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice sobre el nombre ya sin acentos, para comparar por parecido.
CREATE INDEX IF NOT EXISTS productos_nombre_trgm_idx
  ON productos USING gin (sin_acentos(nombre) gin_trgm_ops);

-- Cómo se usa desde la aplicación: primero se busca por texto completo y,
-- si no hubo resultados, se cae a esta consulta por parecido.
--
--   SELECT sku, nombre, similarity(sin_acentos(nombre), sin_acentos(:q)) AS s
--     FROM productos
--    WHERE visible
--      AND sin_acentos(nombre) % sin_acentos(:q)
--    ORDER BY s DESC
--    LIMIT 24;
--
-- El umbral por defecto es 0.3. Para una tienda conviene bajarlo un poco,
-- por sesión, sin tocar la configuración del servidor:
--
--   SELECT set_limit(0.25);
