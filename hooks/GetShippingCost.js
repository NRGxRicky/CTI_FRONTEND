// Función para calcular el costo de envío por almacén
const calculateCostByWarehouse = (weightInKg) => {
	const weight = parseFloat(weightInKg);

	// Usamos las mismas tarifas para todos los almacenes
	const shippingRates = {
		baseCost: 150.0,
		tierCosts: [150.0, 154.0, 159.0, 164.0, 170.0, 175.0, 181.0, 186.0, 192.0, 198.0],
		extraKgCost: 6.0
	};

	if (weight <= 0) {
		// Valor mínimo para envíos
		return shippingRates.baseCost;
	} else if (weight <= 10) {
		// Redondeamos hacia arriba para determinar el tier
		const tier = Math.ceil(weight) - 1;
		return shippingRates.tierCosts[tier];
	} else {
		// Para pesos mayores a 10 kg
		const extraKg = Math.ceil(weight - 10);
		return shippingRates.tierCosts[9] + extraKg * shippingRates.extraKgCost;
	}
};

// Función para determinar el almacén de un producto
const getProductWarehouse = (product) => {
	// Puesto que el catálogo único actual es de Ingram Micro, el origen es 'ingram'
	if (product.origen_mayorista) {
		return product.origen_mayorista.toLowerCase();
	}

	// Detectar almacenes dinámicamente a partir de las propiedades del producto
	const warehouseProperties = Object.keys(product).filter(key =>
		key.endsWith('_existencia_total') || key.endsWith('_articulo')
	);

	const warehouseIds = new Set();
	warehouseProperties.forEach(prop => {
		const match = prop.match(/^(.+)_(existencia_total|articulo)$/);
		if (match) {
			warehouseIds.add(match[1]);
		}
	});

	for (const warehouseId of warehouseIds) {
		const existenciaField = `${warehouseId}_existencia_total`;
		const articuloField = `${warehouseId}_articulo`;

		if ((product[existenciaField] && product[existenciaField] > 0) || product[articuloField]) {
			return warehouseId;
		}
	}

	if (product.origen_inventario && product.origen_inventario !== 'PROPIO') {
		return product.origen_inventario.toLowerCase();
	}

	// Por defecto, asumimos ingram para el catálogo integrado
	return 'ingram';
};

// Función principal que puede recibir un array de productos o un peso total
const GetShippingCost = (weightOrProducts) => {

	// Si es un número, asumimos que es el peso total
	if (typeof weightOrProducts === 'number' || !isNaN(parseFloat(weightOrProducts))) {
		return calculateCostByWarehouse(weightOrProducts);
	}

	// Si es un array, asumimos que son productos del carrito
	if (Array.isArray(weightOrProducts)) {
		const cartItems = weightOrProducts;

		// Agrupar productos por almacén
		const warehouseGroups = cartItems.reduce((groups, item) => {
			const warehouse = getProductWarehouse(item.product);

			if (!groups[warehouse]) {
				groups[warehouse] = { items: [], totalWeight: 0 };
			}

			// Sumar el peso del producto (default: 1.0 kg si no está definido en el modelo) por cantidad
			const itemWeight = parseFloat(item.product.peso || item.product.weight || 1.0) * item.quantity;
			groups[warehouse].totalWeight += itemWeight;
			groups[warehouse].items.push(item);

			return groups;
		}, {});

		// Calcular el costo de envío para cada almacén y sumarlos
		let totalShippingCost = 0;

		for (const warehouse in warehouseGroups) {
			const weight = warehouseGroups[warehouse].totalWeight;
			const cost = calculateCostByWarehouse(weight);
			totalShippingCost += cost;
		}

		return totalShippingCost;
	}

	return calculateCostByWarehouse(0);
};

export default GetShippingCost;
