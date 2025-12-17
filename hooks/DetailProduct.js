import { getApiUrl } from './useApi';

const FetchGetDetailProduct = async (slug) => {
	const apiUrl = getApiUrl();
	return await fetch(`${apiUrl}/${slug}`)
		.then((data) => data.json())
		.then((res) => ({
			item: res,
		}))
		.catch(() => ({
			item: null,
		}));
};

export default FetchGetDetailProduct;
