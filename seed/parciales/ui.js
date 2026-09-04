/* ============================================================
   Ficha de producto (vidrio) + carrito.
   Compartido por la home y el catálogo.
   Espera del anfitrión: DATOS, SILUETAS, $, fmt, esc, stockTotal.
   ============================================================ */

// Pares de color para el halo detrás del vidrio. Salen de la marca:
// verde y azul. El rojo no entra — sigue reservado al precio.
const AURAS = [['#63C46B', '#3FA0D8'], ['#4FA8DC', '#7ED08A'], ['#89A9BA', '#63C46B']];
const auraDe = (p) => AURAS[DATOS.productos.indexOf(p) % AURAS.length];

const prod = (sku) => DATOS.productos.find((x) => x.sku === sku);

const ICO = {
  garantia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
  envio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8h11v9H2z"/><path d="M13 11h4l4 4v2h-8z"/><circle cx="6.5" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/></svg>',
  instalacion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3 6 14h5l-1 7 8-11h-5Z"/></svg>',
  caja: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/></svg>',
};

const ETIQ = {
  capacidad_pies3: 'Capacidad', capacidad_libras: 'Capacidad', capacidad_litros: 'Capacidad',
  tipo: 'Tipo', no_frost: 'No Frost', dispensador_agua: 'Dispensador de agua', color: 'Color',
  eficiencia: 'Eficiencia energética', voltaje: 'Voltaje', rpm_centrifugado: 'Centrifugado',
  programas: 'Programas', ancho_pulgadas: 'Ancho', hornillas: 'Hornillas', horno_litros: 'Horno',
  encendido_electrico: 'Encendido eléctrico', canastas: 'Canastas', btu: 'Capacidad',
  inverter: 'Inverter', seer: 'SEER', area_recomendada_m2: 'Área recomendada', pulgadas: 'Pantalla',
  resolucion: 'Resolución', panel: 'Panel', smart_tv: 'Smart TV', sistema: 'Sistema',
  hz: 'Frecuencia', potencia_watts: 'Potencia', grill: 'Grill', velocidades: 'Velocidades',
  material_vaso: 'Vaso', cuchillas: 'Cuchillas', control_remoto: 'Control remoto',
  temporizador: 'Temporizador', canasta_doble: 'Canasta doble', pantalla: 'Pantalla',
  suela: 'Suela', autoapagado: 'Apagado automático', olla_antiadherente: 'Olla antiadherente',
  filtro_hepa: 'Filtro HEPA', con_cable: 'Con cable', etapas_filtrado: 'Etapas de filtrado',
  frio_caliente: 'Frío / caliente',
};
const UNI = {
  capacidad_pies3: ' pies³', capacidad_libras: ' lb', capacidad_litros: ' L', btu: ' BTU',
  ancho_pulgadas: '"', pulgadas: '"', potencia_watts: ' W', horno_litros: ' L',
  rpm_centrifugado: ' rpm', area_recomendada_m2: ' m²', hz: ' Hz',
};
const valSpec = (k, v) => typeof v === 'boolean' ? (v ? 'Sí' : 'No')
  : (typeof v === 'number' ? v.toLocaleString('en-US') : v) + (UNI[k] || '');

// ---------- las superficies se crean al vuelo: las plantillas no las declaran ----------
function montarSuperficies(){
  if ($('detalle')) return;
  const frag = document.createElement('div');
  frag.innerHTML =
    '<dialog id="detalle" class="vidrio"><div class="vaso"><div class="vaso-in" id="detalleIn"></div></div></dialog>' +
    '<dialog id="carrito" class="vidrio carrito"><div class="vaso"><div class="vaso-in" id="carritoIn"></div></div></dialog>' +
    '<div class="tostada" id="tostada" role="status" aria-live="polite"></div>';
  while (frag.firstChild) document.body.appendChild(frag.firstChild);

  [['detalle'], ['carrito']].forEach(([id]) =>
    $(id).addEventListener('click', (e) => { if (e.target.id === id) $(id).close(); }));
}

let temporizadorTostada;
function tostada(txt){
  const t = $('tostada');
  t.textContent = txt;
  t.classList.add('ver');
  clearTimeout(temporizadorTostada);
  temporizadorTostada = setTimeout(() => t.classList.remove('ver'), 2200);
}

// ============================================================
// FICHA DE PRODUCTO
// ============================================================
function abrir(sku){
  const p = prod(sku);
  const st = stockTotal(p);
  const enCarro = cantidadEnCarrito(sku);
  const [a, b] = auraDe(p);

  const specs = Object.entries(p.specs)
    .map(([k, v]) => '<tr><td>' + esc(ETIQ[k] || k) + '</td><td>' + esc(valSpec(k, v)) + '</td></tr>').join('');

  const existencias = p.stock.map((s) => {
    const u = DATOS.ubicaciones.find((x) => x.id === s.ubicacion);
    return '<tr><td>' + esc(u.nombre) + '</td><td>' + s.cantidad + '</td></tr>';
  }).join('');

  const envios = DATOS.zonas_envio.map((z) => {
    const excl = p.clase_envio === 'voluminoso' && z.voluminoso_excluido;
    return '<tr><td>' + esc(z.departamento) + '</td><td>' +
      (excl ? '<span class="no-disp">No despachamos</span>' : fmt(z.tarifas_centavos[p.clase_envio]) + ' · ' + z.dias_habiles + ' días') +
      '</td></tr>';
  }).join('');

  const past = (clase, ico, titulo, sub) =>
    '<div class="past"><span class="ico ' + clase + '">' + ico + '</span><div><b>' + titulo + '</b><span>' + sub + '</span></div></div>';

  $('detalleIn').innerHTML =
    '<div class="f-cab">' +
      '<div class="f-foto">' + (SILUETAS[p.icono] || '') + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div class="f-marca">' + esc(p.marca) + ' · ' + esc(p.modelo) + '</div>' +
        '<h2>' + esc(p.nombre) + '</h2>' +
        '<div class="f-sub">' + esc(p.sku) + ' · ' + p.vendidos + ' vendidas</div>' +
      '</div>' +
      '<button class="f-cerrar" type="button" id="fCerrar" aria-label="Cerrar">✕</button>' +
    '</div>' +

    '<div class="f-pastillas">' +
      past('v', ICO.garantia, p.garantia_meses + ' meses', 'Garantía de fábrica') +
      past('a', ICO.envio, p.envio_gratis ? 'Envío gratis' : 'Envío según zona', 'Clase ' + p.clase_envio) +
      past(p.instalacion_disponible ? 'r' : 'a', ICO.instalacion,
        p.instalacion_disponible ? 'Con instalación' : 'Listo para usar',
        p.instalacion_disponible ? 'Se factura aparte' : 'No requiere instalación') +
      past('v', ICO.caja, st === 0 ? 'Agotado' : st <= 2 ? 'Últimas ' + st : st + ' disponibles',
        st === 0 ? 'Sin existencias' : 'En bodega y sala') +
    '</div>' +

    '<div class="f-precio">' +
      '<div><span class="et">Precio con IVA</span>' +
        '<span class="val">' + fmt(p.precio_centavos) + '</span>' +
        (p.precio_lista_centavos ? '<span class="antes">' + fmt(p.precio_lista_centavos) + '</span>' : '') +
        (p.precio_centavos >= 15000 ? '<div class="cuota">o ' + fmt(p.cuota_12_centavos) + ' × 12 cuotas</div>' : '') +
      '</div>' +
      (p.descuento_pct ? '<span class="pct">−' + p.descuento_pct + '%</span>' : '') +
    '</div>' +

    '<div class="f-cuerpo">' +
      '<h3>Ficha técnica</h3><div class="f-tabla"><table>' + specs + '</table></div>' +
      '<h3>Desglose fiscal</h3><div class="f-tabla"><table>' +
        '<tr><td>Precio neto</td><td>' + fmt(p.precio_neto_centavos) + '</td></tr>' +
        '<tr><td>IVA 13 %</td><td>' + fmt(p.iva_centavos) + '</td></tr>' +
        '<tr><td>Total</td><td>' + fmt(p.precio_centavos) + '</td></tr>' +
      '</table></div>' +
      '<h3>Disponibilidad</h3><div class="f-tabla"><table>' + existencias + '</table></div>' +
      '<h3>Envío por departamento</h3><div class="f-tabla f-envio"><table>' + envios + '</table></div>' +
    '</div>' +

    '<div class="f-pie">' +
      '<button class="f-btn carro" type="button" id="fCarro"' + (st === 0 || enCarro >= st ? ' disabled' : '') + '>' +
        (st === 0 ? 'Sin existencias' : enCarro >= st ? 'Ya llevás las ' + st : enCarro ? 'Agregar otra (' + enCarro + ')' : 'Agregar al carrito') +
      '</button>' +
      '<button class="f-btn comprar" type="button" id="fComprar"' + (st === 0 ? ' disabled' : '') + '>' +
        (st === 0 ? 'Avisarme cuando llegue' : 'Comprar ahora') +
      '</button>' +
    '</div>';

  const vaso = $('detalle').querySelector('.vaso');
  vaso.style.setProperty('--aura-a', a);
  vaso.style.setProperty('--aura-b', b);

  $('fCerrar').addEventListener('click', () => $('detalle').close());
  if (st > 0) {
    $('fCarro').addEventListener('click', () => { agregarAlCarrito(sku); abrir(sku); });
    $('fComprar').addEventListener('click', () => {
      agregarAlCarrito(sku, 1, true);
      $('detalle').close();
      abrirCarrito();
    });
  }
  if (!$('detalle').open) $('detalle').showModal();
}

// ============================================================
// CARRITO
// ============================================================
const LLAVE = 'econohogar.carrito.v1';
let carro = [];
let metodoEntrega = 'envio';
let depEntrega = 'San Salvador';

function cargarCarrito(){
  try {
    const crudo = localStorage.getItem(LLAVE);
    if (!crudo) return;
    const datos = JSON.parse(crudo);
    // Se filtra contra el catálogo: un SKU que ya no existe no puede quedar colgado.
    carro = (datos.items || []).filter((i) => prod(i.sku) && i.cant > 0);
    if (datos.metodo) metodoEntrega = datos.metodo;
    if (datos.dep) depEntrega = datos.dep;
  } catch (e) { carro = []; }
}
function guardarCarrito(){
  try {
    localStorage.setItem(LLAVE, JSON.stringify({ items: carro, metodo: metodoEntrega, dep: depEntrega }));
  } catch (e) { /* modo privado o almacenamiento bloqueado: el carrito vive solo en memoria */ }
}

const cantidadEnCarrito = (sku) => (carro.find((i) => i.sku === sku) || {}).cant || 0;
const totalUnidades = () => carro.reduce((s, i) => s + i.cant, 0);

function agregarAlCarrito(sku, n = 1, silencioso = false){
  const p = prod(sku);
  const tope = stockTotal(p);
  const item = carro.find((i) => i.sku === sku);
  const actual = item ? item.cant : 0;
  if (actual + n > tope) {
    if (!silencioso) tostada('Solo quedan ' + tope + ' en existencia');
    if (actual >= tope) return false;
    n = tope - actual;
  }
  if (item) item.cant += n; else carro.push({ sku, cant: n });
  guardarCarrito(); pintarLanzador(); pintarCarrito();
  if (!silencioso) tostada('Agregado al carrito');
  return true;
}
function fijarCantidad(sku, n){
  const tope = stockTotal(prod(sku));
  const item = carro.find((i) => i.sku === sku);
  if (!item) return;
  item.cant = Math.max(0, Math.min(n, tope));
  if (item.cant === 0) carro = carro.filter((i) => i.sku !== sku);
  guardarCarrito(); pintarLanzador(); pintarCarrito();
}
function quitarDelCarrito(sku){
  carro = carro.filter((i) => i.sku !== sku);
  guardarCarrito(); pintarLanzador(); pintarCarrito();
  tostada('Producto quitado');
}

// Envío: cada voluminoso paga su tarifa; todo lo demás viaja junto y paga
// una sola vez la tarifa más alta del grupo.
function calcularEnvio(){
  if (!carro.length) return { centavos: 0, bloqueado: false, dias: 0 };
  if (metodoEntrega === 'retiro') return { centavos: 0, bloqueado: false, dias: 0, retiro: true };

  const z = DATOS.zonas_envio.find((x) => x.departamento === depEntrega);
  const vol = carro.filter((i) => prod(i.sku).clase_envio === 'voluminoso');
  if (vol.length && z.voluminoso_excluido) {
    return { centavos: 0, bloqueado: true, dias: z.dias_habiles, depto: z.departamento };
  }
  let cent = vol.reduce((s, i) => s + z.tarifas_centavos.voluminoso * i.cant, 0);
  const otros = carro.filter((i) => prod(i.sku).clase_envio !== 'voluminoso');
  if (otros.length) {
    cent += Math.max(...otros.map((i) => z.tarifas_centavos[prod(i.sku).clase_envio]));
  }
  return { centavos: cent, bloqueado: false, dias: z.dias_habiles };
}

function totalesCarrito(){
  const neto = carro.reduce((s, i) => s + prod(i.sku).precio_neto_centavos * i.cant, 0);
  const iva = carro.reduce((s, i) => s + prod(i.sku).iva_centavos * i.cant, 0);
  const envio = calcularEnvio();
  return { neto, iva, sub: neto + iva, envio, total: neto + iva + envio.centavos };
}

function pintarLanzador(){
  const n = totalUnidades();
  document.querySelectorAll('[data-carrito-n]').forEach((el) => {
    el.textContent = n; el.hidden = n === 0;
  });
  document.querySelectorAll('[data-carrito-total]').forEach((el) => {
    el.textContent = fmt(totalesCarrito().sub);
  });
}

function pintarCarrito(){
  const caja = $('carritoIn');
  if (!caja) return;
  const t = totalesCarrito();

  const cab = '<div class="c-cab"><h2>Tu carrito</h2>' +
    '<span class="f-sub">' + (totalUnidades() || 'sin') + ' producto' + (totalUnidades() === 1 ? '' : 's') + '</span>' +
    '<button class="f-cerrar" type="button" id="cCerrar" style="margin-left:auto" aria-label="Cerrar">✕</button></div>';

  if (!carro.length) {
    caja.innerHTML = cab +
      '<div class="c-vacio">' + (typeof PERSONAJE_VACIO === 'string' ? '<span class="fig">' + PERSONAJE_VACIO + '</span>' : '') +
        '<b>Tu carrito está vacío</b>' +
        '<p>Todavía no agregaste nada. Empezá por las ofertas del día o buscá por categoría.</p>' +
      '</div>';
    $('cCerrar').addEventListener('click', () => $('carrito').close());
    return;
  }

  const items = carro.map((i) => {
    const p = prod(i.sku);
    const tope = stockTotal(p);
    return '<div class="c-item">' +
      '<div class="c-foto">' + (SILUETAS[p.icono] || '') + '</div>' +
      '<div><div class="c-nom">' + esc(p.nombre) + '</div>' +
        '<div class="c-pr">' + fmt(p.precio_centavos * i.cant) + '</div>' +
        (i.cant >= tope ? '<div class="c-tope">Es todo lo que hay</div>' : '') +
      '</div>' +
      '<div class="c-der">' +
        '<div class="c-cant">' +
          '<button type="button" data-menos="' + i.sku + '" aria-label="Quitar uno">−</button>' +
          '<span>' + i.cant + '</span>' +
          '<button type="button" data-mas="' + i.sku + '"' + (i.cant >= tope ? ' disabled' : '') + ' aria-label="Agregar uno">+</button>' +
        '</div>' +
        '<button class="c-quitar" type="button" data-quitar="' + i.sku + '">Quitar</button>' +
      '</div></div>';
  }).join('');

  const opciones = DATOS.zonas_envio.map((z) =>
    '<option value="' + esc(z.departamento) + '"' + (z.departamento === depEntrega ? ' selected' : '') + '>' +
    esc(z.departamento) + ' · ' + z.dias_habiles + ' días</option>').join('');

  caja.innerHTML = cab +
    '<div class="c-lista">' + items + '</div>' +

    '<div class="c-entrega">' +
      '<div class="c-metodos">' +
        '<button class="c-metodo" type="button" data-metodo="envio" aria-pressed="' + (metodoEntrega === 'envio') + '">Envío a domicilio</button>' +
        '<button class="c-metodo" type="button" data-metodo="retiro" aria-pressed="' + (metodoEntrega === 'retiro') + '">Retiro en tienda</button>' +
      '</div>' +
      (metodoEntrega === 'envio' ? '<select id="cDep" aria-label="Departamento de entrega">' + opciones + '</select>' : '') +
      (t.envio.bloqueado ? '<p class="c-aviso">No despachamos productos voluminosos a ' + esc(t.envio.depto) +
        '. Quitá la refrigeradora, lavadora o estufa del carrito, o elegí retiro en la sala de ventas.</p>' : '') +
    '</div>' +

    '<div class="c-totales"><table>' +
      '<tr><td>Subtotal neto</td><td>' + fmt(t.neto) + '</td></tr>' +
      '<tr><td>IVA 13 %</td><td>' + fmt(t.iva) + '</td></tr>' +
      '<tr><td>Envío' + (metodoEntrega === 'retiro' ? ' (retiro en tienda)' : ' a ' + esc(depEntrega)) + '</td><td>' +
        (t.envio.bloqueado ? '—' : t.envio.centavos === 0 ? 'Gratis' : fmt(t.envio.centavos)) + '</td></tr>' +
      '<tr class="total"><td>Total</td><td>' + fmt(t.total) + '</td></tr>' +
    '</table>' +
    (t.total >= 15000 ? '<div class="c-cuota">o ' + fmt(Math.round(t.total / 12)) + ' × 12 cuotas con Banco Agrícola</div>' : '') +
    '</div>' +

    '<div class="c-pie">' +
      '<button class="c-pagar" type="button" id="cPagar"' + (t.envio.bloqueado ? ' disabled' : '') + '>Continuar al pago</button>' +
      '<p class="c-letra">El pago se completa en la pantalla segura de Wompi. Ningún dato de tarjeta pasa por esta tienda.</p>' +
    '</div>';

  // --- eventos ---
  $('cCerrar').addEventListener('click', () => $('carrito').close());
  caja.querySelectorAll('[data-mas]').forEach((b) =>
    b.addEventListener('click', () => agregarAlCarrito(b.dataset.mas, 1, true)));
  caja.querySelectorAll('[data-menos]').forEach((b) =>
    b.addEventListener('click', () => fijarCantidad(b.dataset.menos, cantidadEnCarrito(b.dataset.menos) - 1)));
  caja.querySelectorAll('[data-quitar]').forEach((b) =>
    b.addEventListener('click', () => quitarDelCarrito(b.dataset.quitar)));
  caja.querySelectorAll('[data-metodo]').forEach((b) =>
    b.addEventListener('click', () => { metodoEntrega = b.dataset.metodo; guardarCarrito(); pintarCarrito(); }));
  if ($('cDep')) $('cDep').addEventListener('change', (e) => { depEntrega = e.target.value; guardarCarrito(); pintarCarrito(); });
  if ($('cPagar')) $('cPagar').addEventListener('click', pintarCheckout);
}

// Resumen de lo que se le mandaría a Wompi. No cobra: deja ver el pedido
// tal como saldría, con el desglose que después necesita el DTE.
function pintarCheckout(){
  const t = totalesCarrito();
  const pedido = 'EH-' + String(Date.now()).slice(-6);
  const lineas = carro.map((i) => {
    const p = prod(i.sku);
    return '<tr><td>' + i.cant + ' × ' + esc(p.nombre.slice(0, 42)) + '</td><td>' + fmt(p.precio_centavos * i.cant) + '</td></tr>';
  }).join('');

  $('carritoIn').innerHTML =
    '<div class="c-cab"><h2>Resumen del pedido</h2>' +
      '<button class="f-cerrar" type="button" id="cVolver" style="margin-left:auto" aria-label="Volver">✕</button></div>' +
    '<div class="c-lista" style="display:block">' +
      '<div class="f-tabla"><table>' + lineas +
        '<tr><td>Envío' + (metodoEntrega === 'retiro' ? ' · retiro en tienda' : ' · ' + esc(depEntrega)) + '</td><td>' +
          (t.envio.centavos === 0 ? 'Gratis' : fmt(t.envio.centavos)) + '</td></tr>' +
      '</table></div>' +
      '<h3 style="font-family:\'IBM Plex Mono\',monospace;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--tinta-2);margin:18px 0 8px">Lo que recibe la orden de facturación</h3>' +
      '<div class="f-tabla"><table>' +
        '<tr><td>Pedido</td><td>' + pedido + '</td></tr>' +
        '<tr><td>Neto</td><td>' + fmt(t.neto) + '</td></tr>' +
        '<tr><td>IVA 13 %</td><td>' + fmt(t.iva) + '</td></tr>' +
        '<tr><td>Total a cobrar</td><td>' + fmt(t.total) + '</td></tr>' +
      '</table></div>' +
    '</div>' +
    '<div class="c-pie">' +
      '<button class="c-pagar" type="button" id="cWompi">Pagar ' + fmt(t.total) + ' con Wompi</button>' +
      '<p class="c-letra">Se genera un enlace de pago por pedido, con el número de orden como identificador. ' +
        'Las cuotas de Banco Agrícola se eligen dentro de esa pantalla.</p>' +
    '</div>';

  $('cVolver').addEventListener('click', pintarCarrito);
  $('cWompi').addEventListener('click', () =>
    tostada('Aquí se abre el enlace de Wompi · pendiente de conectar'));
}

function abrirCarrito(){
  pintarCarrito();
  if (!$('carrito').open) $('carrito').showModal();
}



// ---------- tema claro / oscuro ----------
// Por defecto manda el sistema. En cuanto el usuario elige, esa elección
// gana y se recuerda: cambiar de tema para volver a encontrarlo en oscuro
// la próxima visita es de las cosas que más molestan.
const LLAVE_TEMA = 'econohogar.tema';
const SOL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>';
const LUNA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>';

const temaSistemaOscuro = () => matchMedia('(prefers-color-scheme: dark)').matches;
const temaActual = () => document.documentElement.getAttribute('data-theme')
  || (temaSistemaOscuro() ? 'dark' : 'light');

function pintarBotonTema(){
  const irA = temaActual() === 'dark' ? 'claro' : 'oscuro';
  document.querySelectorAll('[data-tema-txt]').forEach((e) => { e.textContent = irA[0].toUpperCase() + irA.slice(1); });
  document.querySelectorAll('[data-tema-icono]').forEach((e) => { e.innerHTML = irA === 'claro' ? SOL : LUNA; });
  document.querySelectorAll('#tema').forEach((b) => b.setAttribute('aria-label', 'Cambiar a tema ' + irA));
}

function fijarTema(t){
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(LLAVE_TEMA, t); } catch (e) { /* almacenamiento bloqueado */ }
  pintarBotonTema();
}

function iniciarTema(){
  let guardado = null;
  try { guardado = localStorage.getItem(LLAVE_TEMA); } catch (e) {}
  if (guardado === 'dark' || guardado === 'light') document.documentElement.setAttribute('data-theme', guardado);
  pintarBotonTema();
  document.querySelectorAll('#tema').forEach((b) =>
    b.addEventListener('click', () => fijarTema(temaActual() === 'dark' ? 'light' : 'dark')));
}

// ---------- barras de desplazamiento al estilo iOS ----------
// El evento scroll no burbujea, así que se escucha en captura sobre el
// documento: sirve para cualquier contenedor, incluidos los que se crean
// después (la ficha y el carrito se montan al vuelo).
const relojesBarra = new WeakMap();
function iniciarBarras(){
  document.addEventListener('scroll', (e) => {
    const el = e.target === document ? document.documentElement : e.target;
    if (!el || !el.classList) return;
    el.classList.add('desplazando');
    clearTimeout(relojesBarra.get(el));
    relojesBarra.set(el, setTimeout(() => el.classList.remove('desplazando'), 700));
  }, true);
}

// ---------- arranque ----------
function iniciarUI(){
  iniciarTema();
  iniciarBarras();
  montarSuperficies();
  cargarCarrito();
  pintarLanzador();
  document.querySelectorAll('[data-abrir-carrito]').forEach((b) =>
    b.addEventListener('click', abrirCarrito));
}
