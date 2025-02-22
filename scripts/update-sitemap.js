// scripts/update-sitemap.js
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Si usas Node.js 18+ puedes usar el global fetch

async function updateSitemap() {
  try {
    // Obtén el storeId desde las variables de entorno o configúralo manualmente
    const storeId = process.env.NEXT_PUBLIC_STORE_ID;
    const sitemapUrl = `https://api.pccdnapi.com/services/${storeId}/sitemap.xml`;

    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      throw new Error(`Error al descargar el sitemap: ${response.status}`);
    }
    const sitemapContent = await response.text();

    // Guarda el archivo en public/services/sitemap.xml
    const publicPath = path.join(__dirname, '../public/services/sitemap/sitemap.xml');
    fs.writeFileSync(publicPath, sitemapContent, 'utf8');
    console.log('Sitemap actualizado correctamente.');
  } catch (error) {
    console.error('Error al actualizar el sitemap:', error);
  }
}

updateSitemap();