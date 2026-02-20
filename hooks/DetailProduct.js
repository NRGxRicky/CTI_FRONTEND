const FetchGetDetailProduct = async (slug) => {
	try {
		// La nueva API no tiene endpoint de detalle individual
		// Necesitamos buscar el producto en el listado completo por SKU

		const isServer = typeof window === 'undefined';
		const baseUrl = isServer
			? 'http://localhost:3000'
			: '';

		// Obtener todos los productos del proxy
		const response = await fetch(`${baseUrl}/api/proxy/section?type=-created&marca=all&categoria=index&q=`);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();

		// Buscar el producto por SKU (el slug es el SKU)
		const producto = data.results?.find(p => p.sku === slug);

		if (!producto) {
			console.log(`Product not found: ${slug}`);
			return { item: null };
		}

		// Adaptar el producto al formato esperado por la página de detalle
		const imageUrl = producto.sku ? `/api/images/${producto.sku}` : null;
		const item = {
			...producto,
			id: producto.sku,
			slug: producto.sku,
			// Imagen del producto — ProductGallery requiere imagen1m para mostrar la imagen
			imagen1s: imageUrl,
			imagen1m: imageUrl,   // ← REQUERIDO por ProductGallery
			imagen1xs: imageUrl,
			imagen1l: imageUrl,
			imagen_principal: imageUrl,
			portada: imageUrl,
			// Campos adicionales que podrían faltar
			stock_total: producto.stock || producto.inventario?.reduce((sum, inv) => sum + (inv.cantidad || 0), 0) || 0,
			compatibleProductos: [],
			breadcrumblist: [],
			parent__slug: producto.seccion?.toLowerCase() || 'index',
			categoria: producto.linea || '',
			specs: {},
			specs_resume: {},  // Agregar specs_resume vacío para evitar error undefined
			mediafiles: [],    // Agregar mediafiles vacío para evitar error undefined
		};

		return { item };

	} catch (error) {
		console.error('Error fetching product:', error);
		return { item: null };
	}
};

export default FetchGetDetailProduct;
