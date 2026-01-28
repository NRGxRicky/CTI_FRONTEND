import { useEnv } from '../context/EnvContext';

/**
 * Hook personalizado para realizar fetch requests con headers configurados
 * @returns {Object} Objeto con buildUrl y apiFetch
 */
export function useApi() {
  const { apiUrl, storeId } = useEnv();

  /**
   * Construye una URL completa para un endpoint
   * @param {string} endpoint - El endpoint de la API (ej: '/section', '/profile/resume/')
   * @returns {string} URL completa
   */
  const buildUrl = (endpoint) => {
    // Asegurarse de que el endpoint empiece con /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // SIEMPRE usar el proxy API para evitar problemas de CORS
    // El proxy maneja la autenticación con X-Store-ID header
    return `/api/proxy${normalizedEndpoint}`;
  };

  /**
   * Wrapper de fetch que incluye headers necesarios
   * @param {string} endpoint - El endpoint de la API
   * @param {RequestInit} options - Opciones de fetch
   * @returns {Promise<Response>} Response de fetch
   */
  const apiFetch = async (endpoint, options = {}) => {
    const url = buildUrl(endpoint);

    // Combinar headers por defecto con los proporcionados
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Store-ID': storeId || 'cti',
      ...(options.headers || {}),
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return {
    apiUrl,
    buildUrl,
    apiFetch,
  };
}

/**
 * Helper function para componentes que no usan hooks
 * @returns {string} URL de la API
 */
export function getApiUrl() {
  // Siempre usar el proxy API para evitar CORS
  return '/api/proxy';
}
