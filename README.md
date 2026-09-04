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

Para subir a un hosting estático por FTP:

```bash
node seed/construir-vista.mjs --ftp
node seed/construir-home.mjs --ftp
```

Con `--ftp` los enlaces internos pasan a rutas relativas y la salida va a
`dist/` como `index.html` y `catalogo.html`. **Sin esa bandera los enlaces
apuntan a los artifacts publicados en claude.ai**, que no sirve para un sitio propio.

Subir por FTP el contenido de `dist/`. No hace falta nada más: las fuentes
vienen de Google Fonts y todo lo demás va incrustado en los dos archivos.

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
| `seed/enlaces.mjs` | Destino de la compilación (artifacts o FTP) |
| `decision-stack.html` | Documento de decisión de arquitectura para la tienda real |

Los `.html` de la raíz y `dist/` son salidas generadas y están en `.gitignore`.

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
Va en un subdominio de demostración hasta que la tienda real esté en pie.
