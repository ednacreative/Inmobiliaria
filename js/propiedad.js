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
        '<button type="button" id="ver-fotos" class="btn btn--linea" style="margin:-0.8rem 0 2rem">Ver las ' +
        p.imagenes.length +
        " fotos</button>" +
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
      activarGaleria(p);
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

    function activarGaleria(p) {
      var visor = document.getElementById("visor");
      if (!visor) return;
      var imgEl = visor.querySelector(".visor__img");
      var contador = visor.querySelector(".visor__contador");
      var btnPrev = visor.querySelector(".visor__prev");
      var btnNext = visor.querySelector(".visor__next");
      var btnCerrar = visor.querySelector(".visor__cerrar");
      var fotos = p.imagenes || [];
      var idx = 0;

      function mostrar(i) {
        if (!fotos.length) return;
        idx = (i + fotos.length) % fotos.length;
        imgEl.src = fotos[idx];
        imgEl.alt = p.titulo + " — foto " + (idx + 1) + " de " + fotos.length;
        if (contador) contador.textContent = idx + 1 + " / " + fotos.length;
        var unaSola = fotos.length < 2;
        btnPrev.hidden = unaSola;
        btnNext.hidden = unaSola;
      }

      function abrir(i) {
        mostrar(i);
        visor.classList.add("abierto");
        document.body.style.overflow = "hidden";
      }

      function cerrar() {
        visor.classList.remove("abierto");
        document.body.style.overflow = "";
      }

      raiz.querySelectorAll(".galeria img").forEach(function (img, i) {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", function () {
          abrir(i);
        });
      });

      var verFotos = document.getElementById("ver-fotos");
      if (verFotos) {
        verFotos.addEventListener("click", function () {
          abrir(0);
        });
      }

      btnPrev.addEventListener("click", function (e) {
        e.stopPropagation();
        mostrar(idx - 1);
      });
      btnNext.addEventListener("click", function (e) {
        e.stopPropagation();
        mostrar(idx + 1);
      });
      btnCerrar.addEventListener("click", function (e) {
        e.stopPropagation();
        cerrar();
      });
      // Clic sobre la imagen = siguiente foto; clic en el fondo = cerrar.
      imgEl.addEventListener("click", function (e) {
        e.stopPropagation();
        mostrar(idx + 1);
      });
      visor.addEventListener("click", cerrar);

      document.addEventListener("keydown", function (e) {
        if (!visor.classList.contains("abierto")) return;
        if (e.key === "Escape") cerrar();
        else if (e.key === "ArrowLeft") mostrar(idx - 1);
        else if (e.key === "ArrowRight") mostrar(idx + 1);
      });
    }

    function activarFormulario(p) {
      var f = document.getElementById("form-contacto-prop");
      if (!f) return;
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = f.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Enviando…";
        }
        var datos = {
          "Tipo de solicitud": "Visita a una vivienda",
          Referencia: p.referencia,
          Inmueble: p.titulo,
          Precio: Inmo.precio(p),
          Ubicación: p.ubicacion.direccion + ", " + p.ubicacion.barrio,
          Nombre: f.nombre.value,
          Teléfono: f.telefono.value,
          Email: f.email.value,
          Mensaje: f.mensaje.value,
          Ficha: location.href,
        };
        var restaura = function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Solicitar visita";
          }
        };
        if (!window.InmoForms) {
          f.innerHTML = avisoOk(p);
          return;
        }
        window.InmoForms.enviar(datos, {
          asunto:
            "📅 Solicitud de visita — " + p.referencia + " · " + p.ubicacion.barrio,
          replyTo: f.email.value,
          autorespuesta:
            "Hola " +
            f.nombre.value +
            ",\n\nHemos recibido tu solicitud de visita para la referencia " +
            p.referencia +
            " (" +
            p.titulo +
            "). Te llamamos en breve para concretar el día y la hora.\n\n" +
            "Un saludo,\nEquipo de Inmobiliaria Sanz\n976 000 000",
        })
          .then(function () {
            f.innerHTML = avisoOk(p);
          })
          .catch(function (err) {
            restaura();
            mostrarError(f, err);
          });
      });
    }

    function avisoOk(p) {
      return (
        '<div class="aviso-form"><strong>¡Solicitud enviada!</strong><br>Gracias, ' +
        "te contactaremos en breve para organizar la visita a la ref. " +
        p.referencia +
        ".</div>"
      );
    }

    function mostrarError(f, err) {
      var prev = f.querySelector(".aviso-error");
      if (prev) prev.remove();
      var div = document.createElement("div");
      div.className = "aviso-form aviso-error";
      div.innerHTML =
        "<strong>No se ha podido enviar.</strong><br>" +
        (err && err.message ? err.message + "<br>" : "") +
        'Escríbenos a <a href="mailto:hola@inmobiliariasanz.es">hola@inmobiliariasanz.es</a> o llámanos al 976 000 000.';
      f.appendChild(div);
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
