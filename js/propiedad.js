/* ============================================================
   propiedad.js — ficha de detalle de una vivienda.
   Lee ?id=SANZ-XXXX de la URL.
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var raiz = document.getElementById("ficha");
    if (!raiz) return;

    var id = Inmo.leerQuery().id;
    if (!id) {
      raiz.innerHTML = mensajeError();
      return;
    }

    Inmo.porId(id).then(function (p) {
      if (!p) {
        raiz.innerHTML = mensajeError();
        return;
      }
      pintar(p);
      Inmo.propiedades().then(function (lista) {
        pintarSimilares(p, lista);
      });
    });

    function mensajeError() {
      return (
        '<div class="contenedor sin-resultados"><h1>Propiedad no encontrada</h1>' +
        '<p>El anuncio que buscas no existe o ha dejado de estar disponible.</p>' +
        '<a class="btn btn--primario" href="venta.html">Ver viviendas en venta</a></div>'
      );
    }

    function pintar(p) {
      var c = p.caracteristicas;
      document.title = p.titulo + " · Inmobiliaria Sanz";

      var galeria = p.imagenes
        .slice(0, 5)
        .map(function (src, i) {
          return (
            '<img src="' +
            src +
            '" alt="' +
            p.titulo +
            " — imagen " +
            (i + 1) +
            '" loading="' +
            (i === 0 ? "eager" : "lazy") +
            '" data-full="' +
            src +
            '">'
          );
        })
        .join("");

      var datos = [
        ["Superficie", c.m2_construidos + " m²"],
        ["Útiles", c.m2_utiles + " m²"],
        ["Habitaciones", c.habitaciones === 0 ? "Estudio" : c.habitaciones],
        ["Baños", c.banos],
        ["Planta", c.planta_texto],
        ["Ascensor", c.ascensor ? "Sí" : "No"],
        ["Año", c.ano_construccion],
        ["Estado", c.estado_conservacion],
        ["Certif. energético", c.certificado_energetico],
        ["Orientación", c.orientacion],
      ];
      if (c.terraza) datos.push(["Terraza", c.m2_terraza + " m²"]);
      if (c.garaje) datos.push(["Garaje", "Incluido"]);
      if (c.trastero) datos.push(["Trastero", "Incluido"]);
      if (c.gastos_comunidad_mes) datos.push(["Comunidad", c.gastos_comunidad_mes + " €/mes"]);

      var datosHTML = datos
        .map(function (d) {
          return "<div class=\"dato\"><span>" + d[0] + "</span><strong>" + d[1] + "</strong></div>";
        })
        .join("");

      var distribucionHTML = p.distribucion
        .map(function (x) {
          return "<li>" + x + "</li>";
        })
        .join("");

      var extrasHTML = p.extras
        .map(function (x) {
          return "<li>" + x + "</li>";
        })
        .join("");

      raiz.innerHTML =
        '<div class="contenedor ficha">' +
        '<p class="ficha__migas"><a href="index.html">Inicio</a> · <a href="' +
        (p.operacion === "alquiler" ? "alquiler.html" : "venta.html") +
        '">' +
        (p.operacion === "alquiler" ? "Alquiler" : "Venta") +
        "</a> · " +
        p.ubicacion.barrio +
        ' · <span>Ref. ' +
        p.referencia +
        "</span></p>" +
        '<div class="ficha__cabecera">' +
        "<div><h1>" +
        p.titulo +
        '</h1><p class="tarjeta__ubicacion">' +
        Inmo.pinSVG() +
        p.ubicacion.direccion +
        ", " +
        p.ubicacion.barrio +
        ", " +
        p.ubicacion.ciudad +
        " (" +
        p.ubicacion.cp +
        ")</p></div>" +
        '<div><div class="ficha__precio">' +
        Inmo.precio(p) +
        "</div><span class=\"insignia insignia--" +
        p.operacion +
        '">' +
        Inmo.etiquetaOperacion(p.operacion) +
        "</span></div>" +
        "</div>" +
        '<div class="galeria">' +
        galeria +
        "</div>" +
        '<div class="ficha__cols">' +
        "<div>" +
        "<h2>Características</h2>" +
        '<div class="datos-clave">' +
        datosHTML +
        "</div>" +
        "<h2>Distribución</h2><ul class=\"lista-check\">" +
        distribucionHTML +
        "</ul>" +
        '<h2 style="margin-top:2rem">Descripción</h2><p>' +
        p.descripcion +
        "</p>" +
        '<h2 style="margin-top:2rem">Equipamiento y extras</h2><ul class="lista-check">' +
        extrasHTML +
        "</ul>" +
        '<h2 style="margin-top:2rem">Ubicación</h2>' +
        "<p>Zona de " +
        p.ubicacion.barrio +
        ". La posición en el mapa es aproximada por privacidad.</p>" +
        '<div id="mapa-ficha" class="mapa-ficha"></div>' +
        "</div>" +
        panelContacto(p) +
        "</div>" +
        '<section class="seccion"><h2>Viviendas similares</h2><div id="similares-grid" class="rejilla"></div></section>' +
        "</div>";

      iniciarMapa(p);
      activarGaleria();
      activarFormulario(p);
    }

    function panelContacto(p) {
      return (
        '<aside class="panel-contacto">' +
        "<h3>¿Te interesa esta vivienda?</h3>" +
        "<p class=\"texto-apoyo\">Escríbenos y un asesor te contacta hoy mismo. Ref. " +
        p.referencia +
        "</p>" +
        '<form id="form-contacto-prop">' +
        '<div class="form-campo"><label for="c-nombre">Nombre</label><input id="c-nombre" name="nombre" required></div>' +
        '<div class="form-campo"><label for="c-tel">Teléfono</label><input id="c-tel" name="telefono" type="tel" required></div>' +
        '<div class="form-campo"><label for="c-email">Email</label><input id="c-email" name="email" type="email" required></div>' +
        '<div class="form-campo"><label for="c-msg">Mensaje</label><textarea id="c-msg" name="mensaje">Hola, me interesa la vivienda ' +
        p.referencia +
        " (" +
        p.titulo +
        "). ¿Podemos concertar una visita?</textarea></div>" +
        '<button class="btn btn--primario btn--bloque" type="submit">Solicitar visita</button>' +
        '<p class="texto-apoyo" style="font-size:.78rem;margin-top:.7rem">Al enviar aceptas la política de privacidad.</p>' +
        "</form>" +
        '<hr style="border:0;border-top:1px solid var(--gris-100);margin:1.2rem 0">' +
        '<p style="margin:0"><strong>Llámanos:</strong> <a href="tel:+34910000000">910 000 000</a></p>' +
        "</aside>"
      );
    }

    function iniciarMapa(p) {
      if (typeof L === "undefined") return;
      var el = document.getElementById("mapa-ficha");
      if (!el) return;
      var mapa = L.map(el, { scrollWheelZoom: false }).setView(
        [p.ubicacion.lat, p.ubicacion.lng],
        15
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(mapa);
      L.circle([p.ubicacion.lat, p.ubicacion.lng], {
        radius: 220,
        color: "#c9992e",
        fillColor: "#e2b04a",
        fillOpacity: 0.25,
      }).addTo(mapa);
    }

    function activarGaleria() {
      var imgs = raiz.querySelectorAll(".galeria img");
      var visor = document.getElementById("visor");
      if (!visor) return;
      var visorImg = visor.querySelector("img");
      imgs.forEach(function (img) {
        img.addEventListener("click", function () {
          visorImg.src = img.getAttribute("data-full");
          visor.classList.add("abierto");
        });
      });
      visor.addEventListener("click", function () {
        visor.classList.remove("abierto");
      });
    }

    function activarFormulario(p) {
      var f = document.getElementById("form-contacto-prop");
      if (!f) return;
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        f.innerHTML =
          '<div class="aviso-form"><strong>¡Solicitud enviada!</strong><br>Gracias, ' +
          "te llamaremos en breve para organizar la visita a la ref. " +
          p.referencia +
          ".</div>";
      });
    }

    function pintarSimilares(p, lista) {
      var cont = document.getElementById("similares-grid");
      if (!cont) return;
      var similares = lista
        .filter(function (o) {
          return (
            o.id !== p.id &&
            o.operacion === p.operacion &&
            (o.ubicacion.barrio === p.ubicacion.barrio || o.tipo === p.tipo) &&
            o.estado_publicacion === "disponible"
          );
        })
        .slice(0, 3);
      if (!similares.length) {
        similares = lista
          .filter(function (o) {
            return o.id !== p.id && o.operacion === p.operacion;
          })
          .slice(0, 3);
      }
      cont.innerHTML = similares.map(Inmo.tarjeta).join("");
    }
  });
})();
