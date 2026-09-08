/* ============================================================
   home.js — lógica de la portada: buscador rápido + destacados.
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("buscador-home");
    if (form) {
      Inmo.propiedades().then(function (lista) {
        var selBarrio = form.querySelector('[name="barrio"]');
        if (selBarrio) {
          Inmo.barrios(lista).forEach(function (b) {
            var o = document.createElement("option");
            o.value = b;
            o.textContent = b;
            selBarrio.appendChild(o);
          });
        }
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var datos = new FormData(form);
        var op = datos.get("operacion") || "venta";
        var params = new URLSearchParams();
        ["tipo", "barrio", "precioMax", "habitaciones"].forEach(function (k) {
          var v = datos.get(k);
          if (v) params.set(k, v);
        });
        var destino = op === "alquiler" ? "alquiler.html" : "venta.html";
        var qs = params.toString();
        location.href = destino + (qs ? "?" + qs : "");
      });
    }

    var cont = document.getElementById("destacados-grid");
    if (cont) {
      Inmo.propiedades().then(function (lista) {
        var destacados = lista
          .filter(function (p) {
            return p.destacado && p.estado_publicacion === "disponible";
          })
          .slice(0, 6);
        if (destacados.length < 6) {
          var resto = lista.filter(function (p) {
            return destacados.indexOf(p) === -1 && p.estado_publicacion === "disponible";
          });
          destacados = destacados.concat(resto.slice(0, 6 - destacados.length));
        }
        cont.innerHTML = destacados.map(Inmo.tarjeta).join("");
      });
    }

    var contReciente = document.getElementById("recientes-grid");
    if (contReciente) {
      Inmo.propiedades().then(function (lista) {
        var recientes = Inmo.ordenar(lista, "recientes")
          .filter(function (p) {
            return p.estado_publicacion === "disponible";
          })
          .slice(0, 3);
        contReciente.innerHTML = recientes.map(Inmo.tarjeta).join("");
      });
    }
  });
})();
