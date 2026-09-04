# EconoHogar — prototipo de tienda

Maqueta navegable para **econohogarsv.com**, tienda de electrodomésticos en El Salvador.

> **No es la tienda.** Es un prototipo de diseño e interacción con catálogo simulado.
> No hay base de datos, ni pasarela de pago, ni facturación. Ver *Qué es real y qué no*.

## Compilar

```bash
node seed/generar-catalogo.mjs     # genera seed/catalogo.json (254 productos)
node seed/construir-vista.mjs      # → vista-catalogo.html
node seed/construir-home.mjs       # → home.html
```

Para el sitio publicado:

```bash
node seed/construir-vista.mjs --sitio
node seed/construir-home.mjs --sitio
```

Con `--sitio` los enlaces internos pasan a rutas relativas y la salida va a
`docs/` como `index.html` y `catalogo.html`. **Sin esa bandera los enlaces
apuntan a los artifacts de claude.ai**, que no sirve para un sitio propio.

`docs/` sí se versiona: es lo que GitHub Pages publica en
<https://sidereai.github.io/econohogarsv/>. Después de tocar cualquier
plantilla hay que recompilar con `--sitio` y commitear `docs/`, o el sitio
queda desfasado del código.

Las rutas son relativas porque el sitio vive en una subruta (`/econohogarsv/`),
no en la raíz de un dominio. Un `href="/catalogo.html"` rompería.

**Publicar en GitHub Pages:** Settings → Pages → Source: `Deploy from a branch`,
rama `main`, carpeta `/docs`.

## Estructura

| Ruta | Qué es |
|---|---|
| `seed/generar-catalogo.mjs` | Generador determinista del catálogo (semilla fija: mismo resultado siempre) |
| `seed/catalogo.json` | 254 productos, 15 categorías, 2 ubicaciones, 14 zonas de envío |
| `seed/home.template.html` | Plantilla de la home |
| `seed/vista.template.html` | Plantilla del catálogo |
| `seed/parciales/ui.css` · `ui.js` | Ficha de producto (vidrio), carrito, barras de desplazamiento, tema — compartidos por las dos páginas |
| `seed/siluetas.mjs` | 15 siluetas SVG, una por familia de producto |
| `seed/personajes.mjs` | Los tres personajes derivados del logo, chispas y trazos |
| `seed/departamentos.mjs` | Agrupación comercial de categorías para el menú |
| `seed/enlaces.mjs` | Destino de la compilación (artifacts o sitio publicado) |
| `decision-stack.html` | Documento de decisión de arquitectura para la tienda real |

Los `.html` de la raíz son salidas generadas y están en `.gitignore`.
`docs/` también es generado, pero se versiona porque es lo que se publica.

## Qué es real y qué no

**Real:** el diseño, el sistema de color derivado del logo, la navegación,
los filtros por departamento y categoría, el buscador con sinónimos, la ficha
de producto, el carrito con tope de existencias, el cálculo de IVA al 13 %,
las tarifas de envío por departamento y la regla que impide despachar
voluminosos a Morazán y La Unión.

**Simulado:** productos, precios, existencias y unidades vendidas. Salen del
generador, no de inventario. El botón de Wompi no cobra: solo muestra el
resumen que recibiría la orden de facturación.

**No existe todavía:** base de datos, autenticación, pedidos persistentes,
integración con Wompi, emisión de DTE, panel de administración y worker de
inventario. Todo eso está especificado en `decision-stack.html`.

## Antes de publicar en el dominio principal

Este prototipo muestra precios que no son reales. Publicarlo en
`econohogarsv.com` invita a alguien a intentar comprar algo que no existe.
Mientras tanto vive en GitHub Pages, con `noindex, nofollow` y `robots.txt`
para que no entre a Google bajo la marca. Ese bloqueo se quita el día que
la tienda de verdad ocupe el dominio.
