// API Proxy para la nueva API de pchtest.to-do.mx

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

export default async function handler(req, res) {
    const { path = [], ...queryParams } = req.query;

    // Construir la URL completa de la API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pchtest.to-do.mx';
    const apiPath = Array.isArray(path) ? path.join('/') : path;

    // Credenciales de autenticación
    const customer = process.env.NEXT_PUBLIC_API_CUSTOMER || '81276';
    const key = process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk';

    // Mapear endpoints antiguos a nuevos
    const endpointMapping = {
        'section': 'extcust/getprodlist',
        'categories/bestcategories': 'extcust/getprodlist', // Temporal, puede necesitar endpoint específico
        'brands/bestbrands': 'extcust/getprodlist', // Temporal, puede necesitar endpoint específico
    };

    // Obtener el endpoint mapeado o usar el original
    const mappedPath = endpointMapping[apiPath] || apiPath;
    const fullUrl = `${apiUrl}/${mappedPath}/`;

    // Verificar caché primero
    const cacheKey = getCacheKey(apiPath, queryParams);
    const cachedResponse = getFromCache(cacheKey);

    if (cachedResponse) {
        // Devolver respuesta desde caché
        return res.status(200).json(cachedResponse);
    }

    // Log para debugging
    console.log('🔵 Proxy Request:', {
        method: 'POST',
        originalPath: apiPath,
        mappedPath,
        fullUrl,
        customer,
    });

    try {
        // Construir el body con autenticación
        // NO enviar SKU para obtener catálogo completo
        const requestBody = {
            customer,
            key,
        };

        // Log para debugging
        console.log('🔵 Proxy Request:', {
            method: 'POST',
            originalPath: apiPath,
            mappedPath,
            fullUrl,
            customer,
        });

        console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));
        // Headers para la nueva API
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        // Hacer la petición POST a la API
        const apiResponse = await fetch(fullUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        });

        console.log('🟢 API Response:', {
            status: apiResponse.status,
            statusText: apiResponse.statusText,
        });

        // Verificar si la respuesta es JSON válida
        const contentType = apiResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await apiResponse.json();

            // Log para ver la estructura real de la respuesta
            console.log('📥 API Response Data:', JSON.stringify(data, null, 2).substring(0, 500));

            // Adaptar la respuesta al formato esperado por el frontend
            // La nueva API devuelve { status, message, data: { productos: [...] } }
            // El frontend espera { results: [...] }
            let adaptedData = data;

            if (data && data.data && data.data.productos) {
                // IMPORTANTE: Limitar productos para evitar exceder 4MB de Next.js
                const MAX_PRODUCTS = 100;
                const productosRaw = data.data.productos.slice(0, MAX_PRODUCTS);

                // Mapear campos de la API a los que espera el frontend
                // Tipo de cambio USD a MXN
                const usdToMxn = parseFloat(process.env.USD_TO_MXN_RATE) || 20.5;

                const productos = productosRaw.map(producto => ({
                    ...producto,
                    // Campos principales
                    titulo: producto.descripcion || '',
                    modelo: producto.sku || producto.skuFabricante || '',
                    slug: producto.sku, // Usar SKU como slug para las URLs de productos
                    // Precios (convertir de USD a MXN)
                    precio_contado: producto.precio ? (producto.precio * usdToMxn) : 0,
                    precio_final: producto.precio ? (producto.precio * usdToMxn) : 0,
                    precio_final_descuento: producto.promo ? (producto.precio * usdToMxn * 0.9) : 0,
                    // Imagen (usar SKU como confirmó el backend: SKU_1.webp)
                    imagen1s: producto.sku ? `/api/images/${producto.sku}` : null,
                }));

                adaptedData = {
                    results: productos,
                    count: productos.length,
                    total: data.data.productos.length, // Total real de productos
                    ...data,
                };
                console.log(`✅ Adapted data with ${adaptedData.results.length} products (limited from ${data.data.productos.length} total)`);
            } else {
                console.log('⚠️ Data structure unexpected:', Object.keys(data));
            }

            // Guardar en caché antes de enviar
            setCache(cacheKey, adaptedData);

            res.status(apiResponse.status).json(adaptedData);
        } else {
            // Si no es JSON, enviar como texto
            const text = await apiResponse.text();
            res.status(apiResponse.status).send(text);
        }
    } catch (error) {
        console.error('❌ API Proxy Error:', error);
        console.error('URL:', fullUrl);
        res.status(500).json({
            error: 'Error al conectar con la API',
            details: error.message
        });
    }
}
