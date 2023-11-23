const fetchData = async (
	q,
	order,
	page,
	filter_available,
	filter_available_store,
	filter_free_shipping,
	brands,
	categories,
	attributes,
	marca,
	categoria,
	page_size
) => {
	let url = `https://api.pccdnapi.com/listado?q=${q}&order=${order}&page=${page}&filter_available=${filter_available}&filter_available_store=${filter_available_store}&filter_free_shipping=${filter_free_shipping}&marca=${marca}&categoria=${categoria}&page_size=${page_size}`;

	brands.forEach((brand) => (url += `&brands=${brand}`));
	categories.forEach((category) => {
		if (category.includes(',')) {
			let arr = category.split(',');
			arr.forEach(
				(internalCategory) => (url += `&categories=${internalCategory}`)
			);
		} else {
			url += `&categories=${category}`;
		}
	});
	attributes.forEach((attribute) => {
		if (attribute.includes(',')) {
			let arr = attribute.split(',');
			arr.forEach(
				(internalAttribute) => (url += `&attributes=${internalAttribute}`)
			);
		} else {
			url += `&attributes=${attribute}`;
		}
	});

	return await fetch(url)
		.then((data) => data.json())
		.then((res) => ({
			results: res.results,
			count: res.count,
			breadcrumblist: res.breadcrumblist,
			brand: res.brand
		}))
		.catch(() => ({
			results: [],
			count: 0,
			breadcrumblist: [],
			brand: { name: null, slug: null }
		}));
};

export default fetchData;
