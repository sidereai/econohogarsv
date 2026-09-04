// Departamentos de la tienda: agrupaciones comerciales de categorías.
// El menú de la home enlaza a estos; el catálogo los resuelve desde el hash de la URL.
export const DEPARTAMENTOS = [
  { slug: 'linea-blanca', nombre: 'Línea blanca',
    cats: ['refrigeradoras', 'lavadoras', 'secadoras', 'estufas', 'congeladores'] },
  { slug: 'pantallas', nombre: 'Pantallas',
    cats: ['televisores'] },
  { slug: 'aires', nombre: 'Aires acondicionados',
    cats: ['aires-acondicionados'] },
  { slug: 'cocina', nombre: 'Cocina',
    cats: ['microondas', 'licuadoras', 'freidoras-de-aire', 'ollas-y-arroceras'] },
  { slug: 'hogar', nombre: 'Cuidado del hogar',
    cats: ['ventiladores', 'planchas', 'aspiradoras', 'filtros-de-agua'] },
];
