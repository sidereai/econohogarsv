-- ============================================================
-- EconoHogar · Etapa 1 — esquema
-- PostgreSQL 13. Pegar en phpPgAdmin → SQL, o ejecutar con psql.
--
-- No requiere ninguna extensión. Los acentos se resuelven con una función
-- propia, no con unaccent, para no depender de lo que el hosting permita
-- instalar. pg_trgm es opcional y va al final, en 03-busqueda-difusa.sql.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Acentos sin extensiones
-- ------------------------------------------------------------
-- translate() mapea carácter por carácter, así que las dos cadenas tienen
-- que medir exactamente lo mismo: 14 y 14.
CREATE OR REPLACE FUNCTION sin_acentos(t text) RETURNS text
  LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$
  SELECT translate(lower(t), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunaeiouun')
$$;

-- ------------------------------------------------------------
-- Catálogo
-- ------------------------------------------------------------
CREATE TABLE categorias (
  slug    text PRIMARY KEY,
  nombre  text NOT NULL,
  orden   int  NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true
);

CREATE TABLE departamentos (
  nombre text PRIMARY KEY,
  orden  int  NOT NULL DEFAULT 0
);

CREATE TABLE productos (
  sku                   text PRIMARY KEY,
  nombre                text NOT NULL,
  marca                 text,
  modelo                text,
  categoria             text REFERENCES categorias(slug) ON DELETE SET NULL,

  -- Precio con IVA incluido, en centavos. Es lo que ve el comprador y lo que
  -- espera un comprador salvadoreño. El desglose se calcula al mostrar.
  precio_centavos       int  NOT NULL CHECK (precio_centavos >= 0),
  precio_lista_centavos int  CHECK (precio_lista_centavos IS NULL
                                    OR precio_lista_centavos >= precio_centavos),
  existencias           int  NOT NULL DEFAULT 0 CHECK (existencias >= 0),
  garantia_meses        int,
  descripcion           text,

  -- Especificaciones variables: una refrigeradora tiene pies³, un aire BTU.
  -- Sin jsonb serían sesenta columnas nulas.
  specs                 jsonb NOT NULL DEFAULT '{}'::jsonb,

  visible               boolean NOT NULL DEFAULT true,
  creado_en             timestamptz NOT NULL DEFAULT now(),
  actualizado_en        timestamptz NOT NULL DEFAULT now(),

  -- Índice de búsqueda en español, ya sin acentos. Se recalcula solo.
  busqueda tsvector GENERATED ALWAYS AS (
    to_tsvector('spanish',
      sin_acentos(coalesce(nombre,'')      || ' ' ||
                  coalesce(marca,'')       || ' ' ||
                  coalesce(modelo,'')      || ' ' ||
                  coalesce(descripcion,'')))
  ) STORED
);

CREATE INDEX productos_busqueda_idx  ON productos USING gin (busqueda);
CREATE INDEX productos_specs_idx     ON productos USING gin (specs);
CREATE INDEX productos_categoria_idx ON productos (categoria) WHERE visible;
CREATE INDEX productos_visibles_idx  ON productos (nombre)    WHERE visible;

CREATE TABLE producto_fotos (
  id        bigserial PRIMARY KEY,
  sku       text NOT NULL REFERENCES productos(sku) ON DELETE CASCADE,
  archivo   text NOT NULL,              -- ruta relativa dentro de /uploads
  orden     int  NOT NULL DEFAULT 0,
  creado_en timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX producto_fotos_sku_idx ON producto_fotos (sku, orden);

-- ------------------------------------------------------------
-- Pedidos
-- ------------------------------------------------------------
-- El código visible se arma solo al insertar. Nadie tiene que calcularlo.
CREATE SEQUENCE pedido_codigo_seq START 1000;

CREATE TABLE pedidos (
  id               bigserial PRIMARY KEY,
  codigo           text NOT NULL UNIQUE
                   DEFAULT ('EH-' || lpad(nextval('pedido_codigo_seq')::text, 6, '0')),
  creado_en        timestamptz NOT NULL DEFAULT now(),
  estado           text NOT NULL DEFAULT 'nuevo'
                   CHECK (estado IN ('nuevo','confirmado','entregado','cancelado')),
  cliente_nombre   text NOT NULL,
  cliente_telefono text NOT NULL,
  departamento     text REFERENCES departamentos(nombre),
  metodo           text NOT NULL CHECK (metodo IN ('retiro','envio')),
  direccion        text,
  nota             text,
  total_centavos   int  NOT NULL CHECK (total_centavos >= 0),
  ip               inet,
  actualizado_en   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pedidos_estado_idx ON pedidos (estado, creado_en DESC);
CREATE INDEX pedidos_fecha_idx  ON pedidos (creado_en DESC);

CREATE TABLE pedido_items (
  id              bigserial PRIMARY KEY,
  pedido_id       bigint NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  sku             text NOT NULL,
  -- Copia del nombre y del precio al momento del pedido: si mañana cambia el
  -- precio, el pedido viejo no se reescribe solo.
  nombre          text NOT NULL,
  precio_centavos int  NOT NULL,
  cantidad        int  NOT NULL CHECK (cantidad > 0)
);
CREATE INDEX pedido_items_pedido_idx ON pedido_items (pedido_id);

-- ------------------------------------------------------------
-- Historial de existencias. Solo se inserta, nunca se corrige.
-- ------------------------------------------------------------
CREATE TABLE movimientos_inventario (
  id         bigserial PRIMARY KEY,
  sku        text NOT NULL REFERENCES productos(sku) ON DELETE CASCADE,
  delta      int  NOT NULL CHECK (delta <> 0),
  motivo     text NOT NULL CHECK (motivo IN ('carga','ajuste','venta_linea',
                                             'venta_tienda','devolucion','cancelacion')),
  referencia text,                      -- código del pedido, cuando aplica
  creado_en  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX movimientos_sku_idx ON movimientos_inventario (sku, creado_en DESC);

-- ------------------------------------------------------------
-- Acceso y configuración
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id            bigserial PRIMARY KEY,
  correo        text NOT NULL UNIQUE,
  hash          text NOT NULL,          -- password_hash() de PHP, nunca texto plano
  nombre        text NOT NULL,
  ultimo_acceso timestamptz,
  creado_en     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE intentos_ingreso (
  id        bigserial PRIMARY KEY,
  correo    text NOT NULL,
  ip        inet,
  creado_en timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX intentos_idx ON intentos_ingreso (correo, creado_en DESC);

CREATE TABLE ajustes (
  clave text PRIMARY KEY,
  valor text
);

-- ------------------------------------------------------------
-- actualizado_en se mantiene solo
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION tocar_actualizado() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  NEW.actualizado_en := now();
  RETURN NEW;
END $$;

CREATE TRIGGER productos_tocar BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();
CREATE TRIGGER pedidos_tocar BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado();

COMMIT;
