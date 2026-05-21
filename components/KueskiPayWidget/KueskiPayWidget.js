// components/KueskiPayWidget.js
import React, { useEffect, useState } from 'react';
import Script from 'next/script';

const KueskiPayWidget = ({product_price, product_title, widget_type=''}) => {
  const [loaded, setLoaded] = useState(() => typeof window !== 'undefined' && !!window.KueskipayAdvertising);

  useEffect(() => {
    // Verifica que el objeto global y la clase existan y luego inicializa
    if (typeof window !== 'undefined' && window.KueskipayAdvertising) {
      new window.KueskipayAdvertising().init();
    }
  }, [loaded]);

  return (
    <div>
      <Script
        id="kpay-advertising-script"
        src={`https://cdn.kueskipay.com/widgets.js?authorization=${process.env.NEXT_PUBLIC_KUESKIPAY_API_KEY}&integration=API&sandbox=false`}
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      <kueskipay-widget
        data-kpay-widget-type={widget_type}
        data-kpay-color-scheme="black"
        data-kpay-widget-font-size="12"
        data-kpay-widget-text-align="left"
        style={{ display: "initial" }}
        data-kpay-widget-amount={product_price}
        data-kpay-widget-product-name={product_title}>
      </kueskipay-widget>
    </div>
  );
};

export default KueskiPayWidget;