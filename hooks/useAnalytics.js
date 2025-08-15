import { useAuth } from './auth';
import { useContext } from 'react';
import CartContext from '../context/CartContext';
import {
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
  setUserId,
  setUserProperties,
  trackPageView
} from '../utils/analytics';

// Hook personalizado para simplificar el uso de Google Analytics
export const useAnalytics = () => {
  const { isAuthenticated, userId, cartMsi } = useAuth();
  const cartContext = useContext(CartContext);

  // Configurar usuario cuando está autenticado
  const configureUser = (userId, userProperties = {}) => {
    if (userId) {
      setUserId(userId);
      setUserProperties({
        user_type: isAuthenticated ? 'registered' : 'guest',
        ...userProperties
      });
    }
  };

  // Trackear vista de producto
  const logViewItem = (product) => {
    trackViewItem(product);
  };

  // Trackear agregar al carrito
  const logAddToCart = (product, quantity = 1) => {
    if (cartContext) {
      const cartValue = cartContext.total || 0;
      trackAddToCart(product, quantity, cartValue);
    } else {
      trackAddToCart(product, quantity, 0);
    }
  };

  // Trackear remover del carrito
  const logRemoveFromCart = (product, quantity = 1) => {
    if (cartContext) {
      const cartValue = cartContext.total || 0;
      trackRemoveFromCart(product, quantity, cartValue);
    } else {
      trackRemoveFromCart(product, quantity, 0);
    }
  };

  // Trackear vista del carrito
  const logViewCart = () => {
    if (cartContext && cartContext.cart) {
      trackViewCart(cartContext.cart, cartContext.total, cartMsi);
    }
  };

  // Trackear inicio de checkout
  const logBeginCheckout = () => {
    if (cartContext && cartContext.cart) {
      trackBeginCheckout(cartContext.cart, cartContext.total, cartMsi);
    }
  };

  // Trackear información de envío
  const logAddShippingInfo = (shippingTier) => {
    if (cartContext && cartContext.cart) {
      trackAddShippingInfo(cartContext.cart, cartContext.total, shippingTier, cartMsi);
    }
  };

  // Trackear información de pago
  const logAddPaymentInfo = (paymentType) => {
    if (cartContext && cartContext.cart) {
      trackAddPaymentInfo(cartContext.cart, cartContext.total, paymentType, cartMsi);
    }
  };

  // Trackear compra
  const logPurchase = (orderData) => {
    trackPurchase({
      ...orderData,
      cartMsi
    });
  };

  // Trackear búsqueda
  const logSearch = (searchTerm, searchResults = null) => {
    trackSearch(searchTerm, searchResults);
  };

  // Trackear selección de item
  const logSelectItem = (product, itemListName = 'Product List', index = null) => {
    trackSelectItem(product, itemListName, index);
  };

  // Trackear vista de lista de items
  const logViewItemList = (products, itemListName = 'Product List') => {
    trackViewItemList(products, itemListName);
  };

  // Trackear generación de cotización
  const logGenerateLead = (value = 0) => {
    trackGenerateLead(value);
  };

  // Trackear registro
  const logSignUp = (method = 'email') => {
    trackSignUp(method);
  };

  // Trackear login
  const logLogin = (method = 'email') => {
    trackLogin(method);
  };

  // Trackear vista de página
  const logPageView = (page_path, page_title = null) => {
    trackPageView(page_path, page_title);
  };

  // Eventos específicos del ecommerce
  const ecommerce = {
    viewItem: logViewItem,
    addToCart: logAddToCart,
    removeFromCart: logRemoveFromCart,
    viewCart: logViewCart,
    beginCheckout: logBeginCheckout,
    addShippingInfo: logAddShippingInfo,
    addPaymentInfo: logAddPaymentInfo,
    purchase: logPurchase,
    search: logSearch,
    selectItem: logSelectItem,
    viewItemList: logViewItemList,
    generateLead: logGenerateLead
  };

  // Eventos de usuario
  const user = {
    signUp: logSignUp,
    login: logLogin,
    configure: configureUser
  };

  // Eventos de navegación
  const navigation = {
    pageView: logPageView
  };

  return {
    ecommerce,
    user,
    navigation,
    isAuthenticated,
    cartMsi
  };
};

export default useAnalytics;
