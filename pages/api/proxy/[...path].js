// API Proxy para la nueva arquitectura de API PCH (3 endpoints separados)
// Actualizado: 2026-02-03 - Migración de getprodlist a catalog + stock + precios

// Cache simple en memoria
// Aumentado a 24 horas por tiempos de respuesta lentos en producción (3+ min)
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

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

// Configuración de timeout - PRODUCCIÓN requiere 3-5 minutos
export const config = {
    api: {
        responseLimit: false,
        bodyParser: {
            sizeLimit: '10mb',
        },
        // Timeout aumentado para APIs lentas de producción PCH
        externalResolver: true,
    },
    maxDuration: 300, // 5 minutos
};

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

        // Mapear stock por SKU (PRODUCCIÓN: sumar de todos los almacenes)
        // En producción, cada SKU tiene múltiples entradas (uno por almacén)
        // Sumamos el total de todos los almacenes
        if (stockResponse?.data?.productos) {
            stockResponse.data.productos.forEach(item => {
                if (item.sku) {
                    const currentStock = stockMap.get(item.sku) || 0;
                    const newStock = item.cantidad || item.stock || 0;
                    stockMap.set(item.sku, currentStock + newStock);
                }
            });
        }

        // Mapear precios por SKU (PRODUCCIÓN: array de precios por almacén)
        // En producción, cada producto tiene item.precios = [{precio, promo, id, almacen}, ...]
        // Estrategia: usar el precio MÁS BAJO de todos los almacenes disponibles
        if (priceResponse?.data?.productos) {
            priceResponse.data.productos.forEach(item => {
                if (item.sku && item.precios && Array.isArray(item.precios) && item.precios.length > 0) {
                    // Encontrar el precio más bajo
                    const lowestPrice = item.precios.reduce((min, current) => {
                        const currentPrice = current.precio || Infinity;
                        const minPrice = min.precio || Infinity;
                        return currentPrice < minPrice ? current : min;
                    }, item.precios[0]);

                    priceMap.set(item.sku, {
                        precio: lowestPrice.precio || 0,
                        promo: lowestPrice.promo || false,
                        almacen: lowestPrice.almacen,
                        id_almacen: lowestPrice.id
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

        // ============================================
        // CASO ESPECIAL: CATEGORIAS
        // ============================================
        if (apiPath.includes('categories') || apiPath.includes('bestcategories')) {
            // Extraer categorías únicas del catálogo COMPLETO (no limitado)
            const categoriesMap = new Map();

            catalogProducts.forEach(product => {
                const categoria = product.seccion || product.categoria;
                const id_categoria = product.id_seccion || product.id_categoria;

                if (categoria && !categoriesMap.has(categoria)) {
                    categoriesMap.set(categoria, {
                        id: id_categoria || categoria,
                        name: categoria,  // Frontend espera "name", no "nombre"
                        slug: categoria.toLowerCase().replace(/ /g, '-'),
                        imagen_principal: `/api/images/${product.sku}`, // Usar primera imagen de producto en esa categoría
                        portada: `/api/images/${product.sku}`, // Agregar portada también
                    });
                }
            });

            const categoriesData = {
                results: Array.from(categoriesMap.values()),
                count: categoriesMap.size,
                total: categoriesMap.size,
                status: 'success',
                message: 'Categorías extraídas del catálogo'
            };

            console.log(`✅ Categories extracted: ${categoriesMap.size} categories`);
            setCache(cacheKey, categoriesData);
            return res.status(200).json(categoriesData);
        }

        // ============================================
        // CASO ESPECIAL: MARCAS
        // ============================================
        if (apiPath.includes('brands') || apiPath.includes('bestbrands')) {
            // Extraer marcas únicas del catálogo COMPLETO
            const brandsMap = new Map();

            catalogProducts.forEach(product => {
                const marca = product.marca;
                const id_marca = product.id_marca;

                if (marca && !brandsMap.has(marca)) {
                    brandsMap.set(marca, {
                        id: id_marca || marca,
                        name: marca,  // Frontend espera "name"
                        slug: marca.toLowerCase().replace(/ /g, '-'),
                        imagen_principal: `/api/images/${product.sku}`,
                        portada: `/api/images/${product.sku}`,
                    });
                }
            });

            const brandsData = {
                results: Array.from(brandsMap.values()),
                count: brandsMap.size,
                total: brandsMap.size,
                status: 'success',
                message: 'Marcas extraídas del catálogo'
            };

            console.log(`✅ Brands extracted: ${brandsMap.size} brands`);
            setCache(cacheKey, brandsData);
            return res.status(200).json(brandsData);
        }

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
