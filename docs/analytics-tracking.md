# Sistema de Seguimiento con Google Analytics 4 (Enhanced Ecommerce)

Este documento describe la implementación completa de Google Analytics 4 con Enhanced Ecommerce para el ecommerce PCStore.

## 📋 Eventos Implementados

### 🛒 Eventos de Ecommerce

#### 1. `view_item` - Ver Producto

- **Dónde**: Páginas de producto (`[productId].js`)
- **Cuándo**: Cuando un usuario visita la página de un producto
- **Datos**: ID del producto, nombre, categoría, marca, precio

#### 2. `add_to_cart` - Agregar al Carrito

- **Dónde**: Contexto del carrito (`CartContext.jsx`)
- **Cuándo**: Cuando se agrega un producto al carrito
- **Datos**: Producto, cantidad, valor total del carrito

#### 3. `remove_from_cart` - Remover del Carrito

- **Dónde**: Contexto del carrito (`CartContext.jsx`)
- **Cuándo**: Cuando se elimina un producto del carrito
- **Datos**: Producto removido, cantidad, valor restante del carrito

#### 4. `view_cart` - Ver Carrito

- **Dónde**: Página de carrito (`/carrito/index.js`)
- **Cuándo**: Cuando un usuario visita la página del carrito
- **Datos**: Lista de productos, valor total, moneda

#### 5. `begin_checkout` - Iniciar Checkout

- **Dónde**: Página de envío (`/carrito/envio/index.js`)
- **Cuándo**: Cuando un usuario inicia el proceso de checkout
- **Datos**: Productos en carrito, valor total

#### 6. `add_shipping_info` - Información de Envío

- **Dónde**: Flujo de checkout
- **Cuándo**: Cuando se selecciona método de envío
- **Datos**: Tipo de envío, valor del carrito

#### 7. `add_payment_info` - Información de Pago

- **Dónde**: Página de pago (`/carrito/pago/index.js`)
- **Cuándo**: Cuando se accede a la página de pago
- **Datos**: Método de pago, valor del carrito

#### 8. `purchase` - Compra Completada

- **Dónde**: Página de confirmación (`/compras/confirmacion/index.js`)
- **Cuándo**: Cuando se confirma una compra exitosa
- **Datos**: ID de transacción, valor total, productos, impuestos, envío

### 🔍 Eventos de Búsqueda

#### 9. `search` - Búsqueda

- **Dónde**: HeaderBar y InstantSearch
- **Cuándo**: Cuando un usuario realiza una búsqueda
- **Datos**: Término de búsqueda, número de resultados

#### 10. `select_item` - Seleccionar Producto

- **Dónde**: Listados de productos (`ListProducts.js`)
- **Cuándo**: Cuando se hace clic en un producto desde una lista
- **Datos**: Producto, lista de origen, posición

#### 11. `view_item_list` - Ver Lista de Productos

- **Dónde**: Páginas de listado
- **Cuándo**: Cuando se visualiza una lista de productos
- **Datos**: Lista de productos, nombre de la lista

### 👤 Eventos de Usuario

#### 12. `login` - Iniciar Sesión

- **Dónde**: Página de login (`/login/index.js`)
- **Cuándo**: Login exitoso
- **Datos**: Método de autenticación

#### 13. `sign_up` - Registro

- **Dónde**: Página de registro (`/registration/index.js`)
- **Cuándo**: Registro exitoso
- **Datos**: Método de registro

#### 14. `generate_lead` - Generar Cotización

- **Dónde**: Sistema de cotizaciones
- **Cuándo**: Cuando se genera una cotización
- **Datos**: Valor de la cotización

## 🔧 Configuración

### Archivos Principales

1. **`utils/analytics.js`** - Funciones principales de tracking
2. **`hooks/useAnalytics.js`** - Hook personalizado para facilitar el uso
3. **`components/GoogleAnalytics/GoogleAnalytics.js`** - Configuración de GA4

### Variables de Entorno

```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Configuración de GA4

```javascript
gtag('config', 'GA_MEASUREMENT_ID', {
	page_path: window.location.pathname,
	send_page_view: true,
	enhanced_ecommerce: true,
	custom_map: {
		custom_parameter_1: 'user_type',
		custom_parameter_2: 'store_location',
	},
});
```

## 📊 Estructura de Datos

### Formato de Producto

```javascript
{
  item_id: 'PROD123',
  item_name: 'Producto Ejemplo',
  item_category: 'Categoría',
  item_brand: 'Marca',
  price: 999.99,
  quantity: 1,
  currency: 'MXN'
}
```

### Formato de Compra

```javascript
{
  transaction_id: 'ORDER123',
  value: 1299.99,
  tax: 150.00,
  shipping: 129.00,
  currency: 'MXN',
  coupon: 'DESCUENTO10',
  items: [/* productos */]
}
```

## 🚀 Uso del Hook useAnalytics

```javascript
import useAnalytics from '../hooks/useAnalytics';

const MyComponent = () => {
  const analytics = useAnalytics();

  const handleProductView = (product) => {
    analytics.ecommerce.viewItem(product);
  };

  const handleAddToCart = (product, quantity) => {
    analytics.ecommerce.addToCart(product, quantity);
  };

  const handleSearch = (searchTerm) => {
    analytics.ecommerce.search(searchTerm);
  };

  return (
    // Tu componente
  );
};
```

## 📈 Eventos Personalizados

### Configurar Usuario Autenticado

```javascript
analytics.user.configure(userId, {
	user_type: 'premium',
	store_location: 'mexico',
});
```

### Trackear Páginas Manualmente

```javascript
analytics.navigation.pageView('/mi-pagina', 'Título de la Página');
```

## 🔄 Flujo Completo de Ecommerce

1. **Usuario navega** → `page_view`
2. **Ve producto** → `view_item`
3. **Busca productos** → `search`
4. **Selecciona de lista** → `select_item`
5. **Agrega al carrito** → `add_to_cart`
6. **Ve carrito** → `view_cart`
7. **Inicia checkout** → `begin_checkout`
8. **Agrega envío** → `add_shipping_info`
9. **Agrega pago** → `add_payment_info`
10. **Completa compra** → `purchase`

## 🛡️ Consideraciones de Privacidad

- Los eventos se envían solo cuando Google Analytics está disponible
- Se respetan las configuraciones de cookies del usuario
- Los datos personales no se envían en los eventos
- Compatible con políticas de privacidad GDPR

## 📝 Debugging

Para verificar que los eventos se están enviando correctamente:

1. Abrir DevTools → Network
2. Filtrar por 'google-analytics' o 'gtag'
3. Verificar que se envían requests a `https://www.google-analytics.com/`

También puedes usar la extensión de Chrome "Google Analytics Debugger" para ver los eventos en tiempo real.

## 🔮 Próximas Mejoras

- [ ] Tracking de tiempo en página
- [ ] Eventos de scroll profundo
- [ ] Tracking de vídeos (si aplica)
- [ ] Eventos de interacción con chat
- [ ] Métricas de rendimiento web (Core Web Vitals)
- [ ] Segmentación por tipo de usuario
- [ ] Eventos de remarketing personalizados

## 📚 Referencias

- [GA4 Enhanced Ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Next.js con Google Analytics](https://nextjs.org/docs/messages/google-analytics)
- [Eventos GA4 Recomendados](https://support.google.com/analytics/answer/9267735)
