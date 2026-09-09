/**
 * Generador de la base de datos de propiedades ficticias.
 *
 * Uso:  node scripts/generar-datos.mjs
 * Salida: data/propiedades.json
 *
 * Los datos son inventados. Las imagenes son placeholders de interiores de
 * vivienda servidos por loremflickr.com (fotos reales de Flickr por palabra
 * clave, deterministas via ?lock=). Si loremflickr falla, la web cae de forma
 * automatica a picsum.photos (ver el manejador global en js/layout.js).
 * Sustituye este fichero (o directamente el JSON) por fotos reales cuando toque.
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
// Distritos / barrios de Zaragoza con coordenadas aproximadas de referencia.
const DISTRITOS = [
  { barrio: "Centro", ciudad: "Zaragoza", cp: "50004", lat: 41.6520, lng: -0.8809, nivel: 1.45 },
  { barrio: "Casco Histórico", ciudad: "Zaragoza", cp: "50003", lat: 41.6563, lng: -0.8773, nivel: 1.3 },
  { barrio: "Universidad", ciudad: "Zaragoza", cp: "50009", lat: 41.6360, lng: -0.8970, nivel: 1.35 },
  { barrio: "Delicias", ciudad: "Zaragoza", cp: "50017", lat: 41.6470, lng: -0.9010, nivel: 1.0 },
  { barrio: "San José", ciudad: "Zaragoza", cp: "50008", lat: 41.6408, lng: -0.8720, nivel: 1.05 },
  { barrio: "Las Fuentes", ciudad: "Zaragoza", cp: "50002", lat: 41.6488, lng: -0.8648, nivel: 0.9 },
  { barrio: "La Almozara", ciudad: "Zaragoza", cp: "50003", lat: 41.6640, lng: -0.9012, nivel: 1.0 },
  { barrio: "Actur-Rey Fernando", ciudad: "Zaragoza", cp: "50018", lat: 41.6725, lng: -0.8865, nivel: 1.1 },
  { barrio: "El Rabal (Arrabal)", ciudad: "Zaragoza", cp: "50015", lat: 41.6660, lng: -0.8790, nivel: 0.95 },
  { barrio: "Torrero-La Paz", ciudad: "Zaragoza", cp: "50007", lat: 41.6280, lng: -0.8830, nivel: 0.9 },
  { barrio: "Casablanca", ciudad: "Zaragoza", cp: "50012", lat: 41.6185, lng: -0.9075, nivel: 1.15 },
  { barrio: "Miralbueno", ciudad: "Zaragoza", cp: "50011", lat: 41.6520, lng: -0.9345, nivel: 1.1 },
  { barrio: "Oliver-Valdefierro", ciudad: "Zaragoza", cp: "50011", lat: 41.6420, lng: -0.9300, nivel: 0.82 },
  { barrio: "Santa Isabel", ciudad: "Zaragoza", cp: "50016", lat: 41.6820, lng: -0.8500, nivel: 0.85 },
  { barrio: "Parque Goya", ciudad: "Zaragoza", cp: "50015", lat: 41.6855, lng: -0.8930, nivel: 1.05 },
  { barrio: "Romareda", ciudad: "Zaragoza", cp: "50006", lat: 41.6350, lng: -0.8880, nivel: 1.4 },
];

const CALLES = [
  "Paseo de la Independencia", "Calle de Alfonso I", "Calle del Coso", "Paseo de María Agustín",
  "Avenida de Goya", "Paseo de Sagasta", "Calle de León XIII", "Paseo de Pamplona",
  "Calle de San Miguel", "Avenida de Madrid", "Avenida de Navarra", "Avenida de San José",
  "Calle de Miguel Servet", "Paseo de la Constitución", "Calle del Cinco de Marzo",
  "Avenida de César Augusto", "Calle de Don Jaime I", "Avenida de Valencia", "Avenida de Tenor Fleta",
  "Paseo de Fernando el Católico", "Calle de Bretón", "Avenida de Cataluña", "Camino de las Torres",
  "Vía Hispanidad", "Calle de Delicias",
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
    "{tipo} reformado cerca del tranvía en {barrio}",
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
 * Imágenes de vivienda (placeholders temáticos de interiores)
 * ------------------------------------------------------------------ */
// Cada posición de la galería muestra una estancia distinta.
const ESTANCIAS_FOTO = [
  "apartment,interior",
  "living-room",
  "kitchen",
  "bedroom",
  "bathroom",
  "apartment,hallway",
];

function hashCadena(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function imagenPiso(id, n) {
  const tag = ESTANCIAS_FOTO[(n - 1) % ESTANCIAS_FOTO.length];
  const lock = hashCadena(id + "-" + n) % 100000;
  return `https://loremflickr.com/1200/800/${tag}?lock=${lock}`;
}

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
  const imagenes = Array.from({ length: numImgs }, (_, n) => imagenPiso(id, n + 1));

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
      provincia: "Zaragoza",
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
    ciudad: "Zaragoza",
    centro_mapa: { lat: 41.6488, lng: -0.8891, zoom: 13 },
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
