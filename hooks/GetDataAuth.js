import { Router, withRouter } from 'next/router';
import { getApiUrl } from './useApi';

/**
 * Hook para hacer requests GET autenticados a la API
 * @param {string} endpoint - Endpoint de la API (ej: '/profile/resume/')
 * @param {string} token - Token de autenticación
 * @returns {Promise<Response>} Response de fetch
 */
const fetchData = async (endpoint, token) => {
	const apiUrl = getApiUrl();
	// Asegurar que el endpoint comience con /
	const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	const urlComplete = `${apiUrl}${normalizedEndpoint}`;

	return await fetch(urlComplete, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export default fetchData;
