/* ============================================================
   publica.js — formulario "Publica tu inmueble".
   Envía la ficha del inmueble por email (FormSubmit, ver js/forms.js).
   No publica nada en el listado: es una solicitud de revisión.
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var f = document.getElementById("form-publica");
    if (!f) return;
    var ok = document.getElementById("publica-ok");
    var err = document.getElementById("publica-error");

    // name -> etiqueta legible en el email
    var ETIQUETAS = {
      operacion: "Operación",
      tipo: "Tipo de inmueble",
      precio: "Precio",
      estado_conservacion: "Estado de conservación",
      direccion: "Dirección",
      barrio: "Barrio / zona",
      ciudad: "Ciudad",
      cp: "Código postal",
      m2_construidos: "Superficie construida (m²)",
      m2_utiles: "Superficie útil (m²)",
      habitaciones: "Habitaciones",
      banos: "Baños",
      planta: "Planta",
      ano_construccion: "Año de construcción",
      certificado_energetico: "Certificado energético",
      orientacion: "Orientación",
      gastos_comunidad_mes: "Gastos de comunidad (€/mes)",
      m2_terraza: "Superficie de terraza (m²)",
      ascensor: "Ascensor",
      garaje: "Garaje",
      trastero: "Trastero",
      terraza: "Terraza",
      descripcion: "Descripción",
      extras: "Equipamiento y extras",
      fotos_enlace: "Enlace a las fotos",
      contacto_nombre: "Contacto · Nombre",
      contacto_telefono: "Contacto · Teléfono",
      contacto_email: "Contacto · Email",
    };

    var CHECKS = ["ascensor", "garaje", "trastero", "terraza"];

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Enviando…";
      err.classList.add("oculto");

      var datos = {};
      Object.keys(ETIQUETAS).forEach(function (name) {
        var etq = ETIQUETAS[name];
        if (CHECKS.indexOf(name) !== -1) {
          datos[etq] = f.elements[name] && f.elements[name].checked ? "Sí" : "No";
          return;
        }
        var el = f.elements[name];
        if (!el) return;
        var v = (el.value || "").trim();
        if (v !== "") datos[etq] = v;
      });

      var titular =
        (f.elements.tipo.value || "Inmueble") +
        " en " +
        (f.elements.barrio.value || f.elements.ciudad.value || "Zaragoza");

      var fin = function () {
        btn.disabled = false;
        btn.textContent = "Enviar inmueble para revisión";
      };

      var exito = function () {
        f.classList.add("oculto");
        ok.innerHTML =
          "<strong>¡Inmueble recibido!</strong><br>Gracias. Vamos a revisar la ficha de tu " +
          titular.toLowerCase() +
          " y te contactaremos en el email o teléfono que nos has dejado para confirmar la publicación. " +
          "Recuerda: no se publica automáticamente.";
        ok.classList.remove("oculto");
        window.scrollTo({
          top: ok.getBoundingClientRect().top + window.scrollY - 120,
          behavior: "smooth",
        });
      };

      if (!window.InmoForms) {
        fin();
        exito();
        return;
      }

      window.InmoForms.enviar(datos, {
        asunto: "🏠 Nuevo inmueble para revisar: " + titular,
        replyTo: f.elements.contacto_email.value,
        autorespuesta:
          "Hola " +
          f.elements.contacto_nombre.value +
          ",\n\nHemos recibido la ficha de tu " +
          titular.toLowerCase() +
          ". La revisaremos y te contactaremos en el email o teléfono que nos has dejado " +
          "para confirmar la publicación. Recuerda que no se publica de forma automática.\n\n" +
          "Gracias por confiar en Inmobiliaria Sanz.\n976 000 000 · hola@inmobiliariasanz.es",
      })
        .then(exito)
        .catch(function (e2) {
          fin();
          err.innerHTML =
            "<strong>No se ha podido enviar.</strong><br>" +
            (e2 && e2.message ? e2.message + "<br>" : "") +
            'Escríbenos a <a href="mailto:hola@inmobiliariasanz.es">hola@inmobiliariasanz.es</a> ' +
            "o llámanos al 976 000 000 y publicamos tu inmueble contigo.";
          err.classList.remove("oculto");
        });
    });
  });
})();
