# Meta Pixel (Facebook Pixel) - Eventos de E-commerce Implementados

## 📊 **Resumen de Implementación**

Se han implementado exitosamente todos los eventos de Meta Pixel necesarios para el tracking completo de ecommerce en paralelo con Google Analytics 4.

## 🔧 **Configuración Base**

### **1. Meta Pixel Configurado**

- **Archivo**: `components/FacebookPixel/FacebookPixel.js`
- **Variable de entorno**: `NEXT_PUBLIC_FACEBOOK_PIXEL`
- **Características**:
  - ID dinámico desde variables de entorno
  - Soporte para NoScript
  - Disponible globalmente como `window.fbq_id`

### **2. Utilidades Centralizadas**

- **Archivo**: `utils/metaAnalytics.js`
- **Función principal**: `fbq()` wrapper
- **Formateo**: Funciones dedicadas para productos y carritos

## 🛍️ **Eventos de E-commerce Implementados**

### **1. ViewContent (Ver Producto)**

- **Archivo**: `pages/[productId].js`
- **Trigger**: Al cargar página de producto
- **Datos**: ID, nombre, categoría, marca, precio
- **Equivale a**: Google Analytics `view_item`

### **2. AddToCart (Agregar al Carrito)**

- **Archivo**: `context/CartContext.jsx`
- **Trigger**: Al agregar producto al carrito
- **Datos**: Producto, cantidad, valor total del carrito
- **Equivale a**: Google Analytics `add_to_cart`

### **3. RemoveFromCart (Remover del Carrito)**

- **Archivo**: `context/CartContext.jsx`
- **Trigger**: Al eliminar producto del carrito
- **Datos**: Producto, cantidad, valor total del carrito
- **Tipo**: Evento personalizado (`trackCustom`)

### **4. AddToWishlist (Ver Carrito)**

- **Archivo**: `pages/carrito/index.js`
- **Trigger**: Al acceder a la página del carrito
- **Datos**: Lista de productos, valor total
- **Equivale a**: Google Analytics `view_cart`

### **5. InitiateCheckout (Iniciar Checkout)**

- **Archivo**: `pages/carrito/envio/index.js`
- **Trigger**: Al acceder a página de envío
- **Datos**: Productos, valor total, cantidad de items
- **Equivale a**: Google Analytics `begin_checkout`

### **6. AddPaymentInfo (Información de Pago)**

- **Archivo**: `pages/carrito/pago/index.js`
- **Trigger**: Al acceder a página de pago
- **Datos**: Productos, valor total
- **Equivale a**: Google Analytics `add_payment_info`

### **7. Purchase (Compra Completada)** 🎯

- **Archivo**: `pages/compras/confirmacion/index.js`
- **Trigger**: Al confirmar orden exitosa
- **Datos**: ID transacción, valor, productos
- **Equivale a**: Google Analytics `purchase`
- **Nota**: ¡Evento más importante para conversiones!

### **8. Search (Búsqueda)**

- **Archivos**:
  - `components/HeaderBar/HeaderBar.tsx`
  - `components/InstantSearch/InstantSearch.js`
- **Trigger**: Al realizar búsqueda
- **Datos**: Término de búsqueda
- **Equivale a**: Google Analytics `search`

### **9. CompleteRegistration (Registro)**

- **Archivo**: `pages/registration/index.js`
- **Trigger**: Al completar registro exitoso
- **Datos**: Método de registro (email)
- **Equivale a**: Google Analytics `sign_up`

## 🎨 **Eventos Adicionales Disponibles**

### **Eventos de Navegación**

- `ViewCategory`: Ver categorías de productos
- `ViewHomePage`: Ver página de inicio (personalizado)
- `Contact`: Eventos de contacto
- `Lead`: Generación de leads/cotizaciones

### **Eventos Sociales**

- `Share`: Compartir productos en redes sociales

### **Configuración de Usuario**

- `setMetaUserData`: Configurar datos de usuario hasheados
- `setMetaCustomParameters`: Parámetros personalizados

## 📍 **Archivos Modificados**

### **Componentes Core**

```
✅ components/FacebookPixel/FacebookPixel.js
✅ utils/metaAnalytics.js (nuevo)
✅ context/CartContext.jsx
```

### **Páginas de Producto**

```
✅ pages/[productId].js
```

### **Páginas de Carrito y Checkout**

```
✅ pages/carrito/index.js
✅ pages/carrito/envio/index.js
✅ pages/carrito/pago/index.js
✅ pages/compras/confirmacion/index.js
```

### **Páginas de Usuario**

```
✅ pages/registration/index.js
```

### **Componentes de Búsqueda**

```
✅ components/HeaderBar/HeaderBar.tsx
✅ components/InstantSearch/InstantSearch.js
```

## 🔄 **Flujo Completo de Tracking**

### **Journey del Cliente Tracked:**

```
1. 🔍 Search (Búsqueda) → Meta: Search
2. 👁️ ViewContent (Ver producto) → Meta: ViewContent
3. 🛒 AddToCart (Agregar al carrito) → Meta: AddToCart
4. 🗑️ RemoveFromCart (Remover del carrito) → Meta: RemoveFromCart
5. 👀 ViewCart (Ver carrito) → Meta: AddToWishlist
6. 🚀 InitiateCheckout (Iniciar checkout) → Meta: InitiateCheckout
7. 💳 AddPaymentInfo (Info de pago) → Meta: AddPaymentInfo
8. ✅ Purchase (Compra) → Meta: Purchase
9. 📝 Registration (Registro) → Meta: CompleteRegistration
```

## 🎯 **Eventos de Conversión Principales**

### **Para Campañas de Meta Ads:**

1. **Purchase** - Conversión final 💰
2. **AddToCart** - Interés alto 🛒
3. **InitiateCheckout** - Intención de compra 🚀
4. **ViewContent** - Interés en productos 👁️
5. **CompleteRegistration** - Captación de leads 📝

## 🛠️ **Variables de Entorno Requeridas**

```env
NEXT_PUBLIC_FACEBOOK_PIXEL=TU_PIXEL_ID_AQUI
```

## 📊 **Verificación en Meta Business Manager**

### **Para verificar que los eventos funcionan:**

1. Ve a **Meta Business Manager**
2. Selecciona **Eventos Manager**
3. Elige tu Pixel
4. Verifica en **Test Events** que los eventos se envían correctamente

### **Eventos Clave a Monitorear:**

- `Purchase` - ¡El más importante para ROI!
- `InitiateCheckout` - Para optimización de checkout
- `AddToCart` - Para remarketing
- `ViewContent` - Para audiencias similares

## ✨ **Beneficios de la Implementación**

### **📈 Para Marketing:**

- **Tracking completo** del funnel de conversión
- **Remarketing preciso** basado en comportamiento
- **Audiencias similares** basadas en compradores
- **Optimización automática** de campañas de Meta Ads

### **📊 Para Analytics:**

- **Datos duales** (Google Analytics + Meta)
- **Cross-validation** de métricas
- **Insights complementarios** entre plataformas
- **Backup de datos** en caso de problemas

### **🎯 Para Conversiones:**

- **Attribution mejorada** en ecosistema Meta
- **Optimización de bid** automática
- **Dynamic Ads** más efectivos
- **Retargeting especializado** por etapa del funnel

## 🚀 **Próximos Pasos Recomendados**

1. **Verificar eventos** en Meta Events Manager
2. **Configurar conversiones** en Meta Ads Manager
3. **Crear audiencias personalizadas** basadas en eventos
4. **Configurar campañas optimizadas** para Purchase
5. **Implementar Dynamic Ads** usando el catálogo de productos
6. **Configurar Server-Side API** para mayor precisión (opcional)

---

**🎉 ¡Implementación Completa!**  
Tu tienda ahora tiene tracking completo de Meta Pixel trabajando en paralelo con Google Analytics para máximo alcance y precisión en el análisis de conversiones.
