// "Los tres de EconoHogar" — los tres cuadros de color del logo convertidos en personajes.
// Estilo tomado de la referencia de app: volumen suave, cara simple, sombra al piso.
// Se dibujan con degradados SVG: cero imágenes externas, cero CDN, escalan sin perder nitidez.

const abre = (vb) => '<svg viewBox="' + vb + '" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';

export const PERSONAJES = {
  // Refrigeradora, en el rojo de la marca.
  refri: abre('0 0 200 215') +
    '<defs>' +
      '<linearGradient id="pr-b" x1="28%" y1="2%" x2="82%" y2="100%">' +
        '<stop offset="0" stop-color="#FF9E96"/><stop offset=".46" stop-color="#EE4A42"/><stop offset="1" stop-color="#BE201A"/></linearGradient>' +
      '<radialGradient id="pr-h" cx="34%" cy="20%" r="56%">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    '</defs>' +
    '<ellipse cx="100" cy="200" rx="56" ry="9" fill="#0F1D26" opacity=".14"/>' +
    '<rect x="30" y="96" width="21" height="50" rx="10.5" fill="#D62A23"/>' +
    '<g transform="rotate(-20 158 104)"><rect x="147" y="78" width="21" height="52" rx="10.5" fill="#D62A23"/></g>' +
    '<rect x="66" y="176" width="24" height="20" rx="9" fill="#A81813"/>' +
    '<rect x="110" y="176" width="24" height="20" rx="9" fill="#A81813"/>' +
    '<rect x="42" y="26" width="116" height="160" rx="34" fill="url(#pr-b)"/>' +
    '<rect x="42" y="26" width="116" height="160" rx="34" fill="url(#pr-h)"/>' +
    '<path d="M47 112h106" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>' +
    '<rect x="131" y="126" width="7" height="30" rx="3.5" fill="#fff" fill-opacity=".5"/>' +
    '<ellipse cx="66" cy="88" rx="12" ry="7.5" fill="#FFC4BE" opacity=".8"/>' +
    '<ellipse cx="134" cy="88" rx="12" ry="7.5" fill="#FFC4BE" opacity=".8"/>' +
    '<ellipse cx="82" cy="68" rx="8" ry="10.5" fill="#2B0A08"/>' +
    '<ellipse cx="118" cy="68" rx="8" ry="10.5" fill="#2B0A08"/>' +
    '<circle cx="85" cy="63.5" r="3" fill="#fff"/><circle cx="121" cy="63.5" r="3" fill="#fff"/>' +
    '<path d="M89 87q11 10 22 0" stroke="#2B0A08" stroke-width="3.6" stroke-linecap="round"/>' +
    '</svg>',

  // Lavadora, en el verde de la marca.
  lava: abre('0 0 200 215') +
    '<defs>' +
      '<linearGradient id="pl-b" x1="26%" y1="2%" x2="84%" y2="100%">' +
        '<stop offset="0" stop-color="#A8E6AD"/><stop offset=".46" stop-color="#4CAF50"/><stop offset="1" stop-color="#2A7A32"/></linearGradient>' +
      '<radialGradient id="pl-h" cx="32%" cy="18%" r="58%">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="pl-p" cx="38%" cy="32%" r="70%">' +
        '<stop offset="0" stop-color="#EAF9EC"/><stop offset="1" stop-color="#B4DCB8"/></radialGradient>' +
    '</defs>' +
    '<ellipse cx="100" cy="200" rx="56" ry="9" fill="#0F1D26" opacity=".14"/>' +
    '<g transform="rotate(22 42 108)"><rect x="31" y="82" width="21" height="52" rx="10.5" fill="#43A047"/></g>' +
    '<g transform="rotate(-22 158 108)"><rect x="148" y="82" width="21" height="52" rx="10.5" fill="#43A047"/></g>' +
    '<rect x="66" y="176" width="24" height="20" rx="9" fill="#256B2C"/>' +
    '<rect x="110" y="176" width="24" height="20" rx="9" fill="#256B2C"/>' +
    '<rect x="40" y="30" width="120" height="156" rx="32" fill="url(#pl-b)"/>' +
    '<rect x="40" y="30" width="120" height="156" rx="32" fill="url(#pl-h)"/>' +
    '<circle cx="100" cy="126" r="40" fill="#2A7A32" opacity=".38"/>' +
    '<circle cx="100" cy="124" r="35" fill="url(#pl-p)"/>' +
    '<path d="M74 130q13 11 26 0t26 0" stroke="#7EC084" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="60" cy="50" r="4.5" fill="#fff" fill-opacity=".6"/>' +
    '<circle cx="75" cy="50" r="4.5" fill="#fff" fill-opacity=".6"/>' +
    '<ellipse cx="64" cy="82" rx="11" ry="7" fill="#CFF0D2" opacity=".85"/>' +
    '<ellipse cx="136" cy="82" rx="11" ry="7" fill="#CFF0D2" opacity=".85"/>' +
    '<ellipse cx="82" cy="66" rx="8" ry="10.5" fill="#0B2B0F"/>' +
    '<ellipse cx="118" cy="66" rx="8" ry="10.5" fill="#0B2B0F"/>' +
    '<circle cx="85" cy="61.5" r="3" fill="#fff"/><circle cx="121" cy="61.5" r="3" fill="#fff"/>' +
    '<path d="M90 84q10 9 20 0" stroke="#0B2B0F" stroke-width="3.6" stroke-linecap="round"/>' +
    '</svg>',

  // Pantalla, en el azul de la marca.
  tele: abre('0 0 200 215') +
    '<defs>' +
      '<linearGradient id="pt-b" x1="24%" y1="4%" x2="86%" y2="100%">' +
        '<stop offset="0" stop-color="#8FD2F2"/><stop offset=".46" stop-color="#1E88C7"/><stop offset="1" stop-color="#0E4D72"/></linearGradient>' +
      '<radialGradient id="pt-h" cx="30%" cy="16%" r="60%">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".48"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="pt-s" x1="10%" y1="0%" x2="90%" y2="100%">' +
        '<stop offset="0" stop-color="#0B3D5C"/><stop offset="1" stop-color="#12557E"/></linearGradient>' +
    '</defs>' +
    '<ellipse cx="100" cy="196" rx="58" ry="9" fill="#0F1D26" opacity=".14"/>' +
    '<path d="M100 152v22" stroke="#0E4D72" stroke-width="13" stroke-linecap="round"/>' +
    '<rect x="60" y="172" width="80" height="16" rx="8" fill="#0E4D72"/>' +
    '<g transform="rotate(20 34 110)"><rect x="24" y="86" width="20" height="46" rx="10" fill="#1976AB"/></g>' +
    '<g transform="rotate(-20 166 110)"><rect x="156" y="86" width="20" height="46" rx="10" fill="#1976AB"/></g>' +
    '<rect x="22" y="38" width="156" height="118" rx="30" fill="url(#pt-b)"/>' +
    '<rect x="22" y="38" width="156" height="118" rx="30" fill="url(#pt-h)"/>' +
    '<rect x="40" y="56" width="120" height="82" rx="20" fill="url(#pt-s)"/>' +
    '<ellipse cx="78" cy="92" rx="9" ry="11.5" fill="#EAF6FD"/>' +
    '<ellipse cx="122" cy="92" rx="9" ry="11.5" fill="#EAF6FD"/>' +
    '<circle cx="81" cy="88" r="3.4" fill="#0B3D5C"/><circle cx="125" cy="88" r="3.4" fill="#0B3D5C"/>' +
    '<path d="M86 114q14 12 28 0" stroke="#EAF6FD" stroke-width="4" stroke-linecap="round"/>' +
    '<ellipse cx="58" cy="112" rx="10" ry="6.5" fill="#9CD8F5" opacity=".5"/>' +
    '<ellipse cx="142" cy="112" rx="10" ry="6.5" fill="#9CD8F5" opacity=".5"/>' +
    '</svg>',
};

// Chispas decorativas, en la línea de la referencia. Se colocan con CSS.
export const CHISPAS = {
  estrella: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c.7 6.4 4.9 10.6 12 12-7.1 1.4-11.3 5.6-12 12-.7-6.4-4.9-10.6-12-12C7.1 10.6 11.3 6.4 12 0Z"/></svg>',
  destello: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5 14.4 9l7.6 2.4-7.6 2.4L12 22.5 9.6 13.8 2 11.4 9.6 9 12 1.5Z"/></svg>',
};

// Marcas dibujadas a mano alrededor del número que importa: el mismo recurso
// que usa la referencia para subrayar el precio.
export const TRAZOS = {
  subrayado: '<svg viewBox="0 0 120 14" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><path d="M4 9c22-5 62-7 112-4"/></svg>',
  rayas: '<svg viewBox="0 0 40 46" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M34 6 22 15"/><path d="M36 23H21"/><path d="M32 40 21 32"/></svg>',
};
