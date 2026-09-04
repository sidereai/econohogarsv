// Arma vista-catalogo.html incrustando el catálogo y las siluetas en la plantilla.
// Uso: node generar-catalogo.mjs && node construir-vista.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { SILUETAS } from './siluetas.mjs';
import { DEPARTAMENTOS } from './departamentos.mjs';
import { HOME, ES_SITIO, salida } from './enlaces.mjs';

const uiCss = readFileSync(new URL('./parciales/ui.css', import.meta.url), 'utf8');
const uiJs  = readFileSync(new URL('./parciales/ui.js', import.meta.url), 'utf8');
const catalogo = readFileSync(new URL('./catalogo.json', import.meta.url), 'utf8');
const plantilla = readFileSync(new URL('./vista.template.html', import.meta.url), 'utf8');

const html = plantilla
  .replace('/*__CATALOGO__*/ null', catalogo)
  .replace('/*__SILUETAS__*/ {}', JSON.stringify(SILUETAS))
  .replace('/*__DEPARTAMENTOS__*/ []', JSON.stringify(DEPARTAMENTOS))
  .replace('/*__UI_CSS__*/', uiCss)
  .replace('/*__UI_JS__*/', uiJs)
  .replaceAll('__HOME__', HOME);

// La demo lleva precios que no son reales: no puede entrar a Google bajo la
// marca. Solo aplica a la compilación --sitio; se quita cuando la tienda de
// verdad ocupe el dominio.
const pagina = ES_SITIO ? '<meta name="robots" content="noindex, nofollow">\n' + html : html;

const destino = new URL(salida('vista-catalogo.html', 'catalogo.html'), import.meta.url);
mkdirSync(new URL('./', destino), { recursive: true });
writeFileSync(destino, pagina, 'utf8');

console.log((ES_SITIO ? 'docs/catalogo.html' : 'vista-catalogo.html') + '  ' + (html.length / 1024).toFixed(0) + ' KB  ·  ' + JSON.parse(catalogo).total + ' productos incrustados');
for (const m of ['__CATALOGO__', '__SILUETAS__', '__HOME__']) {
  if (html.includes(m)) { console.error('AVISO: quedó sin sustituir ' + m); process.exit(1); }
}
