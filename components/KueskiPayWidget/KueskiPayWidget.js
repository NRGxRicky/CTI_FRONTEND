// components/KueskiPayWidget.js
import React, { useEffect } from 'react';

const KueskiPayWidget = ({product_price, product_title, widget_type=''}) => {
  useEffect(() => {
    // Verifica que el objeto global y la clase existan y luego inicializa
    if (typeof window !== 'undefined' && window.KueskipayAdvertising) {
      new window.KueskipayAdvertising().init();
    }
  }, []);

  return (
    <div>
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