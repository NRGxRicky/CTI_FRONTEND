/**
 * Cliente de API autenticado para pchtest.to-do.mx
 * Maneja las peticiones con customer y key requeridos
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pchtest.to-do.mx';
const API_CUSTOMER = process.env.NEXT_PUBLIC_API_CUSTOMER || '81276';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0idYtk';

/**
 * Realiza una petición autenticada a la API
 * @param {string} endpoint - Endpoint de la API (sin el prefijo /extcust/)
 * @param {object} additionalData - Datos adicionales para el body
 * @returns {Promise<object>} - Respuesta de la API
 */
export async function authenticatedFetch(endpoint, additionalData = {}) {
    const url = `${API_BASE_URL}/extcust/${endpoint}`;

    const body = {
        customer: API_CUSTOMER,
        key: API_KEY,
        sku: '', // Requerido según documentación
        ...additionalData,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Verificar si la API devolvió un error
        if (data.status !== 200) {
            throw new Error(data.message || 'API Error');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Obtiene el listado de productos
 * @returns {Promise<object>} - Listado de productos
 */
export async function getProductList() {
    return authenticatedFetch('getprodlist/');
}

/**
 * Obtiene detalles de un producto específico
 * @param {string} sku - SKU del producto
 * @returns {Promise<object>} - Detalles del producto
 */
export async function getProductDetail(sku) {
    return authenticatedFetch('getprodlist/', { sku });
}

/**
 * Obtiene la URL base para imágenes de productos
 * @returns {string} - URL base de imágenes
 */
export function getImageBaseUrl() {
    return 'https://www.pchmayoreo.com/archivos';
}

/**
 * Construye URL completa de imagen de producto
 * @param {string} imagePath - Ruta relativa de la imagen
 * @returns {string} - URL completa de la imagen
 */
export function buildImageUrl(imagePath) {
    if (!imagePath) return '/images/placeholder-product.png';

    // Si ya es una URL completa, devolverla tal cual
    if (imagePath.startsWith('http')) return imagePath;

    // Construir URL completa
    const baseUrl = getImageBaseUrl();
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
}
