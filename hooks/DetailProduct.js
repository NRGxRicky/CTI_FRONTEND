const FetchGetDetailProduct = async (slug) => {
	try {
		const isServer = typeof window === 'undefined';
		let producto;

		if (isServer) {
			// Acceso directo a base de datos en SSR sin llamadas loopback HTTP
			const prisma = (await import('../lib/prisma')).default;
			const { getProductBySkuOrSlug, mapProductToFrontend } = await import('../services/productService');
			
			const dbProduct = await getProductBySkuOrSlug(prisma, slug);
			if (dbProduct) {
				producto = mapProductToFrontend(dbProduct);
			}
		} else {
			// Cliente/Browser fallback (si se llama desde el frontend)
			let response;
			let lastError;
			const maxRetries = 3;

			for (let i = 0; i < maxRetries; i++) {
				try {
					response = await fetch(`/api/proxy/section?sku=${encodeURIComponent(slug)}`);
					if (response.ok) {
						break;
					}
				} catch (err) {
					lastError = err;
					if (i === maxRetries - 1) throw err;
					console.warn(`⚠️ Timeout/Error en intento ${i + 1} para ${slug}. Reintentando en 1s...`);
					await new Promise(res => setTimeout(res, 1000));
				}
			}

			if (!response || !response.ok) {
				throw new Error(`API error: ${response ? response.status : (lastError?.message || 'Timeout Error')}`);
			}

			const data = await response.json();
			producto = data.result;
		}

		if (!producto) {
			console.log(`Product not found: ${slug}`);
			return { item: null };
		}

		const imageUrl = producto.imageUrl || (producto.sku ? `/api/images/${producto.sku}` : null);
		
		const item = {
			...producto,
			id: producto.id,
			// Preservar el slug completo para SEO en lugar de sobreescribirlo con el SKU
			slug: producto.slug || producto.sku,
			imagen1s: imageUrl,
			imagen1m: imageUrl,   
			imagen1xs: imageUrl,
			imagen1l: imageUrl,
			imagen_principal: imageUrl,
			portada: imageUrl,
			stock_total: producto.stock_total ?? producto.stock ?? 0,
			compatibleProductos: [],
			breadcrumblist: [],
			parent__slug: producto.seccion?.toLowerCase() || 'index',
			categoria: producto.linea || '',
			specs: {},
			specs_resume: {},  
			mediafiles: [],    
		};

		return { item };

	} catch (error) {
		console.error('Error fetching product:', error);
		return { item: null };
	}
};

export default FetchGetDetailProduct;
