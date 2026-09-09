/* ============================================================
   layout.js — cabecera y pie comunes + widget de cuenta (perfil,
   favoritos, sesión demo) en todas las páginas.
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

  var actual = location.pathname.split("/").pop() || "index.html";
  if (actual === "") actual = "index.html";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var ICONO_USUARIO =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
    '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>';

  /* ---------- Cabecera ---------- */
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
      '<a class="btn btn--primario nav__cta" href="publica.html">Solicitar valoración</a>' +
      "</nav>" +
      '<div class="perfil" id="perfil">' +
      '<button type="button" class="perfil__btn" id="perfil-btn" aria-haspopup="true" aria-expanded="false" aria-label="Mi cuenta">' +
      ICONO_USUARIO +
      '<span class="perfil__num" id="perfil-num" hidden></span>' +
      "</button>" +
      '<div class="perfil__menu" id="perfil-menu" hidden></div>' +
      "</div>" +
      "</div>"
    );
  }

  function menuHTML() {
    var s = window.InmoSesion ? window.InmoSesion.actual() : null;
    var favN = window.InmoFav ? window.InmoFav.total() : 0;
    var favTxt =
      '<a href="favoritos.html">Mis favoritos' +
      (favN ? ' <span class="pill">' + favN + "</span>" : "") +
      "</a>";
    var out = [];

    if (s) {
      out.push(
        '<div class="perfil__cab"><strong>' +
          esc(s.nombre) +
          "</strong>" +
          (s.email ? "<span>" + esc(s.email) + "</span>" : "") +
          '<span class="perfil__rol perfil__rol--' +
          s.rol +
          '">' +
          (s.rol === "admin" ? "Administrador" : "Cliente") +
          "</span></div>"
      );
      out.push('<a href="perfil.html">Mi perfil y mis datos</a>');
      out.push(favTxt);
      if (s.rol === "admin")
        out.push('<a href="admin.html" class="perfil__destacado">Panel de administración</a>');
      out.push('<button type="button" data-accion="salir">Cerrar sesión</button>');
    } else {
      out.push(
        '<div class="perfil__cab"><strong>Bienvenido/a</strong>' +
          "<span>Accede para guardar favoritos y tus datos</span></div>"
      );
      out.push(favTxt);
      out.push(
        '<button type="button" class="btn btn--primario btn--bloque" data-accion="entrar" style="margin-top:.4rem">Iniciar sesión</button>'
      );
    }
    return out.join("");
  }

  function modalHTML() {
    return (
      '<div class="modal-sesion" id="modal-sesion" hidden>' +
      '<div class="modal-sesion__caja" role="dialog" aria-modal="true" aria-label="Iniciar sesión">' +
      '<button type="button" class="modal-sesion__x" data-cerrar aria-label="Cerrar">&times;</button>' +
      "<h3>Iniciar sesión</h3>" +
      '<p class="texto-apoyo">Demostración: elige con qué rol quieres entrar. No pide contraseña — sirve para ver la experiencia de cada perfil.</p>' +
      '<div class="form-campo"><label for="ms-nombre">Tu nombre</label><input id="ms-nombre" placeholder="Nombre y apellidos"></div>' +
      '<div class="form-campo"><label for="ms-email">Email</label><input id="ms-email" type="email" placeholder="tucorreo@ejemplo.com"></div>' +
      '<div class="modal-sesion__roles">' +
      '<button type="button" class="btn btn--linea" data-entrar="cliente">Entrar como cliente</button>' +
      '<button type="button" class="btn btn--oscuro" data-entrar="admin">Entrar como administrador</button>' +
      "</div>" +
      '<p class="texto-apoyo" style="font-size:.78rem;margin:.9rem 0 0">Prototipo · la autenticación real se añade en la Fase 2.</p>' +
      "</div>" +
      "</div>"
    );
  }

  /* ---------- Pie ---------- */
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
      '<li><a href="favoritos.html">Mis favoritos</a></li>' +
      "</ul></div>" +
      "<div><h4>Agencia</h4><ul>" +
      '<li><a href="nosotros.html">Sobre nosotros</a></li>' +
      '<li><a href="informacion.html">Guías y trámites</a></li>' +
      '<li><a href="publica.html">Solicitar valoración</a></li>' +
      '<li><a href="contacto.html">Contacto</a></li>' +
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

  /* ---------- Respaldo de imágenes rotas ---------- */
  document.addEventListener(
    "error",
    function (e) {
      var img = e.target;
      if (
        img &&
        img.tagName === "IMG" &&
        !img.dataset.fallback &&
        !/picsum\.photos/.test(img.src) &&
        /^https?:/.test(img.src)
      ) {
        img.dataset.fallback = "1";
        img.src =
          "https://picsum.photos/seed/piso-" + Math.abs(hashTxt(img.src)) + "/1200/800";
      }
    },
    true
  );

  function hashTxt(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  /* ---------- Widget de cuenta ---------- */
  function refrescarPerfil() {
    var menu = document.getElementById("perfil-menu");
    if (menu) menu.innerHTML = menuHTML();

    var num = document.getElementById("perfil-num");
    if (num) {
      var n = window.InmoFav ? window.InmoFav.total() : 0;
      num.textContent = n;
      num.hidden = n === 0;
    }

    var admin = window.InmoSesion && window.InmoSesion.esAdmin();
    document.body.classList.toggle("sesion-admin", !!admin);
    pintarBarraAdmin(!!admin);
  }

  function pintarBarraAdmin(mostrar) {
    var barra = document.getElementById("barra-admin");
    if (!mostrar) {
      if (barra) barra.remove();
      return;
    }
    if (barra) return;
    var header = document.querySelector(".cabecera");
    if (!header) return;
    barra = document.createElement("div");
    barra.id = "barra-admin";
    barra.className = "barra-admin";
    barra.innerHTML =
      "<span>Estás en <strong>modo administrador</strong> (demo)</span>" +
      '<a href="admin.html">Ir al panel</a>' +
      '<button type="button" data-accion="salir">Salir</button>';
    header.insertAdjacentElement("afterend", barra);
  }

  function abrirModal() {
    var m = document.getElementById("modal-sesion");
    if (m) m.hidden = false;
  }
  function cerrarModal() {
    var m = document.getElementById("modal-sesion");
    if (m) m.hidden = true;
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

    if (!document.getElementById("modal-sesion")) {
      document.body.insertAdjacentHTML("beforeend", modalHTML());
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

    // Desplegable de cuenta
    var pBtn = document.getElementById("perfil-btn");
    var pMenu = document.getElementById("perfil-menu");
    if (pBtn && pMenu) {
      pBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var abrir = pMenu.hidden;
        pMenu.hidden = !abrir;
        pBtn.setAttribute("aria-expanded", abrir ? "true" : "false");
      });
      document.addEventListener("click", function (e) {
        if (!pMenu.hidden && !document.getElementById("perfil").contains(e.target)) {
          pMenu.hidden = true;
          pBtn.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Acciones globales (delegación): favoritos, entrar, salir, cerrar modal
    document.addEventListener("click", function (e) {
      var fav = e.target.closest && e.target.closest("[data-fav]");
      if (fav) {
        e.preventDefault();
        if (window.InmoFav) {
          var marcado = window.InmoFav.alternar(fav.getAttribute("data-fav"));
          fav.classList.toggle("activo", marcado);
          fav.setAttribute("aria-pressed", marcado);
          fav.setAttribute(
            "aria-label",
            marcado ? "Quitar de favoritos" : "Guardar en favoritos"
          );
        }
        return;
      }

      var acc = e.target.closest && e.target.closest("[data-accion]");
      if (acc) {
        var a = acc.getAttribute("data-accion");
        if (a === "entrar") abrirModal();
        else if (a === "salir" && window.InmoSesion) window.InmoSesion.salir();
        if (pMenu) pMenu.hidden = true;
        return;
      }

      var entrarRol = e.target.closest && e.target.closest("[data-entrar]");
      if (entrarRol && window.InmoSesion) {
        var nombre = (document.getElementById("ms-nombre") || {}).value || "";
        var email = (document.getElementById("ms-email") || {}).value || "";
        window.InmoSesion.entrar({
          nombre: nombre,
          email: email,
          rol: entrarRol.getAttribute("data-entrar"),
        });
        cerrarModal();
        return;
      }

      if (e.target.closest && e.target.closest("[data-cerrar]")) cerrarModal();
      else if (e.target.id === "modal-sesion") cerrarModal();
    });

    // Reacciona a cambios de sesión / favoritos
    window.addEventListener("inmo:sesion", refrescarPerfil);
    window.addEventListener("inmo:favoritos", function () {
      refrescarPerfil();
      // sincroniza los corazones visibles con el estado real
      document.querySelectorAll("[data-fav]").forEach(function (b) {
        var m = window.InmoFav.tiene(b.getAttribute("data-fav"));
        b.classList.toggle("activo", m);
        b.setAttribute("aria-pressed", m);
      });
    });

    refrescarPerfil();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
