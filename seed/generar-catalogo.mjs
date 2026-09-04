// Generador determinista de catálogo de ejemplo para econohogarsv.com
// Todo simulado. Sustituible por Open Icecat / Best Buy API cuando llegue la integración.
// Uso: node generar-catalogo.mjs
import { writeFileSync } from 'node:fs';

const SEMILLA = 20260903;
const TOTAL = 250;
const IVA = 0.13;

// ---------- PRNG determinista (mulberry32) ----------
function prng(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r = prng(SEMILLA);
const elegir = (arr) => arr[Math.floor(r() * arr.length)];
const entre = (a, b) => a + Math.floor(r() * (b - a + 1));
const quizas = (p) => r() < p;
// Sesgo hacia el extremo bajo del rango: los catálogos reales tienen más producto barato.
const sesgado = (min, max, exp = 1.9) => min + (max - min) * Math.pow(r(), exp);

// ---------- Precios con forma de etiqueta salvadoreña ----------
function precioRetail(v) {
  if (v >= 100) return Math.round(v / 10) * 10 - 1;   // 649, 1299
  return Math.round(v / 5) * 5 - 0.05;                 // 24.95, 39.95
}
const aCentavos = (v) => Math.round(v * 100);

// ---------- Marcas realmente presentes en El Salvador ----------
const BLANCA   = ['Whirlpool', 'Mabe', 'Frigidaire', 'LG', 'Samsung', 'Indurama', 'Atlas', 'Electrolux', 'Haier', 'Midea'];
const PEQUENA  = ['Oster', 'Black+Decker', 'Hamilton Beach', 'Sankey', 'Premium', 'Universal', 'Ninja', 'Imusa'];
const PANTALLA = ['Samsung', 'LG', 'TCL', 'Hisense', 'Philips', 'Sankey'];
const CLIMA    = ['LG', 'Samsung', 'Midea', 'Mabe', 'Carrier', 'Whirlpool', 'TCL'];

const COLORES = ['Blanco', 'Gris grafito', 'Acero inoxidable', 'Negro', 'Silver'];
const EFIC = ['A++', 'A+', 'A', 'B'];

const CATEGORIAS = [
  {
    slug: 'refrigeradoras', nombre: 'Refrigeradoras', icono: 'refrigeradora', peso: 10,
    clase: 'voluminoso', garantia: 24, instalacion: false, precio: [349, 1899], marcas: BLANCA,
    specs() {
      // La capacidad depende del formato: no existe una French Door de 9 pies³.
      const tipo = elegir(['Top Mount', 'Bottom Mount', 'Side by Side', 'French Door']);
      const capacidadPorTipo = {
        'Top Mount': [9, 11, 12, 14, 16, 18],
        'Bottom Mount': [11, 12, 14, 16, 18],
        'Side by Side': [21, 25, 28],
        'French Door': [21, 25, 28],
      };
      return {
        capacidad_pies3: elegir(capacidadPorTipo[tipo]), tipo,
        no_frost: quizas(0.8), dispensador_agua: quizas(0.35), color: elegir(COLORES),
        eficiencia: elegir(EFIC), voltaje: '110V',
      };
    },
    titulo(s, m) { return 'Refrigeradora ' + m + ' ' + s.tipo + ' ' + s.capacidad_pies3 + ' pies³' + (s.no_frost ? ' No Frost' : ''); },
  },
  {
    slug: 'lavadoras', nombre: 'Lavadoras', icono: 'lavadora', peso: 9,
    clase: 'voluminoso', garantia: 24, instalacion: true, precio: [299, 1199], marcas: BLANCA,
    specs() {
      return {
        capacidad_libras: elegir([16, 18, 20, 22, 25, 28, 32]), tipo: elegir(['Carga superior', 'Carga frontal']),
        rpm_centrifugado: elegir([700, 800, 1000, 1200, 1400]), programas: entre(6, 16),
        color: elegir(COLORES), voltaje: '110V',
      };
    },
    titulo(s, m) { return 'Lavadora ' + m + ' ' + s.tipo + ' ' + s.capacidad_libras + ' libras'; },
  },
  {
    slug: 'secadoras', nombre: 'Secadoras', icono: 'lavadora', peso: 5,
    clase: 'voluminoso', garantia: 24, instalacion: true, precio: [349, 999], marcas: BLANCA,
    specs() {
      return {
        capacidad_libras: elegir([16, 18, 20, 22, 26]), tipo: elegir(['Eléctrica', 'A gas']),
        programas: entre(4, 12), color: elegir(COLORES), voltaje: elegir(['110V', '220V']),
      };
    },
    titulo(s, m) { return 'Secadora ' + m + ' ' + s.tipo + ' ' + s.capacidad_libras + ' libras'; },
  },
  {
    slug: 'estufas', nombre: 'Estufas y cocinas', icono: 'estufa', peso: 8,
    clase: 'voluminoso', garantia: 24, instalacion: true, precio: [229, 899], marcas: BLANCA,
    specs() {
      return {
        ancho_pulgadas: elegir([20, 24, 30, 36]), hornillas: elegir([4, 5, 6]),
        tipo: elegir(['A gas', 'Eléctrica', 'Mixta']), horno_litros: elegir([45, 60, 72, 90]),
        encendido_electrico: quizas(0.7), color: elegir(COLORES),
      };
    },
    titulo(s, m) { return 'Estufa ' + m + ' ' + s.tipo + ' ' + s.ancho_pulgadas + '" · ' + s.hornillas + ' hornillas'; },
  },
  {
    slug: 'congeladores', nombre: 'Congeladores', icono: 'congelador', peso: 4,
    clase: 'voluminoso', garantia: 24, instalacion: false, precio: [299, 799], marcas: BLANCA,
    specs() {
      return {
        capacidad_pies3: elegir([5, 7, 9, 11, 14, 17, 21]), tipo: elegir(['Horizontal', 'Vertical']),
        canastas: entre(1, 3), eficiencia: elegir(EFIC), color: elegir(['Blanco', 'Gris grafito']),
      };
    },
    titulo(s, m) { return 'Congelador ' + m + ' ' + s.tipo + ' ' + s.capacidad_pies3 + ' pies³'; },
  },
  {
    slug: 'aires-acondicionados', nombre: 'Aires acondicionados', icono: 'aire', peso: 9,
    clase: 'voluminoso', garantia: 24, instalacion: true, precio: [329, 1249], marcas: CLIMA,
    specs() {
      // Los equipos de ventana no pasan de 18k BTU; arriba de eso solo hay split.
      const tipo = elegir(['Split', 'Split', 'De ventana']);
      const btu = tipo === 'De ventana' ? elegir([9000, 12000, 18000]) : elegir([9000, 12000, 18000, 24000, 36000]);
      return {
        btu, tipo, inverter: tipo === 'De ventana' ? false : quizas(0.7),
        seer: elegir([13, 16, 19, 21]), area_recomendada_m2: Math.round(btu / 600),
        voltaje: btu >= 18000 ? '220V' : '110V',
      };
    },
    titulo(s, m) { return 'Aire acondicionado ' + m + ' ' + s.tipo + ' ' + s.btu.toLocaleString('es-SV') + ' BTU' + (s.inverter ? ' Inverter' : ''); },
  },
  {
    slug: 'televisores', nombre: 'Televisores', icono: 'television', peso: 12,
    clase: 'mediano', garantia: 12, instalacion: true, precio: [139, 1499], marcas: PANTALLA,
    specs() {
      const p = elegir([32, 40, 43, 50, 55, 58, 65, 70, 75, 85]);
      return {
        pulgadas: p, resolucion: p <= 40 ? 'HD / Full HD' : elegir(['4K UHD', '4K UHD', '8K']),
        panel: elegir(['LED', 'QLED', 'OLED', 'Mini LED']), smart_tv: true,
        sistema: elegir(['Google TV', 'webOS', 'Tizen', 'Roku TV']), hz: elegir([60, 60, 120]),
      };
    },
    titulo(s, m) { return 'Televisor ' + m + ' ' + s.panel + ' ' + s.pulgadas + '" ' + s.resolucion + ' ' + s.sistema; },
  },
  {
    slug: 'microondas', nombre: 'Microondas', icono: 'microondas', peso: 6,
    clase: 'mediano', garantia: 12, instalacion: false, precio: [79, 349],
    marcas: BLANCA.slice(0, 6).concat(PEQUENA.slice(0, 4)),
    specs() {
      return {
        capacidad_litros: elegir([17, 20, 23, 25, 30, 34]), potencia_watts: elegir([700, 900, 1000, 1200]),
        tipo: elegir(['De mesa', 'Empotrable']), grill: quizas(0.4), color: elegir(COLORES),
      };
    },
    titulo(s, m) { return 'Microondas ' + m + ' ' + s.tipo + ' ' + s.capacidad_litros + ' L · ' + s.potencia_watts + 'W'; },
  },
  {
    slug: 'licuadoras', nombre: 'Licuadoras', icono: 'licuadora', peso: 7,
    clase: 'pequeno', garantia: 12, instalacion: false, precio: [24, 199], marcas: PEQUENA,
    specs() {
      return {
        potencia_watts: elegir([400, 600, 700, 900, 1200, 1500]), capacidad_litros: elegir([1.25, 1.5, 1.75, 2]),
        velocidades: elegir([2, 3, 5, 10, 12]), material_vaso: elegir(['Vidrio', 'Plástico Tritan']),
        cuchillas: elegir([4, 6]),
      };
    },
    titulo(s, m) { return 'Licuadora ' + m + ' ' + s.potencia_watts + 'W vaso de ' + s.material_vaso.toLowerCase() + ' ' + s.capacidad_litros + ' L'; },
  },
  {
    slug: 'ventiladores', nombre: 'Ventiladores', icono: 'ventilador', peso: 6,
    clase: 'mediano', garantia: 12, instalacion: false, precio: [19, 149], marcas: PEQUENA,
    specs() {
      return {
        tipo: elegir(['De pedestal', 'De torre', 'De pared', 'De mesa']), pulgadas: elegir([12, 16, 18, 20]),
        velocidades: elegir([3, 3, 5]), control_remoto: quizas(0.4), temporizador: quizas(0.5),
      };
    },
    titulo(s, m) { return 'Ventilador ' + m + ' ' + s.tipo + ' ' + s.pulgadas + '"'; },
  },
  {
    slug: 'freidoras-de-aire', nombre: 'Freidoras de aire', icono: 'freidora', peso: 5,
    clase: 'pequeno', garantia: 12, instalacion: false, precio: [49, 249], marcas: PEQUENA,
    specs() {
      return {
        capacidad_litros: elegir([2.5, 3.5, 4, 5.5, 7, 8]), potencia_watts: elegir([1200, 1500, 1700]),
        programas: entre(4, 12), canasta_doble: quizas(0.25), pantalla: elegir(['Digital', 'Perilla']),
      };
    },
    titulo(s, m) { return 'Freidora de aire ' + m + ' ' + s.capacidad_litros + ' L' + (s.canasta_doble ? ' canasta doble' : ''); },
  },
  {
    slug: 'planchas', nombre: 'Planchas', icono: 'plancha', peso: 4,
    clase: 'pequeno', garantia: 12, instalacion: false, precio: [12, 89], marcas: PEQUENA,
    specs() {
      return {
        potencia_watts: elegir([1200, 1400, 1600, 1800, 2400]), tipo: elegir(['De vapor', 'Seca', 'Vertical']),
        suela: elegir(['Cerámica', 'Antiadherente', 'Acero inoxidable']), autoapagado: quizas(0.5),
      };
    },
    titulo(s, m) { return 'Plancha ' + m + ' ' + s.tipo.toLowerCase() + ' ' + s.potencia_watts + 'W suela de ' + s.suela.toLowerCase(); },
  },
  {
    slug: 'ollas-y-arroceras', nombre: 'Ollas y arroceras', icono: 'olla', peso: 5,
    clase: 'pequeno', garantia: 12, instalacion: false, precio: [24, 179], marcas: PEQUENA,
    specs() {
      return {
        tipo: elegir(['Arrocera', 'De presión eléctrica', 'Multiusos']),
        capacidad_litros: elegir([1.8, 3, 4, 5, 6, 8]), potencia_watts: elegir([500, 700, 900, 1000]),
        programas: entre(3, 14), olla_antiadherente: quizas(0.8),
      };
    },
    titulo(s, m) { return 'Olla ' + m + ' ' + s.tipo.toLowerCase() + ' ' + s.capacidad_litros + ' L'; },
  },
  {
    slug: 'aspiradoras', nombre: 'Aspiradoras', icono: 'aspiradora', peso: 5,
    clase: 'mediano', garantia: 12, instalacion: false, precio: [49, 499], marcas: PEQUENA,
    specs() {
      return {
        tipo: elegir(['De arrastre', 'Vertical', 'Inalámbrica', 'Robot']),
        potencia_watts: elegir([600, 1000, 1400, 1800]), capacidad_litros: elegir([1, 1.5, 2, 3.5]),
        filtro_hepa: quizas(0.55), con_cable: quizas(0.6),
      };
    },
    titulo(s, m) { return 'Aspiradora ' + m + ' ' + s.tipo.toLowerCase() + (s.filtro_hepa ? ' con filtro HEPA' : ''); },
  },
  {
    slug: 'filtros-de-agua', nombre: 'Filtros y purificadores', icono: 'filtro', peso: 5,
    clase: 'mediano', garantia: 12, instalacion: true, precio: [39, 349],
    marcas: PEQUENA.slice(0, 4).concat(['Whirlpool', 'LG']),
    specs() {
      return {
        tipo: elegir(['Dispensador', 'Purificador de encimera', 'Filtro bajo lavatrastos', 'Ósmosis inversa']),
        etapas_filtrado: elegir([1, 2, 3, 5]), capacidad_litros: elegir([2, 5, 8, 12, 20]),
        frio_caliente: quizas(0.35),
      };
    },
    titulo(s, m) { return s.tipo + ' ' + m + ' ' + s.etapas_filtrado + ' etapa' + (s.etapas_filtrado > 1 ? 's' : ''); },
  },
];

// ---------- El precio sigue al tamaño ----------
// Sin esto salen televisores de 85" a $189. La posición dentro del rango de precio de
// la categoría se decide en su mayoría por la especificación que manda, no al azar.
const norm = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));
const NIVEL = {
  'refrigeradoras': (s) => norm(s.capacidad_pies3, 9, 28),
  'lavadoras': (s) => norm(s.capacidad_libras, 16, 32),
  'secadoras': (s) => norm(s.capacidad_libras, 16, 26),
  'estufas': (s) => norm(s.ancho_pulgadas, 20, 36),
  'congeladores': (s) => norm(s.capacidad_pies3, 5, 21),
  'aires-acondicionados': (s) => norm(s.btu, 9000, 36000) * (s.inverter ? 1 : 0.85),
  'televisores': (s) => norm(s.pulgadas, 32, 85) * (s.panel === 'OLED' ? 1 : s.panel === 'QLED' ? 0.9 : 0.78),
  'microondas': (s) => norm(s.capacidad_litros, 17, 34),
  'licuadoras': (s) => norm(s.potencia_watts, 400, 1500),
  'ventiladores': (s) => norm(s.pulgadas, 12, 20),
  'freidoras-de-aire': (s) => norm(s.capacidad_litros, 2.5, 8),
  'planchas': (s) => norm(s.potencia_watts, 1200, 2400),
  'ollas-y-arroceras': (s) => norm(s.capacidad_litros, 1.8, 8),
  'aspiradoras': (s) => norm(s.potencia_watts, 600, 1800),
  'filtros-de-agua': (s) => norm(s.etapas_filtrado, 1, 5),
};

// ---------- Ubicaciones y zonas ----------
const UBICACIONES = [
  { id: 'bodega-central', nombre: 'Bodega central', departamento: 'San Salvador', tipo: 'bodega' },
  { id: 'sala-ventas', nombre: 'Sala de ventas Soyapango', departamento: 'San Salvador', tipo: 'tienda' },
];

const DEPARTAMENTOS = ['Ahuachapán', 'Santa Ana', 'Sonsonate', 'Chalatenango', 'La Libertad', 'San Salvador',
  'Cuscatlán', 'La Paz', 'Cabañas', 'San Vicente', 'Usulután', 'San Miguel', 'Morazán', 'La Unión'];
const METRO = ['San Salvador', 'La Libertad'];
const LEJANOS = ['Morazán', 'La Unión', 'Cabañas', 'Chalatenango'];

const zonasEnvio = DEPARTAMENTOS.map((dep) => {
  const esMetro = METRO.includes(dep);
  const lejano = LEJANOS.includes(dep);
  return {
    departamento: dep,
    metodo_preferente: esMetro ? 'entrega_propia' : 'courier',
    tarifas_centavos: {
      pequeno: esMetro ? 350 : (lejano ? 750 : 550),
      mediano: esMetro ? 800 : (lejano ? 2200 : 1500),
      voluminoso: esMetro ? 2500 : (lejano ? 8500 : 5500),
    },
    // Válvula contra pedidos que pierden plata: ver la sección de logística del documento.
    voluminoso_excluido: ['Morazán', 'La Unión'].includes(dep),
    dias_habiles: esMetro ? 1 : (lejano ? 5 : 3),
  };
});

// ---------- Generación ----------
const pesoTotal = CATEGORIAS.reduce((s, c) => s + c.peso, 0);
const productos = [];
let n = 0;

for (const cat of CATEGORIAS) {
  const cuantos = Math.round((cat.peso / pesoTotal) * TOTAL);
  for (let i = 0; i < cuantos; i++) {
    const marca = elegir(cat.marcas);
    const specs = cat.specs();
    const titulo = cat.titulo(specs, marca);

    // 62 % del precio lo decide el tamaño del producto, 38 % la marca y el acabado.
    const nivel = NIVEL[cat.slug] ? NIVEL[cat.slug](specs) : r();
    const pos = 0.62 * nivel + 0.38 * Math.pow(r(), 1.4);
    const precio = precioRetail(cat.precio[0] + (cat.precio[1] - cat.precio[0]) * pos);
    const conIva = aCentavos(precio);
    const neto = Math.round(conIva / (1 + IVA));

    const tieneDesc = quizas(0.45);
    const descPct = tieneDesc ? entre(8, 35) : 0;
    const lista = tieneDesc ? aCentavos(precioRetail(precio / (1 - descPct / 100))) : null;

    // Distribución de existencias que ejercita los casos límite del modelo de reservas.
    const dado = r();
    const totalStock = dado < 0.10 ? 0 : dado < 0.30 ? entre(1, 2) : dado < 0.85 ? entre(3, 25) : entre(26, 60);
    const enTienda = totalStock === 0 ? 0 : Math.min(totalStock, entre(0, Math.ceil(totalStock / 3)));

    const prefijo = cat.slug.slice(0, 3).toUpperCase();
    const codMarca = marca.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
    n++;

    productos.push({
      sku: prefijo + '-' + codMarca + '-' + String(n).padStart(4, '0'),
      slug: titulo.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) + '-' + n,
      nombre: titulo,
      marca,
      modelo: codMarca + entre(100, 9999) + elegir(['', 'A', 'X', 'S', 'TF', 'GW']),
      categoria: cat.slug,
      icono: cat.icono,
      clase_envio: cat.clase,
      precio_centavos: conIva,
      precio_neto_centavos: neto,
      iva_centavos: conIva - neto,
      precio_lista_centavos: lista,
      descuento_pct: descPct,
      cuota_12_centavos: Math.round(conIva / 12),
      garantia_meses: cat.garantia,
      instalacion_disponible: cat.instalacion,
      envio_gratis: conIva >= 24900,
      specs,
      stock: [
        { ubicacion: 'bodega-central', cantidad: totalStock - enTienda },
        { ubicacion: 'sala-ventas', cantidad: enTienda },
      ],
      vendidos: totalStock === 0 ? entre(5, 90) : Math.max(0, Math.round((3000 / precio) * r() * 6)),
      calificacion: Math.round((3.4 + r() * 1.6) * 10) / 10,
      resenas: entre(0, 180),
    });
  }
}

const salida = {
  _aviso: 'CATÁLOGO SIMULADO. Datos generados, no corresponden a inventario ni precios reales.',
  generado: new Date().toISOString().slice(0, 10),
  semilla: SEMILLA,
  moneda: 'USD',
  iva: IVA,
  total: productos.length,
  categorias: CATEGORIAS.map((c) => ({ slug: c.slug, nombre: c.nombre, icono: c.icono, clase_envio: c.clase })),
  ubicaciones: UBICACIONES,
  zonas_envio: zonasEnvio,
  productos,
};

writeFileSync(new URL('./catalogo.json', import.meta.url), JSON.stringify(salida, null, 2), 'utf8');

const sinStock = productos.filter((p) => p.stock.reduce((s, x) => s + x.cantidad, 0) === 0).length;
const conDesc = productos.filter((p) => p.descuento_pct > 0).length;
const precios = productos.map((p) => p.precio_centavos);
console.log('catalogo.json  ' + productos.length + ' productos en ' + CATEGORIAS.length + ' categorias');
console.log('  sin existencias: ' + sinStock + '   con descuento: ' + conDesc);
console.log('  precio min $' + (Math.min(...precios) / 100).toFixed(2) + '   max $' + (Math.max(...precios) / 100).toFixed(2));
