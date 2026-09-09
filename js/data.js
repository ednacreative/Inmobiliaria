/* ============================================================
   data.js — acceso a la "base de datos" de propiedades + utilidades.
   Expone window.Inmo con métodos comunes usados por el resto de scripts.
   ============================================================ */

window.Inmo = (function () {
  "use strict";

  var cache = null;

  /* ---------- Overlay del administrador (DEMO, localStorage) ----------
     El panel de administración guarda aquí los inmuebles añadidos, las
     ediciones y los ocultados. Se fusiona sobre la BBDD base al leer, así
     los cambios del admin se ven en listados, mapa y fichas (en ese
     navegador). En la Fase 2 esto lo sustituye la base de datos real. */
  var OV_CLAVE = "inmo_admin_overlay";

  function overlayLeer() {
    try {
      var o = JSON.parse(localStorage.getItem(OV_CLAVE) || "{}");
      return {
        anadidos: Array.isArray(o.anadidos) ? o.anadidos : [],
        editados: o.editados && typeof o.editados === "object" ? o.editados : {},
        ocultos: Array.isArray(o.ocultos) ? o.ocultos : [],
      };
    } catch (e) {
      return { anadidos: [], editados: {}, ocultos: [] };
    }
  }

  function overlayGuardar(ov) {
    try {
      localStorage.setItem(OV_CLAVE, JSON.stringify(ov));
    } catch (e) {}
  }

  function aplicarOverlay(lista) {
    var ov = overlayLeer();
    var res = lista
      .filter(function (p) {
        return ov.ocultos.indexOf(p.id) === -1;
      })
      .map(function (p) {
        return ov.editados[p.id]
          ? Object.assign({}, p, ov.editados[p.id])
          : p;
      });
    // Los añadidos van primero (los más nuevos arriba).
    return ov.anadidos.concat(res);
  }

  /**
   * Devuelve una promesa con el objeto completo de la BBDD:
   * { agencia, propiedades: [...] , total, ... }
   * Usa window.INMO_DB (data/propiedades.js) si está cargado;
   * si no, intenta fetch del JSON (requiere servir la web por HTTP).
   */
  function cargar() {
    if (cache) return Promise.resolve(cache);

    if (window.INMO_DB && Array.isArray(window.INMO_DB.propiedades)) {
      cache = window.INMO_DB;
      return Promise.resolve(cache);
    }

    return fetch("data/propiedades.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (db) {
        cache = db;
        return db;
      })
      .catch(function (err) {
        console.error("No se pudo cargar la base de datos de propiedades:", err);
        return { agencia: {}, propiedades: [] };
      });
  }

  function propiedades() {
    return cargar().then(function (db) {
      return aplicarOverlay(db.propiedades || []);
    });
  }

  function propiedadesBase() {
    return cargar().then(function (db) {
      return (db.propiedades || []).slice();
    });
  }

  function porId(id) {
    return propiedades().then(function (lista) {
      return lista.filter(function (p) {
        return p.id === id;
      })[0] || null;
    });
  }

  /* ---------- Formateo ---------- */
  function euros(n) {
    return n.toLocaleString("es-ES") + " €";
  }

  function precio(p) {
    return p.operacion === "alquiler" ? euros(p.precio) + "/mes" : euros(p.precio);
  }

  function etiquetaOperacion(op) {
    return op === "alquiler" ? "Alquiler" : "Venta";
  }

  function ubicacionCorta(p) {
    return p.ubicacion.barrio + ", " + p.ubicacion.ciudad;
  }

  /* ---------- Filtrado ---------- */
  /**
   * criterios: {
   *   operacion, tipo, barrio, habitaciones (mín),
   *   precioMin, precioMax, m2Min, texto,
   *   soloDisponibles (bool), soloDestacados (bool)
   * }
   */
  function filtrar(lista, c) {
    c = c || {};
    return lista.filter(function (p) {
      if (c.operacion && p.operacion !== c.operacion) return false;
      if (c.tipo && p.tipo !== c.tipo) return false;
      if (c.barrio && p.ubicacion.barrio !== c.barrio) return false;
      if (c.habitaciones && p.caracteristicas.habitaciones < Number(c.habitaciones)) return false;
      if (c.precioMin && p.precio < Number(c.precioMin)) return false;
      if (c.precioMax && p.precio > Number(c.precioMax)) return false;
      if (c.m2Min && p.caracteristicas.m2_construidos < Number(c.m2Min)) return false;
      if (c.soloDestacados && !p.destacado) return false;
      if (c.soloDisponibles && p.estado_publicacion !== "disponible") return false;
      if (c.texto) {
        var q = c.texto.toLowerCase();
        var heno = (
          p.titulo +
          " " +
          p.ubicacion.barrio +
          " " +
          p.ubicacion.direccion +
          " " +
          p.tipo +
          " " +
          p.referencia
        ).toLowerCase();
        if (heno.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function ordenar(lista, modo) {
    var l = lista.slice();
    switch (modo) {
      case "precio-asc":
        return l.sort(function (a, b) {
          return a.precio - b.precio;
        });
      case "precio-desc":
        return l.sort(function (a, b) {
          return b.precio - a.precio;
        });
      case "m2-desc":
        return l.sort(function (a, b) {
          return b.caracteristicas.m2_construidos - a.caracteristicas.m2_construidos;
        });
      case "recientes":
      default:
        return l.sort(function (a, b) {
          if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
          return a.fecha_publicacion < b.fecha_publicacion ? 1 : -1;
        });
    }
  }

  /* ---------- Listas para desplegables ---------- */
  function barrios(lista) {
    var set = {};
    lista.forEach(function (p) {
      set[p.ubicacion.barrio] = true;
    });
    return Object.keys(set).sort();
  }

  function tipos(lista) {
    var set = {};
    lista.forEach(function (p) {
      set[p.tipo] = true;
    });
    return Object.keys(set).sort();
  }

  /* ---------- Iconos SVG inline para specs ---------- */
  var ICONOS = {
    area:
      '<svg viewBox="0 0 24 24"><path d="M3 3h7M3 3v7M21 21h-7M21 21v-7M3 3l7 7M21 21l-7-7"/></svg>',
    cama:
      '<svg viewBox="0 0 24 24"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 14h18M3 18h18M6 10V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>',
    bano:
      '<svg viewBox="0 0 24 24"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2M7 19l-1 2M18 19l1 2"/></svg>',
    escalera:
      '<svg viewBox="0 0 24 24"><path d="M4 20h4v-4h4v-4h4v-4h4"/></svg>',
    ascensor:
      '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 9l1.5-2L12 9M13 15l1.5 2 1.5-2"/></svg>',
  };

  function spec(icono, texto) {
    return (
      '<span class="spec">' + (ICONOS[icono] || "") + "<span>" + texto + "</span></span>"
    );
  }

  /* ---------- Tarjeta de propiedad (HTML) ---------- */
  function tarjeta(p) {
    var c = p.caracteristicas;
    var estadoInsignia =
      p.estado_publicacion !== "disponible"
        ? '<span class="insignia insignia--estado">' +
          p.estado_publicacion.charAt(0).toUpperCase() +
          p.estado_publicacion.slice(1) +
          "</span>"
        : "";
    var destacadoInsignia = p.destacado
      ? '<span class="insignia insignia--destacado">Destacado</span>'
      : "";

    var specs =
      spec("area", c.m2_construidos + " m²") +
      spec("cama", (c.habitaciones === 0 ? "Estudio" : c.habitaciones + " hab.")) +
      spec("bano", c.banos + (c.banos === 1 ? " baño" : " baños")) +
      spec("escalera", c.planta_texto);

    var favBtn = window.InmoFav ? window.InmoFav.boton(p.id) : "";

    return (
      '<article class="tarjeta">' +
      '<div class="tarjeta__media">' +
      '<a href="propiedad.html?id=' +
      encodeURIComponent(p.id) +
      '" aria-label="' +
      p.titulo +
      '">' +
      '<img src="' +
      p.imagen_principal +
      '" alt="' +
      p.titulo +
      '" loading="lazy" width="600" height="450">' +
      "</a>" +
      '<span class="tarjeta__insignias">' +
      '<span class="insignia insignia--' +
      p.operacion +
      '">' +
      etiquetaOperacion(p.operacion) +
      "</span>" +
      destacadoInsignia +
      estadoInsignia +
      "</span>" +
      favBtn +
      '<span class="tarjeta__precio">' +
      precio(p) +
      "</span>" +
      "</div>" +
      '<div class="tarjeta__cuerpo">' +
      '<h3 class="tarjeta__titulo"><a href="propiedad.html?id=' +
      encodeURIComponent(p.id) +
      '">' +
      p.titulo +
      "</a></h3>" +
      '<p class="tarjeta__ubicacion">' +
      pinSVG() +
      p.ubicacion.direccion +
      " · " +
      p.ubicacion.barrio +
      "</p>" +
      '<div class="tarjeta__specs">' +
      specs +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function pinSVG() {
    return (
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>'
    );
  }

  /* ---------- Query string ---------- */
  function leerQuery() {
    var q = {};
    new URLSearchParams(location.search).forEach(function (v, k) {
      if (v !== "") q[k] = v;
    });
    return q;
  }

  function escribirQuery(obj) {
    var params = new URLSearchParams();
    Object.keys(obj).forEach(function (k) {
      if (obj[k] !== "" && obj[k] != null) params.set(k, obj[k]);
    });
    var qs = params.toString();
    history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  return {
    cargar: cargar,
    propiedades: propiedades,
    propiedadesBase: propiedadesBase,
    porId: porId,
    overlayLeer: overlayLeer,
    overlayGuardar: overlayGuardar,
    euros: euros,
    precio: precio,
    etiquetaOperacion: etiquetaOperacion,
    ubicacionCorta: ubicacionCorta,
    filtrar: filtrar,
    ordenar: ordenar,
    barrios: barrios,
    tipos: tipos,
    tarjeta: tarjeta,
    spec: spec,
    pinSVG: pinSVG,
    leerQuery: leerQuery,
    escribirQuery: escribirQuery,
  };
})();
