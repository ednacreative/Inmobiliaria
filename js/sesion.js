/* ============================================================
   sesion.js — sesión de usuario (DEMO, sin backend).

   Guarda en localStorage un objeto { nombre, email, rol } donde
   rol es "cliente" o "admin". NO hay seguridad real: sirve para
   enseñar la experiencia de los dos roles. En la Fase 2 esto se
   sustituye por autenticación real (Supabase u otro).
   ============================================================ */

window.InmoSesion = (function () {
  "use strict";

  var CLAVE = "inmo_sesion";
  var oyentes = [];

  function leer() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) || "null");
    } catch (e) {
      return null;
    }
  }

  function guardar(s) {
    try {
      if (s) localStorage.setItem(CLAVE, JSON.stringify(s));
      else localStorage.removeItem(CLAVE);
    } catch (e) {}
    oyentes.forEach(function (cb) {
      try {
        cb(s);
      } catch (e) {}
    });
    window.dispatchEvent(new CustomEvent("inmo:sesion", { detail: s }));
  }

  return {
    actual: leer,
    esAdmin: function () {
      var s = leer();
      return !!s && s.rol === "admin";
    },
    identificado: function () {
      return !!leer();
    },
    entrar: function (datos) {
      datos = datos || {};
      guardar({
        nombre: datos.nombre || (datos.rol === "admin" ? "Administrador" : "Cliente"),
        email: datos.email || "",
        rol: datos.rol === "admin" ? "admin" : "cliente",
        desde: Date.now(),
      });
    },
    salir: function () {
      guardar(null);
    },
    onCambio: function (cb) {
      if (typeof cb === "function") oyentes.push(cb);
    },
  };
})();
