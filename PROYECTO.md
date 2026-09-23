# EconoHogar · Etapa 1 — especificación de construcción

Tienda en línea con pedidos por WhatsApp para **econohogarsv.com**.
Sin pago en línea. Se monta en el **cPanel** que el cliente ya tiene, con
**PHP + PostgreSQL 13**.

Este documento es de donde se programa. Si algo aquí contradice lo que hay en
el repositorio, manda el repositorio y se corrige este archivo.

> **Sustituye la decisión de hosting de `decision-stack.html`.** Ese documento
> proponía Next.js sobre Railway, antes de saber que el cliente ya tenía cPanel.
> Lo demás de ese documento sigue vigente: modelo de inventario, IVA, DTE y
> la ruta de la etapa 2.

---

## 0. Entorno real del servidor

El cliente activó PostgreSQL en cPanel el 23 de septiembre de 2026.

| Qué | Valor |
|---|---|
| Base de datos | **PostgreSQL 13.23**, en `127.0.0.1:5432` |
| Base creada | `econohog_master`, con usuario propio |
| Administración | phpPgAdmin desde cPanel |
| Servidor | `s20420.usc1.stableserver.net` |

### La base no es accesible desde fuera, y así debe quedarse

Se probó desde otra red: el puerto 5432 responde con **tiempo agotado**, no con
conexión rechazada. Eso es el cortafuegos descartando los paquetes en silencio,
que es exactamente lo que debe hacer. Una base de datos no va abierta a internet.

Consecuencias prácticas:

- La aplicación corre en el mismo servidor y conecta a `127.0.0.1`. No necesita
  acceso remoto en ningún momento.
- El esquema se aplica **pegando los archivos de `sql/` en phpPgAdmin**.
- Si en algún momento hace falta trabajar contra la base desde afuera, se hace
  con un **túnel SSH** (`ssh -L 5432:127.0.0.1:5432 usuario@servidor`), nunca
  abriendo el puerto.

### Falta verificar

| Qué | Dónde | Por qué importa |
|---|---|---|
| **¿La web está en este mismo servidor?** | Comparar con el dominio | La primera base MySQL estaba en `s1089.usc1.mysecurecloudhost.com`, otro servidor. Si la web y PostgreSQL no comparten máquina, `127.0.0.1` no sirve |
| **Versión de PHP** | cPanel → Select PHP Version | El documento asume 8.1 o superior |
| **`pdo_pgsql` habilitada** | Select PHP Version → Extensions | Sin ella PHP no habla con PostgreSQL |
| **`gd` habilitada** | Igual que arriba | Sin ella no hay redimensionado de fotos |
| **SSL activo en el dominio** | cPanel → SSL/TLS Status | El panel no puede pedir contraseña sin HTTPS |
| **Cron disponible** | cPanel → Cron Jobs | Sin cron no hay respaldo automático |
| **`pg_trgm` disponible** | `sql/00-verificar.sql` | Opcional. Da tolerancia a errores de escritura |

### Las contraseñas

Van en `config.php`, **fuera de `public_html`** y fuera del repositorio, que es
público. `config.php`, `.my.cnf` y `*.env` ya están en `.gitignore`.

Las credenciales se compartieron por chat durante el desarrollo. Conviene
rotarlas antes de publicar y dejar unas distintas para producción.

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

## 3. Modelo de datos (PostgreSQL 13)

El esquema vive en archivos, no en este documento, para que no existan dos
copias que se separen con el tiempo:

| Archivo | Qué hace | Cuándo |
|---|---|---|
| `sql/00-verificar.sql` | Versión, codificación, extensiones y permisos. No modifica nada | Antes de todo |
| `sql/01-esquema.sql` | Tablas, índices, secuencia y disparadores | Una vez |
| `sql/02-datos.sql` | 15 categorías, 14 departamentos y ajustes. Se puede repetir | Después del esquema |
| `sql/03-busqueda-difusa.sql` | `pg_trgm`. **Opcional** | Solo si el servidor lo permite |

Se pegan en phpPgAdmin en ese orden.

> **Advertencia honesta:** el SQL está revisado y balanceado, pero **no se
> ejecutó todavía contra un PostgreSQL real**. No hay uno disponible en el
> entorno de desarrollo. El `00-verificar.sql` es justamente para eso.

### 3.1 Sin extensiones obligatorias

Los acentos se resuelven con una función propia de cuatro líneas
(`sin_acentos`), no con la extensión `unaccent`. Razón: en hosting compartido no
siempre se pueden instalar extensiones, y no vale la pena que el proyecto
dependa de un permiso que no controlamos.

La búsqueda en español (`to_tsvector('spanish', …)`) viene con PostgreSQL y no
necesita nada instalado.

`pg_trgm` queda como mejora opcional: si está, «refrijeradora» encuentra
refrigeradoras; si no, la tienda funciona igual y ese caso devuelve cero
resultados. Es lo único que se pierde.

### 3.2 Por qué existencias vive en dos lugares

`productos.existencias` es el número que se consulta mil veces al día.
`movimientos_inventario` es el historial que explica cómo llegó a ese número.

Los dos se escriben **en la misma transacción**. Sin el historial, la pregunta
«¿por qué dice 3 si hay 5?» no tiene respuesta. Con él se lee qué pasó.

### 3.3 Confirmar un pedido descuenta existencias

En PHP dentro de una transacción, no en una función de la base. Razón: hay que
decir **cuál** producto no alcanzó, y eso desde una función se vuelve incómodo
de depurar en un hosting sin consola.

```php
$db->beginTransaction();
// FOR UPDATE bloquea esas filas hasta el commit: dos confirmaciones
// simultáneas no pueden leer la misma existencia.
$items = $db->prepare(
  'SELECT i.sku, i.cantidad, i.nombre, p.existencias
     FROM pedido_items i JOIN productos p ON p.sku = i.sku
    WHERE i.pedido_id = ? FOR UPDATE');
$items->execute([$pedidoId]);

$faltan = [];
foreach ($items as $it) {
  if ($it['existencias'] < $it['cantidad']) {
    $faltan[] = "{$it['nombre']}: hay {$it['existencias']}, se piden {$it['cantidad']}";
  }
}
if ($faltan) { $db->rollBack(); return ['error' => $faltan]; }

// Descuenta, deja historial y cambia el estado.
foreach ($items as $it) { /* UPDATE productos … ; INSERT movimientos … */ }
$db->prepare("UPDATE pedidos SET estado = 'confirmado'
               WHERE id = ? AND estado = 'nuevo'")->execute([$pedidoId]);
$db->commit();
```

El `CHECK (existencias >= 0)` de la tabla es la última red: si algo se escapa de
la lógica, la transacción falla sola. La base es el último guardián, no el
código de la aplicación.

Cancelar hace lo inverso con motivo `cancelacion`, solo si estaba en
`confirmado`.

### 3.4 Cómo se busca

1. **Sinónimos primero**, con la lista que ya existe en el prototipo: `tv` y
   `television` pasan a `televisor`, `refri` a `refrigeradora`, `abanico` a
   `ventilador`, `freezer` a `congelador`.
2. **Texto completo** sobre la columna `busqueda`, que ya está sin acentos:
   `WHERE busqueda @@ plainto_tsquery('spanish', sin_acentos(:q))`
3. **Si no hubo resultados y `pg_trgm` está instalado**, se reintenta por
   parecido. Si no está, se devuelve vacío con una sugerencia de escribir menos
   palabras.

### 3.5 El código de los pedidos

Lo arma la propia base al insertar, con una secuencia y un valor por defecto:
`EH-001042`. Nadie lo calcula ni hay que actualizarlo después.

### 3.6 El usuario administrador

No se crea con SQL: la contraseña tiene que pasar por `password_hash()` de PHP.
Se crea con un script de línea de comandos que **se borra después de usarlo**.

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
0 1 * * * PGPASSFILE=~/econohogar/.pgpass pg_dump -h 127.0.0.1 -U econohog_adminmaster \
  -Fc econohog_master > ~/econohogar/respaldos/eh-$(date +\%F).dump \
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

*Última actualización: 23 de septiembre de 2026.*
