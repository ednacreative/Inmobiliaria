/* ============================================================
   mapa.js — página de mapa con listado lateral sincronizado.
   Requiere Leaflet (se carga por CDN en mapa.html).
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var elMapa = document.getElementById("mapa-full");
    if (!elMapa || typeof L === "undefined") return;

    var listaEl = document.getElementById("mapa-lista");
    var conteoEl = document.getElementById("mapa-conteo");
    var form = document.getElementById("mapa-filtros");

    var mapa = L.map(elMapa, { scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapa);

    var todas = [];
    var capaMarcadores = L.layerGroup().addTo(mapa);
    var marcadoresPorId = {};

    Inmo.cargar().then(function (db) {
      todas = db.propiedades || [];
      var centro =
        (db.agencia && db.agencia.centro_mapa) || { lat: 40.4238, lng: -3.6905, zoom: 12 };
      mapa.setView([centro.lat, centro.lng], centro.zoom);

      poblarFiltros();
      aplicarQueryInicial();
      actualizar();
    });

    function poblarFiltros() {
      var selBarrio = form.querySelector('[name="barrio"]');
      Inmo.barrios(todas).forEach(function (b) {
        var o = document.createElement("option");
        o.value = b;
        o.textContent = b;
        selBarrio.appendChild(o);
      });
    }

    function aplicarQueryInicial() {
      var q = Inmo.leerQuery();
      Object.keys(q).forEach(function (k) {
        if (form.elements[k]) form.elements[k].value = q[k];
      });
    }

    function criterios() {
      var d = new FormData(form);
      return {
        operacion: d.get("operacion") || "",
        tipo: d.get("tipo") || "",
        barrio: d.get("barrio") || "",
        habitaciones: d.get("habitaciones") || "",
        precioMax: d.get("precioMax") || "",
      };
    }

    function pinIcono(p) {
      var clase = "pin-precio" + (p.operacion === "alquiler" ? " pin-precio--alquiler" : "");
      var txt =
        p.operacion === "alquiler"
          ? Math.round(p.precio) + " €"
          : p.precio >= 1000000
          ? (p.precio / 1000000).toFixed(1) + "M €"
          : Math.round(p.precio / 1000) + "k €";
      return L.divIcon({
        className: "",
        html: '<span class="' + clase + '">' + txt + "</span>",
        iconSize: [60, 24],
        iconAnchor: [30, 24],
      });
    }

    function popupHTML(p) {
      return (
        '<div class="popup-prop">' +
        '<img src="' +
        p.imagen_principal +
        '" alt="' +
        p.titulo +
        '">' +
        "<strong>" +
        Inmo.precio(p) +
        "</strong>" +
        "<div>" +
        p.titulo +
        "</div>" +
        '<div style="color:#6b7787;font-size:.82rem;margin:.2rem 0 .5rem">' +
        p.ubicacion.barrio +
        " · " +
        p.caracteristicas.m2_construidos +
        " m² · " +
        (p.caracteristicas.habitaciones || "0") +
        " hab.</div>" +
        '<a class="btn btn--primario" style="padding:.4rem .8rem;font-size:.82rem" href="propiedad.html?id=' +
        encodeURIComponent(p.id) +
        '">Ver ficha</a>' +
        "</div>"
      );
    }

    function miniTarjeta(p) {
      return (
        '<div class="mini-tarjeta" data-id="' +
        p.id +
        '">' +
        '<img src="' +
        p.imagen_principal +
        '" alt="' +
        p.titulo +
        '">' +
        '<div class="mini-tarjeta__txt">' +
        '<span class="mini-tarjeta__precio">' +
        Inmo.precio(p) +
        "</span>" +
        "<strong>" +
        p.titulo +
        "</strong>" +
        p.ubicacion.barrio +
        " · " +
        p.caracteristicas.m2_construidos +
        " m² · " +
        (p.caracteristicas.habitaciones || "0") +
        " hab." +
        "</div>" +
        "</div>"
      );
    }

    function actualizar() {
      var c = criterios();
      var filtradas = Inmo.filtrar(todas, c);

      capaMarcadores.clearLayers();
      marcadoresPorId = {};

      filtradas.forEach(function (p) {
        var m = L.marker([p.ubicacion.lat, p.ubicacion.lng], { icon: pinIcono(p) })
          .bindPopup(popupHTML(p))
          .addTo(capaMarcadores);
        marcadoresPorId[p.id] = m;
      });

      conteoEl.textContent =
        filtradas.length +
        (filtradas.length === 1 ? " propiedad" : " propiedades");

      listaEl.innerHTML = filtradas.length
        ? filtradas.map(miniTarjeta).join("")
        : '<p class="texto-apoyo">Sin resultados con esos filtros.</p>';

      listaEl.querySelectorAll(".mini-tarjeta").forEach(function (el) {
        el.addEventListener("click", function () {
          var id = el.getAttribute("data-id");
          var m = marcadoresPorId[id];
          if (m) {
            mapa.setView(m.getLatLng(), 15, { animate: true });
            m.openPopup();
          }
          listaEl.querySelectorAll(".mini-tarjeta").forEach(function (x) {
            x.classList.remove("activa");
          });
          el.classList.add("activa");
        });
      });

      if (filtradas.length) {
        var grupo = L.featureGroup(
          filtradas.map(function (p) {
            return marcadoresPorId[p.id];
          })
        );
        try {
          mapa.fitBounds(grupo.getBounds().pad(0.2));
        } catch (e) {
          /* un único punto */
        }
      }

      var query = {};
      Object.keys(c).forEach(function (k) {
        if (c[k]) query[k] = c[k];
      });
      Inmo.escribirQuery(query);
    }

    form.addEventListener("input", actualizar);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      actualizar();
    });
    var btnLimpiar = document.getElementById("mapa-limpiar");
    if (btnLimpiar) {
      btnLimpiar.addEventListener("click", function () {
        form.reset();
        actualizar();
      });
    }

    setTimeout(function () {
      mapa.invalidateSize();
    }, 200);
  });
})();
