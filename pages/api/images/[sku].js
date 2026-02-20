import fs from 'fs';
import path from 'path';

const extensions = ['.webp', '.jpg', '.jpeg', '.png'];

// Helper: buscar candidatos que empiecen con un prefijo dado
function findCandidates(allFiles, prefix) {
    return allFiles.filter(file =>
        file.startsWith(`${prefix}-`) || file.startsWith(`${prefix}.`)
    );
}

// Helper: escoger el mejor candidato (priorizar el que tenga "-1.")
function pickBest(candidates) {
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
        const aIsPrimary = a.includes('-1.');
        const bIsPrimary = b.includes('-1.');
        if (aIsPrimary && !bIsPrimary) return -1;
        if (!aIsPrimary && bIsPrimary) return 1;
        return a.length - b.length;
    });
    return candidates[0];
}

// Helper: obtener el SKU base quitando sufijos de variante como -Y, -A, -K, -M, -P, -T, -RE
function getBaseSku(sku) {
    // Quitar sufijo de 1-2 letras mayúsculas al final (ej: -Y, -A, -RE)
    return sku.replace(/-[A-Z]{1,3}$/, '');
}

export default async function handler(req, res) {
    const { sku } = req.query;

    if (!sku) {
        return res.status(400).json({ error: 'SKU is required' });
    }

    const imagesPath = process.env.IMAGES_PATH || '/app/images';
    const baseSku = getBaseSku(sku);

    console.log('🖼️  Image Request:', { sku, baseSku, imagesPath });

    // Leer directorio una sola vez
    let allFiles = [];
    if (fs.existsSync(imagesPath)) {
        try {
            allFiles = fs.readdirSync(imagesPath);
        } catch (err) {
            console.error('❌ Error leyendo directorio:', err);
        }
    } else {
        console.log(`❌ La carpeta ${imagesPath} NO EXISTE.`);
        return res.status(404).json({ error: 'Images directory not found' });
    }

    // ---------------------------------------------------------
    // ESTRATEGIA DE BÚSQUEDA (intenta con SKU completo y base)
    // ---------------------------------------------------------
    const skusToTry = sku === baseSku ? [sku] : [sku, baseSku];

    for (const skuAttempt of skusToTry) {
        // 1. Búsqueda Exacta
        for (const ext of extensions) {
            const exactPath = path.join(imagesPath, `${skuAttempt}-1${ext}`);
            if (fs.existsSync(exactPath)) {
                return serveImage(res, exactPath, ext);
            }
            const exactPathBase = path.join(imagesPath, `${skuAttempt}${ext}`);
            if (fs.existsSync(exactPathBase)) {
                return serveImage(res, exactPathBase, ext);
            }
        }

        // 2. Búsqueda Fuzzy: encontrar cualquier archivo que empiece con skuAttempt
        const candidates = findCandidates(allFiles, skuAttempt);
        const best = pickBest(candidates);
        if (best) {
            const matchPath = path.join(imagesPath, best);
            const ext = path.extname(best).toLowerCase();
            return serveImage(res, matchPath, ext);
        }
    }

    // 3. Búsqueda en Subcarpeta (estructura de carpetas)
    for (const skuAttempt of skusToTry) {
        const skuFolderPath = path.join(imagesPath, skuAttempt);
        if (fs.existsSync(skuFolderPath) && fs.lstatSync(skuFolderPath).isDirectory()) {
            try {
                const files = fs.readdirSync(skuFolderPath);
                const validImage = files.find(file =>
                    extensions.includes(path.extname(file).toLowerCase())
                );
                if (validImage) {
                    const imagePath = path.join(skuFolderPath, validImage);
                    const ext = path.extname(validImage).toLowerCase();
                    return serveImage(res, imagePath, ext);
                }
            } catch (err) {
                console.error('Error reading SKU folder:', err);
            }
        }
    }

    // ---------------------------------------------------------
    // FALLBACK
    // ---------------------------------------------------------
    console.log('❌ Image not found for SKU:', sku, '| baseSku:', baseSku);

    const placeholderPath = path.join(process.cwd(), 'public', 'images', 'not-available.png');
    if (fs.existsSync(placeholderPath)) {
        const placeholderBuffer = fs.readFileSync(placeholderPath);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.status(200).send(placeholderBuffer);
    }

    return res.status(404).json({ error: 'Image not found', sku });
}

function serveImage(res, filePath, ext) {
    try {
        const imageBuffer = fs.readFileSync(filePath);

        const contentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
        }[ext] || 'image/jpeg';

        console.log('✅ Serving:', filePath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.status(200).send(imageBuffer);
    } catch (error) {
        console.error('Error serving image:', error);
        return res.status(500).json({ error: 'Error serving image' });
    }
}
