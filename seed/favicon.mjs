// Genera el favicon a partir de una marca reducida del logo.
//
// El logo completo no sobrevive a 16 px: el contorno del techo se cierra y los
// tres cuadros se convierten en manchas. La reducción cambia dos cosas:
//   1. El techo pasa de contorno a trazo macizo. A tamaño chico el relleno
//      sobrevive y el contorno no.
//   2. Los tres cuadros se funden en una sola barra dividida en tres colores.
//      Tres formas separadas con espacio entre ellas desaparecen; una barra
//      continua conserva el trío verde-azul-rojo hasta 16 px.
//
// Sin dependencias: el PNG se arma con zlib de Node y el ICO envuelve ese PNG.
import { deflateSync } from 'node:zlib';

const ROJO  = [224, 49, 42];
const VERDE = [76, 175, 80];
const AZUL  = [30, 136, 199];

// Geometría en una retícula de 32×32; se escala para cualquier tamaño.
const TECHO = [[3.5, 17.6], [16, 5.4], [28.5, 17.6]];  // vértices del trazo
const GROSOR = 2.6;                                     // radio del trazo
const BARRA = { x0: 4, x1: 28, y0: 21, y1: 27.6, r: 2.2 };

// Distancia de un punto al segmento AB. Da esquinas y puntas redondeadas gratis.
function distSegmento(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Distancia al borde de un rectángulo redondeado (negativa adentro).
function distRect(px, py, { x0, x1, y0, y1, r }) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const hx = (x1 - x0) / 2 - r, hy = (y1 - y0) / 2 - r;
  const qx = Math.max(Math.abs(px - cx) - hx, 0), qy = Math.max(Math.abs(py - cy) - hy, 0);
  return Math.hypot(qx, qy) - r;
}

// Qué color le toca a un punto, o null si no hay tinta.
function tinta(x, y) {
  const enTecho = Math.min(
    distSegmento(x, y, TECHO[0], TECHO[1]),
    distSegmento(x, y, TECHO[1], TECHO[2]),
  ) <= GROSOR;
  if (enTecho) return ROJO;
  if (distRect(x, y, BARRA) <= 0) return x < 12 ? VERDE : x < 20 ? AZUL : ROJO;
  return null;
}

// Rasteriza con 3×3 muestras por píxel: sin suavizado, a 32 px se ve dentado.
function rasterizar(lado) {
  const px = new Uint8Array(lado * lado * 4);
  const escala = 32 / lado;
  const M = 3;
  for (let j = 0; j < lado; j++) {
    for (let i = 0; i < lado; i++) {
      let r = 0, g = 0, b = 0, cubiertas = 0;
      for (let sy = 0; sy < M; sy++) {
        for (let sx = 0; sx < M; sx++) {
          const c = tinta((i + (sx + 0.5) / M) * escala, (j + (sy + 0.5) / M) * escala);
          if (c) { r += c[0]; g += c[1]; b += c[2]; cubiertas++; }
        }
      }
      const k = (j * lado + i) * 4;
      if (cubiertas) {
        px[k] = r / cubiertas; px[k + 1] = g / cubiertas; px[k + 2] = b / cubiertas;
        px[k + 3] = Math.round((cubiertas / (M * M)) * 255);
      }
    }
  }
  return px;
}

// ---------- PNG ----------
const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xFFFFFFFF;
  for (const b of buf) c = TABLA_CRC[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
};
function trozo(tipo, datos) {
  const largo = Buffer.alloc(4); largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}
export function png(lado) {
  const px = rasterizar(lado);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(lado, 0); ihdr.writeUInt32BE(lado, 4);
  ihdr[8] = 8;   // 8 bits por canal
  ihdr[9] = 6;   // RGBA
  const filas = [];
  for (let j = 0; j < lado; j++) {
    filas.push(Buffer.from([0]));  // filtro 0: sin predicción
    filas.push(Buffer.from(px.subarray(j * lado * 4, (j + 1) * lado * 4)));
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(Buffer.concat(filas), { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- ICO ----------
// Un ICO moderno puede envolver un PNG tal cual, sin recodificar a BMP.
export function ico(lado = 32) {
  const datos = png(lado);
  const cab = Buffer.alloc(22);
  cab.writeUInt16LE(0, 0); cab.writeUInt16LE(1, 2); cab.writeUInt16LE(1, 4);
  cab[6] = lado % 256; cab[7] = lado % 256;
  cab.writeUInt16LE(1, 10); cab.writeUInt16LE(32, 12);
  cab.writeUInt32LE(datos.length, 14); cab.writeUInt32LE(22, 18);
  return Buffer.concat([cab, datos]);
}

// ---------- SVG ----------
// Misma geometría, pero vectorial: es la que usan los navegadores modernos.
export function svg() {
  const rgb = (c) => 'rgb(' + c.join(',') + ')';
  const p = TECHO.map((v) => v.join(' ')).join(' L ');
  const { x0, x1, y0, y1, r } = BARRA;
  const seg = (a, b, color) =>
    '<rect x="' + a + '" y="' + y0 + '" width="' + (b - a) + '" height="' + (y1 - y0) + '" fill="' + rgb(color) + '"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
    '<path d="M ' + p + '" fill="none" stroke="' + rgb(ROJO) + '" stroke-width="' + GROSOR * 2 +
      '" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<clipPath id="b"><rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) +
      '" height="' + (y1 - y0) + '" rx="' + r + '"/></clipPath>' +
    '<g clip-path="url(#b)">' + seg(x0, 12, VERDE) + seg(12, 20, AZUL) + seg(20, x1, ROJO) + '</g>' +
    '</svg>';
}

// Etiquetas para el <head>. Solo entran en la compilación --sitio: en los
// artifacts de claude.ai el ícono lo pone la plataforma.
export const ETIQUETAS =
  '<link rel="icon" href="favicon.svg" type="image/svg+xml">' +
  '<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">' +
  '<link rel="alternate icon" href="favicon.ico" sizes="32x32">' +
  '<link rel="apple-touch-icon" href="favicon-180.png">' +
  '<meta name="theme-color" content="#14618F">';
