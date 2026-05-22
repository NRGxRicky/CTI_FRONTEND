// ============================================================
// ROBOT V4: Scraper Multi-Fuente + IA Background Removal
// 
// PLAN:
// 1. Busca fotos REALES del producto en Icecat → Amazon → MercadoLibre
// 2. Descarga hasta 4 fotos por producto
// 3. Usa IA (@imgly/background-removal-node) para quitar el fondo
// 4. Centra el producto en un canvas blanco 800x800
// 5. Aplica sharpening y guarda como WebP optimizado
//
// Costo: $0 — Todo corre localmente en tu máquina
// ============================================================

require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Ignorar certificado autofirmado de Coolify
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');

// ─── Configuración ───────────────────────────────────────────
const BATCH_SIZE = parseInt(process.env.SCRAPER_BATCH || '50');
const DELAY_MS = 2000;
const MAX_IMAGES_PER_PRODUCT = 4;

const s3Client = new S3Client({
    region: 'garage', // Garage por defecto usa la región 'garage'
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: true // Necesario para Garage y MinIO
});

// Variable global para el módulo de IA (se carga bajo demanda)
let removeBackground = null;

async function loadAI() {
    if (removeBackground) return;
    console.log('🧠 Cargando modelo de IA para remoción de fondos (primera vez tarda ~30s)...');
    const bgModule = await import('@imgly/background-removal-node');
    removeBackground = bgModule.default || bgModule.removeBackground;
    console.log('🧠 ¡Modelo de IA listo!\n');
}

// ─── FUENTE 1: Icecat (Catálogo abierto de hardware) ─────────
async function searchIcecat(upc, mpn, brand) {
    const username = 'openicecat-live';
    const baseUrl = 'https://live.icecat.biz/api/';
    
    let url = null;
    if (upc && upc.toString().length >= 8) {
        url = `${baseUrl}?UserName=${username}&Language=es&GTIN=${encodeURIComponent(upc.toString())}`;
    } else if (mpn && brand) {
        url = `${baseUrl}?UserName=${username}&Language=es&Brand=${encodeURIComponent(brand)}&PartCode=${encodeURIComponent(mpn)}`;
    }
    
    if (!url) return [];

    try {
        const resp = await fetch(url, { 
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(8000)
        });
        if (!resp.ok) return [];
        const json = await resp.json();
        
        if (json?.msg === 'OK' && json?.data) {
            const gallery = [];
            if (json.data.Gallery && Array.isArray(json.data.Gallery)) {
                json.data.Gallery.forEach(img => {
                    const picUrl = img.Pic || img.HighPic || img.Pic500x500;
                    if (picUrl) gallery.push(picUrl);
                });
            }
            if (gallery.length === 0) {
                const main = json.data.Image?.HighPic || json.data.Image?.Pic500x500;
                if (main) gallery.push(main);
            }
            return [...new Set(gallery)].slice(0, MAX_IMAGES_PER_PRODUCT);
        }
    } catch { /* silenciar */ }
    return [];
}

// ─── FUENTE 2: Amazon (Scraping de resultados y Product Page) ───────────────
async function searchAmazon(searchTerm) {
    const urls = [
        `https://www.amazon.com.mx/s?k=${encodeURIComponent(searchTerm)}&i=electronics`,
        `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&i=electronics`,
    ];
    
    for (const url of urls) {
        try {
            const resp = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
                },
                signal: AbortSignal.timeout(10000),
            });
            if (!resp.ok) continue;
            const html = await resp.text();
            
            // Paso 1: Encontrar el ASIN del primer resultado
            const asinMatch = html.match(/\/dp\/([A-Z0-9]{10})/);
            if (!asinMatch) {
                // Fallback: Si no hay ASIN, sacar la imagen de la búsqueda (1 sola)
                const pattern = /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9._-]+\.jpg/g;
                const matches = html.match(pattern) || [];
                const good = matches.filter(u => !u.includes('_SS40_') && !u.includes('sprite'));
                const cleaned = [...new Set(good)].map(u => u.replace(/\._[A-Z]+_[^.]*\./, '._AC_UF1000,1000_QL80_.'));
                if (cleaned.length > 0) return cleaned.slice(0, 1);
                continue;
            }
            
            // Paso 2: Visitar la página del producto para obtener la galería completa (variantes)
            const asin = asinMatch[1];
            const dpUrl = url.includes('.mx') ? `https://www.amazon.com.mx/dp/${asin}` : `https://www.amazon.com/dp/${asin}`;
            
            const dpResp = await fetch(dpUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
                },
                signal: AbortSignal.timeout(10000),
            });
            
            if (!dpResp.ok) continue;
            const dpHtml = await dpResp.text();
            
            // Extraer bloque de imágenes 'colorImages'
            const blockMatch = dpHtml.match(/'colorImages':\s*\{\s*'initial':\s*(\[.+?\])\s*\},/);
            if (blockMatch) {
                const imgUrls = [...blockMatch[1].matchAll(/"hiRes":"([^"]+)"/g)].map(m => m[1]);
                if (imgUrls.length > 0) {
                    const uniqueUrls = [...new Set(imgUrls)];
                    return uniqueUrls.slice(0, MAX_IMAGES_PER_PRODUCT); // Máximo 4 variantes
                }
            }
            
        } catch { /* siguiente fuente */ }
        await new Promise(r => setTimeout(r, 500));
    }
    return [];
}

// ─── FUENTE 3: MercadoLibre (Scraping de resultados) ─────────
async function searchMercadoLibre(searchTerm) {
    try {
        const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(searchTerm)}`;
        const resp = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept-Language': 'es-MX,es;q=0.9',
            },
            signal: AbortSignal.timeout(10000),
        });
        if (!resp.ok) return [];
        const html = await resp.text();
        
        const pattern = /https:\/\/http2\.mlstatic\.com\/D_[A-Za-z0-9_-]+\.jpg/g;
        const matches = html.match(pattern) || [];
        
        // Forzar resolución original
        const cleaned = [...new Set(matches)].map(u => 
            u.replace(/-[A-Z]\.jpg/, '-O.jpg')
        );
        
        return cleaned.slice(0, 1);
    } catch { /* silenciar */ }
    return [];
}

// ─── Orquestador: Buscar en TODAS las fuentes ────────────────
async function findImages(prod) {
    const { mpn, brand, title, upc } = prod;
    
    // 1. Icecat (la más confiable para marcas internacionales)
    console.log(`      📡 Buscando en Icecat...`);
    let urls = await searchIcecat(upc, mpn, brand);
    if (urls.length > 0) {
        console.log(`      ✅ Icecat: ${urls.length} imagen(es)`);
        return { urls, source: 'Icecat' };
    }
    
    // 2. Amazon (la más grande)
    const searchTerms = [
        `${brand} ${mpn}`,                           // Marca + MPN (MÁS ESPECÍFICO)
        `${brand} ${title}`.substring(0, 50),        // Marca + título corto
        mpn,                                         // MPN exacto (último recurso)
    ].filter(Boolean);
    
    for (const term of searchTerms) {
        console.log(`      📡 Buscando en Amazon: "${term}"...`);
        urls = await searchAmazon(term);
        if (urls.length > 0) {
            console.log(`      ✅ Amazon: ${urls.length} imagen(es)`);
            return { urls, source: 'Amazon' };
        }
        await new Promise(r => setTimeout(r, 800));
    }
    
    // 3. MercadoLibre (fallback)
    for (const term of searchTerms) {
        console.log(`      📡 Buscando en MercadoLibre: "${term}"...`);
        urls = await searchMercadoLibre(term);
        if (urls.length > 0) {
            console.log(`      ✅ MercadoLibre: ${urls.length} imagen(es)`);
            return { urls, source: 'MercadoLibre' };
        }
        await new Promise(r => setTimeout(r, 800));
    }
    
    return { urls: [], source: null };
}

// ─── IA: Quitar fondo + Centrar + Optimizar ──────────────────
async function processImageWithAI(imageBuffer, s3Key) {
    try {
        // Paso 1: IA quita el fondo (genera PNG con transparencia)
        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        const resultBlob = await removeBackground(blob, {
            output: { format: 'image/png' },
        });
        const pngBuffer = Buffer.from(await resultBlob.arrayBuffer());
        
        // Paso 2: Sharp → Auto-crop (quitar espacio vacío transparente)
        //        → Centrar en canvas blanco 800x800
        //        → Sharpen (mejorar nitidez)
        //        → Guardar como WebP
        const trimmed = await sharp(pngBuffer)
            .trim()  // Recorta automáticamente los bordes transparentes
            .toBuffer({ resolveWithObject: true });
        
        const { width, height } = trimmed.info;
        
        // Calcular el tamaño máximo manteniendo proporción dentro de 700x700
        // (dejando 50px de padding en cada lado del canvas de 800)
        const maxDim = 700;
        const scale = Math.min(maxDim / width, maxDim / height, 1);
        const newW = Math.round(width * scale);
        const newH = Math.round(height * scale);
        
        const resized = await sharp(trimmed.data)
            .resize(newW, newH, { fit: 'inside' })
            .toBuffer();
        
        // Componer sobre canvas blanco 800x800 perfectamente centrado
        const finalWebpBuffer = await sharp({
            create: {
                width: 800,
                height: 800,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
        .composite([{
            input: resized,
            gravity: 'centre'
        }])
        .flatten({ background: '#ffffff' })
        .sharpen({ sigma: 1.0, m1: 0.5, m2: 0.5 })  // Mejorar nitidez
        .webp({ quality: 85, effort: 6 })
        .toBuffer();
        
        // Paso 3: Subir a S3 (Garage)
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
            Body: finalWebpBuffer,
            ContentType: 'image/webp',
            ACL: 'public-read' // Garage soporta public-read si el bucket tiene allow website
        }));
        
        return true;
    } catch (err) {
        // Fallback: Si la IA falla, al menos guardamos con fondo blanco
        console.log(`      ⚠️ IA falló, usando fallback básico: ${err.message}`);
        try {
            const fallbackBuffer = await sharp(imageBuffer)
                .resize(800, 800, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                .flatten({ background: '#ffffff' })
                .sharpen()
                .webp({ quality: 80 })
                .toBuffer();

            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: s3Key,
                Body: fallbackBuffer,
                ContentType: 'image/webp',
                ACL: 'public-read'
            }));
            return true;
        } catch {
            return false;
        }
    }
}

// ─── Procesamiento sin IA (fallback rápido) ──────────────────
async function processImageBasic(imageBuffer, s3Key) {
    try {
        const fallbackBuffer = await sharp(imageBuffer)
            .resize(800, 800, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .flatten({ background: '#ffffff' })
            .sharpen()
            .webp({ quality: 80 })
            .toBuffer();

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
            Body: fallbackBuffer,
            ContentType: 'image/webp',
            ACL: 'public-read'
        }));
        return true;
    } catch {
        return false;
    }
}

// ─── Descargar una imagen como Buffer ────────────────────────
async function downloadImage(url) {
    try {
        const resp = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            signal: AbortSignal.timeout(15000),
        });
        if (!resp.ok) return null;
        const ab = await resp.arrayBuffer();
        return Buffer.from(ab);
    } catch {
        return null;
    }
}

// ─── Procesar un producto completo ───────────────────────────
async function processProduct(prod, useAI) {
    const sku = prod.ingramSku;
    
    // 1. Buscar imágenes en todas las fuentes
    const { urls, source } = await findImages(prod);
    
    if (urls.length === 0) {
        return { success: false, reason: 'Sin imágenes en Icecat, Amazon ni MercadoLibre.' };
    }
    
    // 2. Descargar y subir cada imagen a S3
    let downloadedCount = 0;
    for (let i = 0; i < urls.length; i++) {
        const s3Key = `products/${sku}/${i + 1}.webp`;
        
        const buffer = await downloadImage(urls[i]);
        if (!buffer) continue;
        
        let ok = false;
        if (useAI && i === 0) {
            console.log(`      🧠 Aplicando IA a imagen principal...`);
            ok = await processImageWithAI(buffer, s3Key);
        } else {
            ok = await processImageBasic(buffer, s3Key);
        }
        
        if (ok) downloadedCount++;
    }
    
    if (downloadedCount === 0) {
        return { success: false, reason: 'Error al descargar/procesar imágenes.' };
    }
    
    return { success: true, count: downloadedCount, source };
}

// ─── Robot Principal ─────────────────────────────────────────
async function run() {
    // Preguntar si quieren usar IA
    const useAI = process.argv.includes('--ai');
    
    if (useAI) {
        await loadAI();
    } else {
        console.log('💡 Tip: Ejecuta con --ai para activar remoción de fondos con IA');
        console.log('   Ejemplo: node scripts/mass-image-downloader.js --ai\n');
    }
    
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    let completados = 0;
    let fantasmas = 0;
    const startTime = Date.now();

    try {
        console.log('🤖 ============================================');
        console.log('   ROBOT V4: Scraper Multi-Fuente + IA Editor');
        console.log(`   Modo: ${useAI ? '🧠 IA Activada (background removal)' : '⚡ Rápido (sin IA)'}`);
        console.log(`   Batch: ${BATCH_SIZE} productos`);
        console.log(`   Fuentes: Icecat → Amazon → MercadoLibre`);
        console.log('============================================\n');

        // Modificado para forzar la actualización de productos específicos pasados por argumento si se quiere
        const skuToUpdate = process.argv.find(arg => arg.startsWith('--sku='))?.split('=')[1];
        
        const ghosts = await prisma.product.findMany({
            where: skuToUpdate ? { ingramSku: skuToUpdate } : { imageUrl: null },
            orderBy: { updatedAt: 'asc' },
            take: skuToUpdate ? 1 : BATCH_SIZE,
            select: { id: true, ingramSku: true, title: true, mpn: true, brand: true, upc: true }
        });

        console.log(`📦 ${ghosts.length} productos a procesar encontrados\n`);

        if (ghosts.length === 0) {
            console.log('🎉 ¡Catálogo completo! No hay más productos sin imagen.');
            return;
        }

        for (let i = 0; i < ghosts.length; i++) {
            const prod = ghosts[i];
            console.log(`\n[${i + 1}/${ghosts.length}] SKU: ${prod.ingramSku}`);
            console.log(`   📝 ${prod.brand} | ${prod.mpn || 'sin MPN'}`);
            console.log(`   📝 ${(prod.title || '').substring(0, 60)}`);

            try {
                const result = await processProduct(prod, useAI);

                if (result.success) {
                    const publicUrl = `${process.env.S3_PUBLIC_URL}/products/${prod.ingramSku}/1.webp`;
                    
                    // Crear arreglo de imágenes para la galería
                    const galleryUrls = [];
                    for(let j=1; j<=result.count; j++){
                        galleryUrls.push(`${process.env.S3_PUBLIC_URL}/products/${prod.ingramSku}/${j}.webp`);
                    }

                    await prisma.product.update({
                        where: { id: prod.id },
                        data: { 
                            imageUrl: publicUrl,
                            gallery: galleryUrls,
                            updatedAt: new Date() 
                        }
                    });
                    console.log(`   ✅ ${result.count} imágenes guardadas en S3 [${result.source}]`);
                    completados++;
                } else {
                    console.log(`   👻 ${result.reason}`);
                    await prisma.product.update({
                        where: { id: prod.id },
                        data: { updatedAt: new Date() }
                    });
                    fantasmas++;
                }
            } catch (err) {
                console.error(`   ❌ Error: ${err.message}`);
            }

            await new Promise(r => setTimeout(r, DELAY_MS));
        }

        const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        const total = completados + fantasmas;
        const tasa = total > 0 ? ((completados / total) * 100).toFixed(1) : 0;

        console.log('\n🏁 ============================================');
        console.log(`   ✅ Con imagen: ${completados}`);
        console.log(`   👻 Sin imagen: ${fantasmas}`);
        console.log(`   📊 Tasa de éxito: ${tasa}%`);
        console.log(`   ⏱️ Tiempo: ${elapsed} minutos`);
        console.log('============================================\n');

    } catch (e) {
        console.error('❌ Error Crítico:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

run();
