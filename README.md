# Inmobiliaria Sanz — web

Web de una inmobiliaria orientada al usuario final: catálogo de viviendas en
**venta** y **alquiler**, buscador con filtros, **mapa** interactivo y **ficha de
detalle** por propiedad (m², ubicación, distribución, equipamiento…).

> El nombre «Sanz» y todos los datos (propiedades, precios, fotos, equipo) son
> **ficticios / placeholder**. Sustitúyelos por los reales cuando corresponda.

## Stack

Sitio **estático**, sin framework ni build obligatorio:

- HTML + CSS (un único `css/styles.css`, sistema de diseño con variables).
- JavaScript "vanilla" (sin dependencias de terceros salvo el mapa).
- [Leaflet](https://leafletjs.com/) vía CDN para los mapas (tiles de OpenStreetMap).
- "Base de datos" de propiedades en `data/propiedades.json` (+ copia `data/propiedades.js`
  para poder abrir la web sin servidor).
- Imágenes de ejemplo desde `picsum.photos` y `pravatar.cc`.

## Estructura

```
├── index.html          Portada: hero + buscador + destacados
├── venta.html          Listado filtrable — operación fijada a "venta"
├── alquiler.html       Listado filtrable — operación fijada a "alquiler"
├── propiedad.html      Ficha de detalle (usa ?id=SANZ-XXXX)
├── mapa.html           Mapa a pantalla completa + lista lateral sincronizada
├── nosotros.html       Sobre nosotros / equipo
├── informacion.html    Guías y trámites + FAQ
├── contacto.html       Formulario + datos + mapa de la oficina
├── css/styles.css
├── js/
│   ├── layout.js       Inserta cabecera y pie comunes; menú móvil
│   ├── data.js         Carga de la BBDD + filtros, formato y tarjeta de propiedad
│   ├── home.js          Portada
│   ├── listado.js       Páginas de venta / alquiler
│   ├── propiedad.js     Ficha de detalle
│   └── mapa.js          Página de mapa
├── data/
│   ├── propiedades.json  Base de datos (fuente de la verdad)
│   └── propiedades.js    Copia autogenerada (window.INMO_DB) para uso sin servidor
├── scripts/
│   └── generar-datos.mjs Genera las dos anteriores con datos ficticios
└── .github/workflows/deploy-pages.yml  Despliegue automático a GitHub Pages
```

## Uso en local

Abrir `index.html` con doble clic ya funciona (gracias a `data/propiedades.js`).
Para un entorno más fiel al de producción, sirve la carpeta por HTTP:

```bash
npm run dev        # abre http://localhost:3000  (usa npx serve)
```

o con Python:

```bash
python -m http.server 3000
```

o con la extensión **Live Server** de VS Code.

## Regenerar la base de datos ficticia

```bash
npm run datos      # -> data/propiedades.json  y  data/propiedades.js
```

Edita `scripts/generar-datos.mjs` (número de propiedades, distritos, precios…)
o, más adelante, sustituye directamente `data/propiedades.json` por datos reales
y vuelve a generar la copia `.js` (o elimina esa copia y sirve siempre por HTTP).

Modelo de cada propiedad: `id`, `operacion` (`venta` | `alquiler`), `tipo`,
`precio`, `estado_publicacion`, `destacado`, `ubicacion` (dirección, barrio,
`lat`/`lng`…), `caracteristicas` (m² construidos/útiles, habitaciones, baños,
planta, ascensor, garaje, año, certificado energético…), `distribucion[]`,
`extras[]`, `descripcion`, `imagenes[]`.

## Despliegue

Al hacer `push` a `main`, el workflow `deploy-pages.yml` publica el sitio en
**GitHub Pages**. Hay que activarlo una vez en el repositorio:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

Quedará en `https://<usuario>.github.io/<repositorio>/`.

## Pendiente / ideas

- Sustituir textos, datos de contacto y nombre real de la agencia.
- Fotos reales de las viviendas y del equipo.
- Conectar el formulario a un servicio real (Formspree, Getform, backend propio…).
- Añadir favoritos (localStorage) y comparador de viviendas.
- Aviso de cookies / textos legales reales.
