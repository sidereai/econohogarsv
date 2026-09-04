// Siluetas de línea, una por familia de producto. Sustituyen a la fotografía
// mientras el catálogo esté simulado: nada de imágenes de terceros ni CDN.
const S = (d) => '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';

export const SILUETAS = {
  todo: S('<rect x="16" y="16" width="30" height="30" rx="4"/><rect x="54" y="16" width="30" height="30" rx="4"/><rect x="16" y="54" width="30" height="30" rx="4"/><rect x="54" y="54" width="30" height="30" rx="4"/>'),

  refrigeradora: S('<rect x="28" y="10" width="44" height="80" rx="5"/><path d="M28 40h44"/><path d="M63 24v10"/><path d="M63 48v12"/>'),

  lavadora: S('<rect x="20" y="12" width="60" height="76" rx="5"/><circle cx="50" cy="58" r="18"/><circle cx="50" cy="58" r="7"/><path d="M30 26h5"/><path d="M44 26h5"/>'),

  estufa: S('<rect x="14" y="20" width="72" height="22" rx="4"/><circle cx="31" cy="31" r="4.5"/><circle cx="45" cy="31" r="4.5"/><circle cx="59" cy="31" r="4.5"/><circle cx="73" cy="31" r="4.5"/><rect x="14" y="46" width="72" height="40" rx="4"/><path d="M24 56h52"/>'),

  congelador: S('<rect x="12" y="36" width="76" height="46" rx="5"/><path d="M12 50h76"/><path d="M64 43h12"/>'),

  aire: S('<rect x="12" y="22" width="76" height="26" rx="7"/><path d="M20 40h60"/><path d="M28 62c6 6 12 6 18 0"/><path d="M52 62c6 6 12 6 18 0"/><path d="M28 76c6 6 12 6 18 0"/><path d="M52 76c6 6 12 6 18 0"/>'),

  television: S('<rect x="10" y="18" width="80" height="52" rx="5"/><path d="M50 70v10"/><path d="M32 82h36"/>'),

  microondas: S('<rect x="10" y="26" width="80" height="46" rx="5"/><rect x="18" y="34" width="44" height="30" rx="3"/><path d="M72 36v8"/><circle cx="72" cy="58" r="4"/>'),

  licuadora: S('<path d="M38 66 42 22h16l4 44Z"/><path d="M39 20h22"/><path d="M36 66h28l4 20H32Z"/><path d="M40 76h8"/>'),

  ventilador: S('<circle cx="50" cy="40" r="26"/><circle cx="50" cy="40" r="7"/><path d="M50 14v12"/><path d="M72 53 61 46"/><path d="M28 53 39 46"/><path d="M50 66v18"/><path d="M36 86h28"/>'),

  freidora: S('<rect x="24" y="20" width="52" height="68" rx="9"/><path d="M24 58h52"/><path d="M42 72h16"/><circle cx="50" cy="36" r="6"/>'),

  plancha: S('<path d="M16 74h58l10-14H26Z"/><path d="M30 58c4-20 36-20 40 0"/><path d="M22 82h56"/>'),

  olla: S('<rect x="26" y="42" width="48" height="38" rx="5"/><path d="M18 38h64"/><path d="M50 38V28"/><circle cx="50" cy="24" r="5"/><path d="M26 54H14"/><path d="M74 54h12"/>'),

  aspiradora: S('<rect x="18" y="52" width="46" height="32" rx="11"/><circle cx="30" cy="84" r="5"/><circle cx="54" cy="84" r="5"/><path d="M62 62c20-6 18-32 2-38"/><path d="M58 20h14"/>'),

  filtro: S('<rect x="30" y="14" width="40" height="56" rx="5"/><path d="M30 42h40"/><path d="M70 56h9v10"/><rect x="24" y="74" width="52" height="10" rx="3"/>'),
};
