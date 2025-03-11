const GetShippingCost = (weightInKg) => {
	const weight = parseFloat(weightInKg);

	if (weight <= 0) {
		// Podrías decidir si aquí se devuelve 0 o algún valor mínimo
		return 129.00;
	} else if (weight <= 1) {
		return 129.0;
	} else if (weight <= 2) {
		return 133.0;
	} else if (weight <= 3) {
		return 138.0;
	} else if (weight <= 4) {
		return 143.0;
	} else if (weight <= 5) {
		return 149.0;
	} else if (weight <= 6) {
		return 154.0;
	} else if (weight <= 7) {
		return 160.0;
	} else if (weight <= 8) {
		return 165.0;
	} else if (weight <= 9) {
		return 171.0;
	} else if (weight <= 10) {
		return 177.0;
	} else {
		// Para pesos mayores a 10 kg
		// Redondeo hacia arriba y sumamos 6 MXN por cada kg extra
		const extraKg = Math.ceil(weight - 10);
		return 177.0 + extraKg * 6.0;
	}
};

export default GetShippingCost;
