-- ============================================================
-- EconoHogar · Etapa 1 — datos iniciales
-- Se ejecuta despues de 01-esquema.sql. Se puede repetir sin duplicar.
-- ============================================================

BEGIN;

INSERT INTO categorias (slug, nombre, orden) VALUES
  ('refrigeradoras', 'Refrigeradoras', 0),
  ('lavadoras', 'Lavadoras', 10),
  ('secadoras', 'Secadoras', 20),
  ('estufas', 'Estufas y cocinas', 30),
  ('congeladores', 'Congeladores', 40),
  ('aires-acondicionados', 'Aires acondicionados', 50),
  ('televisores', 'Televisores', 60),
  ('microondas', 'Microondas', 70),
  ('licuadoras', 'Licuadoras', 80),
  ('ventiladores', 'Ventiladores', 90),
  ('freidoras-de-aire', 'Freidoras de aire', 100),
  ('planchas', 'Planchas', 110),
  ('ollas-y-arroceras', 'Ollas y arroceras', 120),
  ('aspiradoras', 'Aspiradoras', 130),
  ('filtros-de-agua', 'Filtros y purificadores', 140)
ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre, orden = EXCLUDED.orden;

INSERT INTO departamentos (nombre, orden) VALUES
  ('Ahuachapán', 0),
  ('Santa Ana', 10),
  ('Sonsonate', 20),
  ('Chalatenango', 30),
  ('La Libertad', 40),
  ('San Salvador', 50),
  ('Cuscatlán', 60),
  ('La Paz', 70),
  ('Cabañas', 80),
  ('San Vicente', 90),
  ('Usulután', 100),
  ('San Miguel', 110),
  ('Morazán', 120),
  ('La Unión', 130)
ON CONFLICT (nombre) DO UPDATE SET orden = EXCLUDED.orden;

-- El numero de WhatsApp arranca vacio a proposito: el panel obliga a
-- llenarlo la primera vez que alguien entra.
INSERT INTO ajustes (clave, valor) VALUES
  ('tienda_nombre', 'EconoHogar'),
  ('whatsapp_numero', ''),
  ('whatsapp_saludo', 'Hola EconoHogar, quiero hacer este pedido:'),
  ('tienda_direccion', ''),
  ('envio_nota', 'El costo de envio se confirma por WhatsApp junto con el pedido.'),
  ('productos_por_pagina', '24')
ON CONFLICT (clave) DO NOTHING;

COMMIT;

-- El usuario administrador NO se crea aqui: la contrasena tiene que pasar
-- por password_hash() de PHP. Se crea con el script de linea de comandos
-- descrito en PROYECTO.md, que se borra despues de usarlo.
