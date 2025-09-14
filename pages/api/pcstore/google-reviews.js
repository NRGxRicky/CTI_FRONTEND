// pages/api/google-reviews.js
// Devuelve un snapshot ESTÁTICO de las reseñas de Google para PCStore.mx.
// No realiza ninguna llamada a Google. Útil para pruebas o para servir contenido cacheado.

export default function handler(req, res) {
  // Marca de tiempo del snapshot (para que sepas cuándo se “congelaron” estos datos)
  const last_updated_utc = "2025-09-13T00:00:00Z";

  // Datos estáticos (snapshot)
  const data = {
    html_attributions: [],
    result: {
      address_components: [
        { long_name: "3515", short_name: "3515", types: ["street_number"] },
        { long_name: "Calle 39 Poniente", short_name: "Calle 39 Pte.", types: ["route"] },
        { long_name: "Animas", short_name: "Animas", types: ["sublocality_level_1", "sublocality", "political"] },
        { long_name: "Heroica Puebla de Zaragoza", short_name: "Heroica Puebla de Zaragoza", types: ["locality", "political"] },
        { long_name: "Puebla", short_name: "Pue.", types: ["administrative_area_level_1", "political"] },
        { long_name: "México", short_name: "MX", types: ["country", "political"] },
        { long_name: "72400", short_name: "72400", types: ["postal_code"] }
      ],
      adr_address:
        '<span class="street-address">Calle 39 Pte. 3515</span>, <span class="extended-address">Animas</span>, <span class="postal-code">72400</span> <span class="locality">Heroica Puebla de Zaragoza</span>, <span class="region">Pue.</span>, <span class="country-name">México</span>',
      business_status: "OPERATIONAL",
      current_opening_hours: {
        open_now: false,
        periods: [
          { close: { date: "2025-03-10", day: 1, time: "1800" }, open: { date: "2025-03-10", day: 1, time: "0900" } },
          { close: { date: "2025-03-11", day: 2, time: "1800" }, open: { date: "2025-03-11", day: 2, time: "0900" } },
          { close: { date: "2025-03-12", day: 3, time: "1800" }, open: { date: "2025-03-12", day: 3, time: "0900" } },
          { close: { date: "2025-03-06", day: 4, time: "1800" }, open: { date: "2025-03-06", day: 4, time: "0900" } },
          { close: { date: "2025-03-07", day: 5, time: "1800" }, open: { date: "2025-03-07", day: 5, time: "0900" } }
        ],
        weekday_text: [
          "lunes: 9:00 a.m. – 6:00 p.m.",
          "martes: 9:00 a.m. – 6:00 p.m.",
          "miércoles: 9:00 a.m. – 6:00 p.m.",
          "jueves: 9:00 a.m. – 6:00 p.m.",
          "viernes: 9:00 a.m. – 6:00 p.m.",
          "sábado: Cerrado",
          "domingo: Cerrado"
        ]
      },
      delivery: true,
      formatted_address: "Calle 39 Pte. 3515, Animas, 72400 Heroica Puebla de Zaragoza, Pue., México",
      formatted_phone_number: "222 829 8351",
      geometry: {
        location: { lat: 19.04315799999999, lng: -98.2333943 },
        viewport: {
          northeast: { lat: 19.0445069802915, lng: -98.23204531970849 },
          southwest: { lat: 19.0418090197085, lng: -98.23474328029151 }
        }
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/shopping-71.png",
      icon_background_color: "#4B96F3",
      icon_mask_base_uri: "https://maps.gstatic.com/mapfiles/place_api/icons/v2/shopping_pinlet",
      international_phone_number: "+52 222 829 8351",
      name: "PCStore.mx",
      opening_hours: {
        open_now: false,
        periods: [
          { close: { day: 1, time: "1800" }, open: { day: 1, time: "0900" } },
          { close: { day: 2, time: "1800" }, open: { day: 2, time: "0900" } },
          { close: { day: 3, time: "1800" }, open: { day: 3, time: "0900" } },
          { close: { day: 4, time: "1800" }, open: { day: 4, time: "0900" } },
          { close: { day: 5, time: "1800" }, open: { day: 5, time: "0900" } }
        ],
        weekday_text: [
          "lunes: 9:00 a.m. – 6:00 p.m.",
          "martes: 9:00 a.m. – 6:00 p.m.",
          "miércoles: 9:00 a.m. – 6:00 p.m.",
          "jueves: 9:00 a.m. – 6:00 p.m.",
          "viernes: 9:00 a.m. – 6:00 p.m.",
          "sábado: Cerrado",
          "domingo: Cerrado"
        ]
      },
      photos: [
        {
          height: 4032,
          html_attributions: ['<a href="https://maps.google.com/maps/contrib/114269354353075864829">PCStore.mx</a>'],
          photo_reference:
            "AUy1YQ2IgBsil-wYtz_Aa5VZWi-RfETZRFTPNmzUvPSPXw5bsTSIEAHw4ol5WF0sqpiKDrnonGRk4q_S6fu62q7tzb7DusbBzFB0rfuQS0cmQgaMiPdOQz-tyq8d7cdylu_jNNIdITO3PI465ZPVnrDd21WpBkAW145ChhIVCylM9mz5uD-gymMOK7NH",
          width: 3024
        }
        // ... (dejé una foto para acortar; puedes mantener todas las que ya tenías)
      ],
      place_id: "ChIJUxM4u7LBz4URS3Is_OOd4ZQ",
      plus_code: {
        compound_code: "2QV8+7J Puebla de Zaragoza, Puebla, México",
        global_code: "76F32QV8+7J"
      },
      rating: 5,
      reference: "ChIJUxM4u7LBz4URS3Is_OOd4ZQ",
      // RESEÑAS (con time en epoch y relative_time_description recalculado a 13-sep-2025)
      reviews: [
        {
          author_name: "Jesus Fragoso",
          author_url: "https://www.google.com/maps/contrib/117287947461808306132/reviews",
          language: "es",
          original_language: "es",
          profile_photo_url:
            "https://lh3.googleusercontent.com/a-/ALV-UjUq3K8MZY-l9lKeSZ_4UQYPfmO5YSNlPNQQwPNqgO0od8YTSZo=s128-c0x00000000-cc-rp-mo",
          rating: 5,
          // 2024-11-22 20:28:52 UTC
          relative_time_description: "hace 9 meses",
          text:
            "Excelente servicio!, al principio fue un poco complicado por qué no me llegó mi número de guía o número de orden, pero al ponerme en contacto me tranquilizo saber que todo estaba en orden. Muy amables, atienden tus dudas. Y la respuesta excelente!",
          time: 1732307332,
          translated: false
        },
        {
          author_name: "Hugo Vazquez Machorro",
          author_url: "https://www.google.com/maps/contrib/105761509671537586107/reviews",
          language: "es",
          original_language: "es",
          profile_photo_url:
            "https://lh3.googleusercontent.com/a-/ALV-UjXSlO36xFHjcn7piy03pXPhL2ld3XjOvhRtWKDCGFGHVlsOZS4=s128-c0x00000000-cc-rp-mo-ba2",
          rating: 5,
          // 2025-02-09 00:37:54 UTC
          relative_time_description: "hace 7 meses",
          text:
            "Nunca me habían tratado de esta manera  y más que nada  la paciencia para explicar cada componente para realizar mi compra , 100 % recomendables ,muy profesionales y muy confiables , mi pedido llegó en tiempo y forma tal como lo prometieron",
          time: 1739061474,
          translated: false
        },
        {
          author_name: "Luis Escandón",
          author_url: "https://www.google.com/maps/contrib/108199042278667836283/reviews",
          language: "es",
          original_language: "es",
          profile_photo_url:
            "https://lh3.googleusercontent.com/a-/ALV-UjVb3LeO2p41kPUtU-AtAbDoyaisSIuJGB1PIRXtZwCLQdDFBT0D=s128-c0x00000000-cc-rp-mo-ba4",
          rating: 5,
          // 2025-02-09 02:05:34 UTC
          relative_time_description: "hace 7 meses",
          text:
            "Saben lo que hacen. Son buenos y se ajustan a tus necesidades. Altamente recomendable",
          time: 1739066734,
          translated: false
        },
        {
          author_name: "luis alberto cruz pontigo",
          author_url: "https://www.google.com/maps/contrib/103937605801056151911/reviews",
          language: "es",
          original_language: "es",
          profile_photo_url:
            "https://lh3.googleusercontent.com/a/ACg8ocIWP07_Oe9k6AN47U-hkqro8JE_Z0d9YpwWoUVmSNcHcwo0fA=s128-c0x00000000-cc-rp-mo",
          rating: 5,
          // 2025-02-09 02:23:41 UTC
          relative_time_description: "hace 7 meses",
          text:
            "Buen vendedor puntual y su mercancía es de exelente calidad altamente recomendado",
          time: 1739067821,
          translated: false
        },
        {
          author_name: "Samuel israel Flores Rivera",
          author_url: "https://www.google.com/maps/contrib/102388150142784612859/reviews",
          language: "es",
          original_language: "es",
          profile_photo_url:
            "https://lh3.googleusercontent.com/a-/ALV-UjWihtx7IoxYL-FXGo6ZB_JT51vZp33ZWSSaB8VDNgm5CwDfQtrR=s128-c0x00000000-cc-rp-mo",
          rating: 5,
          // 2024-08-26 23:17:54 UTC
          relative_time_description: "hace 1 año",
          text:
            "Fue una experiencia demaciada satisfactoria , en un comienzo tuve un problema con paquetería , tuvimos un error en captura de datos y no me llegó mi paquete , pero !!! Luis por medio de watsap atención a clientes y me resolvió de inmediato , de una forma atenta y rápida , los felicito por tener integrantes en su equipo con tal compromiso y entrega y con mucha entrega a su trabajo muchas gracias Luis por todo tus servicios y recomiendo PCStore excelente servicio",
          time: 1724714274,
          translated: false
        }
      ],
      types: ["store", "point_of_interest", "establishment"],
      url: "https://maps.google.com/?cid=10728029389887140427",
      user_ratings_total: 15,
      utc_offset: -360,
      vicinity: "Calle 39 Poniente 3515, Heroica Puebla de Zaragoza",
      website: "https://pcstore.mx/"
    },
    status: "OK",
    source: "static_snapshot",
    last_updated_utc
  };

  // Cache headers (opcional, como estático no cambia seguido)
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).json(data);
}