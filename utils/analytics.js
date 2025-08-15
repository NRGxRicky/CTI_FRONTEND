// Utilidades para Google Analytics 4 - Enhanced Ecommerce Events

// Función para enviar eventos a Google Analytics
export const gtag = (...args) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Función para formatear productos para GA4
const formatProductForGA = (product, quantity = 1, price = null) => {
  return {
    item_id: product.id?.toString() || '',
    item_name: product.title || product.nombre || '',
    item_category: product.categoria?.nombre || product.category || '',
    item_brand: product.marca?.nombre || product.brand || '',
    price: price || parseFloat(product.precio_contado || product.price || 0),
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
  gtag('event', 'add_to_cart', {
    currency: 'MXN',
    value: cartValue,
    items: [formatProductForGA(product, quantity)]
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

// 8. Evento: Compra completada (purchase)
export const trackPurchase = (orderData) => {
  const {
    transaction_id,
    value,
    tax = 0,
    shipping = 0,
    items,
    coupon = '',
    cartMsi = false
  } = orderData;

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

  gtag('event', 'purchase', {
    transaction_id,
    value: parseFloat(value),
    tax: parseFloat(tax),
    shipping: parseFloat(shipping),
    currency: 'MXN',
    coupon,
    items: formattedItems
  });
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
