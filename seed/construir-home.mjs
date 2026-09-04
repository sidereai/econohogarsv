// Arma home.html incrustando el catálogo y las siluetas en la plantilla.
// Uso: node generar-catalogo.mjs && node construir-home.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { SILUETAS } from './siluetas.mjs';
import { DEPARTAMENTOS } from './departamentos.mjs';
import { PERSONAJES, CHISPAS, TRAZOS } from './personajes.mjs';
import { HOME, VITRINA, ES_FTP, salida } from './enlaces.mjs';

const uiCss = readFileSync(new URL('./parciales/ui.css', import.meta.url), 'utf8');
const uiJs  = readFileSync(new URL('./parciales/ui.js', import.meta.url), 'utf8');
const catalogo = readFileSync(new URL('./catalogo.json', import.meta.url), 'utf8');
const plantilla = readFileSync(new URL('./home.template.html', import.meta.url), 'utf8');

const html = plantilla
  .replace('/*__CATALOGO__*/ null', catalogo)
  .replace('/*__SILUETAS__*/ {}', JSON.stringify(SILUETAS))
  .replace('/*__DEPARTAMENTOS__*/ []', JSON.stringify(DEPARTAMENTOS))
  .replace("/*__CHISPA_JS__*/ ''", JSON.stringify(CHISPAS.estrella))
  .replace("/*__PERSONAJE_VACIO__*/ ''", JSON.stringify(PERSONAJES.lava))
  .replaceAll('__PERSONAJE_REFRI__', PERSONAJES.refri)
  .replaceAll('__PERSONAJE_LAVA__', PERSONAJES.lava)
  .replaceAll('__PERSONAJE_TELE__', PERSONAJES.tele)
  .replaceAll('__CHISPA_ESTRELLA__', CHISPAS.estrella)
  .replaceAll('__CHISPA_DESTELLO__', CHISPAS.destello)
  .replaceAll('__TRAZO_SUB__', TRAZOS.subrayado)
  .replaceAll('__TRAZO_RAYAS__', TRAZOS.rayas)
  .replaceAll('__VITRINA__', VITRINA)
  .replace('/*__UI_CSS__*/', uiCss)
  .replace('/*__UI_JS__*/', uiJs)
  .replaceAll('__HOME__', HOME);

// La demo lleva precios que no son reales: no puede entrar a Google bajo la
// marca. Solo aplica a la compilación --ftp; se quita cuando la tienda de
// verdad ocupe ese dominio.
const pagina = ES_FTP ? '<meta name="robots" content="noindex, nofollow">\n' + html : html;

const destino = new URL(salida('home.html', 'index.html'), import.meta.url);
mkdirSync(new URL('./', destino), { recursive: true });
writeFileSync(destino, pagina, 'utf8');

console.log((ES_FTP ? 'dist/index.html' : 'home.html') + '  ' + (html.length / 1024).toFixed(0) + ' KB  ·  ' + JSON.parse(catalogo).total + ' productos incrustados');
const marcadores = ['__CATALOGO__', '__SILUETAS__', '__VITRINA__', '__HOME__', '__CHISPA_JS__',
  '__PERSONAJE_REFRI__', '__PERSONAJE_LAVA__', '__PERSONAJE_TELE__',
  '__CHISPA_ESTRELLA__', '__CHISPA_DESTELLO__', '__TRAZO_SUB__', '__TRAZO_RAYAS__'];
for (const m of marcadores) {
  if (html.includes(m)) { console.error('AVISO: quedó sin sustituir ' + m); process.exit(1); }
}
