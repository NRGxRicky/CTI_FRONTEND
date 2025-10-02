import { useEnv } from '../context/EnvContext';

/**
 * Hook personalizado para construir URLs de la API
 * @returns {Object} Objeto con la URL base y función para construir endpoints
 */
export function useApi() {
  const { apiUrl } = useEnv();

  /**
   * Construye una URL completa para un endpoint
   * @param {string} endpoint - El endpoint de la API (ej: '/section', '/profile/resume/')
   * @returns {string} URL completa
   */
  const buildUrl = (endpoint) => {
    // Asegurarse de que el endpoint empiece con /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Remover slash final de apiUrl si existe
    const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    return `${normalizedApiUrl}${normalizedEndpoint}`;
  };

  return {
    apiUrl,
    buildUrl,
  };
}

/**
 * Helper function para componentes que no usan hooks
 * @returns {string} URL de la API
 */
export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.pccdnapi.com';
}

