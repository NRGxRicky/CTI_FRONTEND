import fs from 'fs';
import path from 'path';

const extensions = ['.webp', '.jpg', '.jpeg', '.png'];

let cachedFiles = null;
let cachedImagesPath = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60000; // Refrescar lista de archivos cada 60s

function getImageFiles(imagesPath) {
    const now = Date.now();
    if (cachedFiles && cachedImagesPath === imagesPath && (now - lastCacheTime < CACHE_TTL_MS)) {
        return cachedFiles;
    }
    try {
        cachedFiles = fs.existsSync(imagesPath) ? fs.readdirSync(imagesPath) : [];
        cachedImagesPath = imagesPath;
        lastCacheTime = now;
    } catch {
        cachedFiles = [];
    }
    return cachedFiles;
}

function pickBest(candidates) {
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
        const aIs1 = a.includes('-1.');
        const bIs1 = b.includes('-1.');
        if (aIs1 && !bIs1) return -1;
        if (!aIs1 && bIs1) return 1;
        return a.length - b.length;
    });
    return candidates[0];
}

function streamImage(res, filePath, ext, statusCode = 200) {
    const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
    }[ext.toLowerCase()] || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    if (statusCode === 200) {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    } else {
        res.setHeader('Cache-Control', 'public, max-age=300');
    }
    res.status(statusCode);

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error streaming image' });
        }
    });
    stream.pipe(res);
}

export default async function handler(req, res) {
    const { sku } = req.query;

    if (!sku) {
        return res.status(400).json({ error: 'SKU is required' });
    }

    // Sanitización estricta contra Path Traversal
    const safeSku = String(sku).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!safeSku) {
        return res.status(400).json({ error: 'Invalid SKU format' });
    }

    const imagesPath = process.env.IMAGES_PATH || '/app/images';

    if (!fs.existsSync(imagesPath)) {
        return servePlaceholder(res);
    }

    const allFiles = getImageFiles(imagesPath);

    // ESTRATEGIA 1: Búsqueda exacta SKU-1.ext y SKU.ext
    for (const ext of extensions) {
        const p1 = path.join(imagesPath, `${safeSku}-1${ext}`);
        if (fs.existsSync(p1)) return streamImage(res, p1, ext);

        const p2 = path.join(imagesPath, `${safeSku}${ext}`);
        if (fs.existsSync(p2)) return streamImage(res, p2, ext);
    }

    // ESTRATEGIA 2: Búsqueda fuzzy por prefijo de SKU
    const fuzzy = allFiles.filter(f => f.startsWith(`${safeSku}-`) || f.startsWith(`${safeSku}.`));
    const bestFuzzy = pickBest(fuzzy);
    if (bestFuzzy) {
        const ext = path.extname(bestFuzzy).toLowerCase();
        return streamImage(res, path.join(imagesPath, bestFuzzy), ext);
    }

    // ESTRATEGIA 3: Subcarpeta /images/SKU/imagen.ext
    const skuFolder = path.join(imagesPath, safeSku);
    if (fs.existsSync(skuFolder)) {
        try {
            const stat = fs.lstatSync(skuFolder);
            if (stat.isDirectory()) {
                const files = fs.readdirSync(skuFolder);
                const img = files.find(f => extensions.includes(path.extname(f).toLowerCase()));
                if (img) {
                    const ext = path.extname(img).toLowerCase();
                    return streamImage(res, path.join(skuFolder, img), ext);
                }
            }
        } catch { /* ignorar */ }
    }

    return servePlaceholder(res);
}

function servePlaceholder(res) {
    const placeholder = path.join(process.cwd(), 'public', 'images', 'not-available.png');
    if (fs.existsSync(placeholder)) {
        return streamImage(res, placeholder, '.png', 404);
    }
    return res.status(404).json({ error: 'Image not found' });
}
