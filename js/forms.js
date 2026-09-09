/* ============================================================
   forms.js — envío de formularios de la web por email.

   Usa FormSubmit.co (https://formsubmit.co): no requiere backend ni
   cuenta. La PRIMERA vez que se envía un formulario, FormSubmit manda
   un correo de activación a la dirección de destino; hay que pulsar
   "Activate Form" una sola vez y a partir de ahí llegan todos los envíos.

   Para reducir spam, tras activar se puede sustituir el email por la
   cadena aleatoria que FormSubmit facilita (endpoint /ajax/<hash>).
   ============================================================ */

window.InmoForms = (function () {
  "use strict";

  var DESTINO = "edna.creativestudio@gmail.com";
  var ENDPOINT = "https://formsubmit.co/ajax/" + encodeURIComponent(DESTINO);

  /**
   * datos: objeto plano { campo: valor }
   * opciones: { asunto: "..." }
   * Devuelve una promesa que resuelve si el envío se aceptó y rechaza
   * (con Error.message legible) si no.
   */
  function enviar(datos, opciones) {
    opciones = opciones || {};

    // FormSubmit rechaza las peticiones desde file:// (Origin nulo).
    if (location.protocol === "file:") {
      return Promise.reject(
        new Error(
          "El envío de formularios no funciona abriendo el archivo con doble clic. " +
            "Usa la web publicada o sírvela en local con «npm run dev»."
        )
      );
    }

    var cuerpo = { _subject: opciones.asunto || "Nuevo mensaje desde la web", _template: "table", _captcha: "false" };
    Object.keys(datos).forEach(function (k) {
      cuerpo[k] = datos[k];
    });

    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(cuerpo),
    }).then(function (r) {
      return r
        .json()
        .catch(function () {
          return {};
        })
        .then(function (j) {
          if (r.ok && j && String(j.success) === "true") return j;
          var msg =
            (j && j.message) ||
            "No se ha podido enviar el formulario en este momento.";
          throw new Error(msg);
        });
    });
  }

  return { enviar: enviar, destino: DESTINO };
})();
