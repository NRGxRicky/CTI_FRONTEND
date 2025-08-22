// Utilidades para Google Analytics 4 - Enhanced Ecommerce Events

// Función para enviar eventos a Google Analytics
export const gtag = (...args) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Función para formatear productos para GA4
// Extrae los nombres de los objetos que envía ProductSerializer
const formatProductForGA = (product, quantity = 1, price = null) => {
  return {
    item_id: product.id?.toString() || '',
    item_name: product.titulo || '',
    item_category: product.categoria?.name || '',     // categoria.name del objeto que envía el backend
    item_brand: product.marca?.nombre || '',          // marca.nombre del objeto que envía el backend
    price: price || parseFloat(product.precio_contado || 0),
    quantity: parseInt(quantity) || 1,
    currency: 'MXN'
  };
};

// Función para formatear carrito completo para GA4
const formatCartForGA = (cart, cartMsi = false) => {
  return cart.map(item => {
    let price;

    // Si el item tiene un unit_price y quote_id, usar ese precio (desde la cotización)
    if (item.unit_price && item.quote_id) {
      price = parseFloat(item.unit_price);
    } else {
      // Usar la lógica normal basada en el modo MSI
      price = !cartMsi
        ? parseFloat(item.product.precio_contado)
        : parseFloat(item.product.precio_final_descuento) > 0
          ? parseFloat(item.product.precio_final_descuento)
          : parseFloat(item.product.precio_final);
    }

    return formatProductForGA(item.product, item.quantity, price);
  });
};

// 1. Evento: Ver producto (view_item)
export const trackViewItem = (product) => {
  gtag('event', 'view_item', {
    currency: 'MXN',
    value: parseFloat(product.precio_contado || product.price || 0),
    items: [formatProductForGA(product)]
  });
};

// 2. Evento: Agregar al carrito (add_to_cart)
export const trackAddToCart = (product, quantity = 1, cartValue = 0) => {
  const formattedProduct = formatProductForGA(product, quantity);

  debugLog('🛒 Google Analytics - Add to Cart Event:', {
    product_id: product.id,
    product_titulo: product.titulo,
    extracted_categoria: product.categoria?.name,    // Extraído del objeto
    extracted_marca: product.marca?.nombre,          // Extraído del objeto
    product_precio_contado: product.precio_contado,
    formatted_for_ga: formattedProduct,              // Datos finales para GA4
    quantity,
    cartValue
  });

  gtag('event', 'add_to_cart', {
    currency: 'MXN',
    value: cartValue,
    items: [formattedProduct]
  });
};

// 3. Evento: Remover del carrito (remove_from_cart)
export const trackRemoveFromCart = (product, quantity = 1, cartValue = 0) => {
  gtag('event', 'remove_from_cart', {
    currency: 'MXN',
    value: cartValue,
    items: [formatProductForGA(product, quantity)]
  });
};

// 4. Evento: Ver carrito (view_cart)
export const trackViewCart = (cart, cartTotal, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  gtag('event', 'view_cart', {
    currency: 'MXN',
    value: cartTotal,
    items: formatCartForGA(cart, cartMsi)
  });
};

// 5. Evento: Iniciar checkout (begin_checkout)
export const trackBeginCheckout = (cart, cartTotal, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  gtag('event', 'begin_checkout', {
    currency: 'MXN',
    value: cartTotal,
    items: formatCartForGA(cart, cartMsi)
  });
};

// 6. Evento: Información de envío (add_shipping_info)
export const trackAddShippingInfo = (cart, cartTotal, shippingTier, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  gtag('event', 'add_shipping_info', {
    currency: 'MXN',
    value: cartTotal,
    shipping_tier: shippingTier,
    items: formatCartForGA(cart, cartMsi)
  });
};

// 7. Evento: Información de pago (add_payment_info)
export const trackAddPaymentInfo = (cart, cartTotal, paymentType, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  gtag('event', 'add_payment_info', {
    currency: 'MXN',
    value: cartTotal,
    payment_type: paymentType,
    items: formatCartForGA(cart, cartMsi)
  });
};

// Helper para logging condicional basado en variable de debug
const debugLog = (...args) => {
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log(...args);
  }
};

const debugError = (...args) => {
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.error(...args);
  }
};

// Función helper para esperar a que Google Analytics esté disponible
const waitForGtag = (maxAttempts = 10, interval = 500) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkGtag = () => {
      attempts++;
      debugLog(`🔄 Google Analytics - Attempt ${attempts}/${maxAttempts} - checking gtag availability`);

      if (typeof gtag === 'function' && window.dataLayer) {
        debugLog('✅ Google Analytics - gtag is available!');
        resolve(true);
        return;
      }

      if (attempts >= maxAttempts) {
        debugError('❌ Google Analytics - gtag not available after max attempts');
        reject(new Error('gtag not available'));
        return;
      }

      setTimeout(checkGtag, interval);
    };

    checkGtag();
  });
};

// 8. Evento: Compra completada (purchase)
export const trackPurchase = async (orderData) => {
  debugLog('🎯 Google Analytics - trackPurchase called with:', orderData);

  // Verificar que gtag esté disponible
  debugLog('🔍 Google Analytics - gtag check:', {
    typeof_gtag: typeof gtag,
    gtag_function: typeof gtag === 'function',
    window_gtag: typeof window.gtag,
    global_gtag: typeof globalThis.gtag,
    dataLayer_exists: !!window.dataLayer,
    dataLayer_length: window.dataLayer ? window.dataLayer.length : 0
  });

  // Si gtag no está disponible, esperar a que se cargue
  if (typeof gtag !== 'function') {
    debugLog('⏳ Google Analytics - gtag not available, waiting...');
    try {
      await waitForGtag();
    } catch (error) {
      debugError('❌ Google Analytics - gtag function not available for purchase tracking after waiting');
      return;
    }
  }

  // Verificar datos obligatorios
  if (!orderData) {
    debugError('❌ Google Analytics - No order data provided for purchase tracking');
    return;
  }

  debugLog('✅ Google Analytics - Initial validations passed');

  // Instrucciones para verificar en GA4
  debugLog(`
  📋 INSTRUCCIONES PARA VERIFICAR EN GOOGLE ANALYTICS 4:
  
  1️⃣ Evento Principal - PURCHASE:
     • Ve a: Eventos > purchase
     • O ve a: Monetización > Resumen de ecommerce
     • Deberías ver: transaction_id, value, items
  
  2️⃣ Tiempo Real:
     • Ve a: Informes > Tiempo real > Eventos
     • Busca: "purchase" en los últimos minutos
  
  3️⃣ Debug View (Recomendado):
     • Instala GA Debugger extension
     • O activa Debug View en GA4
  `);

  const {
    transaction_id,
    value,
    tax = 0,
    shipping = 0,
    items,
    coupon = '',
    cartMsi = false
  } = orderData;

  // Validaciones
  if (!transaction_id) {
    debugError('Google Analytics - No transaction_id provided for purchase tracking');
    return;
  }

  if (!value || isNaN(parseFloat(value))) {
    debugError('Google Analytics - Invalid value provided for purchase tracking:', value);
    return;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    debugError('Google Analytics - No items provided for purchase tracking');
    return;
  }

  // Formatear items si vienen del carrito
  const formattedItems = items.map(item => {
    if (item.product) {
      // Es un item del carrito
      let price;
      if (item.unit_price && item.quote_id) {
        price = parseFloat(item.unit_price);
      } else {
        price = !cartMsi
          ? parseFloat(item.product.precio_contado)
          : parseFloat(item.product.precio_final_descuento) > 0
            ? parseFloat(item.product.precio_final_descuento)
            : parseFloat(item.product.precio_final);
      }
      return formatProductForGA(item.product, item.quantity, price);
    } else {
      // Ya está formateado
      return item;
    }
  });

  const purchaseEventData = {
    transaction_id: transaction_id.toString(),
    value: parseFloat(value),
    tax: parseFloat(tax),
    shipping: parseFloat(shipping),
    currency: 'MXN',
    coupon,
    items: formattedItems
  };

  // Log detallado para debug
  debugLog('📊 Google Analytics - Purchase Event Data:', {
    ...purchaseEventData,
    items_count: formattedItems.length,
    gtag_available: typeof gtag === 'function',
    ga_id: window.gtag_id || 'not_available'
  });

  // Enviar evento a Google Analytics
  try {
    debugLog('⏰ Google Analytics - Setting timeout for event dispatch');
    // Asegurar que el evento se envíe con un pequeño delay para evitar problemas de timing
    setTimeout(() => {
      debugLog('🚀 Google Analytics - About to send purchase event');
      debugLog('🔍 Google Analytics - Pre-send gtag check:', typeof gtag);

      try {
        gtag('event', 'purchase', purchaseEventData);
        debugLog('🛒 Google Analytics - PURCHASE event sent successfully (this is the main ecommerce event)');
        debugLog('📊 Data sent:', purchaseEventData);
        debugLog('🔍 Check in GA4: Events > purchase OR Monetization > Ecommerce overview');
      } catch (eventError) {
        debugError('❌ Google Analytics - Error in gtag purchase call:', eventError);
      }

      // Conversión opcional (solo si tienes objetivos configurados en Google Ads)
      const sendConversion = false; // Cambia a true si usas Google Ads
      if (sendConversion && window.gtag_id) {
        try {
          const conversionData = {
            send_to: window.gtag_id,
            transaction_id: purchaseEventData.transaction_id,
            value: purchaseEventData.value,
            currency: 'MXN'
          };
          debugLog('🎯 Google Analytics - About to send conversion event for Google Ads:', conversionData);
          gtag('event', 'conversion', conversionData);
          debugLog('✅ Google Analytics - Conversion event sent for Google Ads tracking');
        } catch (conversionError) {
          debugError('❌ Google Analytics - Error in gtag conversion call:', conversionError);
        }
      } else {
        debugLog('ℹ️ Google Analytics - Conversion event skipped (disabled or no ads tracking)');
      }
    }, 100);
  } catch (error) {
    debugError('❌ Google Analytics - Error setting up purchase event:', error);
  }
};

// 9. Evento: Búsqueda (search)
export const trackSearch = (searchTerm, searchResults = null) => {
  const eventData = {
    search_term: searchTerm
  };

  if (searchResults !== null) {
    eventData.search_results = searchResults;
  }

  gtag('event', 'search', eventData);
};

// 10. Evento: Seleccionar item (select_item)
export const trackSelectItem = (product, itemListName = 'Search Results', index = null) => {
  const eventData = {
    item_list_name: itemListName,
    items: [formatProductForGA(product)]
  };

  if (index !== null) {
    eventData.items[0].index = index;
  }

  gtag('event', 'select_item', eventData);
};

// 11. Evento: Ver lista de items (view_item_list)
export const trackViewItemList = (products, itemListName = 'Product List') => {
  if (!products || products.length === 0) return;

  const items = products.map((product, index) => ({
    ...formatProductForGA(product),
    index: index
  }));

  gtag('event', 'view_item_list', {
    item_list_name: itemListName,
    items: items.slice(0, 100) // GA4 limita a 100 items
  });
};

// 12. Evento: Generar cotización (generate_lead)
export const trackGenerateLead = (value = 0, currency = 'MXN') => {
  gtag('event', 'generate_lead', {
    currency,
    value: parseFloat(value)
  });
};

// 13. Evento: Registrarse (sign_up)
export const trackSignUp = (method = 'email') => {
  gtag('event', 'sign_up', {
    method
  });
};

// 14. Evento: Iniciar sesión (login)
export const trackLogin = (method = 'email') => {
  gtag('event', 'login', {
    method
  });
};

// 15. Evento: Compartir producto (share)
export const trackShare = (product, method = 'link') => {
  gtag('event', 'share', {
    method,
    content_type: 'product',
    item_id: product.id?.toString() || ''
  });
};

// Funciones de utilidad adicionales

// Configurar ID de usuario (para usuarios autenticados)
export const setUserId = (userId) => {
  gtag('config', window.gtag_id || 'GA_MEASUREMENT_ID', {
    user_id: userId
  });
};

// Configurar propiedades personalizadas del usuario
export const setUserProperties = (properties) => {
  gtag('event', 'set_user_properties', properties);
};

// Configurar página actual (para SPA)
export const trackPageView = (page_path, page_title = null) => {
  const eventData = {
    page_path
  };

  if (page_title) {
    eventData.page_title = page_title;
  }

  gtag('event', 'page_view', eventData);
};

export default {
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackSelectItem,
  trackViewItemList,
  trackGenerateLead,
  trackSignUp,
  trackLogin,
  trackShare,
  setUserId,
  setUserProperties,
  trackPageView
};
