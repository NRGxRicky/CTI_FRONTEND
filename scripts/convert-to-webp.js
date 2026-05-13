const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directorio objetivo (puede modificarse)
const imagesDir = path.join(process.cwd(), 'public', 'images', 'products');

// Recorrer el directorio recursivamente
const getAllFiles = function(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

async function processImages() {
  if (!fs.existsSync(imagesDir)) {
    console.log(`❌ El directorio ${imagesDir} no existe.`);
    return;
  }

  const allFiles = getAllFiles(imagesDir);
  const imageFiles = allFiles.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext);
  });

  console.log(`Encontradas ${imageFiles.length} imágenes (PNG/JPG) para revisar/convertir a WebP.`);

  let successCount = 0;
  let skipCount = 0;

  for (const file of imageFiles) {
    const dir = path.dirname(file);
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    const webpPath = path.join(dir, `${basename}.webp`);

    // Si ya existe la versión WebP, nos la saltamos
    if (fs.existsSync(webpPath)) {
      skipCount++;
      continue;
    }

    try {
      await sharp(file)
        .webp({ quality: 80, effort: 6 }) // Alta compresión y buena calidad
        .toFile(webpPath);
      
      console.log(`✅ Convertido: ${path.basename(dir)}/${basename}.webp`);
      successCount++;
      
      // Opcional: Si quieres borrar la original tras éxito, descomenta la siguiente línea
      // fs.unlinkSync(file);
    } catch (err) {
      console.error(`❌ Error al convertir ${file}:`, err.message);
    }
  }

  console.log(`\n🎉 Resumen de Conversión a WebP:`);
  console.log(`- Nuevas convertidas: ${successCount}`);
  console.log(`- Omitidas (ya eran webp): ${skipCount}`);
  console.log(`\nTip: Revisa la carpeta public/images/products. Puedes borrar los .png/.jpg originales para liberar espacio en el disco duro una vez valides que todo carga correctamente.`);
}

processImages();
