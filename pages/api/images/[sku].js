import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { sku } = req.query;

    if (!sku) {
        return res.status(400).json({ error: 'SKU is required' });
    }

    // Ruta a las imágenes (configurable por entorno)
    const imagesPath = process.env.IMAGES_PATH || 'C:\\Users\\delfi\\Documents\\imagenespch\\gallerypch';

    console.log('🖼️  Image Request:', { sku, imagesPath });

    // Patrones de búsqueda - archivo real encontrado: HDTB410XK3AA-1.webp
    // Usar GUION (-) no guion bajo (_)
    const patterns = [
        `${sku}-1`,    // Imagen principal (patrón real confirmado)
        `${sku}-2`,    // Segunda imagen
        `${sku}-3`,    // Tercera imagen  
        sku,           // Sin sufijo (por si acaso)
    ];

    const extensions = ['.webp', '.jpg', '.jpeg', '.png', '.WEBP', '.JPG', '.JPEG', '.PNG'];

    for (const pattern of patterns) {
        for (const ext of extensions) {
            const imagePath = path.join(imagesPath, `${pattern}${ext}`);

            if (fs.existsSync(imagePath)) {
                console.log('✅ Found:', imagePath);
                // Leer la imagen
                const imageBuffer = fs.readFileSync(imagePath);

                // Determinar el content-type
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

                // Enviar la imagen
                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache por 1 año
                return res.status(200).send(imageBuffer);
            }
        }
    }

    console.log('❌ Image not found for SKU:', sku);

    // Devolver imagen placeholder directamente (compatible con Next.js Image)
    const placeholderPath = path.join(process.cwd(), 'public', 'images', 'not-available.png');

    if (fs.existsSync(placeholderPath)) {
        const placeholderBuffer = fs.readFileSync(placeholderPath);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache 5 minutos
        return res.status(200).send(placeholderBuffer);
    }

    // Si no existe el placeholder, devolver 404
    return res.status(404).json({ error: 'Image not found', sku });
}
