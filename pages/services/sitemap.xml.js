// pages/services/sitemap.xml.js

export async function getServerSideProps({ res }) {
  // Aquí debes obtener el storeId de alguna manera en el servidor.
  // Como no puedes usar hooks de React en getServerSideProps,
  // es recomendable usar una variable de entorno o algún otro mecanismo.
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || 'pcstore';
  const sitemapUrl = `https://api.pccdnapi.com/services/${storeId}/sitemap.xml`;

  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    res.statusCode = response.status;
    res.end();
    return { props: {} };
  }
  const sitemap = await response.text();

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  // Este componente nunca se renderiza en el navegador, ya que
  // la respuesta se envía directamente desde getServerSideProps.
  return null;
}
