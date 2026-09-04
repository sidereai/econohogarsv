// Destino de la compilación. Sin bandera arma para los artifacts de Claude;
// con --ftp arma rutas relativas para subir a un hosting estático.
//
//   node construir-home.mjs         → enlaza a los artifacts publicados
//   node construir-home.mjs --ftp   → enlaza a index.html / catalogo.html
const ftp = process.argv.includes('--ftp');

export const ES_FTP = ftp;
export const HOME    = ftp ? 'index.html'    : 'https://claude.ai/code/artifact/349d67cd-17f5-4b49-8a08-e2eae9822aba';
export const VITRINA = ftp ? 'catalogo.html' : 'https://claude.ai/code/artifact/4c0586b1-9246-422e-a04a-730e82daf7a9';

// Carpeta de salida: dist/ para FTP, raíz del proyecto para los artifacts.
export const salida = (nombreArtifact, nombreFtp) =>
  ftp ? '../dist/' + nombreFtp : '../' + nombreArtifact;
