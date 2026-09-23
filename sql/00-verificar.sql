-- ============================================================
-- Verificación del servidor antes de crear nada.
-- Pegar en phpPgAdmin → SQL y ejecutar. No modifica nada.
-- ============================================================

-- 1. Versión y codificación. Se espera PostgreSQL 13 y UTF8.
SELECT version() AS version,
       current_setting('server_encoding')  AS codificacion,
       current_setting('lc_collate')       AS cotejamiento,
       current_database()                  AS base,
       current_user                        AS usuario;

-- 2. ¿Existe la configuración de texto completo en español?
--    Viene con PostgreSQL, no hace falta instalar nada.
SELECT cfgname FROM pg_ts_config WHERE cfgname = 'spanish';

-- 3. ¿Se pueden instalar extensiones? pg_trgm es la única opcional:
--    da tolerancia a errores de escritura ("refrijeradora" → refrigeradora).
--    Si esta consulta no devuelve filas, el servidor no las tiene disponibles
--    y el esquema igual funciona: la búsqueda pierde solo esa tolerancia.
SELECT name, default_version, installed_version
  FROM pg_available_extensions
 WHERE name IN ('pg_trgm', 'unaccent');

-- 4. ¿El usuario puede crear objetos en el esquema public?
SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS puede_crear;

-- 5. ¿Ya hay algo creado? Debe salir vacío en una base nueva.
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
