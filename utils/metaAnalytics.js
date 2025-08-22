// Utilidades para Meta Pixel (Facebook Pixel) - E-commerce Events

// Función para enviar eventos a Meta Pixel
export const fbq = (...args) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

// Función para formatear productos para Meta
// Extrae los nombres de los objetos que envía ProductSerializer
const formatProductForMeta = (product, quantity = 1, price = null) => {
  return {
    content_id: product.id?.toString() || '',
    content_name: product.titulo || '',                  // ProductSerializer devuelve 'titulo'
    content_category: product.categoria?.name || '',     // categoria.name del objeto
    brand: product.marca?.nombre || '',                  // marca.nombre del objeto
    price: price || parseFloat(product.precio_contado || 0),
    quantity: parseInt(quantity) || 1,
    currency: 'MXN'
  };
};

// Función para formatear carrito completo para Meta
const formatCartForMeta = (cart, cartMsi = false) => {
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

    return formatProductForMeta(item.product, item.quantity, price);
  });
};

// 1. Evento: Ver contenido (ViewContent) - Equivalente a view_item
export const trackMetaViewContent = (product) => {
  const productData = formatProductForMeta(product);

  fbq('track', 'ViewContent', {
    content_type: 'product',
    content_ids: [productData.content_id],
    content_name: productData.content_name,
    content_category: productData.content_category,
    value: productData.price,
    currency: 'MXN'
  });
};

// 2. Evento: Agregar al carrito (AddToCart)
export const trackMetaAddToCart = (product, quantity = 1, cartValue = 0) => {
  const productData = formatProductForMeta(product, quantity);

  // Debug logging para Meta Pixel
  const debugLog = (...args) => {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log(...args);
    }
  };

  debugLog('📘 Meta Pixel - Add to Cart Event:', {
    product_id: product.id,
    product_titulo: product.titulo,
    extracted_categoria: product.categoria?.name,
    extracted_marca: product.marca?.nombre,
    formatted_for_meta: productData,
    quantity,
    cartValue
  });

  fbq('track', 'AddToCart', {
    content_type: 'product',
    content_ids: [productData.content_id],
    content_name: productData.content_name,
    content_category: productData.content_category,
    value: cartValue || productData.price * quantity,
    currency: 'MXN'
  });
};

// 3. Evento: Remover del carrito (Evento personalizado - RemoveFromCart)
export const trackMetaRemoveFromCart = (product, quantity = 1, cartValue = 0) => {
  const productData = formatProductForMeta(product, quantity);

  fbq('trackCustom', 'RemoveFromCart', {
    content_type: 'product',
    content_ids: [productData.content_id],
    content_name: productData.content_name,
    content_category: productData.content_category,
    value: cartValue,
    currency: 'MXN'
  });
};

// 4. Evento: Ver carrito/wishlist (AddToWishlist) - Equivalente a view_cart
export const trackMetaAddToWishlist = (cart, cartTotal, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  const products = formatCartForMeta(cart, cartMsi);

  fbq('track', 'AddToWishlist', {
    content_type: 'product',
    content_ids: products.map(p => p.content_id),
    value: cartTotal,
    currency: 'MXN'
  });
};

// 4. Evento: Iniciar checkout (InitiateCheckout)
export const trackMetaInitiateCheckout = (cart, cartTotal, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  const products = formatCartForMeta(cart, cartMsi);

  fbq('track', 'InitiateCheckout', {
    content_type: 'product',
    content_ids: products.map(p => p.content_id),
    value: cartTotal,
    currency: 'MXN',
    num_items: cart.length
  });
};

// 5. Evento: Agregar información de pago (AddPaymentInfo)
export const trackMetaAddPaymentInfo = (cart, cartTotal, cartMsi = false) => {
  if (!cart || cart.length === 0) return;

  const products = formatCartForMeta(cart, cartMsi);

  fbq('track', 'AddPaymentInfo', {
    content_type: 'product',
    content_ids: products.map(p => p.content_id),
    value: cartTotal,
    currency: 'MXN'
  });
};

// 6. Evento: Compra completada (Purchase) - Evento más importante
export const trackMetaPurchase = (orderData) => {
  // Debug logging para Meta Pixel
  const debugLog = (...args) => {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log(...args);
    }
  };

  const {
    transaction_id,
    value,
    items,
    cartMsi = false
  } = orderData;

  // Los items ya vienen formateados desde la página de confirmación
  // No necesitamos formatearlos aquí como en el carrito
  const formattedItems = items.map(item => ({
    content_id: item.item_id || '',
    content_name: item.item_name || '',
    content_category: item.item_category || '',
    brand: item.item_brand || '',
    price: parseFloat(item.price || 0),
    quantity: parseInt(item.quantity || 1),
    currency: 'MXN'
  }));

  debugLog('📘 Meta Pixel - Purchase Event:', {
    transaction_id,
    value,
    items_received: items,
    formatted_items: formattedItems,
    items_count: formattedItems.length
  });

  fbq('track', 'Purchase', {
    content_type: 'product',
    content_ids: formattedItems.map(item => item.content_id),
    value: parseFloat(value),
    currency: 'MXN',
    num_items: formattedItems.length
  });
};

// 7. Evento: Búsqueda (Search)
export const trackMetaSearch = (searchTerm, searchResults = null) => {
  const eventData = {
    search_string: searchTerm
  };

  if (searchResults !== null) {
    eventData.content_category = 'search_results';
  }

  fbq('track', 'Search', eventData);
};

// 8. Evento: Ver categoría/listado (ViewCategory)
export const trackMetaViewCategory = (categoryName, products = []) => {
  const eventData = {
    content_type: 'product_group',
    content_category: categoryName
  };

  if (products.length > 0) {
    const formattedProducts = products.map(product => formatProductForMeta(product));
    eventData.content_ids = formattedProducts.map(p => p.content_id).slice(0, 100);
  }

  fbq('track', 'ViewCategory', eventData);
};

// 9. Evento: Completar registro (CompleteRegistration)
export const trackMetaCompleteRegistration = (method = 'email') => {
  fbq('track', 'CompleteRegistration', {
    registration_method: method
  });
};

// 10. Evento: Generar lead/cotización (Lead)
export const trackMetaLead = (value = 0, currency = 'MXN') => {
  fbq('track', 'Lead', {
    value: parseFloat(value),
    currency
  });
};

// 11. Evento: Contacto (Contact)
export const trackMetaContact = () => {
  fbq('track', 'Contact');
};

// 12. Evento: Personalizado - Ver página de inicio
export const trackMetaViewHomePage = () => {
  fbq('trackCustom', 'ViewHomePage', {
    content_type: 'website'
  });
};

// 13. Evento: Personalizado - Compartir producto
export const trackMetaShare = (product, method = 'link') => {
  const productData = formatProductForMeta(product);

  fbq('trackCustom', 'Share', {
    content_type: 'product',
    content_id: productData.content_id,
    share_method: method
  });
};

// 14. Evento: Page View personalizado (para SPA)
export const trackMetaPageView = (page_path, page_title = null) => {
  fbq('track', 'PageView');

  // También enviar como evento personalizado con más detalles
  fbq('trackCustom', 'DetailedPageView', {
    page_path,
    page_title: page_title || document.title
  });
};

// Funciones de utilidad adicionales

// Configurar ID de usuario personalizado (para usuarios autenticados)
export const setMetaUserData = (userData) => {
  if (typeof window !== 'undefined' && window.fbq) {
    // Datos del usuario hasheados para mayor privacidad
    const hashedData = {};

    if (userData.email) {
      hashedData.em = userData.email; // Meta automáticamente hashea emails
    }
    if (userData.phone) {
      hashedData.ph = userData.phone; // Meta automáticamente hashea teléfonos
    }
    if (userData.firstName) {
      hashedData.fn = userData.firstName;
    }
    if (userData.lastName) {
      hashedData.ln = userData.lastName;
    }
    if (userData.city) {
      hashedData.ct = userData.city;
    }
    if (userData.state) {
      hashedData.st = userData.state;
    }
    if (userData.country) {
      hashedData.country = userData.country;
    }
    if (userData.zipCode) {
      hashedData.zp = userData.zipCode;
    }

    fbq('dataProcessingOptions', []);
    fbq('set', 'userData', hashedData);
  }
};

// Configurar parámetros personalizados
export const setMetaCustomParameters = (parameters) => {
  if (typeof window !== 'undefined' && window.fbq) {
    fbq('set', parameters);
  }
};

// Exportar todas las funciones como objeto por defecto
export default {
  trackMetaViewContent,
  trackMetaAddToCart,
  trackMetaRemoveFromCart,
  trackMetaAddToWishlist,
  trackMetaInitiateCheckout,
  trackMetaAddPaymentInfo,
  trackMetaPurchase,
  trackMetaSearch,
  trackMetaViewCategory,
  trackMetaCompleteRegistration,
  trackMetaLead,
  trackMetaContact,
  trackMetaViewHomePage,
  trackMetaShare,
  trackMetaPageView,
  setMetaUserData,
  setMetaCustomParameters
};
