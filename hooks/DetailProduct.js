import { getApiUrl } from './useApi';

const FetchGetDetailProduct = async (slug) => {
	// En el servidor (getServerSideProps), siempre usar la API directamente
	// porque el proxy API no funciona en server-side
	const isServer = typeof window === 'undefined';
	const apiUrl = isServer
		? (process.env.NEXT_PUBLIC_API_URL || 'https://api.pccdnapi.com')
		: getApiUrl();

	return await fetch(`${apiUrl}/${slug}`)
		.then((data) => data.json())
		.then((res) => ({
			item: res,
		}))
		.catch((error) => {
			console.error('Error fetching product:', error);
			return {
				item: null,
			};
		});
};

export default FetchGetDetailProduct;

