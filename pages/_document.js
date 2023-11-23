import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>

          <link
            href="/ico/favicon.ico"
            rel="shortcut icon"
            type="image/x-icon"
          />
          <link
            href="/fonts/ProximaNova-Regular.woff2"
            as="font"
            type="font/woff2"
            rel="preload"
            crossOrigin=""
          />
          <link
            href="/fonts/ProximaNova-Semibold.woff2"
            as="font"
            type="font/woff2"
            rel="preload"
            crossOrigin=""
          />
          <link
            href="/fonts/ProximaNova-Bold.woff2"
            as="font"
            type="font/woff2"
            rel="preload"
            crossOrigin=""
          />
        </Head>
        <meta
          name="description"
          content="PcStore.mx Tienda líder en cómputo, accesorios, hardware, tecnología y más. Compra protegida, envíos asegurados y pagos seguros con los mejores precios, productos y marcas."
        />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
