// API Proxy para la nueva arquitectura de API PCH (3 endpoints separados)
// Actualizado: 2026-02-18 - Master cache + filtrado por categoría/marca

// ============================================
// CACHE DE RESPUESTAS POR RUTA
// ============================================
const responseCache = new Map();
const RESPONSE_CACHE_DURATION = 30 * 60 * 1000; // 30 min para respuestas filtradas

function getResponseCache(key) {
    const cached = responseCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > RESPONSE_CACHE_DURATION) {
        responseCache.delete(key);
        return null;
    }
    return cached.data;
}

function setResponseCache(key, data) {
    responseCache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// MASTER CACHE - Datos crudos del API PCH
// ============================================
let masterData = null;
let masterDataTimestamp = 0;
let masterDataPromise = null;
const MASTER_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

async function ensureMasterData(apiUrl, customer, key) {
    const now = Date.now();

    // Si tenemos datos frescos, devolver
    if (masterData && (now - masterDataTimestamp) < MASTER_CACHE_DURATION) {
        console.log('✨ Master cache HIT');
        return masterData;
    }

    // Si ya hay un fetch en progreso, esperar ese mismo
    if (masterDataPromise) {
        console.log('⏳ Waiting for in-progress master fetch...');
        return masterDataPromise;
    }

    // Iniciar fetch
    masterDataPromise = (async () => {
        try {
            console.log('🔄 Fetching master data from PCH API (this takes 3-5 min)...');

            const results = await Promise.allSettled([
                callPCHApi(apiUrl, 'extcust/catalog', customer, key),
                callPCHApi(apiUrl, 'extcust/getprodstock', customer, key),
                callPCHApi(apiUrl, 'extcust/getprodprice_warehouse', customer, key),
            ]);

            const catalogResponse = results[0].status === 'fulfilled' ? results[0].value : null;
            const stockResponse = results[1].status === 'fulfilled' ? results[1].value : null;
            const priceResponse = results[2].status === 'fulfilled' ? results[2].value : null;

            if (!catalogResponse) {
                throw new Error('Catalog endpoint failed - cannot proceed without product data');
            }

            // Extraer productos
            const catalogProducts = catalogResponse?.data?.productos || [];

            // Build stock map (sumar todos los almacenes por SKU)
            // y stockPueblaMap con el primer almacén (almacén principal / Puebla)
            const stockMap = new Map();
            const stockPueblaMap = new Map();
            const rawStockData = stockResponse?.data?.productos || [];

            // rawStockData puede ser array de arrays (por almacén) o array plano
            const stockByWarehouse = Array.isArray(rawStockData[0]) ? rawStockData : [rawStockData];

            stockByWarehouse.forEach((warehouseItems, warehouseIndex) => {
                warehouseItems.forEach(item => {
                    if (item.sku) {
                        const qty = item.cantidad || item.stock || 0;
                        // Stock total: suma de todos los almacenes
                        const current = stockMap.get(item.sku) || 0;
                        stockMap.set(item.sku, current + qty);
                        // Stock Puebla: primer almacén (índice 0 = almacén principal)
                        if (warehouseIndex === 0) {
                            stockPueblaMap.set(item.sku, qty);
                        }
                    }
                });
            });

            // Tasa de cambio USD→MXN (configurable via env var USD_TO_MXN_RATE en .env.local)
            const USD_TO_MXN = parseFloat(process.env.USD_TO_MXN_RATE || '20.5');

            // Build price map
            // IMPORTANTE: PCH devuelve precios en USD o MXN según campo `moneda`.
            // Precio centinela 999999 = almacén sin precio disponible → ignorar.
            const SENTINEL_PRICE = 999000; // precio >= 999000 significa "sin precio"
            const priceMap = new Map();
            if (priceResponse?.data?.productos) {
                priceResponse.data.productos.forEach(item => {
                    if (!item.sku || !Array.isArray(item.precios)) return;

                    // Filtrar precios centinela primero
                    const validPrices = item.precios.filter(p => (p.precio || 0) < SENTINEL_PRICE && (p.precio || 0) > 0);
                    if (validPrices.length === 0) return; // Sin precios válidos → omitir

                    // Tomar el precio más bajo entre los válidos
                    const best = validPrices.reduce((min, cur) =>
                        cur.precio < min.precio ? cur : min
                        , validPrices[0]);

                    // Convertir a MXN si el precio viene en USD
                    const isUSD = (item.moneda || '').toUpperCase() === 'USD';
                    const precioMXN = isUSD ? best.precio * USD_TO_MXN : best.precio;

                    priceMap.set(item.sku, {
                        precio: Math.round(precioMXN * 100) / 100, // redondear a 2 decimales
                        promo: best.promo || false,
                        moneda_original: item.moneda || 'MXN',
                        precio_original: best.precio,
                    });
                });
            }

            console.log(`✅ Master data ready: ${catalogProducts.length} products, ${stockMap.size} stock, ${priceMap.size} prices`);

            masterData = { catalogProducts, stockMap, stockPueblaMap, priceMap };
            masterDataTimestamp = Date.now();
            return masterData;
        } catch (err) {
            console.error('❌ Master data fetch failed:', err.message);
            throw err;
        } finally {
            masterDataPromise = null;
        }
    })();

    return masterDataPromise;
}

// Función helper para hacer llamadas a la API PCH
async function callPCHApi(apiUrl, endpoint, customer, key, queryParams = {}) {
    const fullUrl = `${apiUrl}/${endpoint}/`;
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const requestBody = {
        customer,
        key,
        ...queryParams,
    };

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
    const productCount = data?.data?.productos?.length || 0;
    console.log(`✅ ${endpoint} responded - ${productCount} items`);

    return data;
}

// ============================================
// HELPERS DE FILTRADO
// ============================================

function normalizeString(str) {
    return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function slugToName(slug) {
    // "teclados-&-mouses" -> "teclados & mouses"
    return decodeURIComponent(slug || '').replace(/-/g, ' ').toLowerCase().trim();
}

function filterByCategory(products, categoria) {
    if (!categoria || categoria === 'undefined' || categoria === 'all' || categoria === 'index') {
        return products;
    }

    const catSearch = slugToName(categoria);
    console.log(`🔍 Filtering by category: "${catSearch}" from ${products.length} products`);

    const filtered = products.filter(p => {
        const pCat = normalizeString(p.seccion || p.categoria || '');
        return pCat === catSearch;
    });

    console.log(`📋 Category filter result: ${filtered.length} products match "${catSearch}"`);
    return filtered;
}

function filterByBrand(products, marca) {
    if (!marca || marca === 'undefined' || marca === 'all') {
        return products;
    }

    const marcaSearch = slugToName(marca);
    console.log(`🔍 Filtering by brand: "${marcaSearch}" from ${products.length} products`);

    const filtered = products.filter(p => {
        const pMarca = normalizeString(p.marca || '');
        return pMarca === marcaSearch;
    });

    console.log(`📋 Brand filter result: ${filtered.length} products match "${marcaSearch}"`);
    return filtered;
}

// ============================================
// TRANSFORMAR PRODUCTO PARA EL FRONTEND
// ============================================

function transformProduct(producto, stockMap, stockPueblaMap, priceMap) {
    const sku = producto.sku;
    const stock = stockMap.get(sku) || 0;
    const stockPuebla = stockPueblaMap.get(sku) || 0;
    const priceData = priceMap.get(sku) || { precio: 0, promo: false };

    // Precios de PCH ya vienen en MXN, NO convertir
    return {
        ...producto,
        titulo: producto.descripcion || '',
        modelo: producto.sku || producto.skuFabricante || '',
        slug: producto.sku,
        stock: stock,
        stock_total: stock,
        stock_puebla: stockPuebla,   // ← Stock del almacén principal (Puebla)
        precio_contado: priceData.precio || 0,
        precio_final: priceData.precio || 0,
        precio_final_descuento: priceData.promo ? (priceData.precio * 0.9) : 0,
        promo: priceData.promo,
        imagen1s: producto.sku ? `/api/images/${producto.sku}` : null,
    };
}

// Configuración de timeout
export const config = {
    api: {
        responseLimit: false,
        bodyParser: { sizeLimit: '10mb' },
        externalResolver: true,
    },
    maxDuration: 600,
};

// ============================================
// HANDLER PRINCIPAL
// ============================================

export default async function handler(req, res) {
    const { path = [], ...queryParams } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path;

    // Configuración
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://pchm.to-do.mx';
    const customer = process.env.API_CUSTOMER || process.env.NEXT_PUBLIC_API_CUSTOMER || '18619';
    const key = 'C25tg7145$uR';

    // 1. Verificar cache de respuesta primero
    const cacheKey = `${apiPath}:${JSON.stringify(queryParams)}`;
    const cached = getResponseCache(cacheKey);
    if (cached) {
        return res.status(200).json(cached);
    }

    console.log(`🚀 Request: ${apiPath}`, queryParams);

    // Guard: si es búsqueda por SKU, validarlo antes de cargar master data.
    // SKUs de PCH son alfanuméricos con guiones, puntos y letras al final (ej: "920-011902", "4711085941107-A").
    // Rechazar inmediatamente archivos estáticos o rutas inválidas.
    if (queryParams.sku) {
        const skuRaw = queryParams.sku.trim();
        const INVALID_SKU = /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|map|txt|xml|json|woff|woff2|ttf|eot)$/i;
        if (INVALID_SKU.test(skuRaw) || skuRaw.length < 2 || skuRaw.length > 100) {
            return res.status(400).json({ error: 'SKU inválido', sku: skuRaw });
        }
    }

    try {
        // 2. Obtener datos master (cache compartido, solo 1 fetch)
        const { catalogProducts, stockMap, stockPueblaMap, priceMap } = await ensureMasterData(apiUrl, customer, key);

        // 3. Aplicar filtros de categoría y marca
        const categoria = queryParams.categoria;
        const marca = queryParams.marca;
        const filterAvailable = queryParams.filter_available === 'true';
        const filterAvailableStore = queryParams.filter_available_store === 'true';

        let filteredProducts = catalogProducts;
        filteredProducts = filterByCategory(filteredProducts, categoria);
        filteredProducts = filterByBrand(filteredProducts, marca);

        // Filtrar por disponibilidad si se solicita
        if (filterAvailable) {
            filteredProducts = filteredProducts.filter(p => (stockMap.get(p.sku) || 0) > 0);
        }
        // Filtrar por stock en tienda (Puebla)
        if (filterAvailableStore) {
            filteredProducts = filteredProducts.filter(p => (stockPueblaMap.get(p.sku) || 0) > 0);
        }

        // ============================================
        // CASO: FILTROS (filters/listado/available)
        // ============================================
        if (apiPath.includes('filters') && !queryParams.sku) {
            const brandsObj = {};
            const categoriesMap = new Map();
            let availableCount = 0;
            let availableStoreCount = 0;

            filteredProducts.forEach(product => {
                const stock = stockMap.get(product.sku) || 0;
                const stockP = stockPueblaMap.get(product.sku) || 0;
                if (stock > 0) availableCount++;
                if (stockP > 0) availableStoreCount++;

                // Brands como objeto { "BRAND_NAME": { id, count } }
                const m = product.marca;
                if (m) {
                    if (!brandsObj[m]) brandsObj[m] = { id: product.id_marca || m, count: 0 };
                    brandsObj[m].count++;
                }

                // Categories como array con nombre/childrens
                const c = product.seccion || product.categoria;
                if (c) {
                    if (!categoriesMap.has(c)) {
                        categoriesMap.set(c, {
                            id: product.id_seccion || c,
                            nombre: c,
                            slug: c.toLowerCase().replace(/ /g, '-'),
                            count: 0,
                            childrens: {},
                        });
                    }
                    categoriesMap.get(c).count++;
                }
            });

            const filtersData = {
                count: filteredProducts.length,
                available_count: availableCount,
                available_store_count: availableStoreCount,

                free_shipping_count: 0,
                available_discount: 0,
                brands: brandsObj,
                categories: Array.from(categoriesMap.values()),
                attributes: {},
            };

            console.log(`✅ Filters: ${Object.keys(brandsObj).length} brands, ${categoriesMap.size} categories`);
            setResponseCache(cacheKey, filtersData);
            return res.status(200).json(filtersData);
        }

        // ============================================
        // CASO: CATEGORIAS (categories/bestcategories)
        // ============================================
        if (apiPath.includes('categories') || apiPath.includes('bestcategories')) {
            const categoriesMap = new Map();
            // Para categorías, usar catálogo COMPLETO (sin filtro de categoría)
            catalogProducts.forEach(product => {
                const cat = product.seccion || product.categoria;
                const id_cat = product.id_seccion || product.id_categoria;
                if (cat && !categoriesMap.has(cat)) {
                    categoriesMap.set(cat, {
                        id: id_cat || cat,
                        name: cat,
                        slug: cat.toLowerCase().replace(/ /g, '-'),
                        imagen_principal: `/api/images/${product.sku}`,
                        portada: `/api/images/${product.sku}`,
                    });
                }
            });

            const categoriesData = {
                results: Array.from(categoriesMap.values()),
                count: categoriesMap.size,
                total: categoriesMap.size,
                status: 'success',
            };

            console.log(`✅ Categories: ${categoriesMap.size}`);
            setResponseCache(cacheKey, categoriesData);
            return res.status(200).json(categoriesData);
        }

        // ============================================
        // CASO: MARCAS (brands/bestbrands)
        // ============================================
        if (apiPath.includes('brands') || apiPath.includes('bestbrands')) {
            const brandsMap = new Map();
            catalogProducts.forEach(product => {
                const m = product.marca;
                const id_m = product.id_marca;
                if (m && !brandsMap.has(m)) {
                    brandsMap.set(m, {
                        id: id_m || m,
                        name: m,
                        slug: m.toLowerCase().replace(/ /g, '-'),
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
            };

            console.log(`✅ Brands: ${brandsMap.size}`);
            setResponseCache(cacheKey, brandsData);
            return res.status(200).json(brandsData);
        }

        // ============================================
        // CASO: BUSQUEDA POR SKU (detalle de producto)
        // ============================================
        if (queryParams.sku) {
            const skuSearch = queryParams.sku.trim();
            const productoEncontrado = catalogProducts.find(p => p.sku === skuSearch);

            if (!productoEncontrado) {
                console.log(`⚠️ SKU not found: ${skuSearch}`);
                return res.status(404).json({ error: 'Producto no encontrado', sku: skuSearch });
            }

            const productoTransformado = transformProduct(productoEncontrado, stockMap, stockPueblaMap, priceMap);
            console.log(`✅ SKU ${skuSearch}: stock=${productoTransformado.stock_total}`);
            setResponseCache(cacheKey, { result: productoTransformado });
            return res.status(200).json({ result: productoTransformado });
        }

        // ============================================
        // CASO DEFAULT: LISTADO DE PRODUCTOS
        // ============================================

        // Filtrar por marcas adicionales (array brands=[])
        const brandsFilter = queryParams.brands
            ? (Array.isArray(queryParams.brands) ? queryParams.brands : [queryParams.brands])
            : [];
        if (brandsFilter.length > 0) {
            filteredProducts = filteredProducts.filter(p =>
                brandsFilter.some(b => (p.marca || '').toLowerCase() === b.toLowerCase())
            );
        }

        // Filtrar por categorías adicionales (array categories=[])
        const categoriesFilter = queryParams.categories
            ? (Array.isArray(queryParams.categories) ? queryParams.categories : [queryParams.categories])
            : [];
        if (categoriesFilter.length > 0) {
            filteredProducts = filteredProducts.filter(p =>
                categoriesFilter.some(c => {
                    const cat = (p.seccion || p.categoria || '').toLowerCase();
                    return cat === c.toLowerCase() || cat.includes(c.toLowerCase());
                })
            );
        }

        // Búsqueda por texto (q)
        const q = queryParams.q ? queryParams.q.trim().toLowerCase() : '';
        if (q) {
            filteredProducts = filteredProducts.filter(p => {
                const desc = (p.descripcion || '').toLowerCase();
                const skuL = (p.sku || '').toLowerCase();
                const marcaL = (p.marca || '').toLowerCase();
                const linea = (p.linea || '').toLowerCase();
                const skuFab = (p.skuFabricante || '').toLowerCase();
                return desc.includes(q) || skuL.includes(q) || marcaL.includes(q) || linea.includes(q) || skuFab.includes(q);
            });
        }

        // Ordenamiento
        const order = queryParams.order || '-visitas';
        const orderField = order.startsWith('-') ? order.slice(1) : order;
        const orderDesc = order.startsWith('-');

        const fieldMap = {
            'visitas': 'visitas',
            'ventas': 'ventas',
            'precio': 'precio_contado',
            'stock_total': 'stock_total',
            'created': 'created',
        };

        const sortField = fieldMap[orderField];
        if (sortField) {
            filteredProducts = [...filteredProducts].sort((a, b) => {
                const aVal = a[sortField] ?? 0;
                const bVal = b[sortField] ?? 0;
                return orderDesc ? (bVal - aVal) : (aVal - bVal);
            });
        }

        // Paginación
        const pageSize = parseInt(queryParams.page_size) || 200;
        const page = parseInt(queryParams.page) || 1;
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;

        const pagedProducts = filteredProducts.slice(startIdx, endIdx);
        const productos = pagedProducts.map(p =>
            transformProduct(p, stockMap, stockPueblaMap, priceMap)
        );

        const result = {
            results: productos,
            count: filteredProducts.length,
            total: catalogProducts.length,
            page: page,
            page_size: pageSize,
            pages: Math.ceil(filteredProducts.length / pageSize),
            status: 'success',
            message: `${productos.length} productos (pág ${page}, de ${filteredProducts.length} filtrados, ${catalogProducts.length} total)`,
        };


        console.log(`✅ Listado: ${result.count} products (filtered from ${filteredProducts.length}, total ${catalogProducts.length})`);
        setResponseCache(cacheKey, result);
        return res.status(200).json(result);

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({
            error: 'Error al obtener productos de la API',
            details: error.message,
        });
    }
}
