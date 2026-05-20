// services/productService.js
// Servicio compartido para buscar y transformar productos en el frontend/backend

// Genera un slug limpio a partir del título
export function slugify(text) {
	return (text || 'producto')
		.toLowerCase()
		.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
		.substring(0, 80);
}

const CATEGORY_ICON_MAP = {
	'Puntos de Venta y Códigos de Barra': '/images/categories/puntos-de-venta.png',
	'Computadoras': '/images/categories/computadoras.png',
	'Accesorios': '/images/categories/accesorios.png',
	'Suministros': '/images/categories/suministros.png',
	'Dispositivos de Entrada y Salida': '/images/categories/entrada-salida.png',
	'Protección Eléctrica': '/images/categories/proteccion-electrica.png',
	'Almacenamiento': '/images/categories/almacenamiento.png',
};

export function getCategoryIcon(category) {
	return CATEGORY_ICON_MAP[category] || '/images/categories/generico.svg';
}

// Convierte un producto de Prisma al formato que espera el frontend de CTI
export function mapProductToFrontend(dbProduct) {
	if (!dbProduct) return null;

	const cost = dbProduct.price || 0;
	
	// Calcular el precio final de venta:
	// 1. Margen de ganancia (12% -> 1.12)
	const margin = parseFloat(process.env.PROFIT_MARGIN || '1.12');
	
	// 2. Impuesto IVA aplicable en México (16% -> 1.16)
	const iva = 1.16;
	
	// 3. Fórmula final (Costo Puro * Margen * IVA) redondeado a 2 decimales
	const rawPrice = cost * margin * iva;
	const priceMXN = Math.round(rawPrice * 100) / 100;
	
	const brandName = dbProduct.brand || 'Ingram';
	const brandSlug = slugify(brandName);
	const catName = dbProduct.category || 'General';
	
	const result = {
		id: dbProduct.id,
		sku: dbProduct.ingramSku || '',
		titulo: dbProduct.title || 'Sin Título',
		slug: `${slugify(dbProduct.title)}-${dbProduct.ingramSku}`,
		modelo: dbProduct.mpn || dbProduct.ingramSku || '',
		descripcion: dbProduct.description || dbProduct.title || '',
		categoria: catName,
		linea: catName,
		seccion: catName,
		marca: {
			nombre: brandName,
			slug: brandSlug,
			imagen: null,
		},
		precio_contado: priceMXN,
		precio_final: priceMXN,
		precio_final_descuento: 0,
		stock_total: dbProduct.stock || 0,
		stock_puebla: 0,
		costo_envio: priceMXN > 5000 ? 0 : 150,
		imagen1s: dbProduct.imageUrl || getCategoryIcon(catName),
		imagen1m: dbProduct.imageUrl || getCategoryIcon(catName),
		imagen1xs: dbProduct.imageUrl || getCategoryIcon(catName),
		imagen1l: dbProduct.imageUrl || getCategoryIcon(catName),
		envio_gratis: priceMXN > 5000,
		created: dbProduct.createdAt ? dbProduct.createdAt.toISOString() : new Date().toISOString(),
		upc: dbProduct.upc || '',
		specs: {},
		specs_resume: {},
		mediafiles: [],
		compatibleProductos: [],
		breadcrumblist: [],
		parent__slug: slugify(catName),
		imageUrl: dbProduct.imageUrl || getCategoryIcon(catName),
	};

	// Mapear galería de imágenes (hasta 10)
	if (dbProduct.gallery && Array.isArray(dbProduct.gallery)) {
		dbProduct.gallery.slice(0, 9).forEach((imgUrl, index) => {
			const num = index + 2; // Empezamos en imagen2
			result[`imagen${num}s`] = imgUrl;
			result[`imagen${num}m`] = imgUrl;
			result[`imagen${num}xs`] = imgUrl;
			result[`imagen${num}l`] = imgUrl;
		});
	}

	return result;
}

// Busca un producto por SKU o Slug en la base de datos
export async function getProductBySkuOrSlug(db, skuOrSlug) {
	if (!skuOrSlug) return null;

	const skuClean = skuOrSlug.split('-').pop() || skuOrSlug;
	
	return await db.product.findFirst({
		where: {
			OR: [
				{ ingramSku: skuOrSlug },
				{ ingramSku: skuClean },
				{ mpn: skuOrSlug },
				{ mpn: skuClean },
			]
		}
	});
}
