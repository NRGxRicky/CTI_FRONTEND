// pages/sitemap.xml.js
export async function getServerSideProps({ res }) {
  // Obtener el storeId desde las variables de entorno
  const storeId = process.env.NEXT_PUBLIC_STORE_ID; // Asegúrate de tener definida esta variable
  const sitemapUrl = `https://api.pccdnapi.com/services/${storeId}/sitemap.xml`;
  const response = await fetch(sitemapUrl);

  if (!response.ok) {
    res.statusCode = response.status;
    res.end();
    return { props: {} };
  }

  const sitemap = await response.text();

  // Indicar que la respuesta es XML
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}