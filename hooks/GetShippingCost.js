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
	// Primero verificamos si hay un origen_mayorista definido y stock disponible
	if (product.origen_mayorista && product.stock_total > 0) {
		return product.origen_mayorista.toLowerCase();
	}

	// Detectar almacenes dinámicamente a partir de las propiedades del producto
	// Buscar propiedades que terminen en "_existencia_total" o "_articulo"
	const warehouseProperties = Object.keys(product).filter(key =>
		key.endsWith('_existencia_total') || key.endsWith('_articulo')
	);

	// Extraer los nombres de almacén de las propiedades encontradas
	const warehouseIds = new Set();
	warehouseProperties.forEach(prop => {
		// Extraer el ID del almacén (la parte antes de "_existencia_total" o "_articulo")
		const match = prop.match(/^(.+)_(existencia_total|articulo)$/);
		if (match) {
			warehouseIds.add(match[1]);
		}
	});

	// Verificar cada almacén detectado
	for (const warehouseId of warehouseIds) {
		const existenciaField = `${warehouseId}_existencia_total`;
		const articuloField = `${warehouseId}_articulo`;

		if ((product[existenciaField] && product[existenciaField] > 0) || product[articuloField]) {
			return warehouseId;
		}
	}

	// Verificar otros campos de origen
	if (product.origen_inventario && product.origen_inventario !== 'PROPIO') {
		return product.origen_inventario.toLowerCase();
	} else if (product.origen_mayorista) {
		// Si hay origen_mayorista pero no stock, lo usamos como última opción
		return product.origen_mayorista.toLowerCase();
	}

	// Si no se puede determinar, usar default
	return 'default';
};

// Función principal que puede recibir un array de productos o un peso total
const GetShippingCost = (weightOrProducts) => {

	// Si es un número, asumimos que es el peso total y usamos el cálculo antiguo
	if (typeof weightOrProducts === 'number' || !isNaN(parseFloat(weightOrProducts))) {
		return calculateCostByWarehouse(weightOrProducts);
	}

	// Si es un array, asumimos que son productos del carrito
	if (Array.isArray(weightOrProducts)) {
		const cartItems = weightOrProducts;

		// Agrupar productos por almacén
		const warehouseGroups = cartItems.reduce((groups, item) => {
			// Obtener el almacén del producto usando los campos del modelo Productos
			const warehouse = getProductWarehouse(item.product);

			if (!groups[warehouse]) {
				groups[warehouse] = { items: [], totalWeight: 0 };
			}

			// Sumar el peso del producto multiplicado por la cantidad
			const itemWeight = parseFloat(item.product.peso || 0) * item.quantity;
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

	// Si no es ni número ni array, devolver el costo base para el almacén predeterminado
	return calculateCostByWarehouse(0);
};

export default GetShippingCost;
