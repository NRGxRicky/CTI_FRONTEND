import { getProductList } from '../lib/apiClient';

/**
 * Hook para obtener listado de productos desde la nueva API
 * Adaptado para usar autenticación con customer/key
 */
const fetchData = async (
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
	categoria,
	page_size
) => {
	try {
		// Llamar a la nueva API
		const response = await getProductList();

		// Verificar respuesta exitosa
		if (response.status !== 200) {
			throw new Error(response.message || 'Error al obtener productos');
		}

		// Extraer productos del response
		const productos = response.data?.productos || [];

		// Aplicar filtros localmente
		let filteredProducts = productos;

		// Filtrar por búsqueda (q)
		if (q && q !== 'all') {
			filteredProducts = filteredProducts.filter(product =>
				product.descripcion?.toLowerCase().includes(q.toLowerCase()) ||
				product.sku?.toLowerCase().includes(q.toLowerCase())
			);
		}

		// Filtrar por marca
		if (marca && brands.length > 0) {
			filteredProducts = filteredProducts.filter(product =>
				brands.includes(product.marca)
			);
		}

		// Ordenar productos
		if (order) {
			filteredProducts = filteredProducts.sort((a, b) => {
				switch (order) {
					case 'price_asc':
						return a.precio_bruto - b.precio_bruto;
					case 'price_desc':
						return b.precio_bruto - a.precio_bruto;
					case 'name_asc':
						return a.descripcion.localeCompare(b.descripcion);
					case 'name_desc':
						return b.descripcion.localeCompare(a.descripcion);
					default:
						return 0;
				}
			});
		}

		// Paginación
		const pageNum = parseInt(page) || 1;
		const pageSizeNum = parseInt(page_size) || 20;
		const startIndex = (pageNum - 1) * pageSizeNum;
		const endIndex = startIndex + pageSizeNum;
		const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

		// Mapear productos al formato esperado por el frontend
		const mappedProducts = paginatedProducts.map(product => ({
			id: product.id_linea,
			sku: product.sku || product.skuFabricante,
			name: product.descripcion,
			slug: product.sku?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
			price: product.precio_bruto,
			discount_price: product.esp_price || null,
			description: product.descripcion,
			brand: product.marca,
			category: product.categoria,
			stock: product.inventario?.[0]?.cantidad || 0,
			available: product.inventario?.[0]?.cantidad > 0,
			images: [],
			attributes: product.inventario || []
		}));

		return {
			results: mappedProducts,
			count: filteredProducts.length,
			breadcrumblist: [],
			brand: { name: marca || null, slug: marca?.toLowerCase() || null }
		};

	} catch (error) {
		console.error('Error fetching products:', error);
		return {
			results: [],
			count: 0,
			breadcrumblist: [],
			brand: { name: null, slug: null }
		};
	}
};

export default fetchData;
