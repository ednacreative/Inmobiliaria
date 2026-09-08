/**
 * Generador de la base de datos de propiedades ficticias.
 *
 * Uso:  node scripts/generar-datos.mjs
 * Salida: data/propiedades.json
 *
 * Los datos son inventados y las imagenes son placeholders (picsum.photos).
 * Sustituye este fichero (o el JSON) por tus propiedades reales cuando toque.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

/* ------------------------------------------------------------------ *
 * PRNG determinista (mulberry32) para que el dataset sea reproducible
 * ------------------------------------------------------------------ */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260909);

const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);
const intBetween = (min, max) => Math.floor(between(min, max + 1));
const chance = (p) => rand() < p;
const round = (n, step) => Math.round(n / step) * step;

/* ------------------------------------------------------------------ *
 * Catalogos
 * ------------------------------------------------------------------ */
// Distritos de Madrid con coordenadas aproximadas de referencia.
const DISTRITOS = [
  { barrio: "Centro", ciudad: "Madrid", cp: "28013", lat: 40.4155, lng: -3.7074, nivel: 1.35 },
  { barrio: "Salamanca", ciudad: "Madrid", cp: "28001", lat: 40.4302, lng: -3.6797, nivel: 1.6 },
  { barrio: "Chamberí", ciudad: "Madrid", cp: "28010", lat: 40.4360, lng: -3.7038, nivel: 1.45 },
  { barrio: "Retiro", ciudad: "Madrid", cp: "28009", lat: 40.4108, lng: -3.6773, nivel: 1.4 },
  { barrio: "Chamartín", ciudad: "Madrid", cp: "28016", lat: 40.4600, lng: -3.6770, nivel: 1.4 },
  { barrio: "Tetuán", ciudad: "Madrid", cp: "28020", lat: 40.4600, lng: -3.6980, nivel: 1.15 },
  { barrio: "Arganzuela", ciudad: "Madrid", cp: "28045", lat: 40.3950, lng: -3.6950, nivel: 1.2 },
  { barrio: "Moncloa-Aravaca", ciudad: "Madrid", cp: "28008", lat: 40.4350, lng: -3.7200, nivel: 1.3 },
  { barrio: "Latina", ciudad: "Madrid", cp: "28047", lat: 40.4020, lng: -3.7400, nivel: 0.95 },
  { barrio: "Carabanchel", ciudad: "Madrid", cp: "28025", lat: 40.3800, lng: -3.7300, nivel: 0.8 },
  { barrio: "Usera", ciudad: "Madrid", cp: "28026", lat: 40.3820, lng: -3.7050, nivel: 0.8 },
  { barrio: "Puente de Vallecas", ciudad: "Madrid", cp: "28018", lat: 40.3900, lng: -3.6650, nivel: 0.78 },
  { barrio: "Ciudad Lineal", ciudad: "Madrid", cp: "28017", lat: 40.4500, lng: -3.6500, nivel: 1.0 },
  { barrio: "Hortaleza", ciudad: "Madrid", cp: "28043", lat: 40.4750, lng: -3.6400, nivel: 1.1 },
  { barrio: "Moratalaz", ciudad: "Madrid", cp: "28030", lat: 40.4070, lng: -3.6420, nivel: 0.9 },
  { barrio: "San Blas-Canillejas", ciudad: "Madrid", cp: "28022", lat: 40.4300, lng: -3.6100, nivel: 0.85 },
];

const CALLES = [
  "Calle Mayor", "Calle de Alcalá", "Calle de Serrano", "Calle de Génova", "Calle de Fuencarral",
  "Calle de Bravo Murillo", "Calle de Goya", "Calle de Velázquez", "Paseo de la Castellana",
  "Calle de Atocha", "Calle del Doctor Esquerdo", "Calle de Alonso Cano", "Calle de Ríos Rosas",
  "Calle de Cartagena", "Avenida de Filipinas", "Calle de Embajadores", "Calle de Toledo",
  "Calle de Santa Engracia", "Calle de Ferraz", "Calle de Marcelo Usera", "Avenida de la Albufera",
  "Calle de Arturo Soria", "Calle de López de Hoyos", "Calle de Hermosilla", "Calle del General Ricardos",
];

const TIPOS = [
  { tipo: "estudio", peso: 0.08, hab: [0, 1], m2: [28, 45] },
  { tipo: "piso", peso: 0.5, hab: [1, 4], m2: [45, 130] },
  { tipo: "ático", peso: 0.14, hab: [1, 4], m2: [60, 150] },
  { tipo: "dúplex", peso: 0.1, hab: [2, 5], m2: [90, 190] },
  { tipo: "casa", peso: 0.1, hab: [3, 6], m2: [120, 320] },
  { tipo: "loft", peso: 0.08, hab: [1, 2], m2: [55, 110] },
];

const ORIENTACIONES = ["Norte", "Sur", "Este", "Oeste", "Sureste", "Suroeste", "Noreste"];
const CERT_ENERGETICO = ["A", "B", "C", "D", "E", "F", "G"];
const ESTADO_CONSERVACION = ["A estrenar", "Reformado", "Buen estado", "Para actualizar", "A reformar"];

const EXTRAS_POOL = [
  "Aire acondicionado", "Calefacción individual", "Calefacción central", "Armarios empotrados",
  "Puerta blindada", "Suelo de tarima", "Cocina equipada", "Ventanas de climalit",
  "Domótica", "Videoportero", "Zonas comunes ajardinadas", "Piscina comunitaria",
  "Conserje", "Placas solares", "Preinstalación de carga para VE", "Chimenea",
];

const TITULARES = {
  venta: [
    "{tipo} exterior con mucha luz en {barrio}",
    "{tipo} reformado a estrenar en pleno {barrio}",
    "Luminoso {tipo} con {hab} dormitorios en {barrio}",
    "{tipo} con terraza y vistas despejadas — {barrio}",
    "Oportunidad de inversión: {tipo} en {barrio}",
    "{tipo} familiar junto a zonas verdes en {barrio}",
    "{tipo} de diseño con acabados de calidad en {barrio}",
  ],
  alquiler: [
    "{tipo} amueblado listo para entrar en {barrio}",
    "{tipo} exterior con {hab} habitaciones en {barrio}",
    "Acogedor {tipo} céntrico en {barrio}",
    "{tipo} luminoso con terraza en {barrio}",
    "{tipo} ideal para profesionales en {barrio}",
    "{tipo} reformado cerca del metro en {barrio}",
  ],
};

/* ------------------------------------------------------------------ *
 * Utilidades de generacion
 * ------------------------------------------------------------------ */
function tipoPonderado() {
  const total = TIPOS.reduce((s, t) => s + t.peso, 0);
  let r = rand() * total;
  for (const t of TIPOS) {
    if ((r -= t.peso) <= 0) return t;
  }
  return TIPOS[1];
}

function jitter(base, amplitud = 0.006) {
  return +(base + (rand() - 0.5) * 2 * amplitud).toFixed(6);
}

function fraseDescripcion(p) {
  const partes = [];
  partes.push(
    `${cap(p.tipo)} de ${p.caracteristicas.m2_construidos} m² construidos ` +
      `(${p.caracteristicas.m2_utiles} m² útiles) situado en ${p.ubicacion.direccion}, ` +
      `en el distrito de ${p.ubicacion.barrio}.`
  );
  partes.push(
    `La vivienda se distribuye en ${p.caracteristicas.habitaciones === 0 ? "un ambiente diáfano" : p.caracteristicas.habitaciones + " dormitorios"} ` +
      `y ${p.caracteristicas.banos} ${p.caracteristicas.banos === 1 ? "baño" : "baños"}, ` +
      `con orientación ${p.caracteristicas.orientacion.toLowerCase()} y una luminosidad excelente durante todo el día.`
  );
  if (p.caracteristicas.ascensor) partes.push("El edificio dispone de ascensor.");
  if (p.caracteristicas.terraza) partes.push(`Cuenta con una terraza de ${p.caracteristicas.m2_terraza} m² perfecta para el día a día.`);
  if (p.caracteristicas.garaje) partes.push("Incluye plaza de garaje en el mismo edificio.");
  if (p.caracteristicas.trastero) partes.push("Se entrega con trastero.");
  partes.push(
    p.operacion === "venta"
      ? "Zona muy bien comunicada, con comercio de proximidad, colegios y transporte público a pocos minutos. Posibilidad de financiación; consúltanos las condiciones."
      : "Contrato de larga duración. Se requieren nómina y aval o seguro de impago. Gastos de agencia según normativa vigente."
  );
  return partes.join(" ");
}

function distribucionDe(p) {
  const d = [];
  const c = p.caracteristicas;
  d.push(`Salón-comedor de ${intBetween(18, 34)} m²`);
  d.push(chance(0.55) ? "Cocina independiente equipada" : "Cocina abierta al salón");
  if (c.habitaciones === 0) {
    d.push("Zona de descanso integrada");
  } else {
    d.push(`${c.habitaciones} ${c.habitaciones === 1 ? "dormitorio" : "dormitorios"}${c.habitaciones >= 2 ? " (1 tipo suite)" : ""}`);
  }
  d.push(`${c.banos} ${c.banos === 1 ? "baño completo" : "baños completos"}`);
  if (c.terraza) d.push(`Terraza de ${c.m2_terraza} m²`);
  if (chance(0.4)) d.push("Recibidor y zona de paso");
  if (c.trastero) d.push("Trastero");
  return d;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ------------------------------------------------------------------ *
 * Generacion principal
 * ------------------------------------------------------------------ */
const TOTAL = 32;
const propiedades = [];

for (let i = 1; i <= TOTAL; i++) {
  const id = `SANZ-${String(i).padStart(4, "0")}`;
  const operacion = chance(0.55) ? "venta" : "alquiler";
  const distrito = pick(DISTRITOS);
  const t = tipoPonderado();

  const habitaciones = intBetween(t.hab[0], t.hab[1]);
  const m2Construidos = round(intBetween(t.m2[0], t.m2[1]), 1);
  const m2Utiles = Math.max(20, Math.round(m2Construidos * between(0.82, 0.93)));
  const banos = Math.max(1, Math.min(habitaciones <= 1 ? 1 : intBetween(1, Math.ceil(habitaciones / 1.6)), 4));
  const esCasa = t.tipo === "casa";
  const planta = esCasa ? 0 : intBetween(0, 9);
  const ascensor = esCasa ? false : planta === 0 ? chance(0.3) : chance(0.85);
  const terraza = t.tipo === "ático" ? true : chance(0.35);
  const m2Terraza = terraza ? intBetween(6, t.tipo === "ático" ? 45 : 18) : 0;
  const garaje = chance(distrito.nivel > 1.2 ? 0.35 : 0.22);
  const trastero = chance(0.4);
  const anio = intBetween(1955, 2024);
  const orientacion = pick(ORIENTACIONES);
  const cert = anio > 2010 ? pick(["A", "B", "C"]) : pick(CERT_ENERGETICO);

  // Precio
  let precio;
  if (operacion === "venta") {
    const precioM2 = between(2600, 6200) * distrito.nivel;
    precio = round(precioM2 * m2Construidos * between(0.92, 1.08), 1000);
    if (garaje) precio += 18000;
    if (terraza) precio += m2Terraza * 900;
    precio = Math.max(95000, Math.round(precio));
  } else {
    const rentaM2 = between(13, 24) * distrito.nivel;
    precio = round(rentaM2 * m2Construidos * between(0.9, 1.12), 25);
    if (garaje) precio += 90;
    precio = Math.max(550, Math.round(precio));
  }

  const numExtras = intBetween(3, 7);
  const extras = [...EXTRAS_POOL].sort(() => rand() - 0.5).slice(0, numExtras).sort();

  const numImgs = intBetween(4, 6);
  const imagenes = Array.from(
    { length: numImgs },
    (_, n) => `https://picsum.photos/seed/${id}-${n + 1}/1200/800`
  );

  const p = {
    id,
    referencia: id,
    operacion,
    tipo: t.tipo,
    estado_publicacion:
      operacion === "venta"
        ? pick(["disponible", "disponible", "disponible", "reservado", "vendido"])
        : pick(["disponible", "disponible", "disponible", "reservado", "alquilado"]),
    destacado: chance(0.28),
    precio,
    precio_texto:
      operacion === "venta"
        ? `${precio.toLocaleString("es-ES")} €`
        : `${precio.toLocaleString("es-ES")} €/mes`,
    titulo: pick(TITULARES[operacion])
      .replace("{tipo}", cap(t.tipo))
      .replace("{barrio}", distrito.barrio)
      .replace("{hab}", String(habitaciones)),
    ubicacion: {
      direccion: `${pick(CALLES)}, ${intBetween(1, 180)}`,
      barrio: distrito.barrio,
      ciudad: distrito.ciudad,
      provincia: "Madrid",
      cp: distrito.cp,
      lat: jitter(distrito.lat),
      lng: jitter(distrito.lng),
    },
    caracteristicas: {
      m2_construidos: m2Construidos,
      m2_utiles: m2Utiles,
      habitaciones,
      banos,
      planta,
      planta_texto: esCasa ? "Unifamiliar" : planta === 0 ? "Bajo" : `${planta}ª planta`,
      ascensor,
      garaje,
      trastero,
      terraza,
      m2_terraza: m2Terraza,
      ano_construccion: anio,
      estado_conservacion: anio > 2018 ? "A estrenar" : pick(ESTADO_CONSERVACION),
      certificado_energetico: cert,
      orientacion,
      gastos_comunidad_mes: esCasa ? 0 : intBetween(25, 160),
    },
    distribucion: [],
    extras,
    descripcion: "",
    imagenes,
    imagen_principal: imagenes[0],
    fecha_publicacion: new Date(
      2026,
      intBetween(0, 8),
      intBetween(1, 28)
    )
      .toISOString()
      .slice(0, 10),
  };

  p.distribucion = distribucionDe(p);
  p.descripcion = fraseDescripcion(p);
  propiedades.push(p);
}

// Orden: destacados primero, luego por fecha desc
propiedades.sort((a, b) => {
  if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
  return a.fecha_publicacion < b.fecha_publicacion ? 1 : -1;
});

const salida = {
  generado: new Date().toISOString(),
  fuente: "datos ficticios — generar-datos.mjs",
  agencia: {
    nombre: "Inmobiliaria Sanz",
    ciudad: "Madrid",
    centro_mapa: { lat: 40.4238, lng: -3.6905, zoom: 12 },
  },
  total: propiedades.length,
  propiedades,
};

const destino = resolve(raiz, "data", "propiedades.json");
mkdirSync(dirname(destino), { recursive: true });
const json = JSON.stringify(salida, null, 2);
writeFileSync(destino, json + "\n", "utf8");

// Copia como módulo JS para que la web funcione también abriendo los
// ficheros HTML directamente (file://), sin servidor.
const destinoJs = resolve(raiz, "data", "propiedades.js");
writeFileSync(
  destinoJs,
  "/* Generado por scripts/generar-datos.mjs — no editar a mano. */\n" +
    "window.INMO_DB = " +
    json +
    ";\n",
  "utf8"
);

const venta = propiedades.filter((p) => p.operacion === "venta").length;
console.log(
  `OK  ${propiedades.length} propiedades  ->  data/propiedades.json` +
    `\n    ${venta} en venta / ${propiedades.length - venta} en alquiler` +
    `\n    ${propiedades.filter((p) => p.destacado).length} destacadas`
);
