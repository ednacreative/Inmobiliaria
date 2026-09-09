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
- Imágenes de ejemplo: fotos de interiores de vivienda desde `images.unsplash.com`
  (pool `FOTOS_INTERIOR` en `scripts/generar-datos.mjs`), con respaldo automático
  a `picsum.photos` si algún recurso falla, y retratos del equipo desde `pravatar.cc`.
- Envío de formularios por email con [FormSubmit](https://formsubmit.co) (sin backend).
- Ciudad de referencia del prototipo: **Zaragoza** (barrios y coordenadas reales).

## Estructura

```
├── index.html          Portada: hero + buscador + destacados
├── venta.html          Listado filtrable — operación fijada a "venta"
├── alquiler.html       Listado filtrable — operación fijada a "alquiler"
├── propiedad.html      Ficha de detalle (usa ?id=SANZ-XXXX)
├── mapa.html           Mapa a pantalla completa + lista lateral sincronizada
├── publica.html        "Publica tu inmueble": formulario para dar de alta una vivienda
├── nosotros.html       Sobre nosotros / equipo
├── informacion.html    Guías y trámites + FAQ
├── contacto.html       Formulario + datos + mapa de la oficina
├── css/styles.css
├── js/
│   ├── layout.js       Inserta cabecera y pie comunes; menú móvil; respaldo de imágenes
│   ├── data.js         Carga de la BBDD + filtros, formato y tarjeta de propiedad
│   ├── forms.js         Envío de formularios por email (FormSubmit)
│   ├── home.js          Portada
│   ├── listado.js       Páginas de venta / alquiler
│   ├── propiedad.js     Ficha de detalle + carrusel de fotos
│   ├── mapa.js          Página de mapa (marcadores + resaltado al pasar el ratón)
│   └── publica.js       Formulario "Publica tu inmueble"
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

## Formularios por email (FormSubmit)

Los formularios de **Contacto**, **solicitud de visita** (ficha de propiedad) y
**Publica tu inmueble** envían un correo con [FormSubmit](https://formsubmit.co),
sin backend. El destinatario está en `js/forms.js` (constante `DESTINO`):
`edna.creativestudio@gmail.com`.

> **Activación (una sola vez):** el primer envío de cualquier formulario hace que
> FormSubmit mande un correo de confirmación a esa dirección. Hay que abrirlo y
> pulsar **"Activate Form"**. A partir de ahí llegan todos los envíos.
> Los envíos hechos antes de activar **no se reenvían**.

Para reducir spam, tras activar se puede sustituir el email en `js/forms.js` por
la cadena aleatoria (`/ajax/<hash>`) que FormSubmit facilita en su panel.

El formulario de "Publica tu inmueble" es una **solicitud**: no publica nada en el
listado. Al recibir el correo, revisa el inmueble y publícalo manualmente
(añadiéndolo a `data/propiedades.json`) o contacta con la persona con los datos
que ha dejado.

## Pendiente / ideas

- Sustituir textos, datos de contacto y nombre real de la agencia.
- Fotos reales de las viviendas y del equipo.
- Activar el formulario en FormSubmit (ver arriba) o migrar a backend propio.
- Panel para convertir una solicitud de "Publica tu inmueble" en ficha publicada.
- Añadir favoritos (localStorage) y comparador de viviendas.
- Aviso de cookies / textos legales reales.
