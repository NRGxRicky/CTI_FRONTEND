const FetchGetDetailProduct = async (slug) => {
	return await fetch(`https://api.pccdnapi.com/${slug}`)
		.then((data) => data.json())
		.then((res) => ({
			item: res,
		}))
		.catch(() => ({
			item: null,
		}));
};

export default FetchGetDetailProduct;
