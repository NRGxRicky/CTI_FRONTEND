import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { sku } = req.query;

    if (!sku) {
        return res.status(400).json({ error: 'SKU is required' });
    }

    // Ruta a las imágenes (configurable por entorno)
    const imagesPath = process.env.IMAGES_PATH || '/app/images';

    console.log('🖼️  Image Request:', { sku, imagesPath });

    // ---------------------------------------------------------
    // DEBUG: Listar archivos para ver qué hay en la carpeta
    // ---------------------------------------------------------
    try {
        if (fs.existsSync(imagesPath)) {
            const filesInDir = fs.readdirSync(imagesPath);
            console.log(`📂 Contenido de ${imagesPath} (${filesInDir.length} archivos):`, filesInDir.slice(0, 5)); // Mostrar solo los primeros 5
        } else {
            console.log(`❌ La carpeta ${imagesPath} NO EXISTE.`);
        }
    } catch (err) {
        console.error('❌ Error leyendo directorio:', err);
    }

    // ---------------------------------------------------------
    // ESTRATEGIA DE BÚSQUEDA DE IMÁGENES
    // ---------------------------------------------------------

    // 1. Búsqueda Exacta (Prioridad Alta)
    // Busca archivos como: SKU-1.jpg, SKU.jpg
    for (const pattern of [`${sku}-1`, sku]) {
        for (const ext of extensions) {
            const exactPath = path.join(imagesPath, `${pattern}${ext}`);
            if (fs.existsSync(exactPath)) {
                return serveImage(res, exactPath, ext);
            }
        }
    }

    // 2. Búsqueda "Fuzzy" en directorio plano (Prioridad Media)
    // Busca archivos que EMPIECEN con el SKU, útil para variaciones como:
    // 7503023637008-S-1.webp, 7503023637008-V-1.webp
    if (fs.existsSync(imagesPath) && fs.lstatSync(imagesPath).isDirectory()) {
        try {
            const allFiles = fs.readdirSync(imagesPath);

            // Filtrar archivos que empiezan con el SKU
            const candidates = allFiles.filter(file =>
                file.startsWith(`${sku}-`) || file.startsWith(`${sku}.`)
            );

            if (candidates.length > 0) {
                // Ordenar candidatos para preferir "-1" o los más cortos
                // Ejemplo: Preferir SKU-1.jpg sobre SKU-10.jpg
                candidates.sort((a, b) => {
                    const aIsPrimary = a.includes('-1.');
                    const bIsPrimary = b.includes('-1.');
                    if (aIsPrimary && !bIsPrimary) return -1;
                    if (!aIsPrimary && bIsPrimary) return 1;
                    return a.length - b.length; // Preferir nombres más cortos
                });

                const bestMatch = candidates[0];
                const matchPath = path.join(imagesPath, bestMatch);
                const ext = path.extname(bestMatch).toLowerCase();
                return serveImage(res, matchPath, ext);
            }
        } catch (err) {
            console.error('Error scanning images directory:', err);
        }
    }

    // 3. Búsqueda en Subcarpeta (Prioridad Baja - Estructura PCH nueva)
    // Busca en /images/SKU/cualquier_cosa.jpg
    const skuFolderPath = path.join(imagesPath, sku);
    if (fs.existsSync(skuFolderPath) && fs.lstatSync(skuFolderPath).isDirectory()) {
        try {
            const files = fs.readdirSync(skuFolderPath);
            const validImage = files.find(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.webp', '.jpg', '.jpeg', '.png'].includes(ext);
            });

            if (validImage) {
                const imagePath = path.join(skuFolderPath, validImage);
                const ext = path.extname(validImage).toLowerCase();
                return serveImage(res, imagePath, ext);
            }
        } catch (err) {
            console.error('Error reading SKU folder:', err);
        }
    }

    // ---------------------------------------------------------
    // FALLBACK
    // ---------------------------------------------------------
    console.log('❌ Image not found for SKU:', sku);

    const placeholderPath = path.join(process.cwd(), 'public', 'images', 'not-available.png');

    if (fs.existsSync(placeholderPath)) {
        const placeholderBuffer = fs.readFileSync(placeholderPath);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.status(200).send(placeholderBuffer);
    }

    return res.status(404).json({ error: 'Image not found', sku });
}

// Helper para servir la imagen con los headers correctos
function serveImage(res, filePath, ext) {
    try {
        const imageBuffer = fs.readFileSync(filePath);

        const contentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.JPG': 'image/jpeg',
            '.JPEG': 'image/jpeg',
            '.PNG': 'image/png',
            '.WEBP': 'image/webp',
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
