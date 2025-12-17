import { getProductDetail } from '../lib/apiClient';

/**
 * Hook para obtener detalles de un producto específico
 * Adaptado para la nueva API con autenticación
 */
const FetchGetDetailProduct = async (sku) => {
	try {
		// Llamar a la nueva API con el SKU
		const response = await getProductDetail(sku);

		// Verificar respuesta exitosa
		if (response.status !== 200) {
			throw new Error(response.message || 'Producto no encontrado');
		}

		// Extraer producto del response
		const productos = response.data?.productos || [];
		const product = productos.find(p => p.sku === sku || p.skuFabricante === sku);

		if (!product) {
			throw new Error('Producto no encontrado');
		}

		// Mapear producto al formato esperado
		const mappedProduct = {
			id: product.id_linea,
			sku: product.sku || product.skuFabricante,
			name: product.descripcion,
			slug: sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
			price: product.peso_bruto,
			discount_price: product.esp_price || null,
			description: product.descripcion,
			brand: product.marca,
			category: product.categoria,
			stock: product.inventario?.[0]?.cantidad || 0,
			available: product.inventario?.[0]?.cantidad > 0,
			images: [],
			specifications: {
				sku: product.sku,
				skuFabricante: product.skuFabricante,
				moneda: product.moneda,
				peso_bruto: product.peso_bruto,
			},
			variants: product.inventario?.map(inv => ({
				almacen_id: inv.almacen_id,
				almacen: inv.almacen,
				cantidad: inv.cantidad,
			})) || [],
		};

		return {
			item: mappedProduct,
		};

	} catch (error) {
		console.error('Error fetching product detail:', error);
		return {
			item: null,
		};
	}
};

export default FetchGetDetailProduct;
