/* ============================================================
   favoritos.js — favoritos del usuario (localStorage, por navegador).

   Real y funcional sin backend. En la Fase 2, si hay login real,
   pueden pasar a guardarse por usuario en la base de datos.
   ============================================================ */

window.InmoFav = (function () {
  "use strict";

  var CLAVE = "inmo_favoritos";
  var oyentes = [];

  function leer() {
    try {
      var v = JSON.parse(localStorage.getItem(CLAVE) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  function guardar(lista) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lista));
    } catch (e) {}
    oyentes.forEach(function (cb) {
      try {
        cb(lista);
      } catch (e) {}
    });
    window.dispatchEvent(new CustomEvent("inmo:favoritos", { detail: lista }));
  }

  var svgCorazon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.7-4.4-9.3-8.5C1 9.6 2.4 6 5.8 6c2 0 3.3 1.1 4.2 2.4C10.9 7.1 12.2 6 14.2 6c3.4 0 4.8 3.6 3.1 6.5C18.7 16.6 12 21 12 21Z"/></svg>';

  return {
    lista: leer,
    total: function () {
      return leer().length;
    },
    tiene: function (id) {
      return leer().indexOf(id) !== -1;
    },
    alternar: function (id) {
      var l = leer();
      var i = l.indexOf(id);
      if (i === -1) l.push(id);
      else l.splice(i, 1);
      guardar(l);
      return i === -1; // true si ha quedado marcado
    },
    onCambio: function (cb) {
      if (typeof cb === "function") oyentes.push(cb);
    },
    /* Botón de corazón para una tarjeta / ficha */
    boton: function (id, opciones) {
      opciones = opciones || {};
      var activo = this.tiene(id);
      return (
        '<button type="button" class="fav-btn' +
        (activo ? " activo" : "") +
        (opciones.grande ? " fav-btn--grande" : "") +
        '" data-fav="' +
        id +
        '" aria-pressed="' +
        activo +
        '" aria-label="' +
        (activo ? "Quitar de favoritos" : "Guardar en favoritos") +
        '">' +
        svgCorazon +
        "</button>"
      );
    },
  };
})();
