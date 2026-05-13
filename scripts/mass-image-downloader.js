require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');

// ─── Configuración ───────────────────────────────────────────
const BATCH_SIZE = parseInt(process.env.SCRAPER_BATCH || '50');
const DELAY_MS = 2500;  // Pausa entre requests
const MAX_IMAGES_PER_PRODUCT = 4;
const BASE_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

// Fuentes de búsqueda
const IMAGE_SOURCES = [
    {
        name: 'Amazon MX',
        buildUrl: (mpn) => `https://www.amazon.com.mx/s?k=${encodeURIComponent(mpn)}&i=electronics`,
        imagePattern: /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9._-]+\.jpg/g,
    },
    {
        name: 'Amazon US',
        buildUrl: (mpn) => `https://www.amazon.com/s?k=${encodeURIComponent(mpn)}&i=electronics`,
        imagePattern: /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9._-]+\.jpg/g,
    },
    {
        name: 'MercadoLibre',
        buildUrl: (mpn) => `https://listado.mercadolibre.com.mx/${encodeURIComponent(mpn)}`,
        imagePattern: /https:\/\/http2\.mlstatic\.com\/D_[A-Za-z0-9_-]+\.jpg/g,
    },
];

// ─── Funciones Auxiliares ─────────────────────────────────────
async function fetchPage(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    try {
        const resp = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

function cleanUrls(urls) {
    // Limpiar duplicados y quitar parámetros pequeños de Amazon/ML
    const unique = [...new Set(urls)];
    return unique.map(url => {
        if (url.includes('m.media-amazon.com')) {
            return url.replace(/\._[A-Z]+_[^.]*\./, '._AC_UF1000,1000_QL80_.');
        }
        if (url.includes('mlstatic.com') && !url.includes('-O.jpg')) {
            return url.replace(/-[A-Z]\.jpg/, '-O.jpg');
        }
        return url;
    });
}

function extractPatternImages(html, pattern) {
    const matches = html.match(pattern);
    if (!matches || matches.length === 0) return [];
    
    // Filtrar miniaturas y basura
    const goodImages = matches.filter(url => {
        if (url.includes('_SS40_') || url.includes('_AC_US40_') || url.includes('_SX38_')) return false;
        if (url.includes('_SR38') || url.includes('_SS36') || url.includes('sprite')) return false;
        return true;
    });
    
    return cleanUrls(goodImages).slice(0, MAX_IMAGES_PER_PRODUCT);
}

// ─── Descarga y Procesamiento con Sharp ──────────────────────
async function downloadAndOptimizeImage(url, destPath) {
    try {
        const response = await fetch(url);
        if (!response.ok) return false;
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Optimizar con sharp: fondo blanco, redimensionar y a WebP
        await sharp(buffer)
            .resize(800, 800, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .flatten({ background: '#ffffff' }) // Quitar transparencias y poner fondo blanco
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
    const mpn = prod.mpn || prod.title.substring(0, 30);
    
    let foundUrls = [];
    
    // 1. Buscar URLs en las fuentes
    for (const source of IMAGE_SOURCES) {
        const html = await fetchPage(source.buildUrl(mpn));
        if (!html) continue;
        
        const urls = extractPatternImages(html, source.imagePattern);
        if (urls.length > 0) {
            foundUrls = urls;
            break; // Si encontramos en esta fuente, paramos la búsqueda
        }
        await new Promise(r => setTimeout(r, 800)); // Pausa amable
    }
    
    if (foundUrls.length === 0) return { success: false, reason: 'No se encontraron imágenes en la web.' };
    
    // 2. Crear directorio del producto
    const productDir = path.join(BASE_IMAGES_DIR, sku);
    if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
    }
    
    // 3. Descargar y Optimizar
    let downloadedCount = 0;
    for (let i = 0; i < foundUrls.length; i++) {
        const webpName = `${i + 1}.webp`;
        const destPath = path.join(productDir, webpName);
        
        const ok = await downloadAndOptimizeImage(foundUrls[i], destPath);
        if (ok) downloadedCount++;
    }
    
    if (downloadedCount === 0) return { success: false, reason: 'Error al descargar/procesar las imágenes.' };
    
    return { success: true, count: downloadedCount, firstImageUrl: `products/${sku}/1.webp` };
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
        console.log('   ROBOT: Web Scraper + Editor WebP Automático');
        console.log(`   Batch: ${BATCH_SIZE} productos`);
        console.log('============================================\n');

        // Buscar productos fantasma (sin imagen)
        const ghosts = await prisma.product.findMany({
            where: { imageUrl: null },
            orderBy: { stock: 'desc' },
            take: BATCH_SIZE,
            select: { id: true, ingramSku: true, title: true, mpn: true, brand: true }
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
                    // Actualizamos DB con la ruta local
                    await prisma.product.update({
                        where: { id: prod.id },
                        data: { imageUrl: result.firstImageUrl }
                    });
                    console.log(`   ✅ Guardadas ${result.count} imágenes locales WebP.`);
                    encontrados++;
                } else {
                    console.log(`   👻 Falló: ${result.reason}`);
                    // Opcional: Marcar updatedAt para no reprocesar de inmediato
                    await prisma.product.update({
                        where: { id: prod.id },
                        data: { updatedAt: new Date() }
                    });
                    noEncontrados++;
                }
            } catch (err) {
                console.error(`   ❌ Error en producto: ${err.message}`);
            }

            // Pausa obligatoria para no saturar nuestro CPU ni banear IP
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
