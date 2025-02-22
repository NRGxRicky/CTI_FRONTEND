// pages/robots.txt.js
export async function getServerSideProps({ req, res }) {
  // Obtén el storeId de una variable de entorno o, si lo deseas, extráelo del host.
  // Por ejemplo, si usas una variable de entorno:
  const storeId = process.env.NEXT_PUBLIC_PAGE_URL;

  // Si prefieres derivarlo del host, podrías hacer algo como:
  // const storeId = req.headers.host.split('.')[0];

  // Construye el contenido de robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow:

Sitemap: ${storeId}/services/sitemap/sitemap.xml`;

  // Establece el header Content-Type a text/plain y envía la respuesta
  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();

  return { props: {} };
}

export default function Robots() {
  // Esta página no se renderiza en el navegador.
  return null;
}