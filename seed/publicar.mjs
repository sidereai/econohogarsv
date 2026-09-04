// Compila el sitio publicable en docs/ y lo revisa antes de dejarlo pasar.
// Lo corre GitHub Actions en cada push, y sirve igual en local:
//
//   node seed/publicar.mjs
//
// Sale con código 1 si algo está mal, para que el workflow falle antes de
// publicar en vez de dejar el sitio roto.
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const docs = new URL('../docs/', import.meta.url);
const aqui = new URL('./', import.meta.url);

const paso = (t) => console.log('· ' + t);
const fallas = [];

// ---------- 1. compilar ----------
// fileURLToPath y no pathname: en Windows el pathname trae el %20 de
// "Edwin Reyes" sin decodificar y la ruta no existe.
for (const guion of ['construir-vista.mjs', 'construir-home.mjs']) {
  execFileSync(process.execPath, [fileURLToPath(new URL(guion, aqui)), '--sitio'], { stdio: 'inherit' });
}

// ---------- 2. archivos que GitHub Pages necesita ----------
mkdirSync(docs, { recursive: true });
// Sin .nojekyll, Pages pasa el contenido por Jekyll y puede alterar archivos.
writeFileSync(new URL('./.nojekyll', docs), '');
// La demo lleva precios que no son reales: fuera de los buscadores.
writeFileSync(new URL('./robots.txt', docs), 'User-agent: *\nDisallow: /\n');
paso('.nojekyll y robots.txt escritos');

// ---------- 3. revisiones ----------
const paginas = ['index.html', 'catalogo.html'];
for (const nombre of paginas) {
  const ruta = new URL('./' + nombre, docs);
  if (!existsSync(ruta)) { fallas.push(nombre + ': no se generó'); continue; }
  const html = readFileSync(ruta, 'utf8');
  const kb = Math.round(html.length / 1024);

  if (kb < 200) fallas.push(nombre + ': solo ' + kb + ' KB, el catálogo no quedó incrustado');
  if (html.includes('claude.ai')) fallas.push(nombre + ': enlaza a claude.ai, faltó compilar con --sitio');
  if (!html.includes('noindex')) fallas.push(nombre + ': sin la etiqueta noindex');
  if (/__[A-Z_]+__/.test(html)) fallas.push(nombre + ': quedó un marcador sin sustituir');
  // Una ruta absoluta rompe el sitio, que vive en la subruta /econohogarsv/.
  const absolutas = [...html.matchAll(/href="(\/[^/][^"]*)"/g)].map((m) => m[1]);
  if (absolutas.length) fallas.push(nombre + ': rutas absolutas que romperían en la subruta → ' + absolutas.slice(0, 3).join(', '));

  paso(nombre + '  ' + kb + ' KB  ·  revisado');
}

if (fallas.length) {
  console.error('\nEl sitio NO está listo para publicar:');
  for (const f of fallas) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('\nSitio listo en docs/');
