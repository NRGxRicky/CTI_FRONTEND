// pages/api/proxy/[...path].js
// API Proxy conectada a PostgreSQL (Coolify) vía Prisma v7
// Sirve los 9,594 productos de Ingram Micro directamente desde la BD local

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Singleton de conexión para no abrir pools en cada request
let prisma;
function getPrisma() {
    if (!prisma) {
        const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
    }
    return prisma;
}

// Genera un slug limpio a partir del título
function slugify(text) {
    return (text || 'producto')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 80);
}

// Convierte un producto de Prisma al formato que espera el frontend de CTI
function mapProductToFrontend(dbProduct) {
    const cost = dbProduct.price || 0;
    
    // Calcular el precio final de venta:
    // 1. Margen de ganancia (12% -> 1.12)
    const margin = parseFloat(process.env.PROFIT_MARGIN || '1.12');
    
    // 2. Impuesto IVA aplicable en México (16% -> 1.16)
    const iva = 1.16;
    
    // 3. Fórmula final (Costo Puro * Margen * IVA) redondedo a 2 decimales
    const rawPrice = cost * margin * iva;
    const priceMXN = Math.round(rawPrice * 100) / 100;
    
    const brandName = dbProduct.brand || 'Ingram';
    const brandSlug = slugify(brandName);
    const catName = dbProduct.category || 'General';
    
    const result = {
        id: dbProduct.id,
        sku: dbProduct.ingramSku || '',
        titulo: dbProduct.title || 'Sin Título',
        slug: `${slugify(dbProduct.title)}-${dbProduct.ingramSku}`,
        modelo: dbProduct.mpn || dbProduct.ingramSku || '',
        descripcion: dbProduct.description || dbProduct.title || '',
        categoria: catName,
        linea: catName,
        seccion: catName,
        marca: {
            nombre: brandName,
            slug: brandSlug,
            imagen: null,
        },
        precio_contado: priceMXN,
        precio_final: priceMXN,
        precio_final_descuento: 0,
        stock_total: dbProduct.stock || 0,
        stock_puebla: 0,
        costo_envio: priceMXN > 5000 ? 0 : 150,
        imagen1s: dbProduct.imageUrl || '/images/not-available.png',
        imagen1m: dbProduct.imageUrl || '/images/not-available.png',
        imagen1xs: dbProduct.imageUrl || '/images/not-available.png',
        imagen1l: dbProduct.imageUrl || '/images/not-available.png',
        envio_gratis: priceMXN > 5000,
        created: dbProduct.createdAt ? dbProduct.createdAt.toISOString() : new Date().toISOString(),
        upc: dbProduct.upc || '',
        specs: {},
        specs_resume: {},
        mediafiles: [],
        compatibleProductos: [],
        breadcrumblist: [],
        parent__slug: slugify(catName),
        imageUrl: dbProduct.imageUrl || null,
    };

    // Mapear galería de imágenes (hasta 10)
    if (dbProduct.gallery && Array.isArray(dbProduct.gallery)) {
        dbProduct.gallery.slice(0, 9).forEach((imgUrl, index) => {
            const num = index + 2; // Empezamos en imagen2
            result[`imagen${num}s`] = imgUrl;
            result[`imagen${num}m`] = imgUrl;
            result[`imagen${num}xs`] = imgUrl;
            result[`imagen${num}l`] = imgUrl;
        });
    }

    return result;
}

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
    const db = getPrisma();

    try {
        // ============================================
        // CASO: CARRITO (sin cambios por ahora)
        // ============================================


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
                    image: p.imageUrl || null // Usar URL de Icecat directamente
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
            // Buscar por slug (que contiene el SKU al final) o directamente por SKU/MPN
            const skuClean = queryParams.sku.split('-').pop() || queryParams.sku;
            
            const product = await db.product.findFirst({
                where: {
                    OR: [
                        { ingramSku: queryParams.sku },
                        { ingramSku: skuClean },
                        { mpn: queryParams.sku },
                        { mpn: skuClean },
                    ]
                }
            });

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
            // Mapa de logos oficiales (Usando servicio de Google para máxima compatibilidad)
            const brandLogos = {
                'startech.com': 'https://www.google.com/s2/favicons?domain=startech.com&sz=128',
                'hp inc': 'https://www.google.com/s2/favicons?domain=hp.com&sz=128',
                'manhattan': 'https://www.google.com/s2/favicons?domain=manhattan-products.com&sz=128',
                'brobotix': 'https://www.google.com/s2/favicons?domain=brobotix.com&sz=128',
                'cisco': 'https://www.google.com/s2/favicons?domain=cisco.com&sz=128',
                'epson': 'https://www.google.com/s2/favicons?domain=epson.com&sz=128',
                'apple': 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
                'tp-link': 'https://www.google.com/s2/favicons?domain=tp-link.com&sz=128',
                'zebra tech.': 'https://www.google.com/s2/favicons?domain=zebra.com&sz=128',
                'zebra': 'https://www.google.com/s2/favicons?domain=zebra.com&sz=128',
                'perfect choice': 'https://www.google.com/s2/favicons?domain=perfectchoice.com.mx&sz=128',
                'logitech': 'https://www.google.com/s2/favicons?domain=logitech.com&sz=128',
                'xerox': 'https://www.google.com/s2/favicons?domain=xerox.com&sz=128',
                'intellinet': 'https://www.google.com/s2/favicons?domain=intellinet-network.com&sz=128',
                'dell': 'https://www.google.com/s2/favicons?domain=dell.com&sz=128',
                'brother': 'https://www.google.com/s2/favicons?domain=brother.com&sz=128',
                'tripp lite': 'https://www.google.com/s2/favicons?domain=tripplite.com&sz=128',
                'canon': 'https://www.google.com/s2/favicons?domain=canon.com&sz=128',
                'lenovo': 'https://www.google.com/s2/favicons?domain=lenovo.com&sz=128',
                'kensington': 'https://www.google.com/s2/favicons?domain=kensington.com&sz=128',
                'kingston': 'https://www.google.com/s2/favicons?domain=kingston.com&sz=128',
                'jabra': 'https://www.google.com/s2/favicons?domain=jabra.com&sz=128',
                'buffalo': 'https://www.google.com/s2/favicons?domain=buffalo.com&sz=128',
                'apc': 'https://www.google.com/s2/favicons?domain=apc.com&sz=128',
                'lexmark': 'https://www.google.com/s2/favicons?domain=lexmark.com&sz=128',
                'toshiba (pp)': 'https://www.google.com/s2/favicons?domain=toshiba.com&sz=128',
                'samsung': 'https://www.google.com/s2/favicons?domain=samsung.com&sz=128',
                'adata (pyp)': 'https://www.google.com/s2/favicons?domain=adata.com&sz=128',
                'naceb': 'https://www.google.com/s2/favicons?domain=naceb.com.mx&sz=128',
                'viewsonic': 'https://www.google.com/s2/favicons?domain=viewsonic.com&sz=128',
                'benq': 'https://www.google.com/s2/favicons?domain=benq.com&sz=128',
                'cyberpower': 'https://www.google.com/s2/favicons?domain=cyberpowersystems.com&sz=128',
                'microsoft': 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
                'gigabyte': 'https://www.google.com/s2/favicons?domain=gigabyte.com&sz=128',
                'asus': 'https://www.google.com/s2/favicons?domain=asus.com&sz=128',
                'acer': 'https://www.google.com/s2/favicons?domain=acer.com&sz=128',
            };

            const brands = await db.product.groupBy({
                by: ['brand'],
                _count: { brand: true },
                orderBy: { _count: { brand: 'desc' } },
                take: 30,
            });

            const results = brands.filter(b => b.brand).map(b => ({
                name: b.brand,
                slug: slugify(b.brand),
                imagen: brandLogos[b.brand.toLowerCase()] || null,
                count: b._count.brand,
            })).filter(b => b.imagen); // Solo mostrar marcas que tengan logo

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
