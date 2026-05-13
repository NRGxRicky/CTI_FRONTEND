require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');

// ─── Configuración ───────────────────────────────────────────
const BATCH_SIZE = parseInt(process.env.SCRAPER_BATCH || '50');
const DELAY_MS = 2500;  // Pausa gentil entre requests
const MAX_IMAGES_PER_PRODUCT = 4;
const BASE_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

// ─── Búsqueda en Catálogo de Hardware (Icecat) ───────────────
async function fetchIcecatImages(upc, mpn, brand) {
    const username = 'openicecat-live';
    const baseUrl = 'https://live.icecat.biz/api/';
    let url = null;
    
    if (upc && upc.toString().length >= 8) {
        url = `${baseUrl}?UserName=${username}&Language=es&GTIN=${encodeURIComponent(upc.toString())}`;
    } else if (mpn && brand) {
        url = `${baseUrl}?UserName=${username}&Language=es&Brand=${encodeURIComponent(brand.toString())}&PartCode=${encodeURIComponent(mpn.toString())}`;
    } else {
        return [];
    }

    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) return [];

        const json = await response.json();
        if (json?.msg === 'OK' && json?.data) {
            const gallery = [];
            if (json.data.Gallery && Array.isArray(json.data.Gallery)) {
                json.data.Gallery.forEach(img => {
                    const picUrl = img.Pic || img.HighPic || img.Pic500x500;
                    if (picUrl) gallery.push(picUrl);
                });
            }
            if (gallery.length === 0) {
                const mainImage = json.data.Image?.HighPic || json.data.Image?.Pic500x500 || json.data.Image?.Pic;
                if (mainImage) gallery.push(mainImage);
            }
            return [...new Set(gallery)].slice(0, MAX_IMAGES_PER_PRODUCT);
        }
        return [];
    } catch (err) {
        return [];
    }
}

// ─── Búsqueda Web Scraper (Amazon / ML) ──────────────────────
const SCRAPER_SOURCES = [
    {
        name: 'Amazon MX',
        buildUrl: (mpn) => `https://www.amazon.com.mx/s?k=${encodeURIComponent(mpn)}&i=electronics`,
        imagePattern: /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9._-]+\.jpg/g,
    },
    {
        name: 'MercadoLibre',
        buildUrl: (mpn) => `https://listado.mercadolibre.com.mx/${encodeURIComponent(mpn)}`,
        imagePattern: /https:\/\/http2\.mlstatic\.com\/D_[A-Za-z0-9_-]+\.jpg/g,
    }
];

async function fetchPage(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const resp = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
            },
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!resp.ok) return null;
        return await resp.text();
    } catch (e) {
        clearTimeout(timeout);
        return null;
    }
}

function extractPatternImages(html, pattern) {
    const matches = html.match(pattern);
    if (!matches || matches.length === 0) return [];
    
    // Filtrar miniaturas y limpiar URLs
    const goodImages = matches.filter(url => {
        if (url.includes('_SS40_') || url.includes('_AC_US40_') || url.includes('_SX38_')) return false;
        if (url.includes('_SR38') || url.includes('_SS36') || url.includes('sprite')) return false;
        return true;
    });
    
    const cleanUrls = goodImages.map(url => {
        if (url.includes('m.media-amazon.com')) {
            return url.replace(/\._[A-Z]+_[^.]*\./, '._AC_UF1000,1000_QL80_.');
        }
        if (url.includes('mlstatic.com') && !url.includes('-O.jpg')) {
            return url.replace(/-[A-Z]\.jpg/, '-O.jpg');
        }
        return url;
    });

    return [...new Set(cleanUrls)].slice(0, MAX_IMAGES_PER_PRODUCT);
}

// ─── Descarga y Procesamiento con Sharp ──────────────────────
async function downloadAndOptimizeImage(url, destPath) {
    try {
        const response = await fetch(url);
        if (!response.ok) return false;
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await sharp(buffer)
            .resize(800, 800, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .flatten({ background: '#ffffff' })
            .webp({ quality: 80, effort: 6 })
            .toFile(destPath);
            
        return true;
    } catch (err) {
        return false;
    }
}

// ─── Lógica Principal por Producto ───────────────────────────
async function processProduct(prod) {
    const sku = prod.ingramSku;
    
    // 1. Intentar Icecat primero (Oficial y alta calidad)
    let foundUrls = await fetchIcecatImages(prod.upc, prod.mpn, prod.brand);
    let sourceName = 'Icecat';
    
    // 2. Si Icecat falla, intentar Web Scraping
    if (foundUrls.length === 0) {
        const searchTerm = prod.mpn || prod.title.substring(0, 30);
        for (const source of SCRAPER_SOURCES) {
            const html = await fetchPage(source.buildUrl(searchTerm));
            if (!html) continue;
            
            const urls = extractPatternImages(html, source.imagePattern);
            if (urls.length > 0) {
                foundUrls = urls;
                sourceName = source.name;
                break;
            }
            await new Promise(r => setTimeout(r, 800)); // Pausa entre scrapings
        }
    }
    
    if (foundUrls.length === 0) {
        return { success: false, reason: 'No se encontraron imágenes en Icecat ni Web Scraping.' };
    }
    
    // 3. Crear directorio del producto
    const productDir = path.join(BASE_IMAGES_DIR, sku);
    if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
    }
    
    // 4. Descargar y Optimizar
    let downloadedCount = 0;
    for (let i = 0; i < foundUrls.length; i++) {
        const webpName = `${i + 1}.webp`;
        const destPath = path.join(productDir, webpName);
        
        const ok = await downloadAndOptimizeImage(foundUrls[i], destPath);
        if (ok) downloadedCount++;
    }
    
    if (downloadedCount === 0) return { success: false, reason: 'Error al descargar/procesar las imágenes.' };
    
    return { success: true, count: downloadedCount, source: sourceName, firstImageUrl: `products/${sku}/1.webp` };
}

// ─── Robot Principal ─────────────────────────────────────────
async function runMassDownloader() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    let encontrados = 0;
    let noEncontrados = 0;

    try {
        console.log('🤖 ============================================');
        console.log('   ROBOT V3.1: Icecat + WebScraper Fallback');
        console.log(`   Batch: ${BATCH_SIZE} productos`);
        console.log('============================================\n');

        const ghosts = await prisma.product.findMany({
            where: { imageUrl: null },
            orderBy: { updatedAt: 'asc' }, // Prioriza los más antiguos o no revisados
            take: BATCH_SIZE,
            select: { id: true, ingramSku: true, title: true, mpn: true, brand: true, upc: true }
        });

        console.log(`📦 ${ghosts.length} productos listos para procesar\n`);

        if (ghosts.length === 0) {
            console.log('🎉 ¡Catálogo completo! No hay más productos sin imagen.');
            return;
        }

        for (let i = 0; i < ghosts.length; i++) {
            const prod = ghosts[i];
            console.log(`[${i + 1}/${ghosts.length}] ${prod.ingramSku} | ${prod.brand} | ${prod.mpn}`);

            try {
                const result = await processProduct(prod);

                if (result.success) {
                    await prisma.product.update({
                        where: { id: prod.id },
                        data: { imageUrl: result.firstImageUrl, updatedAt: new Date() }
                    });
                    console.log(`   ✅ [${result.source}] Guardadas ${result.count} imágenes locales WebP.`);
                    encontrados++;
                } else {
                    console.log(`   👻 Falló: ${result.reason}`);
                    await prisma.product.update({
                        where: { id: prod.id },
                        data: { updatedAt: new Date() }
                    });
                    noEncontrados++;
                }
            } catch (err) {
                console.error(`   ❌ Error en producto: ${err.message}`);
            }

            await new Promise(r => setTimeout(r, DELAY_MS));
        }

        console.log('\n🏁 ============================================');
        console.log(`   ✅ Completados: ${encontrados}`);
        console.log(`   👻 Sin imagen: ${noEncontrados}`);
        console.log('============================================\n');

    } catch (e) {
        console.error('❌ Error Crítico:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

runMassDownloader();
