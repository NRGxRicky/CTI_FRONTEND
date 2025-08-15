// Utilidades para tracking de redes sociales y eventos de compartir

import { gtag } from './analytics';

// Función para trackear eventos de compartir en redes sociales
export const trackSocialShare = (platform, url, title) => {
  // Evento estándar de Google Analytics para compartir
  gtag('event', 'share', {
    method: platform,
    content_type: 'product',
    item_id: url,
    content_title: title
  });

  // También podemos enviar como evento personalizado más específico
  gtag('event', 'social_share', {
    social_network: platform,
    shared_url: url,
    shared_title: title,
    event_category: 'Social',
    event_label: platform
  });
};

// Función para trackear clicks en enlaces de redes sociales
export const trackSocialClick = (platform, actionType = 'visit') => {
  gtag('event', 'social_click', {
    social_network: platform,
    action_type: actionType,
    event_category: 'Social',
    event_label: `${platform}_${actionType}`
  });
};

// Función para trackear cuando alguien sigue/da like desde el sitio
export const trackSocialEngagement = (platform, actionType, value = 1) => {
  gtag('event', 'social_engagement', {
    social_network: platform,
    engagement_type: actionType, // 'follow', 'like', 'subscribe'
    value: value,
    event_category: 'Social',
    event_label: `${platform}_${actionType}`
  });
};

// Función específica para trackear compartir productos
export const trackProductShare = (product, platform) => {
  const productTitle = product.titulo || product.nombre || 'Producto';
  const productUrl = window.location.href;

  trackSocialShare(platform, productUrl, productTitle);

  // Evento específico para productos
  gtag('event', 'product_share', {
    product_id: product.id?.toString(),
    product_name: productTitle,
    product_brand: product.marca,
    product_category: product.categoria,
    share_method: platform,
    event_category: 'Ecommerce',
    event_label: `Product_Share_${platform}`
  });
};

// Función para trackear cuando se genera contenido para compartir (ej: códigos de referidos)
export const trackShareGeneration = (contentType, platform = 'general') => {
  gtag('event', 'share_generation', {
    content_type: contentType, // 'referral_code', 'product_link', 'discount_code'
    generation_method: platform,
    event_category: 'Social',
    event_label: `Generate_${contentType}`
  });
};

// URLs y configuraciones para compartir en redes sociales
export const getSocialShareUrls = (url, title, description = '', image = '') => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(image);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}&media=${encodedImage}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    copy: url // Para copiar al portapapeles
  };
};

// Función para abrir ventana de compartir y trackear
export const openShareWindow = (platform, shareUrl, product = null) => {
  // Trackear el evento
  if (product) {
    trackProductShare(product, platform);
  } else {
    trackSocialShare(platform, window.location.href, document.title);
  }

  // Configuraciones de ventana para diferentes plataformas
  const windowConfig = {
    facebook: 'width=600,height=400',
    twitter: 'width=600,height=400',
    linkedin: 'width=600,height=400',
    pinterest: 'width=750,height=320',
    default: 'width=600,height=400'
  };

  const config = windowConfig[platform] || windowConfig.default;

  // Abrir ventana de compartir
  if (platform === 'whatsapp' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // En móvil, abrir WhatsApp directamente
    window.location.href = shareUrl;
  } else if (platform === 'email') {
    // Para email, usar mailto
    window.location.href = shareUrl;
  } else if (platform === 'copy') {
    // Copiar al portapapeles
    navigator.clipboard.writeText(shareUrl).then(() => {
      // Opcional: mostrar notificación de copiado
      console.log('URL copiada al portapapeles');
    });
  } else {
    // Para otras redes, abrir ventana emergente
    window.open(
      shareUrl,
      'shareWindow',
      `scrollbars=yes,resizable=yes,toolbar=no,location=yes,${config}`
    );
  }
};

// Función para trackear visualizaciones de contenido social embebido
export const trackSocialEmbed = (platform, contentType) => {
  gtag('event', 'social_embed_view', {
    social_network: platform,
    content_type: contentType, // 'post', 'video', 'story'
    event_category: 'Social',
    event_label: `${platform}_${contentType}_view`
  });
};

export default {
  trackSocialShare,
  trackSocialClick,
  trackSocialEngagement,
  trackProductShare,
  trackShareGeneration,
  getSocialShareUrls,
  openShareWindow,
  trackSocialEmbed
};
