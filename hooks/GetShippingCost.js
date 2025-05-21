// Función para calcular el costo de envío por almacén
const calculateCostByWarehouse = (weightInKg) => {
	const weight = parseFloat(weightInKg);

	// Usamos las mismas tarifas para todos los almacenes
	const shippingRates = {
		baseCost: 129.0,
		tierCosts: [129.0, 133.0, 138.0, 143.0, 149.0, 154.0, 160.0, 165.0, 171.0, 177.0],
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
	// Verificamos existencias para determinar el almacén
	if (product.pch_existencia_total > 0 || product.pch_articulo) {
		return 'pch';
	} else if (product.ct_existencia_total > 0 || product.ct_articulo) {
		return 'ct';
	} else if (product.cva_existencia_total > 0 || product.cva_articulo) {
		return 'cva';
	} else if (product.ingram_existencia_total > 0 || product.ingram_articulo) {
		return 'ingram';
	} else if (product.origen_inventario && product.origen_inventario !== 'PROPIO') {
		return product.origen_inventario.toLowerCase();
	} else if (product.origen_mayorista) {
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
