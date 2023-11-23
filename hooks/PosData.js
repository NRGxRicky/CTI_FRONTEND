import { Router } from 'next/router';

const API_URL = 'https://api.pccdnapi.com';
const API_URL_x = 'http://api.pccomputo.local:8000';

const makeUrl = async (endpoint) => API_URL + endpoint;

const PostData = async (
	url,
	token,
	sendData = {},
	method = 'POST',
	auth = true
) => {
	const urlComplete = await makeUrl(url);
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
