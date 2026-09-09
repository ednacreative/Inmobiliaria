/* ============================================================
   layout.js — inserta cabecera y pie comunes en todas las páginas.
   No usa fetch: funciona también abriendo los HTML con doble clic.
   ============================================================ */

(function () {
  "use strict";

  var NOMBRE = "Inmobiliaria Sanz";

  var NAV = [
    { href: "index.html", txt: "Inicio" },
    { href: "venta.html", txt: "Comprar" },
    { href: "alquiler.html", txt: "Alquilar" },
    { href: "mapa.html", txt: "Mapa" },
    { href: "informacion.html", txt: "Información" },
    { href: "contacto.html", txt: "Contacto" },
    { href: "nosotros.html", txt: "Nosotros" },
  ];

  // Página actual (para marcar el enlace activo).
  var actual = location.pathname.split("/").pop() || "index.html";
  if (actual === "") actual = "index.html";
  // La ficha de propiedad resalta "Comprar/Alquilar" según el contexto: se deja sin marca.

  function cabeceraHTML() {
    var enlaces = NAV.map(function (n) {
      var activo = n.href === actual ? ' aria-current="page"' : "";
      return '<a href="' + n.href + '"' + activo + ">" + n.txt + "</a>";
    }).join("");

    return (
      '<div class="contenedor cabecera__inner">' +
      '<a class="cabecera__logo" href="index.html" aria-label="' +
      NOMBRE +
      ' — inicio"><img src="assets/logo.svg" alt="' +
      NOMBRE +
      '" width="240" height="48"></a>' +
      '<button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false"><span></span></button>' +
      '<nav class="nav" id="nav-principal">' +
      enlaces +
      '<a class="btn btn--primario nav__cta" href="contacto.html">Publica tu inmueble</a>' +
      "</nav>" +
      "</div>"
    );
  }

  function pieHTML() {
    var anio = new Date().getFullYear();
    return (
      '<div class="contenedor">' +
      '<div class="pie__grid">' +
      "<div>" +
      '<img class="pie__logo" src="assets/logo.svg" alt="' +
      NOMBRE +
      '" width="240" height="48">' +
      "<p>Asesoramiento inmobiliario en Zaragoza desde 1998. Compra, venta y alquiler de viviendas con trato cercano y datos claros.</p>" +
      "</div>" +
      "<div><h4>Propiedades</h4><ul>" +
      '<li><a href="venta.html">Viviendas en venta</a></li>' +
      '<li><a href="alquiler.html">Viviendas en alquiler</a></li>' +
      '<li><a href="mapa.html">Buscar en el mapa</a></li>' +
      '<li><a href="index.html#destacados">Destacados</a></li>' +
      "</ul></div>" +
      "<div><h4>Agencia</h4><ul>" +
      '<li><a href="nosotros.html">Sobre nosotros</a></li>' +
      '<li><a href="informacion.html">Guías y trámites</a></li>' +
      '<li><a href="contacto.html">Contacto</a></li>' +
      '<li><a href="contacto.html">Trabaja con nosotros</a></li>' +
      "</ul></div>" +
      "<div><h4>Contacto</h4><ul>" +
      '<li><a href="tel:+34976000000">976 000 000</a></li>' +
      '<li><a href="mailto:hola@inmobiliariasanz.es">hola@inmobiliariasanz.es</a></li>' +
      "<li>Paseo de la Independencia, 24<br>50004 Zaragoza</li>" +
      "<li>L–V 9:30–20:00 · S 10:00–14:00</li>" +
      "</ul></div>" +
      "</div>" +
      '<div class="pie__legal">' +
      "<span>© " +
      anio +
      " " +
      NOMBRE +
      ". Todos los derechos reservados.</span>" +
      "<span>Aviso legal · Política de privacidad · Cookies</span>" +
      "</div>" +
      "</div>"
    );
  }

  // Si una foto de vivienda (loremflickr) no carga, se sustituye por una de
  // picsum.photos para que la demo nunca muestre imágenes rotas.
  document.addEventListener(
    "error",
    function (e) {
      var img = e.target;
      if (
        img &&
        img.tagName === "IMG" &&
        !img.dataset.fallback &&
        /loremflickr\.com/.test(img.src)
      ) {
        img.dataset.fallback = "1";
        var m = img.src.match(/lock=(\d+)/);
        var semilla = m ? m[1] : Math.abs(hashTxt(img.src));
        img.src = "https://picsum.photos/seed/piso-" + semilla + "/1200/800";
      }
    },
    true // fase de captura: el evento "error" de <img> no propaga
  );

  function hashTxt(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  function montar() {
    var header = document.querySelector("[data-cabecera]");
    if (header) {
      header.className = "cabecera";
      header.innerHTML = cabeceraHTML();
    }

    var footer = document.querySelector("[data-pie]");
    if (footer) {
      footer.className = "pie";
      footer.innerHTML = pieHTML();
    }

    // Menú móvil
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var abierto = nav.classList.toggle("abierta");
        toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
        toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
      });
      nav.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          nav.classList.remove("abierta");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
