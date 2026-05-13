const FetchGetDetailProduct = async (slug) => {
	try {
		// Buscamos el producto directamente por SKU usando el endpoint optimizado del proxy.
		// Este endpoint busca en el catálogo COMPLETO (sin límite) y devuelve el stock
		// correcto calculado desde stockMap (extcust/getprodstock, suma de todos los almacenes).

		const isServer = typeof window === 'undefined';
		const baseUrl = isServer
			? 'http://localhost:3000'
			: '';

		let response;
		let lastError;
		const maxRetries = 3;

		for (let i = 0; i < maxRetries; i++) {
			try {
				// Endpoint de detalle por SKU — busca en todo el catálogo, no solo los primeros N
				response = await fetch(`${baseUrl}/api/proxy/section?sku=${encodeURIComponent(slug)}`);
				if (response.ok) {
					break; // Si es exitoso, salimos del loop de reintentos
				}
			} catch (err) {
				lastError = err;
				if (i === maxRetries - 1) throw err; // Si es el último intento, lanzamos el error
				console.warn(`⚠️ Timeout/Error en intento ${i + 1} para ${slug}. Reintentando en 1s...`);
				// Esperamos 1 segundo antes del siguiente intento
				await new Promise(res => setTimeout(res, 1000));
			}
		}

		if (!response || !response.ok) {
			throw new Error(`API error: ${response ? response.status : (lastError?.message || 'Timeout Error')}`);
		}

		const data = await response.json();

		// El endpoint retorna { result: producto } cuando se busca por SKU
		const producto = data.result;

		if (!producto) {
			console.log(`Product not found: ${slug}`);
			return { item: null };
		}

		// El producto ya viene con stock_total, precio_contado, precio_final
		// correctamente calculados por transformProduct() en el proxy.
		// Priorizar la URL de imagen de la base de datos (Icecat) sobre la local
		const imageUrl = producto.imageUrl || (producto.sku ? `/api/images/${producto.sku}` : null);
		const item = {
			...producto,
			// Preservar el id numérico de la BD para el carrito (Number(sku) = NaN → rompe Prisma)
			id: producto.id,
			slug: producto.sku,
			// Imagen del producto — ProductGallery requiere imagen1m para mostrar la imagen
			imagen1s: imageUrl,
			imagen1m: imageUrl,   // ← REQUERIDO por ProductGallery
			imagen1xs: imageUrl,
			imagen1l: imageUrl,
			imagen_principal: imageUrl,
			portada: imageUrl,
			// stock_total ya viene correcto del proxy (suma de todos los almacenes)
			// via transformProduct() → stockMap.get(sku)
			stock_total: producto.stock_total ?? producto.stock ?? 0,
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
