import { Router } from 'next/router';
import { getApiUrl } from './useApi';

/**
 * Hook para hacer requests POST/PUT/DELETE autenticados a la API
 * @param {string} endpoint - Endpoint de la API (ej: '/profile/resume/')
 * @param {string} token - Token de autenticación
 * @param {Object} sendData - Datos a enviar en el body
 * @param {string} method - Método HTTP (POST, PUT, DELETE)
 * @param {boolean} auth - Si requiere autenticación
 * @returns {Promise<[Response, Object]>} Tupla con response y data parseada
 */
const PostData = async (
	endpoint,
	token,
	sendData = {},
	method = 'POST',
	auth = true
) => {
	const apiUrl = getApiUrl();
	// Asegurar que el endpoint comience con /
	const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	const urlComplete = `${apiUrl}${normalizedEndpoint}`;

	const headers = {
		'Content-Type': 'application/json',
	};

	if (auth) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const res = await fetch(urlComplete, {
		method: method,
		headers: headers,
		body: JSON.stringify(sendData),
	});

	if (res.status === 401 || res.status === 400) {
		console.clear();
	}

	return [res, await res.json()];
};

export default PostData;
