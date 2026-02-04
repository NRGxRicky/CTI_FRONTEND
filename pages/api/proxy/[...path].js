// API Proxy para la nueva arquitectura de API PCH (3 endpoints separados)
// Actualizado: 2026-02-03 - Migración de getprodlist a catalog + stock + precios

// Cache simple en memoria (1 hora de duración como recomendó el backend)
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

function getCacheKey(path, queryParams) {
    return `${path}:${JSON.stringify(queryParams)}`;
}

function getFromCache(key) {
    const cached = cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
        cache.delete(key);
        return null;
    }

    console.log('✨ Cache HIT for', key);
    return cached.data;
}

function setCache(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
    console.log('💾 Cached response for', key);
}

// Función helper para hacer llamadas a la API PCH
async function callPCHApi(apiUrl, endpoint, customer, key) {
    const fullUrl = `${apiUrl}/${endpoint}/`;
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const requestBody = { customer, key };

    console.log(`🔵 Calling ${endpoint}...`);

    const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        throw new Error(`${endpoint} returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ ${endpoint} responded successfully`);

    return data;
}

export default async function handler(req, res) {
    const { path = [], ...queryParams } = req.query;

    // Configuración
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pchtest.to-do.mx';
    const apiPath = Array.isArray(path) ? path.join('/') : path;
    const customer = process.env.NEXT_PUBLIC_API_CUSTOMER || '81276';
    const key = process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk';

    // Verificar caché primero
    const cacheKey = getCacheKey(apiPath, queryParams);
    const cachedResponse = getFromCache(cacheKey);

    if (cachedResponse) {
        return res.status(200).json(cachedResponse);
    }

    console.log('🚀 Starting multi-endpoint fetch for:', apiPath);

    try {
        // ============================================
        // NUEVA ARQUITECTURA: 3 LLAMADAS PARALELAS
        // ============================================

        // 1. Obtener catálogo (información básica de productos)
        // 2. Obtener stock de productos  
        // 3. Obtener precios de productos

        const [catalogResponse, stockResponse, priceResponse] = await Promise.all([
            callPCHApi(apiUrl, 'extcust/catalog', customer, key),
            callPCHApi(apiUrl, 'extcust/getprodstock', customer, key),
            callPCHApi(apiUrl, 'extcust/getprodprice_warehouse', customer, key),
        ]);

        console.log('📊 All 3 endpoints responded successfully');

        // ============================================
        // COMBINAR DATOS DE LOS 3 ENDPOINTS
        // ============================================

        // Extraer productos del catálogo
        const catalogProducts = catalogResponse?.data?.productos || [];

        // Crear mapas para búsqueda rápida de stock y precios por SKU
        const stockMap = new Map();
        const priceMap = new Map();

        // Mapear stock por SKU
        if (stockResponse?.data?.productos) {
            stockResponse.data.productos.forEach(item => {
                if (item.sku) {
                    stockMap.set(item.sku, item.stock || 0);
                }
            });
        }

        // Mapear precios por SKU
        if (priceResponse?.data?.productos) {
            priceResponse.data.productos.forEach(item => {
                if (item.sku) {
                    priceMap.set(item.sku, {
                        precio: item.precio || 0,
                        promo: item.promo || false,
                    });
                }
            });
        }

        console.log(`📦 Combining data: ${catalogProducts.length} products, ${stockMap.size} stock entries, ${priceMap.size} price entries`);

        // ============================================
        // COMBINAR Y TRANSFORMAR DATOS
        // ============================================

        // Limitar productos para evitar exceder 4MB de Next.js
        const MAX_PRODUCTS = 100;
        const productosRaw = catalogProducts.slice(0, MAX_PRODUCTS);

        // Tipo de cambio USD a MXN
        const usdToMxn = parseFloat(process.env.USD_TO_MXN_RATE) || 20.5;

        const productos = productosRaw.map(producto => {
            const sku = producto.sku;

            // Obtener stock y precio de los mapas
            const stock = stockMap.get(sku) || 0;
            const priceData = priceMap.get(sku) || { precio: 0, promo: false };

            return {
                ...producto,
                // Campos principales
                titulo: producto.descripcion || '',
                modelo: producto.sku || producto.skuFabricante || '',
                slug: producto.sku,

                // Stock obtenido del endpoint getprodstock
                stock: stock,
                stock_total: stock,

                // Precios obtenidos del endpoint getprodprice_warehouse (convertir USD a MXN)
                precio_contado: priceData.precio ? (priceData.precio * usdToMxn) : 0,
                precio_final: priceData.precio ? (priceData.precio * usdToMxn) : 0,
                precio_final_descuento: priceData.promo ? (priceData.precio * usdToMxn * 0.9) : 0,
                promo: priceData.promo,

                // Imagen (sistema local)
                imagen1s: producto.sku ? `/api/images/${producto.sku}` : null,
            };
        });

        // Formato final para el frontend
        const adaptedData = {
            results: productos,
            count: productos.length,
            total: catalogProducts.length,
            status: 'success',
            message: 'Productos obtenidos de 3 endpoints combinados',
        };

        console.log(`✅ Combined data ready: ${adaptedData.results.length} products (limited from ${catalogProducts.length} total)`);

        // Guardar en caché
        setCache(cacheKey, adaptedData);

        res.status(200).json(adaptedData);

    } catch (error) {
        console.error('❌ Multi-endpoint fetch error:', error);
        console.error('Error details:', error.message);

        res.status(500).json({
            error: 'Error al obtener productos de la API',
            details: error.message,
            info: 'Se requieren 3 endpoints: catalog, getprodstock, getprodprice_warehouse'
        });
    }
}
