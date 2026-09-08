/* ============================================================
   listado.js — páginas de venta y alquiler.
   La página fija la operación con  <body data-operacion="venta|alquiler">
   o deja libre para un listado completo.
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var raiz = document.getElementById("listado");
    if (!raiz) return;

    var operacionFija = document.body.getAttribute("data-operacion") || "";
    var form = document.getElementById("filtros-form");
    var grid = document.getElementById("resultados-grid");
    var conteo = document.getElementById("resultados-conteo");
    var selOrden = document.getElementById("orden");
    var btnLimpiar = document.getElementById("btn-limpiar");
    var btnToggle = document.getElementById("filtros-toggle");
    var panelFiltros = document.getElementById("filtros");

    var todas = [];

    Inmo.propiedades().then(function (lista) {
      todas = operacionFija
        ? lista.filter(function (p) {
            return p.operacion === operacionFija;
          })
        : lista;

      poblarDesplegables(todas);
      aplicarQueryInicial();
      render();
    });

    function poblarDesplegables(lista) {
      var selTipo = form.querySelector('[name="tipo"]');
      var selBarrio = form.querySelector('[name="barrio"]');
      Inmo.tipos(lista).forEach(function (t) {
        selTipo.appendChild(opcion(t, t.charAt(0).toUpperCase() + t.slice(1)));
      });
      Inmo.barrios(lista).forEach(function (b) {
        selBarrio.appendChild(opcion(b, b));
      });
    }

    function opcion(value, txt) {
      var o = document.createElement("option");
      o.value = value;
      o.textContent = txt;
      return o;
    }

    function aplicarQueryInicial() {
      var q = Inmo.leerQuery();
      Object.keys(q).forEach(function (k) {
        var campo = form.elements[k];
        if (campo) campo.value = q[k];
      });
      if (q.orden && selOrden) selOrden.value = q.orden;
    }

    function criteriosActuales() {
      var d = new FormData(form);
      return {
        operacion: operacionFija || d.get("operacion") || "",
        tipo: d.get("tipo") || "",
        barrio: d.get("barrio") || "",
        habitaciones: d.get("habitaciones") || "",
        precioMin: d.get("precioMin") || "",
        precioMax: d.get("precioMax") || "",
        m2Min: d.get("m2Min") || "",
        texto: d.get("texto") || "",
      };
    }

    function render() {
      var c = criteriosActuales();
      var filtradas = Inmo.filtrar(todas, c);
      var ordenadas = Inmo.ordenar(filtradas, selOrden ? selOrden.value : "recientes");

      conteo.textContent =
        ordenadas.length +
        (ordenadas.length === 1 ? " propiedad encontrada" : " propiedades encontradas");

      grid.innerHTML = ordenadas.length
        ? ordenadas.map(Inmo.tarjeta).join("")
        : '<div class="sin-resultados"><h3>No hay propiedades con esos criterios</h3>' +
          "<p>Prueba a ampliar la zona o el rango de precio.</p></div>";

      // Sincroniza URL
      var query = {};
      Object.keys(c).forEach(function (k) {
        if (k !== "operacion" && c[k]) query[k] = c[k];
      });
      if (selOrden && selOrden.value !== "recientes") query.orden = selOrden.value;
      Inmo.escribirQuery(query);
    }

    form.addEventListener("input", render);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });
    if (selOrden) selOrden.addEventListener("change", render);

    if (btnLimpiar) {
      btnLimpiar.addEventListener("click", function () {
        form.reset();
        if (selOrden) selOrden.value = "recientes";
        render();
      });
    }

    if (btnToggle && panelFiltros) {
      btnToggle.addEventListener("click", function () {
        panelFiltros.classList.toggle("oculta");
      });
    }
  });
})();
