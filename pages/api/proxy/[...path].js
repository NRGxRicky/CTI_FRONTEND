// pages/api/proxy/[...path].js
// API Proxy conectada a PostgreSQL (Coolify) vía Prisma v7
// Sirve los 9,594 productos de Ingram Micro directamente desde la BD local

import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';
import { slugify, getCategoryIcon, mapProductToFrontend, getProductBySkuOrSlug } from '../../../services/productService';

export const config = {
    api: {
        responseLimit: false,
        bodyParser: { sizeLimit: '10mb' },
        externalResolver: true,
    },
    maxDuration: 30,
};

export default async function handler(req, res) {
    const { path = [], ...queryParams } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path;
    const db = prisma;

    try {
        // ============================================
        // CASO: CARRITO (Manejo de borrado por ID)
        // ============================================
        if (apiPath.startsWith('cart') && req.method === 'DELETE') {
            const pathParts = Array.isArray(path) ? path : apiPath.split('/');
            const productIdStr = pathParts.find(p => p !== 'cart' && p !== '');
            
            if (!productIdStr) {
                return res.status(400).json({ error: 'Falta el ID del producto' });
            }

            const productId = Number(productIdStr);
            if (isNaN(productId)) {
                return res.status(400).json({ error: 'ID de producto inválido' });
            }

            // Verificar autenticación
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const token = authHeader.split(' ')[1];
            let decoded;
            try {
                const JWT_SECRET = process.env.JWT_SECRET || 'CTI_TEMP_SECRET_KEY';
                decoded = jwt.verify(token, JWT_SECRET);
            } catch (e) {
                return res.status(401).json({ error: 'Token is invalid or expired' });
            }

            const userId = decoded.user_id;

            // Borrar el producto de la BD
            await db.cart.deleteMany({
                where: { userId, productId }
            });

            // Obtener el carrito actualizado
            const cartItems = await db.cart.findMany({
                where: { userId },
                include: { product: true }
            });

            const formattedCart = cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                product: mapProductToFrontend(item.product)
            }));

            return res.status(200).json({
                cart_items: formattedCart,
                shipping_cost: 150,
                total: 0
            });
        }


        // ============================================
        // CASO: SUGERENCIAS DE BUSQUEDA (InstantSearch)
        // ============================================
        if (apiPath.includes('suggestions')) {
            const searchTerm = queryParams.q || '';
            if (!searchTerm) return res.status(200).json({ products: [], queries: [], brands: [], categories: [] });

            const dbProducts = await db.product.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { ingramSku: { contains: searchTerm, mode: 'insensitive' } },
                        { mpn: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                    price: { gt: 0 }
                },
                take: 8
            });

            const mapped = dbProducts.map(p => {
                const frontend = mapProductToFrontend(p);
                return {
                    ...frontend,
                    original_title: p.title,
                    url: `/${frontend.slug}`,
                    image: p.imageUrl || getCategoryIcon(p.category) // Usar URL de Icecat o icono de categoría
                };
            });

            return res.status(200).json({
                products: mapped,
                queries: [searchTerm],
                brands: [],
                categories: [],
                query_words: searchTerm.split(' ')
            });
        }

        // ============================================
        // CASO: BUSQUEDA POR SKU (Detalle de producto)
        // Usado por: DetailProduct.js → /api/proxy/section?sku=XXX
        // ============================================
        if (queryParams.sku) {
            const product = await getProductBySkuOrSlug(db, queryParams.sku);

            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado', sku: queryParams.sku });
            }

            const mapped = mapProductToFrontend(product);

            // DetailProduct.js espera `result` (singular)
            // ListProducts espera `results` (array)
            return res.status(200).json({
                result: mapped,
                results: [mapped],
                count: 1,
                total: 1,
                status: 'success'
            });
        }

        // ============================================
        // CASO: FILTROS / FACETS
        // ============================================
        if (apiPath.includes('filters') && !queryParams.sku) {
            // Obtener marcas únicas con conteo
            const brandCounts = await db.product.groupBy({
                by: ['brand'],
                _count: { brand: true },
                orderBy: { _count: { brand: 'desc' } },
                take: 50,
            });

            // Obtener categorías únicas con conteo
            const categoryCounts = await db.product.groupBy({
                by: ['category'],
                _count: { category: true },
                orderBy: { _count: { category: 'desc' } },
                take: 30,
            });

            const totalCount = await db.product.count();

            const brands = {};
            brandCounts.forEach(b => {
                if (b.brand) {
                    brands[b.brand] = { 
                        id: slugify(b.brand), 
                        count: b._count.brand 
                    };
                }
            });

            const categories = categoryCounts
                .filter(c => c.category)
                .map(c => ({
                    id: slugify(c.category),
                    nombre: c.category,
                    slug: slugify(c.category),
                    count: c._count.category,
                    childrens: {}
                }));

            return res.status(200).json({
                count: totalCount,
                available_count: totalCount,
                available_store_count: 0,
                free_shipping_count: 0,
                available_discount: 0,
                brands,
                categories,
                attributes: {}
            });
        }

        // ============================================
        // CASO: CATEGORIAS
        // ============================================
        if (apiPath.includes('categories') || apiPath.includes('bestcategories')) {
            const cats = await db.product.groupBy({
                by: ['category'],
                _count: { category: true },
                orderBy: { _count: { category: 'desc' } },
                take: 20,
            });

            const results = cats.filter(c => c.category).map(c => ({
                name: c.category,
                slug: slugify(c.category),
                count: c._count.category,
            }));

            return res.status(200).json({ results, count: results.length, total: results.length, status: 'success' });
        }

        // ============================================
        // CASO: MARCAS
        // ============================================
        if (apiPath.includes('brands') || apiPath.includes('bestbrands')) {
            // Mapa de logos - SOLO URLs verificadas con HTTP 200
            const brandData = {
                'startech.com': { logo: 'https://cdn.worldvectorlogo.com/logos/startech.svg', domain: 'startech.com' },
                'hp inc': { logo: 'https://cdn.worldvectorlogo.com/logos/hp-2.svg', domain: 'hp.com' },
                'manhattan': { logo: 'https://cdn.worldvectorlogo.com/logos/manhattan.svg', domain: 'manhattan-products.com' },
                'cisco': { logo: 'https://cdn.worldvectorlogo.com/logos/cisco-2.svg', domain: 'cisco.com' },
                'epson': { logo: 'https://cdn.worldvectorlogo.com/logos/epson.svg', domain: 'epson.com' },
                'apple': { logo: 'https://cdn.worldvectorlogo.com/logos/apple-11.svg', domain: 'apple.com' },
                'tp-link': { logo: 'https://cdn.worldvectorlogo.com/logos/tp-link-2.svg', domain: 'tp-link.com' },
                'zebra tech.': { logo: 'https://cdn.worldvectorlogo.com/logos/zebra-1.svg', domain: 'zebra.com' },
                'zebra': { logo: 'https://cdn.worldvectorlogo.com/logos/zebra-1.svg', domain: 'zebra.com' },
                'logitech': { logo: 'https://cdn.worldvectorlogo.com/logos/logitech-2.svg', domain: 'logitech.com' },
                'xerox': { logo: 'https://cdn.worldvectorlogo.com/logos/xerox-1.svg', domain: 'xerox.com' },
                'dell': { logo: 'https://cdn.worldvectorlogo.com/logos/dell-2.svg', domain: 'dell.com' },
                'brother': { logo: 'https://cdn.worldvectorlogo.com/logos/brother-logo.svg', domain: 'brother.com' },
                'tripp lite': { logo: 'https://cdn.worldvectorlogo.com/logos/tripp-lite.svg', domain: 'tripplite.com' },
                'canon': { logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Canon_wordmark.svg', domain: 'canon.com' },
                'lenovo': { logo: 'https://cdn.worldvectorlogo.com/logos/lenovo-2.svg', domain: 'lenovo.com' },
                'kensington': { logo: 'https://cdn.worldvectorlogo.com/logos/kensington.svg', domain: 'kensington.com' },
                'kingston': { logo: 'https://cdn.worldvectorlogo.com/logos/kingston-technology.svg', domain: 'kingston.com' },
                'jabra': { logo: 'https://cdn.worldvectorlogo.com/logos/jabra.svg', domain: 'jabra.com' },
                'buffalo': { logo: 'https://cdn.worldvectorlogo.com/logos/buffalo-3.svg', domain: 'buffalo.com' },
                'apc': { logo: 'https://cdn.worldvectorlogo.com/logos/apc.svg', domain: 'apc.com' },
                'lexmark': { logo: 'https://cdn.worldvectorlogo.com/logos/lexmark.svg', domain: 'lexmark.com' },
                'toshiba (pp)': { logo: 'https://cdn.worldvectorlogo.com/logos/toshiba-1.svg', domain: 'toshiba.com' },
                'samsung': { logo: 'https://cdn.worldvectorlogo.com/logos/samsung-8.svg', domain: 'samsung.com' },
                'adata (pyp)': { logo: 'https://cdn.worldvectorlogo.com/logos/adata-1.svg', domain: 'adata.com' },
                'viewsonic': { logo: 'https://cdn.worldvectorlogo.com/logos/viewsonic.svg', domain: 'viewsonic.com' },
                'benq': { logo: 'https://cdn.worldvectorlogo.com/logos/benq.svg', domain: 'benq.com' },
                'microsoft': { logo: 'https://cdn.worldvectorlogo.com/logos/microsoft-5.svg', domain: 'microsoft.com' },
                'gigabyte': { logo: 'https://cdn.worldvectorlogo.com/logos/gigabyte-1.svg', domain: 'gigabyte.com' },
                'asus': { logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg', domain: 'asus.com' },
                'acer': { logo: 'https://cdn.worldvectorlogo.com/logos/acer-4.svg', domain: 'acer.com' },
            };

            const brands = await db.product.groupBy({
                by: ['brand'],
                _count: { brand: true },
                orderBy: { _count: { brand: 'desc' } },
                take: 30,
            });

            const results = brands.filter(b => b.brand).map(b => {
                const info = brandData[b.brand.toLowerCase()] || {};
                return {
                    name: b.brand,
                    slug: slugify(b.brand),
                    imagen: info.logo || null,
                    domain: info.domain || null,
                    count: b._count.brand,
                };
            }).filter(b => b.imagen); // Solo mostrar marcas que tengan logo

            return res.status(200).json({ results, count: results.length, total: results.length, status: 'success' });
        }

        // ============================================
        // CASO DEFAULT: LISTADO DE PRODUCTOS
        // ============================================
        const page = parseInt(queryParams.page) || 1;
        const pageSize = parseInt(queryParams.page_size) || 200;
        const search = queryParams.search || queryParams.q || '';
        const brand = queryParams.brand || queryParams.marca || '';
        const category = queryParams.category || queryParams.categoria || '';
        const sort = queryParams.sort || queryParams.ordering || queryParams.type || queryParams.order || '';
        const filterDiscount = queryParams.filter_discount === 'true';
        const filterAvailable = queryParams.filter_available === 'true';

        // Construir filtro WHERE dinámico
        const where = {
            price: { gt: 0 } // Solo mostrar productos con precios reales
        };

        // Filtrar solo productos con stock si se pide
        if (filterAvailable) {
            where.stock = { gt: 0 };
        }
        
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { ingramSku: { contains: search, mode: 'insensitive' } },
                { mpn: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (brand && brand !== 'all') {
            where.brand = { equals: brand, mode: 'insensitive' };
        }

        if (category && category !== 'index') {
            where.category = { contains: category, mode: 'insensitive' };
        }

        // Construir ORDER BY (soporta params tipo PCH: -visitas, -ventas, -created)
        // Construir ORDER BY
        let orderBy = { createdAt: 'desc' };
        let carouselSkip = 0; 

        if (sort === '-visitas') { orderBy = { price: 'asc' }; } // Ofertas: los más baratos primero
        if (sort === '-ventas') { orderBy = { stock: 'desc' }; } // Recomendados: mayor stock
        if (sort === '-created') { orderBy = { createdAt: 'desc' }; } // Nuevos: más recientes
        if (sort === '-popular') { orderBy = { id: 'desc' }; } // Populares: destacados
        if (sort === 'price' || sort === 'precio') orderBy = { price: 'asc' };
        if (sort === '-price' || sort === '-precio') orderBy = { price: 'desc' };
        if (sort === 'title' || sort === 'titulo') orderBy = { title: 'asc' };

        // Para carruseles de homepage, limitar a 20 productos y solo con stock y foto
        const isCarousel = apiPath.includes('section') && (sort === '-visitas' || sort === '-ventas' || sort === '-created' || sort === '-popular');
        if (isCarousel) {
            where.stock = { gt: 0 };
            where.imageUrl = { not: null };
        }
        const take = isCarousel ? 20 : pageSize;
        const skipAmount = isCarousel ? carouselSkip : (page - 1) * take;

        const [products, totalCount] = await Promise.all([
            db.product.findMany({
                where,
                orderBy,
                skip: skipAmount,
                take,
            }),
            db.product.count({ where }),
        ]);

        const results = products.map(p => mapProductToFrontend(p));

        return res.status(200).json({
            results,
            count: results.length,
            total: totalCount,
            page,
            page_size: take,
            pages: Math.ceil(totalCount / take),
            status: 'success',
        });

    } catch (error) {
        console.error('❌ Proxy DB Error:', error.message);
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message,
            results: [],
            count: 0,
            total: 0,
        });
    }
}
