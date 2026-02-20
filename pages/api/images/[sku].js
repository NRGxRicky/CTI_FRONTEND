import fs from 'fs';
import path from 'path';

const extensions = ['.webp', '.jpg', '.jpeg', '.png'];

// Lee el directorio una sola vez por instancia (cache en memoria)
let cachedFiles = null;
let cachedImagesPath = null;

function getImageFiles(imagesPath) {
    if (cachedFiles && cachedImagesPath === imagesPath) {
        return cachedFiles;
    }
    try {
        cachedFiles = fs.existsSync(imagesPath) ? fs.readdirSync(imagesPath) : [];
        cachedImagesPath = imagesPath;
    } catch {
        cachedFiles = [];
    }
    return cachedFiles;
}

// Devuelve el mejor candidato dando prioridad a los que contienen "-1."
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

export default async function handler(req, res) {
    const { sku } = req.query;

    if (!sku) {
        return res.status(400).json({ error: 'SKU is required' });
    }

    const imagesPath = process.env.IMAGES_PATH || '/app/images';
    const allFiles = getImageFiles(imagesPath);

    if (!fs.existsSync(imagesPath)) {
        console.log(`❌ La carpeta ${imagesPath} NO EXISTE.`);
        return res.status(404).json({ error: 'Images directory not found' });
    }

    // ---------------------------------------------------------
    // ESTRATEGIA 1: Búsqueda exacta SKU-1.ext y SKU.ext
    // Ejemplos: 7503030358651-Y-1.webp, HDWT720UZSVA-1.webp
    // ---------------------------------------------------------
    for (const ext of extensions) {
        const p1 = path.join(imagesPath, `${sku}-1${ext}`);
        if (fs.existsSync(p1)) return serveImage(res, p1, ext);

        const p2 = path.join(imagesPath, `${sku}${ext}`);
        if (fs.existsSync(p2)) return serveImage(res, p2, ext);
    }

    // ---------------------------------------------------------
    // ESTRATEGIA 2: Búsqueda fuzzy (archivos que empiezan con SKU)
    // Útil para variantes como SKU-S-1.webp, SKU-V-1.webp
    // ---------------------------------------------------------
    const fuzzy = allFiles.filter(f => f.startsWith(`${sku}-`) || f.startsWith(`${sku}.`));
    const bestFuzzy = pickBest(fuzzy);
    if (bestFuzzy) {
        const ext = path.extname(bestFuzzy).toLowerCase();
        return serveImage(res, path.join(imagesPath, bestFuzzy), ext);
    }

    // ---------------------------------------------------------
    // ESTRATEGIA 3: Subcarpeta /images/SKU/imagen.ext
    // ---------------------------------------------------------
    const skuFolder = path.join(imagesPath, sku);
    if (fs.existsSync(skuFolder) && fs.lstatSync(skuFolder).isDirectory()) {
        try {
            const files = fs.readdirSync(skuFolder);
            const img = files.find(f => extensions.includes(path.extname(f).toLowerCase()));
            if (img) {
                const ext = path.extname(img).toLowerCase();
                return serveImage(res, path.join(skuFolder, img), ext);
            }
        } catch { /* ignorar */ }
    }

    // ---------------------------------------------------------
    // FALLBACK: placeholder not-available.png
    // ---------------------------------------------------------
    console.log('❌ Image not found for SKU:', sku);

    const placeholder = path.join(process.cwd(), 'public', 'images', 'not-available.png');
    if (fs.existsSync(placeholder)) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.status(200).send(fs.readFileSync(placeholder));
    }

    return res.status(404).json({ error: 'Image not found', sku });
}

function serveImage(res, filePath, ext) {
    try {
        const contentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
        }[ext.toLowerCase()] || 'image/jpeg';

        console.log('✅ Serving:', filePath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.status(200).send(fs.readFileSync(filePath));
    } catch (error) {
        console.error('Error serving image:', error);
        return res.status(500).json({ error: 'Error serving image' });
    }
}
