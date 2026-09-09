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

    // name -> etiqueta en el email. El prefijo numérico (01., 02., …) fuerza
    // que la tabla del correo salga EN EL MISMO ORDEN que el formulario,
    // aunque FormSubmit reordene los campos.
    var ETIQUETAS = {
      operacion: "01. Operación",
      tipo: "02. Tipo de inmueble",
      precio: "03. Precio",
      estado_conservacion: "04. Estado de conservación",
      direccion: "05. Dirección",
      barrio: "06. Barrio / zona",
      ciudad: "07. Ciudad",
      cp: "08. Código postal",
      m2_construidos: "09. Superficie construida (m²)",
      m2_utiles: "10. Superficie útil (m²)",
      habitaciones: "11. Habitaciones",
      banos: "12. Baños",
      planta: "13. Planta",
      ano_construccion: "14. Año de construcción",
      certificado_energetico: "15. Certificado energético",
      orientacion: "16. Orientación",
      gastos_comunidad_mes: "17. Gastos de comunidad (€/mes)",
      m2_terraza: "18. Superficie de terraza (m²)",
      ascensor: "19. Ascensor",
      garaje: "20. Garaje",
      trastero: "21. Trastero",
      terraza: "22. Terraza",
      descripcion: "23. Descripción",
      extras: "24. Equipamiento y extras",
      fotos_enlace: "25. Enlace a las fotos",
      contacto_nombre: "26. Contacto · Nombre y apellidos",
      contacto_telefono: "27. Contacto · Teléfono",
      contacto_email: "28. Contacto · Email",
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
        btn.textContent = "Solicitar valoración gratuita";
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
        plantilla: "table",
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
