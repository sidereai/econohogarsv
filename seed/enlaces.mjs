// Destino de la compilación.
//
//   node construir-home.mjs           → enlaza a los artifacts de claude.ai
//   node construir-home.mjs --sitio   → rutas relativas, salida en docs/
//
// docs/ es lo que publica GitHub Pages en sidereai.github.io/econohogarsv/.
// Las rutas son relativas justamente porque el sitio vive en una subruta,
// no en la raíz de un dominio.
const sitio = process.argv.includes('--sitio');

export const ES_SITIO = sitio;
export const HOME    = sitio ? 'index.html'    : 'https://claude.ai/code/artifact/349d67cd-17f5-4b49-8a08-e2eae9822aba';
export const VITRINA = sitio ? 'catalogo.html' : 'https://claude.ai/code/artifact/4c0586b1-9246-422e-a04a-730e82daf7a9';

export const salida = (nombreArtifact, nombreSitio) =>
  sitio ? '../docs/' + nombreSitio : '../' + nombreArtifact;
