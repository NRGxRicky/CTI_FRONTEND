import { Router, withRouter } from 'next/router';

const API_URL = 'https://api.pccdnapi.com';
const API_URLx = 'http://api.pccomputo.local:8000';

const makeUrl = async (endpoint) => API_URL + endpoint;
const fetchData = async (url, token) => {
	const urlComplete = await makeUrl(url);
	return await fetch(urlComplete, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
};

export default fetchData;
