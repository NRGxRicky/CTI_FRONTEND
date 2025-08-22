/* eslint-env browser */
/* global process */
// Utilidades para Google Analytics 4 - Enhanced Ecommerce Events

// ===== DEBUG HELPERS (declarados antes de usarlos) =====
const isDebugMode = () => {
  if (typeof window === 'undefined') return false;
  return process.env.NEXT_PUBLIC_DEBUG === 'true';
};

const debugLog = (...args) => {
  if (isDebugMode()) {
    console.log(...args);
  }
};

const debugError = (...args) => {
  if (isDebugMode()) {
    console.error(...args);
  }
};

// ===== GTAG WRAPPER =====
// Función para enviar eventos a Google Analytics (usa window.gtag)
export const gtag = (...args) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
};

// ===== FORMATTERS =====
// Función para formatear productos para GA4
// Extrae los nombres de los objetos que envía ProductSerializer
const formatProductForGA = (product, quantity = 1, price = null) => {
  return {
    // Recomendado: usar SKU o GTIN como item_id; fallback a ID interno
    item_id: product?.sku?.toString?.() || product?.id?.toString?.() || '',
    item_name: product?.titulo || '',
    item_category: product?.categoria?.name || '',   // categoria.name del backend
    item_brand: product?.marca?.nombre || '',        // marca.nombre del backend
    price: price ?? parseFloat(product?.precio_contado ?? 0),
    quantity: Number.parseInt(quantity, 10) || 1
    // currency no va a nivel item en GA4
  };
};

// Formatear carrito completo para GA4
const formatCartForGA = (cart, cartMsi = false) => {
  return cart.map(item => {
    let price;

    // Si el item tiene unit_price y quote_id, usar ese precio (desde la cotización)
    if (item.unit_price && item.quote_id) {
      price = parseFloat(item.unit_price);
    } else {
      // Lógica basada en el modo MSI
      price = !cartMsi
        ? parseFloat(item.product.precio_contado)
        : parseFloat(item.product.precio_final_descuento) > 0
          ? parseFloat(item.product.precio_final_descuento)
          : parseFloat(item.product.precio_final);
    }

    return formatProductForGA(item.product, item.quantity, price);
  });
};

// ===== WAIT FOR GTAG =====
// Esperar a que Google Analytics esté disponible
const waitForGtag = (maxAttempts = 10, interval = 500) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkGtag = () => {
      attempts++;
      debugLog(`🔄 Google Analytics - Attempt ${attempts}/${maxAttempts} - checking gtag availability`);

      if (typeof window !== 'undefined' && typeof window.gtag === 'function' && window.dataLayer) {
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

// ===== ECOM EVENTS =====

// 1. Ver producto (view_item)
export const trackViewItem = (product) => {
  gtag('event', 'view_item', {
    currency: 'MXN',
    value: parseFloat(product?.precio_contado ?? product?.price ?? 0),
    items: [formatProductForGA(product)]
  });
};

// 2. Agregar al carrito (add_to_cart)
export const trackAddToCart = (product, quantity = 1, cartValue = 0) => {
  const formattedProduct = formatProductForGA(product, quantity);

  debugLog('🛒 Google Analytics - Add to Cart Event:', {
    product_id: product?.id,
    product_sku: product?.sku,
    product_titulo: product?.titulo,
    extracted_categoria: product?.categoria?.name,
    extracted_marca: product?.marca?.nombre,
    product_precio_contado: product?.precio_contado,
    formatted_for_ga: formattedProduct,
    quantity,
    cartValue
  });

  gtag('event', 'add_to_cart', {
    currency: 'MXN',
    value: cartValue,
    items: [formattedProduct]
  });
};

// 3. Remover del carrito (remove_from_cart)
export const trackRemoveFromCart = (product, quantity = 1, cartValue = 0) => {
  gtag('event', 'remove_from_cart', {
    currency: 'MXN',
    value: cartValue,
    items: [formatProductForGA(product, quantity)]
  });
};

// 4. Ver carrito (view_cart)
export const trackViewCart = (cart, cartTotal, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  gtag('event', 'view_cart', {
    currency: 'MXN',
    value: cartTotal,
    items: formatCartForGA(cart, cartMsi)
  });
};

// 5. Iniciar checkout (begin_checkout)
export const trackBeginCheckout = (cart, cartTotal, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  gtag('event', 'begin_checkout', {
    currency: 'MXN',
    value: cartTotal,
    items: formatCartForGA(cart, cartMsi)
  });
};

// 6. Información de envío (add_shipping_info)
export const trackAddShippingInfo = (cart, cartTotal, shippingTier, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  gtag('event', 'add_shipping_info', {
    currency: 'MXN',
    value: cartTotal,
    shipping_tier: shippingTier, // 'pickup' | 'standard' | 'express' | etc.
    items: formatCartForGA(cart, cartMsi)
  });
};

// 7. Información de pago (add_payment_info)
export const trackAddPaymentInfo = (cart, cartTotal, paymentType, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  gtag('event', 'add_payment_info', {
    currency: 'MXN',
    value: cartTotal,
    payment_type: paymentType, // 'credit_card' | 'debit_card' | 'kueskipay' | etc.
    items: formatCartForGA(cart, cartMsi)
  });
};

// 8. Compra completada (purchase)
export const trackPurchase = async (orderData) => {
  debugLog('🎯 Google Analytics - trackPurchase called with:', orderData);

  debugLog('🔍 Google Analytics - gtag check:', {
    typeof_window_gtag: typeof window !== 'undefined' ? typeof window.gtag : 'no-window',
    dataLayer_exists: typeof window !== 'undefined' ? !!window.dataLayer : false,
    dataLayer_length: typeof window !== 'undefined' && window.dataLayer ? window.dataLayer.length : 0
  });

  // Si gtag no está disponible, esperar a que se cargue
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    debugLog('⏳ Google Analytics - gtag not available, waiting...');
    try {
      await waitForGtag();
    } catch (error) {
      debugError('❌ Google Analytics - gtag function not available for purchase tracking after waiting');
      return;
    }
  }

  if (!orderData) {
    debugError('❌ Google Analytics - No order data provided for purchase tracking');
    return;
  }

  const {
    transaction_id,
    value,
    tax = 0,
    shipping = 0,
    items,
    coupon = '',
    cartMsi = false,
    affiliation = 'PCStore' // recomendado para reportes
  } = orderData;

  // Validaciones
  if (!transaction_id) {
    debugError('Google Analytics - No transaction_id provided for purchase tracking');
    return;
  }

  if (value === undefined || value === null || isNaN(parseFloat(value))) {
    debugError('Google Analytics - Invalid value provided for purchase tracking:', value);
    return;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    debugError('Google Analytics - No items provided for purchase tracking');
    return;
  }

  // Formatear items dependiendo de su origen
  const formattedItems = items.map(item => {
    // Si viene de order confirmation (ya formateado de analytics previo)
    if (item.item_id) {
      return {
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.item_category,
        item_brand: item.item_brand,
        price: parseFloat(item.price || 0),
        quantity: parseInt(item.quantity) || 1
      };
    }
    // Si viene del carrito (lógica existente)
    if (item.product) {
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
    }
    // Ya viene formateado
    return item;
  });

  const purchaseEventData = {
    transaction_id: transaction_id.toString(),
    value: parseFloat(value),
    tax: parseFloat(tax),
    shipping: parseFloat(shipping),
    currency: 'MXN',
    coupon,
    affiliation,
    items: formattedItems
  };

  // Log detallado para debug
  debugLog('📊 Google Analytics - Purchase Event Data:', {
    ...purchaseEventData,
    items_count: formattedItems.length,
    ga_id: typeof window !== 'undefined' ? (window.gtag_id || 'not_available') : 'no-window'
  });

  // Enviar evento a Google Analytics
  try {
    debugLog('⏰ Google Analytics - Setting timeout for event dispatch');
    setTimeout(() => {
      debugLog('🚀 Google Analytics - About to send purchase event');
      try {
        gtag('event', 'purchase', purchaseEventData);
        debugLog('🛒 Google Analytics - PURCHASE event sent successfully (main ecommerce event)');
      } catch (eventError) {
        debugError('❌ Google Analytics - Error in gtag purchase call:', eventError);
      }


    }, 100);
  } catch (error) {
    debugError('❌ Google Analytics - Error setting up purchase event:', error);
  }
};

// 9. Búsqueda (search)
export const trackSearch = (searchTerm, searchResults = null) => {
  const eventData = {
    search_term: searchTerm
  };
  if (searchResults !== null) {
    eventData.search_results = searchResults;
  }
  gtag('event', 'search', eventData);
};

// 10. Seleccionar item (select_item)
export const trackSelectItem = (product, itemListName = 'Search Results', index = null, itemListId = null) => {
  const eventData = {
    item_list_name: itemListName,
    ...(itemListId ? { item_list_id: itemListId } : {}),
    items: [formatProductForGA(product)]
  };
  if (index !== null) {
    eventData.items[0].index = index;
  }
  gtag('event', 'select_item', eventData);
};

// 11. Ver lista de items (view_item_list)
export const trackViewItemList = (products, itemListName = 'Product List', itemListId = null) => {
  if (!products || products.length === 0) return;

  const items = products.map((product, index) => ({
    ...formatProductForGA(product),
    index
  }));

  gtag('event', 'view_item_list', {
    item_list_name: itemListName,
    ...(itemListId ? { item_list_id: itemListId } : {}),
    items: items.slice(0, 100) // GA4 limita a 100 items
  });
};

// 12. Generar cotización (generate_lead)
export const trackGenerateLead = (value = 0, currency = 'MXN') => {
  gtag('event', 'generate_lead', {
    currency,
    value: parseFloat(value)
  });
};

// 13. Registrarse (sign_up)
export const trackSignUp = (method = 'email') => {
  gtag('event', 'sign_up', {
    method
  });
};

// 14. Iniciar sesión (login)
export const trackLogin = (method = 'email') => {
  gtag('event', 'login', {
    method
  });
};

// 15. Compartir producto (share)
export const trackShare = (product, method = 'link') => {
  gtag('event', 'share', {
    method,
    content_type: 'product',
    item_id: product?.sku?.toString?.() || product?.id?.toString?.() || ''
  });
};

// ===== USER & PAGE HELPERS =====

// Configurar ID de usuario (para usuarios autenticados)
export const setUserId = (userId) => {
  gtag('config', (typeof window !== 'undefined' && window.gtag_id) || 'GA_MEASUREMENT_ID', {
    user_id: userId
  });
};

// Configurar propiedades personalizadas del usuario (API correcta en GA4)
export const setUserProperties = (properties) => {
  gtag('set', 'user_properties', properties);
};

// Track de página (SPA). Recomendado tener config inicial con { send_page_view: false }
export const trackPageView = (page_path, page_title = null) => {
  const eventData = {
    page_path,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined
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