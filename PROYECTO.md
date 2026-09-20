# EconoHogar · Etapa 1 — especificación de construcción

Tienda en línea con pedidos por WhatsApp para **econohogarsv.com**.
Sin pago en línea. Se monta en el **cPanel** que el cliente ya tiene, con
**PHP + PostgreSQL**.

Este documento es de donde se programa. Si algo aquí contradice lo que hay en
el repositorio, manda el repositorio y se corrige este archivo.

> **Sustituye la decisión de hosting de `decision-stack.html`.** Ese documento
> proponía Next.js sobre Railway, antes de saber que el cliente ya tenía cPanel.
> Lo demás de ese documento sigue vigente: modelo de inventario, IVA, DTE y
> la ruta de la etapa 2.

---

## 0. Verificaciones antes de escribir una línea

Bloquean el arranque. Ninguna es negociable.

| Qué | Cómo se verifica | Si falla |
|---|---|---|
| **PostgreSQL disponible** | cPanel → Bases de datos. Muchos planes compartidos solo traen MySQL | Se pasa a MySQL 8 / MariaDB 10.6. Ver §3.6 |
| **PHP 8.1 o superior** | cPanel → Select PHP Version | Pedir actualización al proveedor |
| **Extensión `pdo_pgsql`** | Select PHP Version → Extensions | Sin ella no hay conexión a Postgres |
| **Extensión `gd`** | Igual que arriba | Sin ella no hay redimensionado de fotos |
| **SSL activo** | cPanel → SSL/TLS Status, AutoSSL | El panel no puede pedir contraseña sin HTTPS |
| **Cron disponible** | cPanel → Cron Jobs | Sin cron no hay respaldo automático |
| **Política de respaldos del proveedor** | Preguntar al proveedor | Si no hay, el cron de §9.3 es el único respaldo |

**Dato que falta confirmar:** en el pedido se escribió «POSGREST». Este documento
asume **PostgreSQL** (la base de datos). Si la intención era **PostgREST** (la
capa que expone Postgres como API REST), no sirve: necesita un proceso corriendo
de forma permanente, y un cPanel compartido no lo permite.

---

## 1. Alcance cotizado

Lo que entra en esta etapa, tal como se cotizó.

| # | Partida | Horas |
|---|---|---|
| 1 | Tienda con el catálogo real | 18 |
| 2 | Pedido por WhatsApp | 8 |
| 3 | Panel con usuario y contraseña | 4 |
| 4 | Formulario de carga rápida con fotos | 16 |
| 5 | Pedidos, descuento y ajuste de existencias | 10 |
| 6 | Catálogo sincronizado con WhatsApp Business | 5 |
| 7 | Instalación en cPanel, base de datos, respaldos | 6 |
| 8 | Manual en video y capacitación | 10 |
| 9 | Pruebas y publicación | 6 |
| | **Base** | **83** |
| | Gestión (10 %) y contingencia (10 %) | 17 |
| | **Total** | **100** |

### Fuera de esta etapa

No se programa, no se promete, no se insinúa en la interfaz:

- Pago en línea, tarjetas, cuotas y todo lo de Wompi
- Facturación electrónica (DTE)
- Costo de envío calculado automáticamente por departamento
- Avisos automáticos al cliente por WhatsApp (API de Meta)
- Reportes de ventas
- Usuarios separados con permisos distintos
- Aplicación móvil nativa
- Integración con sistema contable o ERP

**El prototipo actual muestra cuotas de Banco Agrícola y botones de Wompi.
Todo eso se quita.** Dejarlo es prometer algo que la tienda no hace.

---

## 2. Decisiones de arquitectura

### 2.1 La tienda la arma PHP en el servidor

El catálogo y las fichas se renderizan en PHP, no con JavaScript en el navegador.
Razón: una tienda vive del tráfico que llega por buscador, y un catálogo que solo
existe después de ejecutar JavaScript llega peor a Google. Además funciona si el
JavaScript falla.

El JavaScript queda para lo que sí es interacción: filtros, carrito, ficha
emergente y envío del pedido.

### 2.2 Sin framework y sin Composer

PHP puro con un controlador frontal y PDO. Nada que instalar en el servidor, nada
que actualizar por seguridad más allá del propio PHP. En hosting compartido esto
es una ventaja, no una limitación: `password_hash`, sesiones, PDO y GD vienen en
el propio PHP.

### 2.3 El carrito vive en el navegador

`localStorage`, como en el prototipo. No hace falta sesión ni tabla de carritos:
el pedido solo existe cuando el comprador lo envía.

### 2.4 Qué se reutiliza del prototipo

| Del prototipo | Qué pasa con él |
|---|---|
| `seed/parciales/ui.css` | Pasa a `public/assets/tienda.css` casi sin cambios |
| `seed/parciales/ui.js` | Pasa a `public/assets/tienda.js`. Se quita el bloque de Wompi y cuotas |
| `seed/siluetas.mjs` | Se generan los SVG una vez y se commitean como archivos estáticos |
| `seed/personajes.mjs`, `favicon.mjs` | Igual: se pre-generan los archivos y se sube el resultado |
| `seed/departamentos.mjs` | Pasa a tabla `departamentos` |
| `home.template.html`, `vista.template.html` | Se portan a vistas PHP |
| `seed/generar-catalogo.mjs`, `catalogo.json` | Solo para datos de prueba en desarrollo. No van a producción |

Node deja de ser parte del producto. Solo se usa en desarrollo para pre-generar
los SVG y el favicon.

---

## 3. Modelo de datos (PostgreSQL)

### 3.1 Tablas

```sql
create table categorias (
  slug        text primary key,
  nombre      text not null,
  orden       int  not null default 0,
  visible     boolean not null default true
);

create table departamentos (
  nombre      text primary key,
  orden       int not null default 0
);

create table productos (
  sku                   text primary key,
  nombre                text not null,
  marca                 text,
  modelo                text,
  categoria             text references categorias(slug) on delete set null,
  -- Precio con IVA incluido, en centavos. Es lo que ve el comprador y lo
  -- que espera un comprador salvadoreño. El desglose se calcula al mostrar.
  precio_centavos       int  not null check (precio_centavos >= 0),
  precio_lista_centavos int check (precio_lista_centavos is null
                                   or precio_lista_centavos >= precio_centavos),
  existencias           int  not null default 0 check (existencias >= 0),
  garantia_meses        int,
  descripcion           text,
  -- Especificaciones variables: una refrigeradora tiene pies³, un aire BTU.
  -- Sin jsonb serían sesenta columnas nulas.
  specs                 jsonb not null default '{}'::jsonb,
  visible               boolean not null default true,
  creado_en             timestamptz not null default now(),
  actualizado_en        timestamptz not null default now()
);

create index productos_categoria_idx on productos (categoria)
  where visible;
create index productos_specs_idx on productos using gin (specs);

-- Búsqueda en español, con acentos normalizados y tolerancia a escritura parcial.
create extension if not exists unaccent;
create extension if not exists pg_trgm;

alter table productos add column busqueda tsvector
  generated always as (
    to_tsvector('spanish',
      unaccent(coalesce(nombre,'') || ' ' || coalesce(marca,'') || ' ' ||
               coalesce(modelo,'') || ' ' || coalesce(descripcion,'')))
  ) stored;
create index productos_busqueda_idx on productos using gin (busqueda);
create index productos_nombre_trgm_idx on productos using gin (nombre gin_trgm_ops);

create table producto_fotos (
  id          bigserial primary key,
  sku         text not null references productos(sku) on delete cascade,
  archivo     text not null,          -- ruta relativa dentro de /uploads
  orden       int  not null default 0,
  creado_en   timestamptz not null default now()
);
create index producto_fotos_sku_idx on producto_fotos (sku, orden);

create table pedidos (
  id                text primary key,        -- EH-000142
  creado_en         timestamptz not null default now(),
  estado            text not null default 'nuevo'
                    check (estado in ('nuevo','confirmado','entregado','cancelado')),
  cliente_nombre    text not null,
  cliente_telefono  text not null,
  departamento      text references departamentos(nombre),
  metodo            text not null check (metodo in ('retiro','envio')),
  direccion         text,
  nota              text,
  total_centavos    int  not null,
  ip                inet,
  actualizado_en    timestamptz not null default now()
);
create index pedidos_estado_idx on pedidos (estado, creado_en desc);

create table pedido_items (
  id                bigserial primary key,
  pedido_id         text not null references pedidos(id) on delete cascade,
  sku               text not null,
  -- Copia del nombre y del precio al momento del pedido: si mañana cambia
  -- el precio, el pedido viejo no se reescribe solo.
  nombre            text not null,
  precio_centavos   int  not null,
  cantidad          int  not null check (cantidad > 0)
);
create index pedido_items_pedido_idx on pedido_items (pedido_id);

-- Historial de por qué cambió cada existencia. Solo se inserta.
create table movimientos_inventario (
  id          bigserial primary key,
  sku         text not null references productos(sku) on delete cascade,
  delta       int  not null check (delta <> 0),
  motivo      text not null
              check (motivo in ('carga','ajuste','venta_linea','venta_tienda',
                                'devolucion','cancelacion')),
  referencia  text,                     -- id del pedido, cuando aplica
  creado_en   timestamptz not null default now()
);
create index movimientos_sku_idx on movimientos_inventario (sku, creado_en desc);

create table usuarios (
  id            bigserial primary key,
  correo        text not null unique,
  hash          text not null,
  nombre        text not null,
  ultimo_acceso timestamptz,
  creado_en     timestamptz not null default now()
);

create table ajustes (
  clave  text primary key,
  valor  text
);
-- whatsapp_numero, whatsapp_saludo, tienda_nombre, tienda_direccion,
-- envio_nota, productos_por_pagina
```

### 3.2 Por qué existencias vive en dos lugares

`productos.existencias` es el número que se consulta mil veces al día.
`movimientos_inventario` es el historial que explica cómo llegó a ese número.

Los dos se escriben **en la misma transacción**. Sin el historial, la pregunta
«¿por qué dice 3 si hay 5?» no tiene respuesta. Con él se lee qué pasó.

### 3.3 Confirmar un pedido descuenta existencias

Una función, no código PHP suelto, para que sea atómico:

```sql
create or replace function confirmar_pedido(p_id text)
returns void language plpgsql as $$
declare it record;
begin
  perform 1 from pedidos where id = p_id and estado = 'nuevo' for update;
  if not found then
    raise exception 'El pedido % no existe o ya no está nuevo', p_id;
  end if;

  for it in select sku, cantidad from pedido_items where pedido_id = p_id loop
    update productos set existencias = existencias - it.cantidad,
                         actualizado_en = now()
     where sku = it.sku;
    if not found then
      raise exception 'Producto % no encontrado', it.sku;
    end if;
    insert into movimientos_inventario (sku, delta, motivo, referencia)
    values (it.sku, -it.cantidad, 'venta_linea', p_id);
  end loop;

  update pedidos set estado = 'confirmado', actualizado_en = now() where id = p_id;
end $$;
```

El `check (existencias >= 0)` de la tabla hace que la transacción falle sola si
el descuento dejaría el inventario en negativo. La base es el último guardián,
no el código de la aplicación.

`cancelar_pedido(p_id)` hace lo inverso con motivo `cancelacion`, solo si el
pedido estaba en `confirmado`.

### 3.4 Numeración de pedidos

Secuencia propia, no el id de la tabla: `EH-` más seis dígitos.

```sql
create sequence pedido_numero start 1000;
```

### 3.5 Datos iniciales

- 15 categorías, las mismas del prototipo
- 14 departamentos
- 1 usuario administrador, creado por línea de comandos, nunca por formulario
- Ajustes con el número de WhatsApp vacío: el panel obliga a llenarlo al entrar
  la primera vez

### 3.6 Si no hay PostgreSQL

Cambios para MySQL 8 / MariaDB 10.6, por si toca:

| Postgres | MySQL |
|---|---|
| `jsonb` + índice GIN | `json` + columnas generadas indexadas |
| `tsvector` + `unaccent` | `FULLTEXT` con parser por defecto, y cotejamiento `utf8mb4_unicode_ci` para los acentos |
| `pg_trgm` | No hay equivalente. La tolerancia a errores de escritura se pierde |
| `inet` | `varbinary(16)` con `INET6_ATON` |
| Función plpgsql | Procedimiento almacenado, misma lógica |

Se pierde sobre todo la búsqueda tolerante a errores de escritura. En una tienda
salvadoreña eso importa: mucha gente escribe «refrijeradora».

---

## 4. Rutas

### 4.1 Tienda (públicas, renderizadas en PHP)

| Ruta | Qué hace |
|---|---|
| `GET /` | Portada: destacados, categorías, más vendidos |
| `GET /catalogo` | Catálogo con filtros por categoría, orden y búsqueda. Paginado |
| `GET /producto/{slug}` | Ficha completa, con datos estructurados de producto para buscadores |
| `GET /catalogo-whatsapp.csv` | Feed para WhatsApp Business (§6) |
| `GET /sitemap.xml`, `/robots.txt` | Generados desde la base |

Los filtros y el buscador van por parámetros en la dirección
(`/catalogo?cat=refrigeradoras&q=lg`), para que cada resultado sea un enlace que
se pueda compartir y que el buscador pueda recorrer.

### 4.2 Pedido

| Ruta | Qué hace |
|---|---|
| `POST /api/pedido` | Recibe el carrito y los datos del comprador. Devuelve `{id, url_whatsapp}` |

**El total nunca se toma del navegador.** Llegan SKU y cantidades; los precios
se leen de la base y el total se recalcula en el servidor.

### 4.3 Panel (requieren sesión)

| Ruta | Qué hace |
|---|---|
| `GET/POST /panel/entrar` | Inicio de sesión |
| `POST /panel/salir` | Cerrar sesión |
| `GET /panel` | Resumen: pedidos nuevos, productos agotados, productos sin foto |
| `GET /panel/productos` | Listado con búsqueda y filtros |
| `GET/POST /panel/productos/nuevo` | Alta, optimizada para cargar muchos seguidos |
| `GET/POST /panel/productos/{sku}` | Edición |
| `POST /panel/productos/{sku}/existencias` | Ajuste rápido `+1 / −1 / cantidad` |
| `POST /panel/productos/{sku}/fotos` | Subida de fotos |
| `POST /panel/productos/{sku}/borrar` | Baja lógica (`visible = false`) |
| `GET /panel/pedidos` | Listado por estado |
| `GET /panel/pedidos/{id}` | Detalle, con botón para escribir al cliente por WhatsApp |
| `POST /panel/pedidos/{id}/estado` | Confirmar, entregar o cancelar |
| `GET/POST /panel/ajustes` | Número de WhatsApp, datos de la tienda, contraseña |
| `GET /panel/ayuda` | Los videos del manual |

---

## 5. Pantallas

### 5.1 Tienda

Diseño ya aprobado en el prototipo. Cambios obligatorios:

- **Fuera la barra de «Hasta 12 cuotas con Banco Agrícola».** En su lugar:
  «Pedí por WhatsApp. Pagás al recibir o en la tienda.»
- **Fuera la línea de cuotas** de tarjetas y ficha
- **Fuera el bloque de la calculadora de cuotas.** Se reemplaza por los tres
  pasos de compra, reusando los personajes y el fondo suave que ya existen
- **El carrito** cambia «Continuar al pago» por «Enviar pedido por WhatsApp»
- **El costo de envío** no se calcula: la ficha y el carrito dicen que se
  confirma por WhatsApp

### 5.2 Formulario de pedido

Se abre desde el carrito. Campos:

| Campo | Obligatorio | Validación |
|---|---|---|
| Nombre | Sí | 3 a 80 caracteres |
| Teléfono (WhatsApp) | Sí | 8 dígitos, o con `+503` |
| Departamento | Sí | De la lista |
| Método | Sí | Retiro en tienda o envío |
| Dirección | Solo si es envío | 10 a 200 caracteres |
| Nota | No | Hasta 300 caracteres |

Al enviar: se guarda el pedido, se abre WhatsApp con el mensaje armado y se
vacía el carrito. Si WhatsApp no abre, se muestra el enlace para tocarlo a mano.

### 5.3 Alta de producto, pensada para cargar 250

Es la pantalla donde alguien va a pasar entre 25 y 35 horas. Se diseña para eso:

- **Guardar y cargar otro** deja el formulario limpio pero conserva categoría y
  marca, que es lo que se repite
- **Duplicar** copia un producto parecido y solo se cambia lo distinto
- **Campos según la categoría**: al elegir «Aires acondicionados» aparecen BTU,
  tipo e inverter; al elegir «Refrigeradoras», pies cúbicos y No Frost
- **Fotos arrastrando**, con redimensionado en el servidor
- **SKU sugerido** a partir de categoría y marca, editable
- **Todo con teclado**: `Tab` recorre en orden y `Ctrl+Enter` guarda
- **Avisa si el nombre se parece** a uno que ya existe, para no duplicar

### 5.4 Pedidos

Lista con filtro por estado. Cada pedido: cliente, teléfono, artículos, total,
método de entrega. Acciones: confirmar, marcar entregado, cancelar, y escribir
al cliente por WhatsApp con un mensaje ya redactado.

Al confirmar se llama a `confirmar_pedido()`. Si algún producto ya no tiene
existencias, se avisa cuál y no se confirma nada.

---

## 6. Feed para WhatsApp Business

`GET /catalogo-whatsapp.csv`, generado desde la base en cada petición, con caché
de una hora en archivo.

Columnas del formato de catálogo de Meta:

| Columna | De dónde sale |
|---|---|
| `id` | `sku` |
| `title` | `nombre`, máximo 200 caracteres |
| `description` | `descripcion`, o el nombre y las specs si está vacía |
| `availability` | `in stock` si `existencias > 0`, si no `out of stock` |
| `condition` | `new` |
| `price` | `precio_centavos / 100` más `" USD"` |
| `link` | URL absoluta de la ficha |
| `image_link` | URL absoluta de la primera foto |
| `brand` | `marca`, o «EconoHogar» si está vacía |

**Solo se exportan productos visibles y con al menos una foto.** Meta descarta
los que no tienen imagen, y un feed con errores se rechaza entero.

En Commerce Manager se registra como fuente de datos programada, una vez al día.

El panel muestra cuántos productos quedarían fuera del feed por no tener foto.

---

## 7. El mensaje de WhatsApp

```
Hola EconoHogar, quiero hacer este pedido:

Pedido EH-001042
• 1 × Refrigeradora LG No Frost 14 pies³ — $649.00
• 2 × Licuadora Oster 600W — $79.90

Total: $728.90
Entrega: envío a San Salvador, Col. Escalón, Calle 3 #45
Nombre: Ana Martínez
Teléfono: 7012-3456

Quedo pendiente de su confirmación.
```

Se arma en el servidor y se devuelve listo en `url_whatsapp`, como
`https://wa.me/503XXXXXXXX?text=...` con el texto codificado.

Límite: WhatsApp corta los mensajes muy largos. Si el pedido pasa de 12
artículos, se listan los primeros 10 y se agrega «y 4 artículos más, ver
pedido EH-001042».

---

## 8. Seguridad

Sin pago en línea no hay datos de tarjeta, pero sí hay datos personales de
clientes y un panel que cambia precios.

- **Contraseñas** con `password_hash` (bcrypt). Nunca en texto plano, nunca en el
  repositorio
- **Sesiones** con cookie `HttpOnly`, `Secure` y `SameSite=Lax`; se regenera el
  identificador al entrar
- **Token CSRF** en todo formulario del panel
- **HTTPS obligatorio**, con redirección y `Strict-Transport-Security`
- **Límite de intentos** de ingreso: 5 por correo cada 15 minutos
- **Consultas con parámetros** en PDO, sin concatenar SQL nunca
- **Salida escapada** con `htmlspecialchars` en todas las vistas
- **Subida de fotos**: se valida el tipo real con `finfo`, se renombra al azar,
  se reescribe la imagen con GD para quitar cualquier contenido incrustado, y la
  carpeta lleva un `.htaccess` que prohíbe ejecutar PHP
- **Pedidos**: campo trampa oculto contra robots y límite de 5 pedidos por IP
  cada hora
- **Credenciales** en un archivo de configuración fuera de `public_html`
- **Cabeceras**: `X-Content-Type-Options`, `Referrer-Policy`, y una política de
  contenido que solo permita los tipos de letra de Google

---

## 9. Despliegue en cPanel

### 9.1 Estructura

```
/home/usuario/
├── econohogar/                 ← fuera de la web, no accesible por URL
│   ├── config.php              ← credenciales
│   ├── src/                    ← lógica y vistas
│   └── respaldos/
└── public_html/
    ├── index.php               ← controlador frontal
    ├── .htaccess               ← rutas amigables y HTTPS
    ├── assets/                 ← css, js, svg, favicon
    └── uploads/productos/      ← fotos, sin ejecución de PHP
```

### 9.2 Publicación

Por FTP o Git de cPanel. Sin compilación en el servidor: lo que se sube ya está
listo. Los SVG y el favicon se pre-generan en desarrollo con los scripts de Node
que ya existen y se suben como archivos.

### 9.3 Respaldo

Cron diario a la 1:00 a. m.:

```
0 1 * * * pg_dump -Fc "$DB" > ~/econohogar/respaldos/eh-$(date +\%F).dump \
  && find ~/econohogar/respaldos -name '*.dump' -mtime +14 -delete
```

Las fotos se respaldan con el respaldo del hosting. Si el proveedor no tiene,
se agrega un `tar` semanal de `uploads/`.

**Un respaldo que nunca se restauró no es un respaldo.** Antes de publicar se
restaura uno en una base de prueba y se verifica que los datos estén completos.

### 9.4 Al publicar

- Quitar `noindex` y el `Disallow: /` que hoy protegen el prototipo
- Registrar el sitio en Google Search Console y enviar el sitemap
- Verificar el certificado y la redirección a HTTPS

---

## 10. Plan de trabajo

El orden importa: cada bloque deja algo que se puede mostrar.

| # | Bloque | Entregable verificable | Horas |
|---|---|---|---|
| 0 | Verificaciones de §0 y base de datos creada | Conexión desde PHP, tablas creadas, datos iniciales | 3 |
| 1 | Panel: ingreso y estructura | Se entra con correo y contraseña; el resto pide sesión | 4 |
| 2 | Alta y edición de productos, con fotos | Se carga un producto con foto y aparece en la base | 16 |
| 3 | Tienda: catálogo, filtros, buscador y ficha | Se navega el catálogo real desde el celular | 18 |
| 4 | Carrito y pedido por WhatsApp | Un pedido llega al WhatsApp de prueba y queda guardado | 8 |
| 5 | Pedidos en el panel, existencias y ajuste rápido | Confirmar descuenta; cancelar devuelve | 10 |
| 6 | Feed de WhatsApp Business | Commerce Manager acepta el feed sin errores | 5 |
| 7 | Instalación, respaldo probado y publicación | Tienda en el dominio, con HTTPS y respaldo restaurado | 6 |
| 8 | Manual en video y capacitación | Tres videos dentro del panel y sesión con el cliente | 10 |
| 9 | Pruebas y ajustes finales | Lista de §11 completa | 6 |
| | | **Base** | **86** |

> Las 86 horas del plan contra las 83 cotizadas: las 3 de verificaciones no se
> habían contado por separado. Caben dentro de la contingencia.

La persona que carga el catálogo puede empezar al terminar el bloque 2, que es
lo que permite prometerle el panel para la segunda semana.

---

## 11. Criterios de aceptación

Se prueban uno por uno antes de entregar. Cada uno es una afirmación
verificable, no una opinión.

**Tienda**
- [ ] El catálogo carga en menos de 2,5 s en 4G, en un teléfono de gama media
- [ ] Buscar «refri» encuentra refrigeradoras; buscar «tv 55» encuentra el televisor
- [ ] Un producto con 0 existencias aparece agotado y no se puede agregar
- [ ] Las fichas traen datos estructurados de producto válidos
- [ ] La tienda funciona con JavaScript desactivado, salvo el carrito

**Pedido**
- [ ] El total del mensaje coincide con el de la base, aunque se altere el navegador
- [ ] Un pedido sin nombre o sin teléfono se rechaza con un mensaje claro
- [ ] El sexto pedido desde la misma IP en una hora se rechaza
- [ ] Un pedido de 15 artículos genera un mensaje que WhatsApp no corta

**Panel**
- [ ] Sin sesión, toda ruta del panel redirige al ingreso
- [ ] Cinco contraseñas erradas bloquean el ingreso por 15 minutos
- [ ] Cargar un producto con foto toma menos de 90 segundos
- [ ] Subir un archivo `.php` disfrazado de `.jpg` es rechazado
- [ ] Confirmar un pedido descuenta exactamente lo pedido y queda en el historial
- [ ] Confirmar un pedido sin existencias suficientes no descuenta nada y avisa cuál falta
- [ ] Cancelar un pedido confirmado devuelve las existencias

**Operación**
- [ ] El feed de WhatsApp es aceptado por Commerce Manager sin errores
- [ ] El respaldo del cron se restauró en una base de prueba y los datos están completos
- [ ] El sitio responde solo por HTTPS
- [ ] `noindex` fue retirado y el sitemap fue enviado a Search Console

---

## 12. Lo que se decide en la etapa 2

Queda anotado para no volver a discutirlo desde cero:

- **Dónde vive la tienda completa.** Puede quedarse en cPanel: PHP recibe sin
  problema los avisos de pago de Wompi, y PostgreSQL ya trae lo que necesita la
  reserva de inventario. Se revisa según el volumen real de pedidos
- **La reserva en dos fases** de `decision-stack.html` entra cuando exista pago
  en línea. Hoy no hace falta: el administrador confirma cada pedido a mano
- **La cola de facturación DTE** se conecta al mismo estado de pedidos
- **Usuarios separados** para quien carga el catálogo y quien atiende pedidos

---

*Última actualización: 20 de septiembre de 2026.*
