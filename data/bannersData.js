/**
 * Configuración de banners locales para el carrusel principal
 * 
 * Instrucciones para agregar nuevos banners:
 * 1. Coloca tu imagen en la carpeta /public/banners/
 * 2. Agrega un nuevo objeto al array con:
 *    - id: número único
 *    - nombre: descripción del banner (para SEO)
 *    - imagen: ruta desde /public (ejemplo: "/banners/mi-banner.jpg")
 *    - enlace: URL a la que redirige al hacer clic
 */

export const bannersData = {
    results: [
        {
            id: 1,
            nombre: 'Banner Personalizado 1',
            imagen: '/banners/unnamed (1).webp',
            enlace: '/',
        },
        {
            id: 2,
            nombre: 'Banner Personalizado 2',
            imagen: '/banners/unnamed (2).webp',
            enlace: '/',
        },
        {
            id: 3,
            nombre: 'Banner Personalizado 3',
            imagen: '/banners/unnamed (3).webp',
            enlace: '/',
        },
        // 🎯 AGREGAR MÁS BANNERS AQUÍ
        // {
        // 	id: 7,
        // 	nombre: 'Tu nuevo banner',
        // 	imagen: '/banners/tu-imagen.jpg',
        // 	enlace: '/tu-categoria',
        // },
    ],
};
