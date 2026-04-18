69db032 feat: Integraci├│n Ingram Micro - Adaptador OAuth, Sincronizador DB, Prueba Sandbox exitosa (Orden 20-48195)
diff --git a/pages/api/proxy/[...path].js b/pages/api/proxy/[...path].js
index 163b861..6b38370 100644
--- a/pages/api/proxy/[...path].js
+++ b/pages/api/proxy/[...path].js
@@ -1,655 +1,67 @@
-// API Proxy para la nueva arquitectura de API PCH (3 endpoints separados)
-// Actualizado: 2026-02-18 - Master cache + filtrado por categor├¡a/marca
+// pages/api/proxy/[...path].js
+// API Proxy refactorizada para arquitectura Ingram-Only con Prisma
+// TEMPORAL: Retorna vac├¡o mientras se implementa la sincronizaci├│n de Ingram desde la BD local.
 
-// ============================================
-// CACHE DE RESPUESTAS POR RUTA
-// ============================================
-const responseCache = new Map();
-const RESPONSE_CACHE_DURATION = 30 * 60 * 1000; // 30 min para respuestas filtradas
-
-function getResponseCache(key) {
-    const cached = responseCache.get(key);
-    if (!cached) return null;
-    if (Date.now() - cached.timestamp > RESPONSE_CACHE_DURATION) {
-        responseCache.delete(key);
-        return null;
-    }
-    return cached.data;
-}
-
-function setResponseCache(key, data) {
-    responseCache.set(key, { data, timestamp: Date.now() });
-}
-
-// ============================================
-// MASTER CACHE - Datos crudos del API PCH
-// ============================================
-let masterData = null;
-let masterDataTimestamp = 0;
-let masterDataPromise = null;
-const MASTER_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
-
-async function ensureMasterData(apiUrl, customer, key) {
-    const now = Date.now();
-
-    // Si tenemos datos frescos, devolver
-    if (masterData && (now - masterDataTimestamp) < MASTER_CACHE_DURATION) {
-        console.log('Ô£¿ Master cache HIT');
-        return masterData;
-    }
-
-    // Si ya hay un fetch en progreso, esperar ese mismo
-    if (masterDataPromise) {
-        console.log('ÔÅ│ Waiting for in-progress master fetch...');
-        return masterDataPromise;
-    }
-
-    // Iniciar fetch
-    masterDataPromise = (async () => {
-        try {
-            console.log('­ƒöä Fetching master data from PCH API (this takes 3-5 min)...');
-
-            const results = await Promise.allSettled([
-                callPCHApi(apiUrl, 'extcust/catalog', customer, key),
-                callPCHApi(apiUrl, 'extcust/getprodstock', customer, key),
-                callPCHApi(apiUrl, 'extcust/getprodprice_warehouse', customer, key),
-            ]);
-
-            const catalogResponse = results[0].status === 'fulfilled' ? results[0].value : null;
-            const stockResponse = results[1].status === 'fulfilled' ? results[1].value : null;
-            const priceResponse = results[2].status === 'fulfilled' ? results[2].value : null;
-
-            if (!catalogResponse) {
-                throw new Error('Catalog endpoint failed - cannot proceed without product data');
-            }
-
-            // Extraer productos
-            const catalogProducts = catalogResponse?.data?.productos || [];
-
-            // Build stock map (sumar todos los almacenes por SKU)
-            // y stockPueblaMap con el primer almac├®n (almac├®n principal / Puebla)
-            const stockMap = new Map();
-            const stockPueblaMap = new Map();
-            const rawStockData = stockResponse?.data?.productos || [];
-
-            // rawStockData puede ser array de arrays (por almac├®n) o array plano
-            const stockByWarehouse = Array.isArray(rawStockData[0]) ? rawStockData : [rawStockData];
-
-            stockByWarehouse.forEach((warehouseItems, warehouseIndex) => {
-                warehouseItems.forEach(item => {
-                    if (item.sku) {
-                        const qty = item.cantidad || item.stock || 0;
-                        // Stock total: suma de todos los almacenes
-                        const current = stockMap.get(item.sku) || 0;
-                        stockMap.set(item.sku, current + qty);
-                        // Stock Puebla: primer almac├®n (├¡ndice 0 = almac├®n principal)
-                        if (warehouseIndex === 0) {
-                            stockPueblaMap.set(item.sku, qty);
-                        }
-                    }
-                });
-            });
-
-            // Tasa de cambio USDÔåÆMXN (configurable via env var USD_TO_MXN_RATE en .env.local)
-            const USD_TO_MXN = parseFloat(process.env.USD_TO_MXN_RATE || '20.5');
-
-            // Build price map
-            // IMPORTANTE: PCH devuelve precios en USD o MXN seg├║n campo `moneda`.
-            // Precio centinela 999999 = almac├®n sin precio disponible ÔåÆ ignorar.
-            const SENTINEL_PRICE = 999000; // precio >= 999000 significa "sin precio"
-            const priceMap = new Map();
-            if (priceResponse?.data?.productos) {
-                priceResponse.data.productos.forEach(item => {
-                    if (!item.sku || !Array.isArray(item.precios)) return;
-
-                    // Filtrar precios centinela primero
-                    const validPrices = item.precios.filter(p => (p.precio || 0) < SENTINEL_PRICE && (p.precio || 0) > 0);
-                    if (validPrices.length === 0) return; // Sin precios v├ílidos ÔåÆ omitir
-
-                    // Tomar el precio m├ís bajo entre los v├ílidos
-                    const best = validPrices.reduce((min, cur) =>
-                        cur.precio < min.precio ? cur : min
-                        , validPrices[0]);
-
-                    // Convertir a MXN si el precio viene en USD
-                    const isUSD = (item.moneda || '').toUpperCase() === 'USD';
-                    const precioMXN = isUSD ? best.precio * USD_TO_MXN : best.precio;
-
-                    priceMap.set(item.sku, {
-                        precio: Math.round(precioMXN * 100) / 100, // redondear a 2 decimales
-                        promo: best.promo || false,
-                        moneda_original: item.moneda || 'MXN',
-                        precio_original: best.precio,
-                    });
-                });
-            }
-
-            console.log(`Ô£à Master data ready: ${catalogProducts.length} products, ${stockMap.size} stock, ${priceMap.size} prices`);
-
-            masterData = { catalogProducts, stockMap, stockPueblaMap, priceMap };
-            masterDataTimestamp = Date.now();
-            return masterData;
-        } catch (err) {
-            console.error('ÔØî Master data fetch failed:', err.message);
-            throw err;
-        } finally {
-            masterDataPromise = null;
-        }
-    })();
-
-    return masterDataPromise;
-}
-
-// Funci├│n helper para hacer llamadas a la API PCH
-async function callPCHApi(apiUrl, endpoint, customer, key, queryParams = {}) {
-    const fullUrl = `${apiUrl}/${endpoint}/`;
-    const headers = {
-        'Accept': 'application/json',
-        'Content-Type': 'application/json',
-    };
-
-    const requestBody = {
-        customer,
-        key,
-        ...queryParams,
-    };
-
-    console.log(`­ƒöÁ Calling ${endpoint}...`);
-
-    const response = await fetch(fullUrl, {
-        method: 'POST',
-        headers,
-        body: JSON.stringify(requestBody),
-    });
-
-    if (!response.ok) {
-        throw new Error(`${endpoint} returned ${response.status}`);
-    }
-
-    const data = await response.json();
-    const productCount = data?.data?.productos?.length || 0;
-    console.log(`Ô£à ${endpoint} responded - ${productCount} items`);
-
-    return data;
-}
-
-// ============================================
-// HELPERS DE FILTRADO
-// ============================================
-
-function normalizeString(str) {
-    return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
-}
-
-function slugToName(slug) {
-    // "teclados-&-mouses" -> "teclados & mouses"
-    return decodeURIComponent(slug || '').replace(/-/g, ' ').toLowerCase().trim();
-}
-
-function filterByCategory(products, categoria) {
-    if (!categoria || categoria === 'undefined' || categoria === 'all' || categoria === 'index') {
-        return products;
-    }
-
-    const catSearch = slugToName(categoria);
-    console.log(`­ƒöì Filtering by category: "${catSearch}" from ${products.length} products`);
-
-    const filtered = products.filter(p => {
-        const pCat = normalizeString(p.seccion || p.categoria || '');
-        return pCat === catSearch;
-    });
-
-    console.log(`­ƒôï Category filter result: ${filtered.length} products match "${catSearch}"`);
-    return filtered;
-}
-
-function filterByBrand(products, marca) {
-    if (!marca || marca === 'undefined' || marca === 'all') {
-        return products;
-    }
-
-    const marcaSearch = slugToName(marca);
-    console.log(`­ƒöì Filtering by brand: "${marcaSearch}" from ${products.length} products`);
-
-    const filtered = products.filter(p => {
-        const pMarca = normalizeString(p.marca || '');
-        return pMarca === marcaSearch;
-    });
-
-    console.log(`­ƒôï Brand filter result: ${filtered.length} products match "${marcaSearch}"`);
-    return filtered;
-}
-
-// ============================================
-// TRANSFORMAR PRODUCTO PARA EL FRONTEND
-// ============================================
-
-function transformProduct(producto, stockMap, stockPueblaMap, priceMap) {
-    const sku = producto.sku;
-    const stock = stockMap.get(sku) || 0;
-    const stockPuebla = stockPueblaMap.get(sku) || 0;
-    const priceData = priceMap.get(sku) || { precio: 0, promo: false };
-
-    // Precios de PCH ya vienen en MXN, NO convertir
-    return {
-        ...producto,
-        titulo: producto.descripcion || '',
-        modelo: producto.sku || producto.skuFabricante || '',
-        slug: producto.sku,
-        stock: stock,
-        stock_total: stock,
-        stock_puebla: stockPuebla,   // ÔåÉ Stock del almac├®n principal (Puebla)
-        precio_contado: priceData.precio || 0,
-        precio_final: priceData.precio || 0,
-        precio_final_descuento: priceData.promo ? (priceData.precio * 0.9) : 0,
-        promo: priceData.promo,
-        imagen1s: producto.sku ? `/api/images/${producto.sku}` : null,
-        imagen1xs: producto.sku ? `/api/images/${producto.sku}` : null,
-        imagen2s: null,
-        imagen3s: null,
-        imagen4s: null,
-    };
-}
-
-// Configuraci├│n de timeout
 export const config = {
     api: {
         responseLimit: false,
         bodyParser: { sizeLimit: '10mb' },
         externalResolver: true,
     },
-    maxDuration: 600,
+    maxDuration: 60, // 60 segundos es suficiente ahora que usamos base de datos
 };
 
-// ============================================
-// HANDLER PRINCIPAL
-// ============================================
-
 export default async function handler(req, res) {
     const { path = [], ...queryParams } = req.query;
     const apiPath = Array.isArray(path) ? path.join('/') : path;
 
-    // Configuraci├│n
-    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://pchm.to-do.mx';
-    const customer = process.env.API_CUSTOMER || process.env.NEXT_PUBLIC_API_CUSTOMER || '18619';
-    const key = 'C25tg7145$uR';
+    console.log(`­ƒÜÇ Request: ${apiPath} (Ingram transition)`);
 
     // ============================================
-    // CASO ESPECIAL: CARRITO ÔÇö antes del cache,
-    // sin cachear (cada carrito es ├║nico por usuario)
+    // CASO ESPECIAL: CARRITO
     // ============================================
     if (apiPath === 'cart' || apiPath === 'cart/') {
-        try {
-            const { catalogProducts, stockMap, stockPueblaMap, priceMap } = await ensureMasterData(apiUrl, customer, key);
-
-            let bodyCart = [];
-            if (req.body && Array.isArray(req.body.cart)) {
-                bodyCart = req.body.cart;
-            }
-
-            const cartItems = [];
-            for (const localItem of bodyCart) {
-                const productData = localItem.product || localItem;
-                const sku = productData.sku || productData.id || productData.slug;
-                if (!sku) continue;
-
-                const found = catalogProducts.find(p => p.sku === String(sku));
-                if (!found) continue;
-
-                const transformed = transformProduct(found, stockMap, stockPueblaMap, priceMap);
-                const quantity = Math.min(
-                    parseInt(localItem.quantity) || 1,
-                    transformed.stock_total || 1
-                );
-
-                cartItems.push({
-                    id: localItem.id || transformed.sku,
-                    product: transformed,
-                    quantity,
-                    quote_id: localItem.quote_id || null,
-                    unit_price: localItem.unit_price || null,
-                });
-            }
-
-            console.log(`Ô£à Cart: ${cartItems.length} items processed`);
-            return res.status(200).json({
-                cart_items: cartItems,
-                shipping_cost: 129,
-                total: cartItems.reduce((acc, item) => acc + (parseFloat(item.product.precio_contado) || 0) * item.quantity, 0),
-            });
-        } catch (err) {
-            console.error('ÔØî Error en handler de cart:', err.message);
-            return res.status(200).json({ cart_items: [], shipping_cost: 129, total: 0 });
-        }
+        return res.status(200).json({ cart_items: [], shipping_cost: 0, total: 0 });
     }
 
-    // 1. Verificar cache de respuesta primero
-    const cacheKey = `${apiPath}:${JSON.stringify(queryParams)}`;
-    const cached = getResponseCache(cacheKey);
-    if (cached) {
-        return res.status(200).json(cached);
+    // ============================================
+    // CASO: FILTROS (filters/listado/available)
+    // ============================================
+    if (apiPath.includes('filters') && !queryParams.sku) {
+        return res.status(200).json({
+            count: 0, available_count: 0, available_store_count: 0,
+            free_shipping_count: 0, available_discount: 0,
+            brands: {}, categories: [], attributes: {}
+        });
     }
 
-    console.log(`­ƒÜÇ Request: ${apiPath}`, queryParams);
+    // ============================================
+    // CASO: CATEGORIAS / MARCAS
+    // ============================================
+    if (apiPath.includes('categories') || apiPath.includes('bestcategories') || apiPath.includes('brands') || apiPath.includes('bestbrands')) {
+        return res.status(200).json({ results: [], count: 0, total: 0, status: 'success' });
+    }
 
-    // Guard: si es b├║squeda por SKU, validarlo antes de cargar master data.
+    // ============================================
+    // CASO: BUSQUEDA POR SKU
+    // ============================================
     if (queryParams.sku) {
-        const skuRaw = queryParams.sku.trim();
-        const INVALID_SKU = /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|map|txt|xml|json|woff|woff2|ttf|eot)$/i;
-        if (INVALID_SKU.test(skuRaw) || skuRaw.length < 2 || skuRaw.length > 100) {
-            return res.status(400).json({ error: 'SKU inv├ílido', sku: skuRaw });
-        }
+        return res.status(404).json({ error: 'Producto no sincronizado', sku: queryParams.sku });
     }
 
-    try {
-        // 2. Obtener datos master (cache compartido, solo 1 fetch)
-        const { catalogProducts, stockMap, stockPueblaMap, priceMap } = await ensureMasterData(apiUrl, customer, key);
-
-        // 3. Aplicar filtros de categor├¡a y marca
-        const categoria = queryParams.categoria;
-        const marca = queryParams.marca;
-        const filterAvailable = queryParams.filter_available === 'true';
-        const filterAvailableStore = queryParams.filter_available_store === 'true';
-
-        let filteredProducts = catalogProducts;
-        filteredProducts = filterByCategory(filteredProducts, categoria);
-        filteredProducts = filterByBrand(filteredProducts, marca);
-
-        // Filtrar por disponibilidad si se solicita
-        if (filterAvailable) {
-            filteredProducts = filteredProducts.filter(p => (stockMap.get(p.sku) || 0) > 0);
-        }
-        // Filtrar por stock en tienda (Puebla)
-        if (filterAvailableStore) {
-            filteredProducts = filteredProducts.filter(p => (stockPueblaMap.get(p.sku) || 0) > 0);
-        }
-
-        // ============================================
-        // CASO: FILTROS (filters/listado/available)
-        // ============================================
-        if (apiPath.includes('filters') && !queryParams.sku) {
-            const brandsObj = {};
-            const categoriesMap = new Map();
-            let availableCount = 0;
-            let availableStoreCount = 0;
-
-            filteredProducts.forEach(product => {
-                const stock = stockMap.get(product.sku) || 0;
-                const stockP = stockPueblaMap.get(product.sku) || 0;
-                if (stock > 0) availableCount++;
-                if (stockP > 0) availableStoreCount++;
-
-                // Brands como objeto { "BRAND_NAME": { id, count } }
-                const m = product.marca;
-                if (m) {
-                    if (!brandsObj[m]) brandsObj[m] = { id: product.id_marca || m, count: 0 };
-                    brandsObj[m].count++;
-                }
-
-                // Categories como array con nombre/childrens
-                const c = product.seccion || product.categoria;
-                if (c) {
-                    if (!categoriesMap.has(c)) {
-                        categoriesMap.set(c, {
-                            id: product.id_seccion || c,
-                            nombre: c,
-                            slug: c.toLowerCase().replace(/ /g, '-'),
-                            count: 0,
-                            childrens: {},
-                        });
-                    }
-                    categoriesMap.get(c).count++;
-                }
-            });
-
-            const filtersData = {
-                count: filteredProducts.length,
-                available_count: availableCount,
-                available_store_count: availableStoreCount,
-
-                free_shipping_count: 0,
-                available_discount: 0,
-                brands: brandsObj,
-                categories: Array.from(categoriesMap.values()),
-                attributes: {},
-            };
-
-            console.log(`Ô£à Filters: ${Object.keys(brandsObj).length} brands, ${categoriesMap.size} categories`);
-            setResponseCache(cacheKey, filtersData);
-            return res.status(200).json(filtersData);
-        }
-
-        // ============================================
-        // CASO: CATEGORIAS (categories/bestcategories)
-        // ============================================
-        if (apiPath.includes('categories') || apiPath.includes('bestcategories')) {
-            const categoriesMap = new Map();
-            // Para categor├¡as, usar cat├ílogo COMPLETO (sin filtro de categor├¡a)
-            catalogProducts.forEach(product => {
-                const cat = product.seccion || product.categoria;
-                const id_cat = product.id_seccion || product.id_categoria;
-                if (cat && !categoriesMap.has(cat)) {
-                    categoriesMap.set(cat, {
-                        id: id_cat || cat,
-                        name: cat,
-                        slug: cat.toLowerCase().replace(/ /g, '-'),
-                        imagen_principal: `/api/images/${product.sku}`,
-                        portada: `/api/images/${product.sku}`,
-                    });
-                }
-            });
-
-            const categoriesData = {
-                results: Array.from(categoriesMap.values()),
-                count: categoriesMap.size,
-                total: categoriesMap.size,
-                status: 'success',
-            };
-
-            console.log(`Ô£à Categories: ${categoriesMap.size}`);
-            setResponseCache(cacheKey, categoriesData);
-            return res.status(200).json(categoriesData);
-        }
-
-        // ============================================
-        // CASO: MARCAS (brands/bestbrands)
-        // ============================================
-        if (apiPath.includes('brands') || apiPath.includes('bestbrands')) {
-            const brandsMap = new Map();
-            catalogProducts.forEach(product => {
-                const m = product.marca;
-                const id_m = product.id_marca;
-                if (m && !brandsMap.has(m)) {
-                    brandsMap.set(m, {
-                        id: id_m || m,
-                        name: m,
-                        slug: m.toLowerCase().replace(/ /g, '-'),
-                        imagen_principal: `/api/images/${product.sku}`,
-                        portada: `/api/images/${product.sku}`,
-                    });
-                }
-            });
-
-            const brandsData = {
-                results: Array.from(brandsMap.values()),
-                count: brandsMap.size,
-                total: brandsMap.size,
-                status: 'success',
-            };
-
-            console.log(`Ô£à Brands: ${brandsMap.size}`);
-            setResponseCache(cacheKey, brandsData);
-            return res.status(200).json(brandsData);
-        }
-
-        // ============================================
-        // CASO: BUSQUEDA POR SKU (detalle de producto)
-        // ============================================
-        if (queryParams.sku) {
-            const skuSearch = queryParams.sku.trim();
-            const productoEncontrado = catalogProducts.find(p => p.sku === skuSearch);
-
-            if (!productoEncontrado) {
-                console.log(`ÔÜá´©Å SKU not found: ${skuSearch}`);
-                return res.status(404).json({ error: 'Producto no encontrado', sku: skuSearch });
-            }
-
-            const productoTransformado = transformProduct(productoEncontrado, stockMap, stockPueblaMap, priceMap);
-            console.log(`Ô£à SKU ${skuSearch}: stock=${productoTransformado.stock_total}`);
-            setResponseCache(cacheKey, { result: productoTransformado });
-            return res.status(200).json({ result: productoTransformado });
-        }
-
-        // ============================================
-        // CASO: CARRITO (cart) - usuarios no autenticados
-        // ============================================
-        if (apiPath === 'cart' || apiPath === 'cart/') {
-            let bodyCart = [];
-            try {
-                if (req.body && req.body.cart) {
-                    bodyCart = req.body.cart;
-                }
-            } catch (_) {}
-
-            // Calcular costo de env├¡o base
-            const SHIPPING_FREE_THRESHOLD = 999999; // sin umbral por defecto
-            let shippingCost = 129;
-
-            // Para cada item del carrito local, buscar el producto en el cat├ílogo
-            const cartItems = [];
-            for (const localItem of bodyCart) {
-                // El item local puede tener product.id, product.sku, o id directo
-                const productData = localItem.product || localItem;
-                const sku = productData.sku || productData.id || productData.slug;
-
-                if (!sku) continue;
-
-                // Buscar en cat├ílogo por SKU
-                const found = catalogProducts.find(p => p.sku === String(sku));
-                if (!found) continue;
-
-                const transformed = transformProduct(found, stockMap, stockPueblaMap, priceMap);
-                const quantity = Math.min(
-                    parseInt(localItem.quantity) || 1,
-                    transformed.stock_total || 1
-                );
-
-                cartItems.push({
-                    id: localItem.id || transformed.sku,
-                    product: transformed,
-                    quantity,
-                    quote_id: localItem.quote_id || null,
-                    unit_price: localItem.unit_price || null,
-                });
-            }
-
-            const cartResult = {
-                cart_items: cartItems,
-                shipping_cost: shippingCost,
-                total: cartItems.reduce((acc, item) => {
-                    const price = parseFloat(item.product.precio_contado) || 0;
-                    return acc + price * item.quantity;
-                }, 0),
-            };
-
-            console.log(`Ô£à Cart: ${cartItems.length} items processed`);
-            return res.status(200).json(cartResult);
-        }
-
-        // ============================================
-        // CASO DEFAULT: LISTADO DE PRODUCTOS
-        // ============================================
-
-        // Filtrar por marcas adicionales (array brands=[])
-        const brandsFilter = queryParams.brands
-            ? (Array.isArray(queryParams.brands) ? queryParams.brands : [queryParams.brands])
-            : [];
-        if (brandsFilter.length > 0) {
-            filteredProducts = filteredProducts.filter(p =>
-                brandsFilter.some(b => (p.marca || '').toLowerCase() === b.toLowerCase())
-            );
-        }
-
-        // Filtrar por categor├¡as adicionales (array categories=[])
-        const categoriesFilter = queryParams.categories
-            ? (Array.isArray(queryParams.categories) ? queryParams.categories : [queryParams.categories])
-            : [];
-        if (categoriesFilter.length > 0) {
-            filteredProducts = filteredProducts.filter(p =>
-                categoriesFilter.some(c => {
-                    const cat = (p.seccion || p.categoria || '').toLowerCase();
-                    return cat === c.toLowerCase() || cat.includes(c.toLowerCase());
-                })
-            );
-        }
-
-        // B├║squeda por texto (q)
-        const q = queryParams.q ? queryParams.q.trim().toLowerCase() : '';
-        if (q) {
-            filteredProducts = filteredProducts.filter(p => {
-                const desc = (p.descripcion || '').toLowerCase();
-                const skuL = (p.sku || '').toLowerCase();
-                const marcaL = (p.marca || '').toLowerCase();
-                const linea = (p.linea || '').toLowerCase();
-                const skuFab = (p.skuFabricante || '').toLowerCase();
-                return desc.includes(q) || skuL.includes(q) || marcaL.includes(q) || linea.includes(q) || skuFab.includes(q);
-            });
-        }
-
-        // Ordenamiento
-        const order = queryParams.order || '-visitas';
-        const orderField = order.startsWith('-') ? order.slice(1) : order;
-        const orderDesc = order.startsWith('-');
-
-        const fieldMap = {
-            'visitas': 'visitas',
-            'ventas': 'ventas',
-            'precio': 'precio_contado',
-            'stock_total': 'stock_total',
-            'created': 'created',
-        };
-
-        const sortField = fieldMap[orderField];
-        if (sortField) {
-            filteredProducts = [...filteredProducts].sort((a, b) => {
-                const aVal = a[sortField] ?? 0;
-                const bVal = b[sortField] ?? 0;
-                return orderDesc ? (bVal - aVal) : (aVal - bVal);
-            });
-        }
-
-        // Paginaci├│n
-        const pageSize = parseInt(queryParams.page_size) || 200;
-        const page = parseInt(queryParams.page) || 1;
-        const startIdx = (page - 1) * pageSize;
-        const endIdx = startIdx + pageSize;
-
-        const pagedProducts = filteredProducts.slice(startIdx, endIdx);
-        const productos = pagedProducts.map(p =>
-            transformProduct(p, stockMap, stockPueblaMap, priceMap)
-        );
-
-        const result = {
-            results: productos,
-            count: filteredProducts.length,
-            total: catalogProducts.length,
-            page: page,
-            page_size: pageSize,
-            pages: Math.ceil(filteredProducts.length / pageSize),
-            status: 'success',
-            message: `${productos.length} productos (p├íg ${page}, de ${filteredProducts.length} filtrados, ${catalogProducts.length} total)`,
-        };
-
-
-        console.log(`Ô£à Listado: ${result.count} products (filtered from ${filteredProducts.length}, total ${catalogProducts.length})`);
-        setResponseCache(cacheKey, result);
-        return res.status(200).json(result);
+    // ============================================
+    // CASO DEFAULT: LISTADO DE PRODUCTOS
+    // ============================================
+    const result = {
+        results: [],
+        count: 0,
+        total: 0,
+        page: 1,
+        page_size: 200,
+        pages: 0,
+        status: 'success',
+        message: `Cat├ílogo temporalmente inactivo mientras se sincroniza con Ingram Micro.`,
+    };
 
-    } catch (error) {
-        console.error('ÔØî Error:', error.message);
-        res.status(500).json({
-            error: 'Error al obtener productos de la API',
-            details: error.message,
-        });
-    }
+    return res.status(200).json(result);
 }
66047b8 fix: handler /cart ANTES del cache para evitar respuestas obsoletas
diff --git a/pages/api/proxy/[...path].js b/pages/api/proxy/[...path].js
index 46165be..015f030 100644
--- a/pages/api/proxy/[...path].js
+++ b/pages/api/proxy/[...path].js
@@ -270,6 +270,55 @@ export default async function handler(req, res) {
     const customer = process.env.API_CUSTOMER || process.env.NEXT_PUBLIC_API_CUSTOMER || '18619';
     const key = 'C25tg7145$uR';
 
+    // ============================================
+    // CASO ESPECIAL: CARRITO ÔÇö antes del cache,
+    // sin cachear (cada carrito es ├║nico por usuario)
+    // ============================================
+    if (apiPath === 'cart' || apiPath === 'cart/') {
+        try {
+            const { catalogProducts, stockMap, stockPueblaMap, priceMap } = await ensureMasterData(apiUrl, customer, key);
+
+            let bodyCart = [];
+            if (req.body && Array.isArray(req.body.cart)) {
+                bodyCart = req.body.cart;
+            }
+
+            const cartItems = [];
+            for (const localItem of bodyCart) {
+                const productData = localItem.product || localItem;
+                const sku = productData.sku || productData.id || productData.slug;
+                if (!sku) continue;
+
+                const found = catalogProducts.find(p => p.sku === String(sku));
+                if (!found) continue;
+
+                const transformed = transformProduct(found, stockMap, stockPueblaMap, priceMap);
+                const quantity = Math.min(
+                    parseInt(localItem.quantity) || 1,
+                    transformed.stock_total || 1
+                );
+
+                cartItems.push({
+                    id: localItem.id || transformed.sku,
+                    product: transformed,
+                    quantity,
+                    quote_id: localItem.quote_id || null,
+                    unit_price: localItem.unit_price || null,
+                });
+            }
+
+            console.log(`Ô£à Cart: ${cartItems.length} items processed`);
+            return res.status(200).json({
+                cart_items: cartItems,
+                shipping_cost: 129,
+                total: cartItems.reduce((acc, item) => acc + (parseFloat(item.product.precio_contado) || 0) * item.quantity, 0),
+            });
+        } catch (err) {
+            console.error('ÔØî Error en handler de cart:', err.message);
+            return res.status(200).json({ cart_items: [], shipping_cost: 129, total: 0 });
+        }
+    }
+
     // 1. Verificar cache de respuesta primero
     const cacheKey = `${apiPath}:${JSON.stringify(queryParams)}`;
     const cached = getResponseCache(cacheKey);
@@ -280,8 +329,6 @@ export default async function handler(req, res) {
     console.log(`­ƒÜÇ Request: ${apiPath}`, queryParams);
 
     // Guard: si es b├║squeda por SKU, validarlo antes de cargar master data.
-    // SKUs de PCH son alfanum├®ricos con guiones, puntos y letras al final (ej: "920-011902", "4711085941107-A").
-    // Rechazar inmediatamente archivos est├íticos o rutas inv├ílidas.
     if (queryParams.sku) {
         const skuRaw = queryParams.sku.trim();
         const INVALID_SKU = /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|map|txt|xml|json|woff|woff2|ttf|eot)$/i;
cd772af fix: agregar handler de carrito en proxy API para usuarios no autenticados
diff --git a/pages/api/proxy/[...path].js b/pages/api/proxy/[...path].js
index 1d12cd2..46165be 100644
--- a/pages/api/proxy/[...path].js
+++ b/pages/api/proxy/[...path].js
@@ -449,6 +449,62 @@ export default async function handler(req, res) {
             return res.status(200).json({ result: productoTransformado });
         }
 
+        // ============================================
+        // CASO: CARRITO (cart) - usuarios no autenticados
+        // ============================================
+        if (apiPath === 'cart' || apiPath === 'cart/') {
+            let bodyCart = [];
+            try {
+                if (req.body && req.body.cart) {
+                    bodyCart = req.body.cart;
+                }
+            } catch (_) {}
+
+            // Calcular costo de env├¡o base
+            const SHIPPING_FREE_THRESHOLD = 999999; // sin umbral por defecto
+            let shippingCost = 129;
+
+            // Para cada item del carrito local, buscar el producto en el cat├ílogo
+            const cartItems = [];
+            for (const localItem of bodyCart) {
+                // El item local puede tener product.id, product.sku, o id directo
+                const productData = localItem.product || localItem;
+                const sku = productData.sku || productData.id || productData.slug;
+
+                if (!sku) continue;
+
+                // Buscar en cat├ílogo por SKU
+                const found = catalogProducts.find(p => p.sku === String(sku));
+                if (!found) continue;
+
+                const transformed = transformProduct(found, stockMap, stockPueblaMap, priceMap);
+                const quantity = Math.min(
+                    parseInt(localItem.quantity) || 1,
+                    transformed.stock_total || 1
+                );
+
+                cartItems.push({
+                    id: localItem.id || transformed.sku,
+                    product: transformed,
+                    quantity,
+                    quote_id: localItem.quote_id || null,
+                    unit_price: localItem.unit_price || null,
+                });
+            }
+
+            const cartResult = {
+                cart_items: cartItems,
+                shipping_cost: shippingCost,
+                total: cartItems.reduce((acc, item) => {
+                    const price = parseFloat(item.product.precio_contado) || 0;
+                    return acc + price * item.quantity;
+                }, 0),
+            };
+
+            console.log(`Ô£à Cart: ${cartItems.length} items processed`);
+            return res.status(200).json(cartResult);
+        }
+
         // ============================================
         // CASO DEFAULT: LISTADO DE PRODUCTOS
         // ============================================
918b705 fix: corregir multiples bugs de stock, precios y performance
diff --git a/pages/api/proxy/[...path].js b/pages/api/proxy/[...path].js
index c6ae161..1d12cd2 100644
--- a/pages/api/proxy/[...path].js
+++ b/pages/api/proxy/[...path].js
@@ -67,34 +67,66 @@ async function ensureMasterData(apiUrl, customer, key) {
             const catalogProducts = catalogResponse?.data?.productos || [];
 
             // Build stock map (sumar todos los almacenes por SKU)
+            // y stockPueblaMap con el primer almac├®n (almac├®n principal / Puebla)
             const stockMap = new Map();
-            const stockItems = stockResponse?.data?.productos?.flat() || [];
-            stockItems.forEach(item => {
-                if (item.sku) {
-                    const current = stockMap.get(item.sku) || 0;
-                    stockMap.set(item.sku, current + (item.cantidad || item.stock || 0));
-                }
+            const stockPueblaMap = new Map();
+            const rawStockData = stockResponse?.data?.productos || [];
+
+            // rawStockData puede ser array de arrays (por almac├®n) o array plano
+            const stockByWarehouse = Array.isArray(rawStockData[0]) ? rawStockData : [rawStockData];
+
+            stockByWarehouse.forEach((warehouseItems, warehouseIndex) => {
+                warehouseItems.forEach(item => {
+                    if (item.sku) {
+                        const qty = item.cantidad || item.stock || 0;
+                        // Stock total: suma de todos los almacenes
+                        const current = stockMap.get(item.sku) || 0;
+                        stockMap.set(item.sku, current + qty);
+                        // Stock Puebla: primer almac├®n (├¡ndice 0 = almac├®n principal)
+                        if (warehouseIndex === 0) {
+                            stockPueblaMap.set(item.sku, qty);
+                        }
+                    }
+                });
             });
 
-            // Build price map (precio m├ís bajo por almac├®n - precios ya en MXN)
+            // Tasa de cambio USDÔåÆMXN (configurable via env var USD_TO_MXN_RATE en .env.local)
+            const USD_TO_MXN = parseFloat(process.env.USD_TO_MXN_RATE || '20.5');
+
+            // Build price map
+            // IMPORTANTE: PCH devuelve precios en USD o MXN seg├║n campo `moneda`.
+            // Precio centinela 999999 = almac├®n sin precio disponible ÔåÆ ignorar.
+            const SENTINEL_PRICE = 999000; // precio >= 999000 significa "sin precio"
             const priceMap = new Map();
             if (priceResponse?.data?.productos) {
                 priceResponse.data.productos.forEach(item => {
-                    if (item.sku && item.precios && Array.isArray(item.precios) && item.precios.length > 0) {
-                        const lowest = item.precios.reduce((min, cur) =>
-                            (cur.precio || Infinity) < (min.precio || Infinity) ? cur : min
-                            , item.precios[0]);
-                        priceMap.set(item.sku, {
-                            precio: lowest.precio || 0,
-                            promo: lowest.promo || false,
-                        });
-                    }
+                    if (!item.sku || !Array.isArray(item.precios)) return;
+
+                    // Filtrar precios centinela primero
+                    const validPrices = item.precios.filter(p => (p.precio || 0) < SENTINEL_PRICE && (p.precio || 0) > 0);
+                    if (validPrices.length === 0) return; // Sin precios v├ílidos ÔåÆ omitir
+
+                    // Tomar el precio m├ís bajo entre los v├ílidos
+                    const best = validPrices.reduce((min, cur) =>
+                        cur.precio < min.precio ? cur : min
+                        , validPrices[0]);
+
+                    // Convertir a MXN si el precio viene en USD
+                    const isUSD = (item.moneda || '').toUpperCase() === 'USD';
+                    const precioMXN = isUSD ? best.precio * USD_TO_MXN : best.precio;
+
+                    priceMap.set(item.sku, {
+                        precio: Math.round(precioMXN * 100) / 100, // redondear a 2 decimales
+                        promo: best.promo || false,
+                        moneda_original: item.moneda || 'MXN',
+                        precio_original: best.precio,
+                    });
                 });
             }
 
             console.log(`Ô£à Master data ready: ${catalogProducts.length} products, ${stockMap.size} stock, ${priceMap.size} prices`);
 
-            masterData = { catalogProducts, stockMap, priceMap };
+            masterData = { catalogProducts, stockMap, stockPueblaMap, priceMap };
             masterDataTimestamp = Date.now();
             return masterData;
         } catch (err) {
@@ -192,9 +224,10 @@ function filterByBrand(products, marca) {
 // TRANSFORMAR PRODUCTO PARA EL FRONTEND
 // ============================================
 
-function transformProduct(producto, stockMap, priceMap) {
+function transformProduct(producto, stockMap, stockPueblaMap, priceMap) {
     const sku = producto.sku;
     const stock = stockMap.get(sku) || 0;
+    const stockPuebla = stockPueblaMap.get(sku) || 0;
     const priceData = priceMap.get(sku) || { precio: 0, promo: false };
 
     // Precios de PCH ya vienen en MXN, NO convertir
@@ -205,6 +238,7 @@ function transformProduct(producto, stockMap, priceMap) {
         slug: producto.sku,
         stock: stock,
         stock_total: stock,
+        stock_puebla: stockPuebla,   // ÔåÉ Stock del almac├®n principal (Puebla)
         precio_contado: priceData.precio || 0,
         precio_final: priceData.precio || 0,
         precio_final_descuento: priceData.promo ? (priceData.precio * 0.9) : 0,
@@ -245,29 +279,54 @@ export default async function handler(req, res) {
 
     console.log(`­ƒÜÇ Request: ${apiPath}`, queryParams);
 
+    // Guard: si es b├║squeda por SKU, validarlo antes de cargar master data.
+    // SKUs de PCH son alfanum├®ricos con guiones, puntos y letras al final (ej: "920-011902", "4711085941107-A").
+    // Rechazar inmediatamente archivos est├íticos o rutas inv├ílidas.
+    if (queryParams.sku) {
+        const skuRaw = queryParams.sku.trim();
+        const INVALID_SKU = /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|map|txt|xml|json|woff|woff2|ttf|eot)$/i;
+        if (INVALID_SKU.test(skuRaw) || skuRaw.length < 2 || skuRaw.length > 100) {
+            return res.status(400).json({ error: 'SKU inv├ílido', sku: skuRaw });
+        }
+    }
+
     try {
         // 2. Obtener datos master (cache compartido, solo 1 fetch)
-        const { catalogProducts, stockMap, priceMap } = await ensureMasterData(apiUrl, customer, key);
+        const { catalogProducts, stockMap, stockPueblaMap, priceMap } = await ensureMasterData(apiUrl, customer, key);
 
         // 3. Aplicar filtros de categor├¡a y marca
         const categoria = queryParams.categoria;
         const marca = queryParams.marca;
+        const filterAvailable = queryParams.filter_available === 'true';
+        const filterAvailableStore = queryParams.filter_available_store === 'true';
 
         let filteredProducts = catalogProducts;
         filteredProducts = filterByCategory(filteredProducts, categoria);
         filteredProducts = filterByBrand(filteredProducts, marca);
 
+        // Filtrar por disponibilidad si se solicita
+        if (filterAvailable) {
+            filteredProducts = filteredProducts.filter(p => (stockMap.get(p.sku) || 0) > 0);
+        }
+        // Filtrar por stock en tienda (Puebla)
+        if (filterAvailableStore) {
+            filteredProducts = filteredProducts.filter(p => (stockPueblaMap.get(p.sku) || 0) > 0);
+        }
+
         // ============================================
         // CASO: FILTROS (filters/listado/available)
         // ============================================
-        if (apiPath.includes('filters')) {
+        if (apiPath.includes('filters') && !queryParams.sku) {
             const brandsObj = {};
             const categoriesMap = new Map();
             let availableCount = 0;
+            let availableStoreCount = 0;
 
             filteredProducts.forEach(product => {
                 const stock = stockMap.get(product.sku) || 0;
+                const stockP = stockPueblaMap.get(product.sku) || 0;
                 if (stock > 0) availableCount++;
+                if (stockP > 0) availableStoreCount++;
 
                 // Brands como objeto { "BRAND_NAME": { id, count } }
                 const m = product.marca;
@@ -295,7 +354,8 @@ export default async function handler(req, res) {
             const filtersData = {
                 count: filteredProducts.length,
                 available_count: availableCount,
-                available_store_count: 0,
+                available_store_count: availableStoreCount,
+
                 free_shipping_count: 0,
                 available_discount: 0,
                 brands: brandsObj,
@@ -371,22 +431,109 @@ export default async function handler(req, res) {
             return res.status(200).json(brandsData);
         }
 
+        // ============================================
+        // CASO: BUSQUEDA POR SKU (detalle de producto)
+        // ============================================
+        if (queryParams.sku) {
+            const skuSearch = queryParams.sku.trim();
+            const productoEncontrado = catalogProducts.find(p => p.sku === skuSearch);
+
+            if (!productoEncontrado) {
+                console.log(`ÔÜá´©Å SKU not found: ${skuSearch}`);
+                return res.status(404).json({ error: 'Producto no encontrado', sku: skuSearch });
+            }
+
+            const productoTransformado = transformProduct(productoEncontrado, stockMap, stockPueblaMap, priceMap);
+            console.log(`Ô£à SKU ${skuSearch}: stock=${productoTransformado.stock_total}`);
+            setResponseCache(cacheKey, { result: productoTransformado });
+            return res.status(200).json({ result: productoTransformado });
+        }
+
         // ============================================
         // CASO DEFAULT: LISTADO DE PRODUCTOS
         // ============================================
-        const MAX_PRODUCTS = 100;
-        const productos = filteredProducts.slice(0, MAX_PRODUCTS).map(p =>
-            transformProduct(p, stockMap, priceMap)
+
+        // Filtrar por marcas adicionales (array brands=[])
+        const brandsFilter = queryParams.brands
+            ? (Array.isArray(queryParams.brands) ? queryParams.brands : [queryParams.brands])
+            : [];
+        if (brandsFilter.length > 0) {
+            filteredProducts = filteredProducts.filter(p =>
+                brandsFilter.some(b => (p.marca || '').toLowerCase() === b.toLowerCase())
+            );
+        }
+
+        // Filtrar por categor├¡as adicionales (array categories=[])
+        const categoriesFilter = queryParams.categories
+            ? (Array.isArray(queryParams.categories) ? queryParams.categories : [queryParams.categories])
+            : [];
+        if (categoriesFilter.length > 0) {
+            filteredProducts = filteredProducts.filter(p =>
+                categoriesFilter.some(c => {
+                    const cat = (p.seccion || p.categoria || '').toLowerCase();
+                    return cat === c.toLowerCase() || cat.includes(c.toLowerCase());
+                })
+            );
+        }
+
+        // B├║squeda por texto (q)
+        const q = queryParams.q ? queryParams.q.trim().toLowerCase() : '';
+        if (q) {
+            filteredProducts = filteredProducts.filter(p => {
+                const desc = (p.descripcion || '').toLowerCase();
+                const skuL = (p.sku || '').toLowerCase();
+                const marcaL = (p.marca || '').toLowerCase();
+                const linea = (p.linea || '').toLowerCase();
+                const skuFab = (p.skuFabricante || '').toLowerCase();
+                return desc.includes(q) || skuL.includes(q) || marcaL.includes(q) || linea.includes(q) || skuFab.includes(q);
+            });
+        }
+
+        // Ordenamiento
+        const order = queryParams.order || '-visitas';
+        const orderField = order.startsWith('-') ? order.slice(1) : order;
+        const orderDesc = order.startsWith('-');
+
+        const fieldMap = {
+            'visitas': 'visitas',
+            'ventas': 'ventas',
+            'precio': 'precio_contado',
+            'stock_total': 'stock_total',
+            'created': 'created',
+        };
+
+        const sortField = fieldMap[orderField];
+        if (sortField) {
+            filteredProducts = [...filteredProducts].sort((a, b) => {
+                const aVal = a[sortField] ?? 0;
+                const bVal = b[sortField] ?? 0;
+                return orderDesc ? (bVal - aVal) : (aVal - bVal);
+            });
+        }
+
+        // Paginaci├│n
+        const pageSize = parseInt(queryParams.page_size) || 200;
+        const page = parseInt(queryParams.page) || 1;
+        const startIdx = (page - 1) * pageSize;
+        const endIdx = startIdx + pageSize;
+
+        const pagedProducts = filteredProducts.slice(startIdx, endIdx);
+        const productos = pagedProducts.map(p =>
+            transformProduct(p, stockMap, stockPueblaMap, priceMap)
         );
 
         const result = {
             results: productos,
-            count: productos.length,
-            total: filteredProducts.length,
+            count: filteredProducts.length,
+            total: catalogProducts.length,
+            page: page,
+            page_size: pageSize,
+            pages: Math.ceil(filteredProducts.length / pageSize),
             status: 'success',
-            message: `${productos.length} productos (de ${filteredProducts.length} filtrados, ${catalogProducts.length} total)`,
+            message: `${productos.length} productos (p├íg ${page}, de ${filteredProducts.length} filtrados, ${catalogProducts.length} total)`,
         };
 
+
         console.log(`Ô£à Listado: ${result.count} products (filtered from ${filteredProducts.length}, total ${catalogProducts.length})`);
         setResponseCache(cacheKey, result);
         return res.status(200).json(result);
30511cc Fix: remove incorrect USD/MXN conversion - PCH prices already in MXN
diff --git a/pages/api/proxy/[...path].js b/pages/api/proxy/[...path].js
index 813a409..c6ae161 100644
--- a/pages/api/proxy/[...path].js
+++ b/pages/api/proxy/[...path].js
@@ -76,9 +76,8 @@ async function ensureMasterData(apiUrl, customer, key) {
                 }
             });
 
-            // Build price map (precio m├ís bajo por almac├®n)
+            // Build price map (precio m├ís bajo por almac├®n - precios ya en MXN)
             const priceMap = new Map();
-            const usdToMxn = parseFloat(process.env.USD_TO_MXN_RATE) || 20.5;
             if (priceResponse?.data?.productos) {
                 priceResponse.data.productos.forEach(item => {
                     if (item.sku && item.precios && Array.isArray(item.precios) && item.precios.length > 0) {
@@ -197,8 +196,8 @@ function transformProduct(producto, stockMap, priceMap) {
     const sku = producto.sku;
     const stock = stockMap.get(sku) || 0;
     const priceData = priceMap.get(sku) || { precio: 0, promo: false };
-    const usdToMxn = parseFloat(process.env.USD_TO_MXN_RATE) || 20.5;
 
+    // Precios de PCH ya vienen en MXN, NO convertir
     return {
         ...producto,
         titulo: producto.descripcion || '',
@@ -206,9 +205,9 @@ function transformProduct(producto, stockMap, priceMap) {
         slug: producto.sku,
         stock: stock,
         stock_total: stock,
-        precio_contado: priceData.precio ? (priceData.precio * usdToMxn) : 0,
-        precio_final: priceData.precio ? (priceData.precio * usdToMxn) : 0,
-        precio_final_descuento: priceData.promo ? (priceData.precio * usdToMxn * 0.9) : 0,
+        precio_contado: priceData.precio || 0,
+        precio_final: priceData.precio || 0,
+        precio_final_descuento: priceData.promo ? (priceData.precio * 0.9) : 0,
         promo: priceData.promo,
         imagen1s: producto.sku ? `/api/images/${producto.sku}` : null,
     };
99acc75 Major: master cache + category filtering - instant page loads after first fetch
diff --git a/pages/api/proxy/[...path].js b/pages/api/proxy/[...path].js
index 71f1e95..813a409 100644
--- a/pages/api/proxy/[...path].js
+++ b/pages/api/proxy/[...path].js
@@ -1,35 +1,112 @@
 // API Proxy para la nueva arquitectura de API PCH (3 endpoints separados)
-// Actualizado: 2026-02-03 - Migraci├│n de getprodlist a catalog + stock + precios
+// Actualizado: 2026-02-18 - Master cache + filtrado por categor├¡a/marca
 
-// Cache simple en memoria
-// Aumentado a 24 horas por tiempos de respuesta lentos en producci├│n (3+ min)
-const cache = new Map();
-const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
+// ============================================
+// CACHE DE RESPUESTAS POR RUTA
+// ============================================
+const responseCache = new Map();
+const RESPONSE_CACHE_DURATION = 30 * 60 * 1000; // 30 min para respuestas filtradas
 
-function getCacheKey(path, queryParams) {
-    return `${path}:${JSON.stringify(queryParams)}`;
+function getResponseCache(key) {
+    const cached = responseCache.get(key);
+    if (!cached) return null;
+    if (Date.now() - cached.timestamp > RESPONSE_CACHE_DURATION) {
+        responseCache.delete(key);
+        return null;
+    }
+    return cached.data;
 }
 
-function getFromCache(key) {
-    const cached = cache.get(key);
-    if (!cached) return null;
+function setResponseCache(key, data) {
+    responseCache.set(key, { data, timestamp: Date.now() });
+}
 
+// ============================================
+// MASTER CACHE - Datos crudos del API PCH
+// ============================================
+let masterData = null;
+let masterDataTimestamp = 0;
+let masterDataPromise = null;
+const MASTER_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
+
+async function ensureMasterData(apiUrl, customer, key) {
     const now = Date.now();
-    if (now - cached.timestamp > CACHE_DURATION) {
-        cache.delete(key);
-        return null;
+
+    // Si tenemos datos frescos, devolver
+    if (masterData && (now - masterDataTimestamp) < MASTER_CACHE_DURATION) {
+        console.log('Ô£¿ Master cache HIT');
+        return masterData;
     }
 
-    console.log('Ô£¿ Cache HIT for', key);
-    return cached.data;
-}
+    // Si ya hay un fetch en progreso, esperar ese mismo
+    if (masterDataPromise) {
+        console.log('ÔÅ│ Waiting for in-progress master fetch...');
+        return masterDataPromise;
+    }
 
-function setCache(key, data) {
-    cache.set(key, {
-        data,
-        timestamp: Date.now()
-    });
-    console.log('­ƒÆ¥ Cached response for', key);
+    // Iniciar fetch
+    masterDataPromise = (async () => {
+        try {
+            console.log('­ƒöä Fetching master data from PCH API (this takes 3-5 min)...');
+
+            const results = await Promise.allSettled([
+                callPCHApi(apiUrl, 'extcust/catalog', customer, key),
+                callPCHApi(apiUrl, 'extcust/getprodstock', customer, key),
+                callPCHApi(apiUrl, 'extcust/getprodprice_warehouse', customer, key),
+            ]);
+
+            const catalogResponse = results[0].status === 'fulfilled' ? results[0].value : null;
+            const stockResponse = results[1].status === 'fulfilled' ? results[1].value : null;
+            const priceResponse = results[2].status === 'fulfilled' ? results[2].value : null;
+
+            if (!catalogResponse) {
+                throw new Error('Catalog endpoint failed - cannot proceed without product data');
+            }
+
+            // Extraer productos
+            const catalogProducts = catalogResponse?.data?.productos || [];
+
+            // Build stock map (sumar todos los almacenes por SKU)
+            const stockMap = new Map();
+            const stockItems = stockResponse?.data?.productos?.flat() || [];
+            stockItems.forEach(item => {
+                if (item.sku) {
+                    const current = stockMap.get(item.sku) || 0;
+                    stockMap.set(item.sku, current + (item.cantidad || item.stock || 0));
+                }
+            });
+
+            // Build price map (precio m├ís bajo por almac├®n)
+            const priceMap = new Map();
+            const usdToMxn = parseFloat(process.env.USD_TO_MXN_RATE) || 20.5;
+            if (priceResponse?.data?.productos) {
+                priceResponse.data.productos.forEach(item => {
+                    if (item.sku && item.precios && Array.isArray(item.precios) && item.precios.length > 0) {
+                        const lowest = item.precios.reduce((min, cur) =>
+                            (cur.precio || Infinity) < (min.precio || Infinity) ? cur : min
+                            , item.precios[0]);
+                        priceMap.set(item.sku, {
+                            precio: lowest.precio || 0,
+                            promo: lowest.promo || false,
+                        });
+                    }
+                });
+            }
+
+            console.log(`Ô£à Master data ready: ${catalogProducts.length} products, ${stockMap.size} stock, ${priceMap.size} prices`);
+
+            masterData = { catalogProducts, stockMap, priceMap };
+            masterDataTimestamp = Date.now();
+            return masterData;
+        } catch (err) {
+            console.error('ÔØî Master data fetch failed:', err.message);
+            throw err;
+        } finally {
+            masterDataPromise = null;
+        }
+    })();
+
+    return masterDataPromise;
 }
 
 // Funci├│n helper para hacer llamadas a la API PCH
@@ -40,15 +117,13 @@ async function callPCHApi(apiUrl, endpoint, customer, key, queryParams = {}) {
         'Content-Type': 'application/json',
     };
 
-    // Incluir queryParams en el body para que la API pueda filtrar correctamente
     const requestBody = {
         customer,
         key,
-        ...queryParams  // CR├ìTICO: Agregar filtros (type, marca, categoria, q, etc.)
+        ...queryParams,
     };
 
     console.log(`­ƒöÁ Calling ${endpoint}...`);
-    console.log(`­ƒôñ Request body:`, JSON.stringify(requestBody));
 
     const response = await fetch(fullUrl, {
         method: 'POST',
@@ -61,255 +136,165 @@ async function callPCHApi(apiUrl, endpoint, customer, key, queryParams = {}) {
     }
 
     const data = await response.json();
-
-    // Debug: Ver estructura de respuesta y cantidad de datos
     const productCount = data?.data?.productos?.length || 0;
-    console.log(`Ô£à ${endpoint} responded successfully - ${productCount} items returned`);
-    if (productCount === 0) {
-        console.log(`ÔÜá´©Å  ${endpoint} returned 0 items. Response structure:`, JSON.stringify(data).substring(0, 200));
-    }
+    console.log(`Ô£à ${endpoint} responded - ${productCount} items`);
 
     return data;
 }
 
-// Configuraci├│n de timeout - PRODUCCI├ôN requiere 3-5 minutos, aumentado a 10 min
-export const config = {
-    api: {
-        responseLimit: false,
-        bodyParser: {
-            sizeLimit: '10mb',
-        },
-        // Timeout aumentado para APIs lentas de producci├│n PCH
-        externalResolver: true,
-    },
-    maxDuration: 600, // 10 minutos (aumentado de 5 min por timeouts frecuentes)
-};
-
-export default async function handler(req, res) {
-    const { path = [], ...queryParams } = req.query;
-
-    // Configuraci├│n - Usar variables de servidor (sin prefijo NEXT_PUBLIC_)
-    // NEXT_PUBLIC_* solo est├ín disponibles en client-side, no en API routes
-    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://pchm.to-do.mx';
-    const apiPath = Array.isArray(path) ? path.join('/') : path;
-    const customer = process.env.API_CUSTOMER || process.env.NEXT_PUBLIC_API_CUSTOMER || '18619';
-    // TEMP: Hardcodeado mientras arreglamos el escaping en Coolify
-    const key = 'C25tg7145$uR'; // process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || 'C25tg7145$uR';
+// ============================================
+// HELPERS DE FILTRADO
+// ============================================
 
-    // DEBUG: Log credenciales reales usadas (temporal)
-    console.log('­ƒöÉ Credentials being used:', {
-        apiUrl,
-        customer,
-        key: key, // TEMP: Mostrar key completa para debug
-        hasAPI_URL: !!process.env.API_URL,
-        hasAPI_CUSTOMER: !!process.env.API_CUSTOMER,
-        hasAPI_KEY: !!process.env.API_KEY
-    });
+function normalizeString(str) {
+    return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
+}
 
-    // Verificar cach├® primero
-    const cacheKey = getCacheKey(apiPath, queryParams);
-    const cachedResponse = getFromCache(cacheKey);
+function slugToName(slug) {
+    // "teclados-&-mouses" -> "teclados & mouses"
+    return decodeURIComponent(slug || '').replace(/-/g, ' ').toLowerCase().trim();
+}
 
-    if (cachedResponse) {
-        return res.status(200).json(cachedResponse);
+function filterByCategory(products, categoria) {
+    if (!categoria || categoria === 'undefined' || categoria === 'all' || categoria === 'index') {
+        return products;
     }
 
-    console.log('­ƒÜÇ Starting multi-endpoint fetch for:', apiPath);
-
-    try {
-        // ============================================
-        // NUEVA ARQUITECTURA: 3 LLAMADAS PARALELAS
-        // ============================================
-
-        // 1. Obtener cat├ílogo (informaci├│n b├ísica de productos)
-        // 2. Obtener stock de productos  
-        // 3. Obtener precios de productos (opcional - continuar sin precios si falla)
-
-        const results = await Promise.allSettled([
-            callPCHApi(apiUrl, 'extcust/catalog', customer, key, queryParams),
-            callPCHApi(apiUrl, 'extcust/getprodstock', customer, key, queryParams),
-            callPCHApi(apiUrl, 'extcust/getprodprice_warehouse', customer, key, queryParams),
-        ]);
-
-        // Extraer respuestas exitosas, null si fall├│
-        const catalogResponse = results[0].status === 'fulfilled' ? results[0].value : null;
-        const stockResponse = results[1].status === 'fulfilled' ? results[1].value : null;
-        const priceResponse = results[2].status === 'fulfilled' ? results[2].value : null;
-
-        // Log warnings para endpoints fallidos
-        if (!catalogResponse) console.warn('ÔÜá´©Å  Catalog endpoint failed');
-        if (!stockResponse) console.warn('ÔÜá´©Å  Stock endpoint failed');
-        if (!priceResponse) console.warn('ÔÜá´©Å  Price endpoint failed - continuing without prices');
-
-        // Si el cat├ílogo fall├│, no podemos continuar
-        if (!catalogResponse) {
-            throw new Error('Catalog endpoint failed - cannot proceed without product data');
-        }
+    const catSearch = slugToName(categoria);
+    console.log(`­ƒöì Filtering by category: "${catSearch}" from ${products.length} products`);
 
-        console.log('­ƒôè Endpoints completed:', {
-            catalog: !!catalogResponse,
-            stock: !!stockResponse,
-            prices: !!priceResponse
-        });
-
-        // ============================================
-        // COMBINAR DATOS DE LOS 3 ENDPOINTS
-        // ============================================
-
-        console.log('­ƒÜ¿ DEBUG: Code version b8a7293 - Starting data combination');
-
-        // Extraer productos del cat├ílogo
-        const catalogProducts = catalogResponse?.data?.productos || [];
-
-        // Crear mapas para b├║squeda r├ípida de stock y precios por SKU
-        const stockMap = new Map();
-        const priceMap = new Map();
-
-        // Mapear stock por SKU (PRODUCCI├ôN: sumar de todos los almacenes)
-        // En producci├│n, cada SKU tiene m├║ltiples entradas (uno por almac├®n)
-        // Sumamos el total de todos los almacenes
-
-        // DEBUG: Ver estructura real del stock
-        console.log('­ƒöì Stock Response Structure:', {
-            hasData: !!stockResponse?.data,
-            hasProductos: !!stockResponse?.data?.productos,
-            productosType: Array.isArray(stockResponse?.data?.productos) ? 'array' : typeof stockResponse?.data?.productos,
-            productosLength: stockResponse?.data?.productos?.length,
-            keys: stockResponse?.data ? Object.keys(stockResponse.data) : [],
-            firstItem: stockResponse?.data?.productos?.[0]
-        });
+    const filtered = products.filter(p => {
+        const pCat = normalizeString(p.seccion || p.categoria || '');
+        return pCat === catSearch;
+    });
 
-        // CR├ìTICO: El stock viene como array de arrays [[{...}, {...}]]
-        // Necesitamos aplanar o acceder al primer elemento
-        const stockItems = stockResponse?.data?.productos?.flat() || [];
+    console.log(`­ƒôï Category filter result: ${filtered.length} products match "${catSearch}"`);
+    return filtered;
+}
 
-        console.log(`­ƒôè Stock items to process: ${stockItems.length}`);
+function filterByBrand(products, marca) {
+    if (!marca || marca === 'undefined' || marca === 'all') {
+        return products;
+    }
 
-        stockItems.forEach(item => {
-            if (item.sku) {
-                const currentStock = stockMap.get(item.sku) || 0;
-                const newStock = item.cantidad || item.stock || 0;
-                stockMap.set(item.sku, currentStock + newStock);
-            }
-        });
+    const marcaSearch = slugToName(marca);
+    console.log(`­ƒöì Filtering by brand: "${marcaSearch}" from ${products.length} products`);
 
-        // Mapear precios por SKU (PRODUCCI├ôN: array de precios por almac├®n)
-        // En producci├│n, cada producto tiene item.precios = [{precio, promo, id, almacen}, ...]
-        // Estrategia: usar el precio M├üS BAJO de todos los almacenes disponibles
-        if (priceResponse?.data?.productos) {
-            priceResponse.data.productos.forEach(item => {
-                if (item.sku && item.precios && Array.isArray(item.precios) && item.precios.length > 0) {
-                    // Encontrar el precio m├ís bajo
-                    const lowestPrice = item.precios.reduce((min, current) => {
-                        const currentPrice = current.precio || Infinity;
-                        const minPrice = min.precio || Infinity;
-                        return currentPrice < minPrice ? current : min;
-                    }, item.precios[0]);
-
-                    priceMap.set(item.sku, {
-                        precio: lowestPrice.precio || 0,
-                        promo: lowestPrice.promo || false,
-                        almacen: lowestPrice.almacen,
-                        id_almacen: lowestPrice.id
-                    });
-                }
-            });
-        }
-
-        console.log(`­ƒôª Combining data: ${catalogProducts.length} products, ${stockMap.size} stock entries, ${priceMap.size} price entries`);
+    const filtered = products.filter(p => {
+        const pMarca = normalizeString(p.marca || '');
+        return pMarca === marcaSearch;
+    });
 
-        // ============================================
-        // COMBINAR Y TRANSFORMAR DATOS
-        // ============================================
+    console.log(`­ƒôï Brand filter result: ${filtered.length} products match "${marcaSearch}"`);
+    return filtered;
+}
 
-        // Limitar productos para evitar exceder 4MB de Next.js
-        const MAX_PRODUCTS = 100;
-        const productosRaw = catalogProducts.slice(0, MAX_PRODUCTS);
+// ============================================
+// TRANSFORMAR PRODUCTO PARA EL FRONTEND
+// ============================================
+
+function transformProduct(producto, stockMap, priceMap) {
+    const sku = producto.sku;
+    const stock = stockMap.get(sku) || 0;
+    const priceData = priceMap.get(sku) || { precio: 0, promo: false };
+    const usdToMxn = parseFloat(process.env.USD_TO_MXN_RATE) || 20.5;
+
+    return {
+        ...producto,
+        titulo: producto.descripcion || '',
+        modelo: producto.sku || producto.skuFabricante || '',
+        slug: producto.sku,
+        stock: stock,
+        stock_total: stock,
+        precio_contado: priceData.precio ? (priceData.precio * usdToMxn) : 0,
+        precio_final: priceData.precio ? (priceData.precio * usdToMxn) : 0,
+        precio_final_descuento: priceData.promo ? (priceData.precio * usdToMxn * 0.9) : 0,
+        promo: priceData.promo,
+        imagen1s: producto.sku ? `/api/images/${producto.sku}` : null,
+    };
+}
 
-        // Tipo de cambio USD a MXN
-        const usdToMxn = parseFloat(process.env.USD_TO_MXN_RATE) || 20.5;
+// Configuraci├│n de timeout
+export const config = {
+    api: {
+        responseLimit: false,
+        bodyParser: { sizeLimit: '10mb' },
+        externalResolver: true,
+    },
+    maxDuration: 600,
+};
 
-        const productos = productosRaw.map(producto => {
-            const sku = producto.sku;
+// ============================================
+// HANDLER PRINCIPAL
+// ============================================
 
-            // Obtener stock y precio de los mapas
-            const stock = stockMap.get(sku) || 0;
-            const priceData = priceMap.get(sku) || { precio: 0, promo: false };
+export default async function handler(req, res) {
+    const { path = [], ...queryParams } = req.query;
+    const apiPath = Array.isArray(path) ? path.join('/') : path;
 
-            return {
-                ...producto,
-                // Campos principales
-                titulo: producto.descripcion || '',
-                modelo: producto.sku || producto.skuFabricante || '',
-                slug: producto.sku,
+    // Configuraci├│n
+    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://pchm.to-do.mx';
+    const customer = process.env.API_CUSTOMER || process.env.NEXT_PUBLIC_API_CUSTOMER || '18619';
+    const key = 'C25tg7145$uR';
 
-                // Stock obtenido del endpoint getprodstock
-                stock: stock,
-                stock_total: stock,
+    // 1. Verificar cache de respuesta primero
+    const cacheKey = `${apiPath}:${JSON.stringify(queryParams)}`;
+    const cached = getResponseCache(cacheKey);
+    if (cached) {
+        return res.status(200).json(cached);
+    }
 
-                // Precios obtenidos del endpoint getprodprice_warehouse (convertir USD a MXN)
-                precio_contado: priceData.precio ? (priceData.precio * usdToMxn) : 0,
-                precio_final: priceData.precio ? (priceData.precio * usdToMxn) : 0,
-                precio_final_descuento: priceData.promo ? (priceData.precio * usdToMxn * 0.9) : 0,
-                promo: priceData.promo,
+    console.log(`­ƒÜÇ Request: ${apiPath}`, queryParams);
 
-                // Imagen (sistema local)
-                imagen1s: producto.sku ? `/api/images/${producto.sku}` : null,
-            };
-        });
+    try {
+        // 2. Obtener datos master (cache compartido, solo 1 fetch)
+        const { catalogProducts, stockMap, priceMap } = await ensureMasterData(apiUrl, customer, key);
 
-        // Formato final para el frontend
-        const adaptedData = {
-            results: productos,
-            count: productos.length,
-            total: catalogProducts.length,
-            status: 'success',
-            message: 'Productos obtenidos de 3 endpoints combinados',
-        };
+        // 3. Aplicar filtros de categor├¡a y marca
+        const categoria = queryParams.categoria;
+        const marca = queryParams.marca;
 
-        console.log(`Ô£à Combined data ready: ${adaptedData.results.length} products (limited from ${catalogProducts.length} total)`);
+        let filteredProducts = catalogProducts;
+        filteredProducts = filterByCategory(filteredProducts, categoria);
+        filteredProducts = filterByBrand(filteredProducts, marca);
 
         // ============================================
-        // CASO ESPECIAL: FILTROS
+        // CASO: FILTROS (filters/listado/available)
         // ============================================
         if (apiPath.includes('filters')) {
-            // Extraer filtros del cat├ílogo COMPLETO
             const brandsObj = {};
-            const categoriesArr = [];
             const categoriesMap = new Map();
             let availableCount = 0;
 
-            catalogProducts.forEach(product => {
+            filteredProducts.forEach(product => {
                 const stock = stockMap.get(product.sku) || 0;
                 if (stock > 0) availableCount++;
 
-                // Brands - formato: { "BRAND_NAME": { id, count } }
-                const marca = product.marca;
-                if (marca) {
-                    if (!brandsObj[marca]) {
-                        brandsObj[marca] = { id: product.id_marca || marca, count: 0 };
-                    }
-                    brandsObj[marca].count++;
+                // Brands como objeto { "BRAND_NAME": { id, count } }
+                const m = product.marca;
+                if (m) {
+                    if (!brandsObj[m]) brandsObj[m] = { id: product.id_marca || m, count: 0 };
+                    brandsObj[m].count++;
                 }
 
-                // Categories
-                const categoria = product.seccion || product.categoria;
-                if (categoria) {
-                    if (!categoriesMap.has(categoria)) {
-                        categoriesMap.set(categoria, {
-                            id: product.id_seccion || categoria,
-                            nombre: categoria,
-                            slug: categoria.toLowerCase().replace(/ /g, '-'),
+                // Categories como array con nombre/childrens
+                const c = product.seccion || product.categoria;
+                if (c) {
+                    if (!categoriesMap.has(c)) {
+                        categoriesMap.set(c, {
+                            id: product.id_seccion || c,
+                            nombre: c,
+                            slug: c.toLowerCase().replace(/ /g, '-'),
                             count: 0,
                             childrens: {},
                         });
                     }
-                    categoriesMap.get(categoria).count++;
+                    categoriesMap.get(c).count++;
                 }
             });
 
             const filtersData = {
-                count: catalogProducts.length,
+                count: filteredProducts.length,
                 available_count: availableCount,
                 available_store_count: 0,
                 free_shipping_count: 0,
@@ -319,29 +304,27 @@ export default async function handler(req, res) {
                 attributes: {},
             };
 
-            console.log(`Ô£à Filters extracted: ${Object.keys(brandsObj).length} brands, ${categoriesMap.size} categories`);
-            setCache(cacheKey, filtersData);
+            console.log(`Ô£à Filters: ${Object.keys(brandsObj).length} brands, ${categoriesMap.size} categories`);
+            setResponseCache(cacheKey, filtersData);
             return res.status(200).json(filtersData);
         }
 
         // ============================================
-        // CASO ESPECIAL: CATEGORIAS
+        // CASO: CATEGORIAS (categories/bestcategories)
         // ============================================
         if (apiPath.includes('categories') || apiPath.includes('bestcategories')) {
-            // Extraer categor├¡as ├║nicas del cat├ílogo COMPLETO (no limitado)
             const categoriesMap = new Map();
-
+            // Para categor├¡as, usar cat├ílogo COMPLETO (sin filtro de categor├¡a)
             catalogProducts.forEach(product => {
-                const categoria = product.seccion || product.categoria;
-                const id_categoria = product.id_seccion || product.id_categoria;
-
-                if (categoria && !categoriesMap.has(categoria)) {
-                    categoriesMap.set(categoria, {
-                        id: id_categoria || categoria,
-                        name: categoria,  // Frontend espera "name", no "nombre"
-                        slug: categoria.toLowerCase().replace(/ /g, '-'),
-                        imagen_principal: `/api/images/${product.sku}`, // Usar primera imagen de producto en esa categor├¡a
-                        portada: `/api/images/${product.sku}`, // Agregar portada tambi├®n
+                const cat = product.seccion || product.categoria;
+                const id_cat = product.id_seccion || product.id_categoria;
+                if (cat && !categoriesMap.has(cat)) {
+                    categoriesMap.set(cat, {
+                        id: id_cat || cat,
+                        name: cat,
+                        slug: cat.toLowerCase().replace(/ /g, '-'),
+                        imagen_principal: `/api/images/${product.sku}`,
+                        portada: `/api/images/${product.sku}`,
                     });
                 }
             });
@@ -351,30 +334,26 @@ export default async function handler(req, res) {
                 count: categoriesMap.size,
                 total: categoriesMap.size,
                 status: 'success',
-                message: 'Categor├¡as extra├¡das del cat├ílogo'
             };
 
-            console.log(`Ô£à Categories extracted: ${categoriesMap.size} categories`);
-            setCache(cacheKey, categoriesData);
+            console.log(`Ô£à Categories: ${categoriesMap.size}`);
+            setResponseCache(cacheKey, categoriesData);
             return res.status(200).json(categoriesData);
         }
 
         // ============================================
-        // CASO ESPECIAL: MARCAS
+        // CASO: MARCAS (brands/bestbrands)
         // ============================================
         if (apiPath.includes('brands') || apiPath.includes('bestbrands')) {
-            // Extraer marcas ├║nicas del cat├ílogo COMPLETO
             const brandsMap = new Map();
-
             catalogProducts.forEach(product => {
-                const marca = product.marca;
-                const id_marca = product.id_marca;
-
-                if (marca && !brandsMap.has(marca)) {
-                    brandsMap.set(marca, {
-                        id: id_marca || marca,
-                        name: marca,  // Frontend espera "name"
-                        slug: marca.toLowerCase().replace(/ /g, '-'),
+                const m = product.marca;
+                const id_m = product.id_marca;
+                if (m && !brandsMap.has(m)) {
+                    brandsMap.set(m, {
+                        id: id_m || m,
+                        name: m,
+                        slug: m.toLowerCase().replace(/ /g, '-'),
                         imagen_principal: `/api/images/${product.sku}`,
                         portada: `/api/images/${product.sku}`,
                     });
@@ -386,27 +365,38 @@ export default async function handler(req, res) {
                 count: brandsMap.size,
                 total: brandsMap.size,
                 status: 'success',
-                message: 'Marcas extra├¡das del cat├ílogo'
             };
 
-            console.log(`Ô£à Brands extracted: ${brandsMap.size} brands`);
-            setCache(cacheKey, brandsData);
+            console.log(`Ô£à Brands: ${brandsMap.size}`);
+            setResponseCache(cacheKey, brandsData);
             return res.status(200).json(brandsData);
         }
 
-        // Guardar en cach├®
-        setCache(cacheKey, adaptedData);
+        // ============================================
+        // CASO DEFAULT: LISTADO DE PRODUCTOS
+        // ============================================
+        const MAX_PRODUCTS = 100;
+        const productos = filteredProducts.slice(0, MAX_PRODUCTS).map(p =>
+            transformProduct(p, stockMap, priceMap)
+        );
+
+        const result = {
+            results: productos,
+            count: productos.length,
+            total: filteredProducts.length,
+            status: 'success',
+            message: `${productos.length} productos (de ${filteredProducts.length} filtrados, ${catalogProducts.length} total)`,
+        };
 
-        res.status(200).json(adaptedData);
+        console.log(`Ô£à Listado: ${result.count} products (filtered from ${filteredProducts.length}, total ${catalogProducts.length})`);
+        setResponseCache(cacheKey, result);
+        return res.status(200).json(result);
 
     } catch (error) {
-        console.error('ÔØî Multi-endpoint fetch error:', error);
-        console.error('Error details:', error.message);
-
+        console.error('ÔØî Error:', error.message);
         res.status(500).json({
             error: 'Error al obtener productos de la API',
             details: error.message,
-            info: 'Se requieren 3 endpoints: catalog, getprodstock, getprodprice_warehouse'
         });
     }
 }
5e233cc Fix: Make price endpoint optional with Promise.allSettled
diff --git a/pages/api/proxy/[...path].js b/pages/api/proxy/[...path].js
index 47b9f90..d3eca8a 100644
--- a/pages/api/proxy/[...path].js
+++ b/pages/api/proxy/[...path].js
@@ -123,15 +123,34 @@ export default async function handler(req, res) {
 
         // 1. Obtener cat├ílogo (informaci├│n b├ísica de productos)
         // 2. Obtener stock de productos  
-        // 3. Obtener precios de productos
+        // 3. Obtener precios de productos (opcional - continuar sin precios si falla)
 
-        const [catalogResponse, stockResponse, priceResponse] = await Promise.all([
+        const results = await Promise.allSettled([
             callPCHApi(apiUrl, 'extcust/catalog', customer, key, queryParams),
             callPCHApi(apiUrl, 'extcust/getprodstock', customer, key, queryParams),
             callPCHApi(apiUrl, 'extcust/getprodprice_warehouse', customer, key, queryParams),
         ]);
 
-        console.log('­ƒôè All 3 endpoints responded successfully');
+        // Extraer respuestas exitosas, null si fall├│
+        const catalogResponse = results[0].status === 'fulfilled' ? results[0].value : null;
+        const stockResponse = results[1].status === 'fulfilled' ? results[1].value : null;
+        const priceResponse = results[2].status === 'fulfilled' ? results[2].value : null;
+
+        // Log warnings para endpoints fallidos
+        if (!catalogResponse) console.warn('ÔÜá´©Å  Catalog endpoint failed');
+        if (!stockResponse) console.warn('ÔÜá´©Å  Stock endpoint failed');
+        if (!priceResponse) console.warn('ÔÜá´©Å  Price endpoint failed - continuing without prices');
+
+        // Si el cat├ílogo fall├│, no podemos continuar
+        if (!catalogResponse) {
+            throw new Error('Catalog endpoint failed - cannot proceed without product data');
+        }
+
+        console.log('­ƒôè Endpoints completed:', {
+            catalog: !!catalogResponse,
+            stock: !!stockResponse,
+            prices: !!priceResponse
+        });
 
         // ============================================
         // COMBINAR DATOS DE LOS 3 ENDPOINTS
a1f0ab1 feat: Migrar a arquitectura multi-endpoint (catalog + stock + precio) seg├║n PCH
diff --git a/pages/api/proxy/[...path].js b/pages/api/proxy/[...path].js
index 38ef987..00a0eb4 100644
--- a/pages/api/proxy/[...path].js
+++ b/pages/api/proxy/[...path].js
@@ -1,4 +1,5 @@
-// API Proxy para la nueva API de pchtest.to-do.mx
+// API Proxy para la nueva arquitectura de API PCH (3 endpoints separados)
+// Actualizado: 2026-02-03 - Migraci├│n de getprodlist a catalog + stock + precios
 
 // Cache simple en memoria (1 hora de duraci├│n como recomend├│ el backend)
 const cache = new Map();
@@ -30,144 +31,168 @@ function setCache(key, data) {
     console.log('­ƒÆ¥ Cached response for', key);
 }
 
+// Funci├│n helper para hacer llamadas a la API PCH
+async function callPCHApi(apiUrl, endpoint, customer, key) {
+    const fullUrl = `${apiUrl}/${endpoint}/`;
+    const headers = {
+        'Accept': 'application/json',
+        'Content-Type': 'application/json',
+    };
+
+    const requestBody = { customer, key };
+
+    console.log(`­ƒöÁ Calling ${endpoint}...`);
+
+    const response = await fetch(fullUrl, {
+        method: 'POST',
+        headers,
+        body: JSON.stringify(requestBody),
+    });
+
+    if (!response.ok) {
+        throw new Error(`${endpoint} returned ${response.status}`);
+    }
+
+    const data = await response.json();
+    console.log(`Ô£à ${endpoint} responded successfully`);
+
+    return data;
+}
+
 export default async function handler(req, res) {
     const { path = [], ...queryParams } = req.query;
 
-    // Construir la URL completa de la API
+    // Configuraci├│n
     const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pchtest.to-do.mx';
     const apiPath = Array.isArray(path) ? path.join('/') : path;
-
-    // Credenciales de autenticaci├│n
     const customer = process.env.NEXT_PUBLIC_API_CUSTOMER || '81276';
     const key = process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk';
 
-    // Mapear endpoints antiguos a nuevos
-    const endpointMapping = {
-        'section': 'extcust/getprodlist',
-        'categories/bestcategories': 'extcust/getprodlist', // Temporal, puede necesitar endpoint espec├¡fico
-        'brands/bestbrands': 'extcust/getprodlist', // Temporal, puede necesitar endpoint espec├¡fico
-    };
-
-    // Obtener el endpoint mapeado o usar el original
-    const mappedPath = endpointMapping[apiPath] || apiPath;
-    const fullUrl = `${apiUrl}/${mappedPath}/`;
-
     // Verificar cach├® primero
     const cacheKey = getCacheKey(apiPath, queryParams);
     const cachedResponse = getFromCache(cacheKey);
 
     if (cachedResponse) {
-        // Devolver respuesta desde cach├®
         return res.status(200).json(cachedResponse);
     }
 
-    // Log para debugging
-    console.log('­ƒöÁ Proxy Request:', {
-        method: 'POST',
-        originalPath: apiPath,
-        mappedPath,
-        fullUrl,
-        customer,
-    });
+    console.log('­ƒÜÇ Starting multi-endpoint fetch for:', apiPath);
 
     try {
-        // Construir el body con autenticaci├│n
-        // NO enviar SKU para obtener cat├ílogo completo
-        const requestBody = {
-            customer,
-            key,
-        };
+        // ============================================
+        // NUEVA ARQUITECTURA: 3 LLAMADAS PARALELAS
+        // ============================================
+
+        // 1. Obtener cat├ílogo (informaci├│n b├ísica de productos)
+        // 2. Obtener stock de productos  
+        // 3. Obtener precios de productos
+
+        const [catalogResponse, stockResponse, priceResponse] = await Promise.all([
+            callPCHApi(apiUrl, 'extcust/catalog', customer, key),
+            callPCHApi(apiUrl, 'extcust/getprodstock', customer, key),
+            callPCHApi(apiUrl, 'extcust/getprodprice_warehouse', customer, key),
+        ]);
+
+        console.log('­ƒôè All 3 endpoints responded successfully');
+
+        // ============================================
+        // COMBINAR DATOS DE LOS 3 ENDPOINTS
+        // ============================================
+
+        // Extraer productos del cat├ílogo
+        const catalogProducts = catalogResponse?.data?.productos || [];
+
+        // Crear mapas para b├║squeda r├ípida de stock y precios por SKU
+        const stockMap = new Map();
+        const priceMap = new Map();
+
+        // Mapear stock por SKU
+        if (stockResponse?.data?.productos) {
+            stockResponse.data.productos.forEach(item => {
+                if (item.sku) {
+                    stockMap.set(item.sku, item.stock || 0);
+                }
+            });
+        }
+
+        // Mapear precios por SKU
+        if (priceResponse?.data?.productos) {
+            priceResponse.data.productos.forEach(item => {
+                if (item.sku) {
+                    priceMap.set(item.sku, {
+                        precio: item.precio || 0,
+                        promo: item.promo || false,
+                    });
+                }
+            });
+        }
+
+        console.log(`­ƒôª Combining data: ${catalogProducts.length} products, ${stockMap.size} stock entries, ${priceMap.size} price entries`);
+
+        // ============================================
+        // COMBINAR Y TRANSFORMAR DATOS
+        // ============================================
+
+        // Limitar productos para evitar exceder 4MB de Next.js
+        const MAX_PRODUCTS = 100;
+        const productosRaw = catalogProducts.slice(0, MAX_PRODUCTS);
+
+        // Tipo de cambio USD a MXN
+        const usdToMxn = parseFloat(process.env.USD_TO_MXN_RATE) || 20.5;
+
+        const productos = productosRaw.map(producto => {
+            const sku = producto.sku;
 
-        // Log para debugging
-        console.log('­ƒöÁ Proxy Request:', {
-            method: 'POST',
-            originalPath: apiPath,
-            mappedPath,
-            fullUrl,
-            customer,
+            // Obtener stock y precio de los mapas
+            const stock = stockMap.get(sku) || 0;
+            const priceData = priceMap.get(sku) || { precio: 0, promo: false };
+
+            return {
+                ...producto,
+                // Campos principales
+                titulo: producto.descripcion || '',
+                modelo: producto.sku || producto.skuFabricante || '',
+                slug: producto.sku,
+
+                // Stock obtenido del endpoint getprodstock
+                stock: stock,
+                stock_total: stock,
+
+                // Precios obtenidos del endpoint getprodprice_warehouse (convertir USD a MXN)
+                precio_contado: priceData.precio ? (priceData.precio * usdToMxn) : 0,
+                precio_final: priceData.precio ? (priceData.precio * usdToMxn) : 0,
+                precio_final_descuento: priceData.promo ? (priceData.precio * usdToMxn * 0.9) : 0,
+                promo: priceData.promo,
+
+                // Imagen (sistema local)
+                imagen1s: producto.sku ? `/api/images/${producto.sku}` : null,
+            };
         });
 
-        console.log('­ƒôª Request Body:', JSON.stringify(requestBody, null, 2));
-        // Headers para la nueva API
-        const headers = {
-            'Accept': 'application/json',
-            'Content-Type': 'application/json',
+        // Formato final para el frontend
+        const adaptedData = {
+            results: productos,
+            count: productos.length,
+            total: catalogProducts.length,
+            status: 'success',
+            message: 'Productos obtenidos de 3 endpoints combinados',
         };
 
-        // Hacer la petici├│n POST a la API
-        const apiResponse = await fetch(fullUrl, {
-            method: 'POST',
-            headers: headers,
-            body: JSON.stringify(requestBody),
-        });
+        console.log(`Ô£à Combined data ready: ${adaptedData.results.length} products (limited from ${catalogProducts.length} total)`);
 
-        console.log('­ƒƒó API Response:', {
-            status: apiResponse.status,
-            statusText: apiResponse.statusText,
-        });
+        // Guardar en cach├®
+        setCache(cacheKey, adaptedData);
+
+        res.status(200).json(adaptedData);
 
-        // Verificar si la respuesta es JSON v├ílida
-        const contentType = apiResponse.headers.get('content-type');
-        if (contentType && contentType.includes('application/json')) {
-            const data = await apiResponse.json();
-
-            // Log para ver la estructura real de la respuesta
-            console.log('­ƒôÑ API Response Data:', JSON.stringify(data, null, 2).substring(0, 500));
-
-            // Adaptar la respuesta al formato esperado por el frontend
-            // La nueva API devuelve { status, message, data: { productos: [...] } }
-            // El frontend espera { results: [...] }
-            let adaptedData = data;
-
-            if (data && data.data && data.data.productos) {
-                // IMPORTANTE: Limitar productos para evitar exceder 4MB de Next.js
-                const MAX_PRODUCTS = 100;
-                const productosRaw = data.data.productos.slice(0, MAX_PRODUCTS);
-
-                // Mapear campos de la API a los que espera el frontend
-                // Tipo de cambio USD a MXN
-                const usdToMxn = parseFloat(process.env.USD_TO_MXN_RATE) || 20.5;
-
-                const productos = productosRaw.map(producto => ({
-                    ...producto,
-                    // Campos principales
-                    titulo: producto.descripcion || '',
-                    modelo: producto.sku || producto.skuFabricante || '',
-                    slug: producto.sku, // Usar SKU como slug para las URLs de productos
-                    // Precios (convertir de USD a MXN)
-                    precio_contado: producto.precio ? (producto.precio * usdToMxn) : 0,
-                    precio_final: producto.precio ? (producto.precio * usdToMxn) : 0,
-                    precio_final_descuento: producto.promo ? (producto.precio * usdToMxn * 0.9) : 0,
-                    // Imagen (usar SKU como confirm├│ el backend: SKU_1.webp)
-                    imagen1s: producto.sku ? `/api/images/${producto.sku}` : null,
-                }));
-
-                adaptedData = {
-                    results: productos,
-                    count: productos.length,
-                    total: data.data.productos.length, // Total real de productos
-                    ...data,
-                };
-                console.log(`Ô£à Adapted data with ${adaptedData.results.length} products (limited from ${data.data.productos.length} total)`);
-            } else {
-                console.log('ÔÜá´©Å Data structure unexpected:', Object.keys(data));
-            }
-
-            // Guardar en cach├® antes de enviar
-            setCache(cacheKey, adaptedData);
-
-            res.status(apiResponse.status).json(adaptedData);
-        } else {
-            // Si no es JSON, enviar como texto
-            const text = await apiResponse.text();
-            res.status(apiResponse.status).send(text);
-        }
     } catch (error) {
-        console.error('ÔØî API Proxy Error:', error);
-        console.error('URL:', fullUrl);
+        console.error('ÔØî Multi-endpoint fetch error:', error);
+        console.error('Error details:', error.message);
+
         res.status(500).json({
-            error: 'Error al conectar con la API',
-            details: error.message
+            error: 'Error al obtener productos de la API',
+            details: error.message,
+            info: 'Se requieren 3 endpoints: catalog, getprodstock, getprodprice_warehouse'
         });
     }
 }
