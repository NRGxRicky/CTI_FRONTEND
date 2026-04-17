// pages/api/proxy/[...path].js
// API Proxy refactorizada para arquitectura Ingram-Only con Prisma
// TEMPORAL: Retorna vacío mientras se implementa la sincronización de Ingram desde la BD local.

export const config = {
    api: {
        responseLimit: false,
        bodyParser: { sizeLimit: '10mb' },
        externalResolver: true,
    },
    maxDuration: 60, // 60 segundos es suficiente ahora que usamos base de datos
};

export default async function handler(req, res) {
    const { path = [], ...queryParams } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path;

    console.log(`🚀 Request: ${apiPath} (Ingram transition)`);

    // ============================================
    // CASO ESPECIAL: CARRITO
    // ============================================
    if (apiPath === 'cart' || apiPath === 'cart/') {
        return res.status(200).json({ cart_items: [], shipping_cost: 0, total: 0 });
    }

    // ============================================
    // CASO: FILTROS (filters/listado/available)
    // ============================================
    if (apiPath.includes('filters') && !queryParams.sku) {
        return res.status(200).json({
            count: 0, available_count: 0, available_store_count: 0,
            free_shipping_count: 0, available_discount: 0,
            brands: {}, categories: [], attributes: {}
        });
    }

    // ============================================
    // CASO: CATEGORIAS / MARCAS
    // ============================================
    if (apiPath.includes('categories') || apiPath.includes('bestcategories') || apiPath.includes('brands') || apiPath.includes('bestbrands')) {
        return res.status(200).json({ results: [], count: 0, total: 0, status: 'success' });
    }

    // ============================================
    // CASO: BUSQUEDA POR SKU
    // ============================================
    if (queryParams.sku) {
        return res.status(404).json({ error: 'Producto no sincronizado', sku: queryParams.sku });
    }

    // ============================================
    // CASO DEFAULT: LISTADO DE PRODUCTOS
    // ============================================
    const result = {
        results: [],
        count: 0,
        total: 0,
        page: 1,
        page_size: 200,
        pages: 0,
        status: 'success',
        message: `Catálogo temporalmente inactivo mientras se sincroniza con Ingram Micro.`,
    };

    return res.status(200).json(result);
}
