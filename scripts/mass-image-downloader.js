// ============================================================
// ROBOT V5.1: SISTEMA DE ADQUISICIÓN FOTOGRÁFICA ZERO-ERROR (CTI)
// 
// ARQUITECTURA BLINDADA Y AUDITADA:
// 1. Icecat Oficial: Prioridad absoluta con catálogo del fabricante.
// 2. Buscador Web con Triple Candado:
//    - Exige coincidencia de palabra completa del MPN: (?<![a-zA-Z0-9])MPN(?![a-zA-Z0-9])
//    - Exige que la Marca aparezca en el título.
//    - Filtra y RECHAZA accesorios compatibles ("compatible con", "funda para", "case for", "reemplazo").
// 3. Manejo de Intangibles y Distinción de Errores:
//    - Los errores de red transitorios NO escriben placeholders (se reintentan).
//    - Prisma Json null corregido con Prisma.DbNull.
//    - Timeouts de conexión y request en S3 y fetches.
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const https = require('https');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { NodeHttpHandler } = require('@smithy/node-http-handler');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient, Prisma } = require('@prisma/client');
const sharp = require('sharp');

// ─── Configuración ───────────────────────────────────────────
const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith('--batch='))?.split('=')[1] || process.env.SCRAPER_BATCH || '50');
const DELAY_MS = parseInt(process.argv.find(a => a.startsWith('--delay='))?.split('=')[1] || '1500');
const MAX_IMAGES_PER_PRODUCT = 4;
const RUN_CONTINUOUS = process.argv.includes('--all') || process.argv.includes('--continuous');

// Validar variables de entorno críticas al arrancar
if (!process.env.S3_BUCKET || !process.env.S3_PUBLIC_URL) {
    console.error('❌ Error: Variables S3_BUCKET y S3_PUBLIC_URL requeridas en .env');
    process.exit(1);
}

// Cliente S3 con timeouts configurados y SSL acotado
const s3Client = new S3Client({
    region: 'garage',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        connectionTimeout: 5000,
        requestTimeout: 10000,
    })
});

// Variable global para IA de fondo (se carga bajo demanda con --ai)
let removeBackground = null;
async function loadAI() {
    if (removeBackground) return;
    console.log('🧠 Cargando modelo de IA para remoción de fondos...');
    const bgModule = await import('@imgly/background-removal-node');
    removeBackground = bgModule.default || bgModule.removeBackground;
    console.log('✅ Modelo de IA listo.\n');
}

// ─── Mapa Oficial de Categorías para Cobertura Garantizada ────
const CATEGORY_ARTWORK_MAP = {
    'Puntos de Venta y Códigos de Barra': '/images/categories/puntos-de-venta.png',
    'Computadoras': '/images/categories/computadoras.png',
    'Accesorios': '/images/categories/accesorios.png',
    'Suministros': '/images/categories/suministros.png',
    'Dispositivos de Entrada y Salida': '/images/categories/entrada-salida.png',
    'Protección Eléctrica': '/images/categories/proteccion-electrica.png',
    'Almacenamiento': '/images/categories/almacenamiento.png',
    'Redes': '/images/categories/redes.png',
    'Componentes': '/images/categories/componentes.png',
    'Cables': '/images/categories/cables.png',
    'Imagen Digital': '/images/categories/video.png',
    'Dispositivos de Video': '/images/categories/video.png',
    'Impresión': '/images/categories/impresion.png',
    'Servicios': '/images/categories/servicios.png',
    'Software': '/images/categories/software.png',
};

function getCategoryArtwork(category) {
    return CATEGORY_ARTWORK_MAP[category] || '/images/categories/generico.svg';
}

function isIntangibleProduct(title, category) {
    const t = (title || '').toLowerCase();
    const c = (category || '').toLowerCase();
    if (c === 'servicios' || c === 'software' || c === 'licenciamiento') return true;
    if (t.startsWith('garantia') || t.startsWith('garantía') || t.startsWith('poliza') || t.startsWith('póliza') || t.startsWith('licencia') || t.includes('care pack') || t.includes('extension de garantia')) return true;
    return false;
}

// Palabras prohibidas que delatan productos compatibles o accesorios ajenos
const FORBIDDEN_COMPATIBLE_PATTERNS = [
    /\bcompatible\s+con\b/i,
    /\bcompatible\s+for\b/i,
    /\bpara\s+(hp|dell|lenovo|samsung|apple|epson|canon|brother|cisco)\b/i,
    /\bfor\s+(hp|dell|lenovo|samsung|apple|epson|canon|brother|cisco)\b/i,
    /\breemplazo\s+de\b/i,
    /\breplacement\s+for\b/i,
    /\bfunda\s+para\b/i,
    /\bcase\s+for\b/i,
    /\bgen[eé]rico\b/i
];

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── FUENTE 1: Icecat Oficial (Vía IcecatAdapter) ────────────
let IcecatAdapterClass = null;
async function searchIcecat(upc, mpn, brand) {
    if (!IcecatAdapterClass) {
        const mod = await import('../services/wholesalers/IcecatAdapter.js');
        IcecatAdapterClass = mod.IcecatAdapter;
    }
    const res = await IcecatAdapterClass.fetchProductImage(upc, mpn, brand);
    if (res && res.mainImage) {
        const urls = [res.mainImage, ...(res.gallery || [])];
        return [...new Set(urls)].slice(0, MAX_IMAGES_PER_PRODUCT);
    }
    return [];
}

// ─── FUENTE 2: Buscador Web con Triple Candado de MPN ────────
async function searchVerifiedWeb(brand, mpn) {
    if (!mpn || mpn.trim().length < 3) return { urls: [], status: 'NO_MPN' };

    const cleanMpn = mpn.trim();
    const cleanBrand = (brand || '').trim();
    const query = `"${cleanBrand}" "${cleanMpn}"`;

    try {
        // Paso 1: Obtener token VQD de DuckDuckGo
        const mainUrl = 'https://duckduckgo.com/?q=' + encodeURIComponent(query);
        const mainResp = await fetch(mainUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8'
            },
            signal: AbortSignal.timeout(8000)
        });

        if (mainResp.status === 429) {
            return { urls: [], status: 'RATE_LIMIT' };
        }
        if (!mainResp.ok) return { urls: [], status: 'NET_ERROR' };

        const mainHtml = await mainResp.text();
        const vqdMatch = mainHtml.match(/vqd=['"]?([^&'"]+)/) || mainHtml.match(/vqd=([^&]+)/);
        if (!vqdMatch) {
            // Si la página no trae VQD puede ser bloqueo anti-bot
            if (mainHtml.includes('captcha') || mainHtml.includes('challenge')) {
                return { urls: [], status: 'CAPTCHA' };
            }
            return { urls: [], status: 'NO_VQD' };
        }

        const vqd = vqdMatch[1];

        // Paso 2: Consultar imágenes
        const imgApiUrl = `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`;
        const imgResp = await fetch(imgApiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://duckduckgo.com/'
            },
            signal: AbortSignal.timeout(8000)
        });

        if (imgResp.status === 429) return { urls: [], status: 'RATE_LIMIT' };
        if (!imgResp.ok) return { urls: [], status: 'NET_ERROR' };

        const imgJson = await imgResp.json();
        const rawResults = imgJson.results || [];

        // Paso 3: TRIPLE CANDADO ESTRICTO DE IDENTIDAD
        // Candado A: Regex con límite estricto de palabra para el MPN (evita subcadenas como CF258A vs CF258AC)
        const escapedMpn = escapeRegex(cleanMpn);
        const mpnBoundaryRegex = new RegExp(`(?<![a-zA-Z0-9])${escapedMpn}(?![a-zA-Z0-9])`, 'i');

        // Versión sin guiones para casos asimétricos
        const mpnStripped = cleanMpn.replace(/[-_.\s]/g, '');
        const mpnStrippedRegex = mpnStripped.length >= 4 
            ? new RegExp(`(?<![a-zA-Z0-9])${escapeRegex(mpnStripped)}(?![a-zA-Z0-9])`, 'i')
            : null;

        const brandNorm = cleanBrand.toLowerCase();
        const firstBrandWord = brandNorm.split(/\s+/)[0];

        const verifiedImages = [];
        for (const item of rawResults) {
            if (!item.image || !item.title) continue;
            const title = item.title;

            // 1. Candado A: El título DEBE contener el MPN exacto como palabra completa
            const titleClean = title.replace(/[-_.\s]/g, ' ');
            const matchMpn = mpnBoundaryRegex.test(title) || (mpnStrippedRegex && mpnStrippedRegex.test(titleClean));
            if (!matchMpn) continue;

            // 2. Candado B: El resultado NO debe ser un accesorio genérico o tóner compatible
            const isForbidden = FORBIDDEN_COMPATIBLE_PATTERNS.some(pat => pat.test(title));
            if (isForbidden) continue;

            // 3. Candado C: Si el producto tiene marca, verificar que la marca aparezca en el título
            if (firstBrandWord && firstBrandWord.length > 2) {
                if (!title.toLowerCase().includes(firstBrandWord)) {
                    continue; // Marca no coincide
                }
            }

            // 4. Filtro de ruido
            const imgLower = item.image.toLowerCase();
            if (imgLower.includes('sprite') || imgLower.includes('placeholder') || imgLower.includes('logo_') || imgLower.includes('favicon')) {
                continue;
            }

            verifiedImages.push(item.image);
            if (verifiedImages.length >= MAX_IMAGES_PER_PRODUCT) break;
        }

        return { urls: verifiedImages, status: 'OK' };

    } catch (err) {
        return { urls: [], status: 'NET_ERROR', error: err.message };
    }
}

// ─── Descarga y Procesamiento de Imagen ───────────────────────
async function downloadImageBuffer(url) {
    try {
        const resp = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            },
            signal: AbortSignal.timeout(10000)
        });
        if (!resp.ok) return null;
        const arrayBuf = await resp.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        if (buffer.length < 500) return null;
        return buffer;
    } catch {
        return null;
    }
}

async function optimizeAndUpload(imageBuffer, s3Key, useAI = false) {
    try {
        let processedBuffer = imageBuffer;

        if (useAI && removeBackground) {
            try {
                const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
                const resultBlob = await removeBackground(blob, { output: { format: 'image/png' } });
                const pngBuffer = Buffer.from(await resultBlob.arrayBuffer());
                processedBuffer = await sharp(pngBuffer).trim().toBuffer();
            } catch {
                processedBuffer = imageBuffer;
            }
        }

        const finalWebpBuffer = await sharp(processedBuffer)
            .resize(800, 800, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .flatten({ background: '#ffffff' })
            .sharpen()
            .webp({ quality: 82 })
            .toBuffer();

        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
            Body: finalWebpBuffer,
            ContentType: 'image/webp',
            ACL: 'public-read'
        }));

        return true;
    } catch (err) {
        console.error(`      ❌ Error al subir imagen a S3: ${err.message}`);
        return false;
    }
}

// ─── Búsqueda Orquestada de Producto ─────────────────────────
async function findImagesForProduct(prod) {
    const { upc, mpn, brand, title, category } = prod;

    // A) Si es intangible (Garantía o Licencia), asignar directamente tarjeta oficial
    if (isIntangibleProduct(title, category)) {
        return {
            urls: [getCategoryArtwork(category)],
            source: 'Insignia Oficial de Servicio/Licencia',
            isDirectLocal: true,
            isTransitoryError: false
        };
    }

    // B) Nivel 1: Icecat Oficial
    console.log(`      🔍 Nivel 1: Buscando en Icecat Oficial...`);
    const icecatUrls = await searchIcecat(upc, mpn, brand);
    if (icecatUrls.length > 0) {
        console.log(`      ✅ Icecat: ${icecatUrls.length} imagen(es) oficial(es) encontradas`);
        return { urls: icecatUrls, source: 'Icecat Oficial', isDirectLocal: false, isTransitoryError: false };
    }

    // C) Nivel 2: Web Técnica con Triple Candado de MPN
    if (mpn) {
        console.log(`      🔍 Nivel 2: Buscando en Web con Candado de MPN ("${brand}" "${mpn}")...`);
        const webRes = await searchVerifiedWeb(brand, mpn);
        
        // Si hubo fallo transitorio de red o rate limit, no aplicar placeholder aún
        if (webRes.status === 'RATE_LIMIT' || webRes.status === 'CAPTCHA' || webRes.status === 'NET_ERROR') {
            console.log(`      ⚠️ Advertencia en Nivel 2 (${webRes.status}): fallo transitorio de red`);
            return { urls: [], source: null, isDirectLocal: false, isTransitoryError: true };
        }

        if (webRes.urls.length > 0) {
            console.log(`      ✅ Web Verificada: ${webRes.urls.length} imagen(es) con MPN y Marca coincidentes`);
            return { urls: webRes.urls, source: 'Web Verificada por MPN', isDirectLocal: false, isTransitoryError: false };
        }
    }

    // D) Nivel 3: Cobertura Garantizada (Packshot Oficial de Categoría)
    // Solo se llega aquí si se buscó limpiamente y ningún fabricante tiene foto en internet
    console.log(`      📦 Nivel 3: Asignando Packshot Oficial de Categoría (${category || 'General'})...`);
    return {
        urls: [getCategoryArtwork(category)],
        source: 'Packshot Oficial de Categoría',
        isDirectLocal: true,
        isTransitoryError: false
    };
}

// ─── Proceso de Producto Individual ──────────────────────────
async function processProduct(prod, useAI) {
    const searchRes = await findImagesForProduct(prod);

    // Si hubo fallo transitorio de red, no alterar el producto para que se reintente
    if (searchRes.isTransitoryError) {
        return {
            success: false,
            transitory: true,
            reason: 'Fallo transitorio de red en búsqueda (se mantiene en cola)'
        };
    }

    // Caso A: Imagen local de categoría (Packshot oficial)
    if (searchRes.isDirectLocal && searchRes.urls.length > 0) {
        return {
            success: true,
            publicUrl: searchRes.urls[0],
            gallery: [],
            source: searchRes.source
        };
    }

    // Caso B: Descargar, optimizar y subir imágenes a S3
    let uploadedCount = 0;
    const galleryUrls = [];

    for (let i = 0; i < searchRes.urls.length; i++) {
        const s3Key = `products/${prod.ingramSku}/${i + 1}.webp`;
        const buffer = await downloadImageBuffer(searchRes.urls[i]);
        if (!buffer) continue;

        const ok = await optimizeAndUpload(buffer, s3Key, useAI && i === 0);
        if (ok) {
            const publicUrl = `${process.env.S3_PUBLIC_URL}/${s3Key}`;
            galleryUrls.push(publicUrl);
            uploadedCount++;
        }
    }

    if (uploadedCount > 0) {
        return {
            success: true,
            publicUrl: galleryUrls[0],
            gallery: galleryUrls,
            source: searchRes.source
        };
    }

    // Si falló la descarga física a S3, marcar como fallo transitorio para no quemar con placeholder
    return {
        success: false,
        transitory: true,
        reason: 'Fallo al descargar/subir archivo físico a S3'
    };
}

// ─── Robot Principal ─────────────────────────────────────────
async function run() {
    const useAI = process.argv.includes('--ai');
    const specificSku = process.argv.find(a => a.startsWith('--sku='))?.split('=')[1];

    if (useAI) {
        await loadAI();
    }

    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log('============================================================');
    console.log('🤖 ROBOT FOTOGRÁFICO V5.1 - BLINDADO CON TRIPLE CANDADO (CTI)');
    const fixDeadMode = process.argv.includes('--fix-dead');
    let deadIds = [];
    if (fixDeadMode) {
        const deadFilePath = path.resolve(__dirname, '../data/dead_icecat_products.json');
        if (fs.existsSync(deadFilePath)) {
            const deadList = JSON.parse(fs.readFileSync(deadFilePath, 'utf8'));
            deadIds = deadList.map(p => p.id);
            console.log(`🎯 Modo Reparación: ${deadIds.length} productos detectados con enlaces rotos.`);
        } else {
            console.error('❌ Archivo data/dead_icecat_products.json no encontrado.');
            process.exit(1);
        }
    }

    console.log(`   Modo: ${useAI ? '🧠 IA Activada (Recorte de fondo)' : '⚡ Rápido (Sharp 800x800)'}${fixDeadMode ? ' | 🛠️ REPARACIÓN DE ENLACES ROTOS (404)' : ''}`);
    console.log(`   Lote: ${specificSku ? '1 SKU específico (' + specificSku + ')' : BATCH_SIZE + ' productos'}`);
    console.log('   Nivel 1: Icecat Oficial (GTIN + MPN)');
    console.log('   Nivel 2: Web Técnica con Triple Candado (MPN exacto + Marca)');
    console.log('   Nivel 3: Packshots Oficiales de Categoría (Garantía de Cobertura)');
    console.log('============================================================\n');

    let totalProcesados = 0;
    const globalStartTime = Date.now();
    let hasMore = true;
    const skippedIds = new Set();

    try {
        while (hasMore) {
            let whereClause = {};
            if (specificSku) {
                whereClause = { ingramSku: specificSku };
            } else if (fixDeadMode) {
                whereClause = {
                    id: { in: deadIds },
                    imageUrl: { contains: 'icecat.biz' },
                    ...(skippedIds.size > 0 ? { id: { notIn: Array.from(skippedIds) } } : {})
                };
            } else {
                whereClause = {
                    imageUrl: null,
                    ...(skippedIds.size > 0 ? { id: { notIn: Array.from(skippedIds) } } : {})
                };
            }

            const targets = await prisma.product.findMany({
                where: whereClause,
                orderBy: [{ stock: 'desc' }, { id: 'asc' }],
                take: specificSku ? 1 : BATCH_SIZE,
                select: { id: true, ingramSku: true, title: true, mpn: true, brand: true, upc: true, category: true, stock: true }
            });

            if (targets.length === 0) {
                if (skippedIds.size > 0) {
                    console.log(`🎉 Fin del recorrido. Se procesaron todos los productos disponibles (${skippedIds.size} quedaron pendientes de reintento transitorio de red).`);
                } else {
                    console.log('🎉 ¡Catálogo 100% completo! No quedan productos pendientes.');
                }
                break;
            }

            console.log(`📋 Procesando lote de ${targets.length} productos ${fixDeadMode ? 'con enlaces rotos' : 'sin imagen'}...\n`);

            for (let i = 0; i < targets.length; i++) {
                const prod = targets[i];
                console.log(`[${i + 1}/${targets.length}] SKU: ${prod.ingramSku} | Stock: ${prod.stock} | ${prod.brand || 'Sin Marca'} | MPN: ${prod.mpn || 'N/A'}`);
                console.log(`   🏷️  ${(prod.title || '').substring(0, 60)}`);

                try {
                    const res = await processProduct(prod, useAI);

                    if (res.success) {
                        const updateData = {
                            imageUrl: res.publicUrl,
                            updatedAt: new Date()
                        };

                        // Prisma Json seguro: Si no hay galería, usar Prisma.DbNull
                        if (res.gallery && res.gallery.length > 0) {
                            updateData.gallery = res.gallery;
                        } else {
                            updateData.gallery = Prisma.DbNull;
                        }

                        await prisma.product.update({
                            where: { id: prod.id },
                            data: updateData
                        });

                        console.log(`   ✨ Asignado con éxito [${res.source}]`);
                        console.log(`   🔗 URL: ${res.publicUrl}`);
                        totalProcesados++;
                    } else if (res.transitory) {
                        console.log(`   ⏳ Reintentable: ${res.reason}`);
                        skippedIds.add(prod.id);
                    }
                } catch (itemErr) {
                    console.error(`   ❌ Error procesando SKU ${prod.ingramSku}:`, itemErr.message);
                    skippedIds.add(prod.id);
                }

                if (i < targets.length - 1) {
                    await new Promise(r => setTimeout(r, DELAY_MS));
                }
                console.log('');
            }

            // Si es SKU específico o no está activado el modo continuo, terminar después de un lote
            if (specificSku || !RUN_CONTINUOUS) {
                hasMore = false;
            }
        }

        const elapsed = ((Date.now() - globalStartTime) / 1000).toFixed(1);
        console.log('============================================================');
        console.log(`✅ Lote finalizado con éxito: ${totalProcesados} productos asignados`);
        console.log(`⏱️  Tiempo total: ${elapsed} segundos`);
        console.log('============================================================\n');

    } catch (err) {
        console.error('💥 Error crítico en el robot:', err);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

run();
