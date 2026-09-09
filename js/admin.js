/* ============================================================
   admin.js — panel de administración (DEMO).

   Gestiona el "overlay" de localStorage (js/data.js): inmuebles
   añadidos, editados y ocultados. Los cambios se ven en toda la web
   pero SOLO en este navegador. En la Fase 2 esto se conecta a la
   base de datos real con permisos por rol.
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("admin-root");
    if (!root) return;

    if (!window.InmoSesion || !window.InmoSesion.esAdmin()) {
      root.innerHTML =
        '<div class="sin-resultados"><h2>Acceso restringido</h2>' +
        "<p>Esta página es solo para administradores.</p>" +
        '<button class="btn btn--primario" data-accion="entrar">Iniciar sesión como administrador</button></div>';
      window.addEventListener("inmo:sesion", function () {
        if (window.InmoSesion.esAdmin()) location.reload();
      });
      return;
    }

    var TIPOS = ["piso", "ático", "dúplex", "casa", "estudio", "loft", "local"];
    var CEE = ["A", "B", "C", "D", "E", "F", "G"];
    var ESTADOS = ["disponible", "reservado", "vendido", "alquilado"];

    var editandoId = null;

    render();

    function render() {
      Inmo.propiedades().then(function (lista) {
        var ov = Inmo.overlayLeer();
        root.innerHTML =
          '<div class="admin-aviso"><strong>Modo demostración.</strong> Los cambios se guardan solo en este navegador ' +
          "(localStorage). En producción se guardarían en la base de datos y los verían todos los usuarios.</div>" +

          '<div class="admin-seccion">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">' +
          "<h2 style=\"margin:0\">Inmuebles <span class=\"pill\">" + lista.length + "</span></h2>" +
          '<div style="display:flex;gap:.6rem;flex-wrap:wrap">' +
          '<button class="btn btn--primario" id="btn-nuevo">+ Añadir inmueble</button>' +
          '<button class="btn btn--linea" id="btn-restaurar">Restaurar catálogo original</button>' +
          "</div></div>" +
          '<div id="form-zona"></div>' +
          '<div class="admin-tabla__scroll"><table class="admin-tabla"><thead><tr>' +
          "<th>Ref.</th><th>Título</th><th>Operación</th><th>Precio</th><th>Zona</th><th>Estado</th><th></th><th>Acciones</th>" +
          "</tr></thead><tbody>" +
          lista.map(function (p) { return fila(p, ov); }).join("") +
          "</tbody></table></div>" +
          "</div>" +

          '<div class="admin-seccion">' +
          "<h2>Solicitudes de valoración</h2>" +
          '<p class="texto-apoyo">Las solicitudes del formulario <a href="publica.html">Solicitar valoración</a> ' +
          "y los mensajes de contacto llegan por email a <strong>edna.creativestudio@gmail.com</strong>. " +
          "En la Fase 2 se listarán aquí para revisarlas y publicarlas con un clic.</p>" +
          "</div>";

        document.getElementById("btn-nuevo").addEventListener("click", function () {
          editandoId = null;
          mostrarFormulario(null);
        });
        document.getElementById("btn-restaurar").addEventListener("click", function () {
          if (confirm("¿Descartar todos los cambios locales y volver al catálogo original?")) {
            Inmo.overlayGuardar({ anadidos: [], editados: {}, ocultos: [] });
            editandoId = null;
            render();
          }
        });

        root.querySelectorAll("[data-editar]").forEach(function (b) {
          b.addEventListener("click", function () {
            editandoId = b.getAttribute("data-editar");
            var p = lista.filter(function (x) { return x.id === editandoId; })[0];
            mostrarFormulario(p);
          });
        });
        root.querySelectorAll("[data-ocultar]").forEach(function (b) {
          b.addEventListener("click", function () { alternarOculto(b.getAttribute("data-ocultar")); });
        });
        root.querySelectorAll("[data-eliminar]").forEach(function (b) {
          b.addEventListener("click", function () {
            if (confirm("¿Eliminar este inmueble añadido?")) eliminarAnadido(b.getAttribute("data-eliminar"));
          });
        });
      });
    }

    function fila(p, ov) {
      var esNuevo = ov.anadidos.some(function (x) { return x.id === p.id; });
      var oculto = ov.ocultos.indexOf(p.id) !== -1;
      var editado = !!ov.editados[p.id];
      var badge = esNuevo
        ? '<span class="admin-badge admin-badge--nuevo">NUEVO</span>'
        : editado
        ? '<span class="admin-badge">editado</span>'
        : "";
      return (
        '<tr class="' + (oculto ? "oculta-fila" : "") + '">' +
        "<td>" + esc(p.referencia || p.id) + "</td>" +
        "<td>" + (p.destacado ? "★ " : "") + esc(p.titulo) + "</td>" +
        "<td>" + esc(p.operacion) + "</td>" +
        "<td>" + Inmo.precio(p) + "</td>" +
        "<td>" + esc(p.ubicacion.barrio) + "</td>" +
        "<td>" + esc(p.estado_publicacion || "disponible") + "</td>" +
        "<td>" + badge + "</td>" +
        '<td><div class="admin-acciones">' +
        '<button data-editar="' + p.id + '">Editar</button>' +
        '<button data-ocultar="' + p.id + '">' + (oculto ? "Mostrar" : "Ocultar") + "</button>" +
        (esNuevo ? '<button data-eliminar="' + p.id + '">Eliminar</button>' : "") +
        "</div></td>" +
        "</tr>"
      );
    }

    function mostrarFormulario(p) {
      var c = (p && p.caracteristicas) || {};
      var u = (p && p.ubicacion) || {};
      var zona = document.getElementById("form-zona");
      zona.innerHTML =
        '<form id="form-inmueble" class="form-grid" style="border:1px solid var(--gris-100);border-radius:var(--radio);padding:1.4rem;margin-bottom:1.5rem">' +
        "<fieldset><legend>" + (p ? "Editar: " + esc(p.titulo) : "Nuevo inmueble") + "</legend></fieldset>" +
        campoSel("operacion", "Operación", ["venta", "alquiler"], p ? p.operacion : "venta") +
        campoSel("tipo", "Tipo", TIPOS, p ? p.tipo : "piso") +
        campo("titulo", "Título del anuncio", p ? p.titulo : "", "text", true) +
        campo("precio", "Precio (€ · €/mes)", p ? p.precio : "", "number", true) +
        campo("direccion", "Dirección", u.direccion || "", "text", true) +
        campo("barrio", "Barrio / zona", u.barrio || "", "text", true) +
        campo("ciudad", "Ciudad", u.ciudad || "Zaragoza") +
        campo("cp", "Código postal", u.cp || "") +
        campo("m2_construidos", "Superficie construida (m²)", c.m2_construidos || "", "number", true) +
        campo("m2_utiles", "Superficie útil (m²)", c.m2_utiles || "", "number") +
        campo("habitaciones", "Habitaciones", c.habitaciones != null ? c.habitaciones : "", "number", true) +
        campo("banos", "Baños", c.banos || "", "number", true) +
        campo("planta_texto", "Planta", c.planta_texto || "", "text") +
        campo("ano_construccion", "Año de construcción", c.ano_construccion || "", "number") +
        campoSel("certificado_energetico", "Certificado energético", [""].concat(CEE), c.certificado_energetico || "") +
        campo("orientacion", "Orientación", c.orientacion || "") +
        campoSel("estado_publicacion", "Estado", ESTADOS, (p && p.estado_publicacion) || "disponible") +
        campo("imagen", "Imagen (URL)", (p && p.imagen_principal) || "", "url") +
        '<div class="form-campo ancho-total"><label for="fi-descripcion">Descripción</label>' +
        '<textarea id="fi-descripcion" name="descripcion">' + esc((p && p.descripcion) || "") + "</textarea></div>" +
        '<div class="form-check-fila"><label><input type="checkbox" name="destacado"' +
        (p && p.destacado ? " checked" : "") + "> Destacado en portada</label></div>" +
        '<div class="ancho-total" style="display:flex;gap:.6rem;flex-wrap:wrap">' +
        '<button class="btn btn--primario" type="submit">' + (p ? "Guardar cambios" : "Añadir inmueble") + "</button>" +
        '<button class="btn btn--linea" type="button" id="fi-cancelar">Cancelar</button>' +
        "</div>" +
        "</form>";

      document.getElementById("fi-cancelar").addEventListener("click", function () {
        zona.innerHTML = "";
        editandoId = null;
      });
      document.getElementById("form-inmueble").addEventListener("submit", function (e) {
        e.preventDefault();
        guardarInmueble(e.target, p);
      });
      zona.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function guardarInmueble(f, original) {
      var ov = Inmo.overlayLeer();
      var num = function (v) { var n = parseFloat(v); return isNaN(n) ? undefined : n; };
      var datos = {
        operacion: f.operacion.value,
        tipo: f.tipo.value,
        titulo: f.titulo.value.trim(),
        precio: num(f.precio.value) || 0,
        destacado: f.destacado.checked,
        estado_publicacion: f.estado_publicacion.value,
        descripcion: f.descripcion.value.trim(),
        imagen_principal: f.imagen.value.trim() || imagenPorDefecto(),
        ubicacion: {
          direccion: f.direccion.value.trim(),
          barrio: f.barrio.value.trim(),
          ciudad: f.ciudad.value.trim() || "Zaragoza",
          provincia: "Zaragoza",
          cp: f.cp.value.trim(),
        },
        caracteristicas: {
          m2_construidos: num(f.m2_construidos.value) || 0,
          m2_utiles: num(f.m2_utiles.value) || num(f.m2_construidos.value) || 0,
          habitaciones: num(f.habitaciones.value) || 0,
          banos: num(f.banos.value) || 1,
          planta_texto: f.planta_texto.value.trim() || "—",
          planta: 0,
          ascensor: true,
          garaje: false,
          trastero: false,
          terraza: false,
          m2_terraza: 0,
          ano_construccion: num(f.ano_construccion.value) || new Date().getFullYear(),
          estado_conservacion: "Buen estado",
          certificado_energetico: f.certificado_energetico.value || "—",
          orientacion: f.orientacion.value.trim() || "—",
          gastos_comunidad_mes: 0,
        },
      };
      datos.imagenes = [datos.imagen_principal];
      datos.distribucion = [];
      datos.extras = [];
      datos.precio_texto = datos.operacion === "alquiler"
        ? datos.precio.toLocaleString("es-ES") + " €/mes"
        : datos.precio.toLocaleString("es-ES") + " €";

      if (original) {
        var base = Inmo.overlayLeer();
        // ¿es un añadido? -> se edita in situ; si es de la BBDD base -> va a editados
        var idx = base.anadidos.findIndex(function (x) { return x.id === original.id; });
        if (idx !== -1) {
          base.anadidos[idx] = Object.assign({}, base.anadidos[idx], datos, {
            id: original.id, referencia: original.referencia || original.id,
          });
        } else {
          base.editados[original.id] = Object.assign({}, base.editados[original.id] || {}, datos);
        }
        Inmo.overlayGuardar(base);
      } else {
        var id = nuevoId(ov);
        var jitter = function () { return +(41.6488 + (Math.random() - 0.5) * 0.06).toFixed(6); };
        datos.id = id;
        datos.referencia = id;
        datos.ubicacion.lat = jitter();
        datos.ubicacion.lng = +(-0.8891 + (Math.random() - 0.5) * 0.08).toFixed(6);
        datos.fecha_publicacion = new Date().toISOString().slice(0, 10);
        ov.anadidos.unshift(datos);
        Inmo.overlayGuardar(ov);
      }

      editandoId = null;
      document.getElementById("form-zona").innerHTML = "";
      render();
    }

    function alternarOculto(id) {
      var ov = Inmo.overlayLeer();
      var i = ov.ocultos.indexOf(id);
      if (i === -1) ov.ocultos.push(id);
      else ov.ocultos.splice(i, 1);
      Inmo.overlayGuardar(ov);
      render();
    }

    function eliminarAnadido(id) {
      var ov = Inmo.overlayLeer();
      ov.anadidos = ov.anadidos.filter(function (x) { return x.id !== id; });
      Inmo.overlayGuardar(ov);
      render();
    }

    function nuevoId(ov) {
      var n = 1 + ov.anadidos.length;
      var id;
      do {
        id = "LOCAL-" + String(n).padStart(4, "0");
        n++;
      } while (ov.anadidos.some(function (x) { return x.id === id; }));
      return id;
    }

    function imagenPorDefecto() {
      return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&q=70";
    }

    /* ---------- helpers de formulario ---------- */
    function campo(name, label, val, tipo, req) {
      return (
        '<div class="form-campo"><label for="fi-' + name + '">' + label + (req ? " *" : "") + "</label>" +
        '<input id="fi-' + name + '" name="' + name + '" type="' + (tipo || "text") + '" value="' + esc(val) + '"' +
        (req ? " required" : "") + "></div>"
      );
    }
    function campoSel(name, label, opciones, sel) {
      return (
        '<div class="form-campo"><label for="fi-' + name + '">' + label + "</label>" +
        '<select id="fi-' + name + '" name="' + name + '">' +
        opciones.map(function (o) {
          var v = o, t = o === "" ? "Sin especificar" : o.charAt(0).toUpperCase() + o.slice(1);
          return '<option value="' + v + '"' + (String(sel) === String(v) ? " selected" : "") + ">" + t + "</option>";
        }).join("") +
        "</select></div>"
      );
    }
    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }
  });
})();
