// pages/api/google-reviews.js

export default function handler(req, res) {
  // JSON de ejemplo (mock) para pruebas
  const mockData = {
    "html_attributions": [],
    "result":
    {
      "address_components":
        [
          {
            "long_name": "10B",
            "short_name": "10B",
            "types":
              [
                "subpremise"
              ]
          },
          {
            "long_name": "1959",
            "short_name": "1959",
            "types":
              [
                "street_number"
              ]
          },
          {
            "long_name": "Boulevard Municipio Libre",
            "short_name": "Blvd. Municipio Libre",
            "types":
              [
                "route"
              ]
          },
          {
            "long_name": "Reserva Territorial Atlixcáyotl",
            "short_name": "Reserva Territorial Atlixcáyotl",
            "types":
              [
                "neighborhood",
                "political"
              ]
          },
          {
            "long_name": "Col. La Cima",
            "short_name": "Col. La Cima",
            "types":
              [
                "sublocality_level_1",
                "sublocality",
                "political"
              ]
          },
          {
            "long_name": "Heroica Puebla de Zaragoza",
            "short_name": "Heroica Puebla de Zaragoza",
            "types":
              [
                "locality",
                "political"
              ]
          },
          {
            "long_name": "Puebla",
            "short_name": "Pue.",
            "types":
              [
                "administrative_area_level_1",
                "political"
              ]
          },
          {
            "long_name": "México",
            "short_name": "MX",
            "types":
              [
                "country",
                "political"
              ]
          },
          {
            "long_name": "72464",
            "short_name": "72464",
            "types":
              [
                "postal_code"
              ]
          }
        ],
      "adr_address": "\u003cspan class=\"street-address\"\u003eBlvd. Municipio Libre 1959\u003c/span\u003e-10B, \u003cspan class=\"extended-address\"\u003eReserva Territorial Atlixcáyotl, Col. La Cima\u003c/span\u003e, \u003cspan class=\"postal-code\"\u003e72464\u003c/span\u003e \u003cspan class=\"locality\"\u003eHeroica Puebla de Zaragoza\u003c/span\u003e, \u003cspan class=\"region\"\u003ePue.\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eMéxico\u003c/span\u003e",
      "business_status": "OPERATIONAL",
      "current_opening_hours":
      {
        "open_now": false,
        "periods":
          [
            {
              "close":
              {
                "date": "2025-03-10",
                "day": 1,
                "time": "1800"
              },
              "open":
              {
                "date": "2025-03-10",
                "day": 1,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "date": "2025-03-11",
                "day": 2,
                "time": "1800"
              },
              "open":
              {
                "date": "2025-03-11",
                "day": 2,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "date": "2025-03-12",
                "day": 3,
                "time": "1800"
              },
              "open":
              {
                "date": "2025-03-12",
                "day": 3,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "date": "2025-03-13",
                "day": 4,
                "time": "1800"
              },
              "open":
              {
                "date": "2025-03-13",
                "day": 4,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "date": "2025-03-14",
                "day": 5,
                "time": "1800"
              },
              "open":
              {
                "date": "2025-03-14",
                "day": 5,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "date": "2025-03-15",
                "day": 6,
                "time": "1500"
              },
              "open":
              {
                "date": "2025-03-15",
                "day": 6,
                "time": "0900"
              }
            }
          ],
        "weekday_text":
          [
            "lunes: 9:00 a.m. – 6:00 p.m.",
            "martes: 9:00 a.m. – 6:00 p.m.",
            "miércoles: 9:00 a.m. – 6:00 p.m.",
            "jueves: 9:00 a.m. – 6:00 p.m.",
            "viernes: 9:00 a.m. – 6:00 p.m.",
            "sábado: 9:00 a.m. – 3:00 p.m.",
            "domingo: Cerrado"
          ]
      },
      "formatted_address": "Blvd. Municipio Libre 1959-10B, Reserva Territorial Atlixcáyotl, Col. La Cima, 72464 Heroica Puebla de Zaragoza, Pue., México",
      "formatted_phone_number": "81 3402 2741",
      "geometry":
      {
        "location":
        {
          "lat": 19.0107986,
          "lng": -98.24577499999999
        },
        "viewport":
        {
          "northeast":
          {
            "lat": 19.0121802802915,
            "lng": -98.2443453697085
          },
          "southwest":
          {
            "lat": 19.0094823197085,
            "lng": -98.2470433302915
          }
        }
      },
      "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/shopping-71.png",
      "icon_background_color": "#4B96F3",
      "icon_mask_base_uri": "https://maps.gstatic.com/mapfiles/place_api/icons/v2/shopping_pinlet",
      "international_phone_number": "+52 81 3402 2741",
      "name": "CTI Systems",
      "opening_hours":
      {
        "open_now": false,
        "periods":
          [
            {
              "close":
              {
                "day": 1,
                "time": "1800"
              },
              "open":
              {
                "day": 1,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "day": 2,
                "time": "1800"
              },
              "open":
              {
                "day": 2,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "day": 3,
                "time": "1800"
              },
              "open":
              {
                "day": 3,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "day": 4,
                "time": "1800"
              },
              "open":
              {
                "day": 4,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "day": 5,
                "time": "1800"
              },
              "open":
              {
                "day": 5,
                "time": "0900"
              }
            },
            {
              "close":
              {
                "day": 6,
                "time": "1500"
              },
              "open":
              {
                "day": 6,
                "time": "0900"
              }
            }
          ],
        "weekday_text":
          [
            "lunes: 9:00 a.m. – 6:00 p.m.",
            "martes: 9:00 a.m. – 6:00 p.m.",
            "miércoles: 9:00 a.m. – 6:00 p.m.",
            "jueves: 9:00 a.m. – 6:00 p.m.",
            "viernes: 9:00 a.m. – 6:00 p.m.",
            "sábado: 9:00 a.m. – 3:00 p.m.",
            "domingo: Cerrado"
          ]
      },
      "photos":
        [
          {
            "height": 900,
            "html_attributions":
              [
                "\u003ca href=\"https://maps.google.com/maps/contrib/112365468933713888620\"\u003eCTI Cuentas\u003c/a\u003e"
              ],
            "photo_reference": "AUy1YQ08DxN-rgzdL41IRvEJUHIl17g35Y4uCFPaQzfTYj5zi7xf8mcNOa_dUNCniaZNnLVKgrfGFVjz9TW6KNalyRlh9ei5ojmEdqb0aHY4sWEdpKZj0vJPOZxA5LkFfZMg60cEKxiCuVGM9uIVmMrS2-Q6UBj2BcNizeOqO0r4xW_fVk_KvziqNcl25TP2OH9rIRTx8cI_KeOaJyuzAGRajqks23jLoUq5S6DZphB-m2ZZH2uQBpm-uInZAXvIYIUh1nxHY2rJ3kikymhbXB1ySJiCCrbsIudxZXwD8uOLf416Cz1Q3R3Jrwh9MjfAEQB8Trc98znBzDk",
            "width": 1600
          },
          {
            "height": 900,
            "html_attributions":
              [
                "\u003ca href=\"https://maps.google.com/maps/contrib/112158788124906369374\"\u003eCTI Systems\u003c/a\u003e"
              ],
            "photo_reference": "AUy1YQ1qaXW-YpYYChTdG7nUSG56Jq3gSCC8C00CBpiVRcLOqVPDb9x1Bju6Y8dwkO0wyp4xuEc9zVs99SFi_E_iuOpGdulce0MT-agU9pjndxvEb-LVzfQHpu17Z4kkJU99qAq4Oy_Z9PG5xhEl7lXF1hzOT0BbjVAc6Y4l8pnw30wR-rjTY9Uwf_yERoa4bgSka3ERpdIv8JodaMmRIhJnVS4Vww2W9oCJa3SGGSNcX24CGlnqySLPnydyn79r4RWOvqggkSQFxQ3T_qrkyx_pc-9Y7uer6jRoU255MqhH-zA8VB8Mnp5_QYGo5ysoz1-uIDs2xIFv3Jc",
            "width": 1600
          },
          {
            "height": 1080,
            "html_attributions":
              [
                "\u003ca href=\"https://maps.google.com/maps/contrib/112158788124906369374\"\u003eCTI Systems\u003c/a\u003e"
              ],
            "photo_reference": "AUy1YQ3NZH87q8lIoh5PwXKkopgSMBiX9vRGat9zXOZ1mI2inxs6wWL5x5gH4iIEEaqPkHl22ztulbocLPdGzInzhn7DwAselkOuSh3ENHqCSof_MDC7M8Fh7IVb98VPcg19P-ytyh6jfVeNduiXySRdtvN1bf_fox0L_aJ4pGET6LBSDN6B6Y0wUPNntunChtFBSQcZibJEZ-aSqdaxcmg0iFZm4EAsVRI9NHt8G0cQY-t8xCrMCmTZdgKQffwembXIATnPYYvbrmpCkH78pMTlNh1Da_u4qpN47c3B98iAFnYmfzHsI8wge5ZLJZT4lsqhTGbLTocSfzg",
            "width": 1920
          },
          {
            "height": 900,
            "html_attributions":
              [
                "\u003ca href=\"https://maps.google.com/maps/contrib/112158788124906369374\"\u003eCTI Systems\u003c/a\u003e"
              ],
            "photo_reference": "AUy1YQ17ykFFARwVH8zpAsJbv37NlXHTUSAjUnYbGGoCJq6cSRigVxD6zxou9OE_RmoN3Yt_unj0kFnkOvspGI8vLlozpvUwxQFH3q4V6VpKX-IwW1_dLEhY5Ba-NPXS48KSlWxP-rGPhA0OQS1sMJg5CXlpG65gG7AnA9hVKbCLUiY0uuQIoEZK8HeU29-CTjD7TzcxFuGEpY68p-qevU3G6kN43T3Foy-bO8bbh8fnw1qsOVaf_gFBpOGSNZzjt7deVdVLr4oqo2pZkRRUAMIHCXs0DPJzxaQRY6VsIdq6rdu2E_GpMHO_cb1knaepMo41W2zitbYu_yg",
            "width": 1600
          },
          {
            "height": 900,
            "html_attributions":
              [
                "\u003ca href=\"https://maps.google.com/maps/contrib/112365468933713888620\"\u003eCTI Cuentas\u003c/a\u003e"
              ],
            "photo_reference": "AUy1YQ3pukJUkjrZTP83KsycVyB5udKrdhNtFJ0tI0rLkR3GMmCEQR7uivyY3Bsg22YMNBN1qGgU7vuw-kPEJtOL1MWIEul4v5-nQqzuX7NxyeGAfvUdrDMI_u92wnCKIX9MvVWfo0Yh8IJNDro65rR-F24FlAhKDjA39dOp5svUBwEBnw88dd-wSA7_9qUo3mBC2B3fLehLJMd__kzKzZdxaEnwmK1bnwoZLeRjt8rda11xGoucrsQ3s3kx4YtuKbtSRJWOJWwvk8t1qcf3neP_mNR2NNSxnRtG-WzmkNw5ZWIezA1cfP2jOJfLQi_6z2UnlEzIqKc36cE",
            "width": 1600
          },
          {
            "height": 900,
            "html_attributions":
              [
                "\u003ca href=\"https://maps.google.com/maps/contrib/112158788124906369374\"\u003eCTI Systems\u003c/a\u003e"
              ],
            "photo_reference": "AUy1YQ1o0K9jtAcDDgqW5SBTsaVXAFZMjYJv1iAg3aD8s6og8CUll6qdN8R5Hzi6jN24HKoyzVN-G3fvMY7iI30LPa4gRk4i1U34ADSv7fhiqSaOUa3R90DptbWoPsOuFDm8_Jyt-HgU_DX2MudTquikferFMbqEWexMJ-lo-1Ctq7VTyJWl5_NTPWdlQIUOJ4ruepfpMAkfX9HalJAkc1gOP3qyL8u7SuoI74h3xSt5T2N1zpUCBBuJQtj5aD68RVmtuxOJkISw53POVbfBhHKZqS7_Ff9gsZRyR9GtLUGWcFDuOguU0PvEg1L0z4jHM9nPNSpkq8UUUr4",
            "width": 1600
          },
          {
            "height": 900,
            "html_attributions":
              [
                "\u003ca href=\"https://maps.google.com/maps/contrib/112158788124906369374\"\u003eCTI Systems\u003c/a\u003e"
              ],
            "photo_reference": "AUy1YQ0eXVL_hEgL38eYwISVwqvW4cdZACGiQrRga6vOMhQdKOCHw_q7PZDv21w2hZQ-A_n8sP-mRhwa2noKNd6HDVPjZyOSbU3yTh5QxyCjkRHKP3y9RSWFBtN-o7tIksnMlec6jVxxOxhvtYW6z6twbjp-i6xfamKpiSgf0tKBLRPANhU2OU_NvYjYuOllBb_cEwBpmIiJZH9S3TM6hTZMyTTqQ0lvRAcR76Z__WBYSn149KMSNrsV8kHYjNPnlN664L66izreUeb4rmb9iuUE3V-5sFnZOBj51XIwvCiSsULwmVEE-N0RynXB-5SvdqN54sXFPyJGiUE",
            "width": 1600
          }
        ],
      "place_id": "ChIJh4YwC17Hz4URvbLgamN2XO0",
      "plus_code":
      {
        "compound_code": "2Q63+8M Puebla de Zaragoza, Puebla, México",
        "global_code": "76F32Q63+8M"
      },
      "reference": "ChIJh4YwC17Hz4URvbLgamN2XO0",
      "types":
        [
          "store",
          "point_of_interest",
          "establishment"
        ],
      "url": "https://maps.google.com/?cid=17103675654213251773",
      "utc_offset": -360,
      "vicinity": "Boulevard Municipio Libre 1959-10B, Col. La Cima, Heroica Puebla de Zaragoza",
      "website": "https://ctisystems.mx/"
    },
    "status": "OK"
  };

  // Devolver la data simulando la respuesta de Google
  res.status(200).json(mockData);
}
