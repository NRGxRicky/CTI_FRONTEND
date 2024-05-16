const fetchFilterData = async (
	q,
	order,
	page,
	filter_available,
	filter_available_store,
	filter_free_shipping,
	filter_discount,
	brands,
	categories,
	attributes,
	marca,
	categoria
) => {
	let url = `https://api.pccdnapi.com/filters/listado/available?q=${q}&order=${order}&page=${page}&filter_available=${filter_available}&filter_available_store=${filter_available_store}&filter_free_shipping=${filter_free_shipping}&filter_discount=${filter_discount}&marca=${marca}&categoria=${categoria}`;

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
			count: res.count,
			available_store_count: res.available_store_count,
			available_count: res.available_count,
			free_shipping_count: res.free_shipping_count,
			available_discount: res.available_discount,
			brands: res.brands,
			categories: res.categories,
			attributes: res.attributes,
		}))
		.catch(() => ({
			count: 0,
			available_count: 0,
			available_store_count: 0,
			free_shipping_count: 0,
			available_discount: 0,
			brands: [],
			categories: [],
			attributes: [],
		}));
};

export default fetchFilterData;
