const GetShippingCost = (weightInKg) => {
	const weight = parseFloat(weightInKg);

	if (weight <= 0) {
		// Podrías decidir si aquí se devuelve 0 o algún valor mínimo
		return 139;
	} else if (weight <= 1) {
		return 139.0;
	} else if (weight <= 2) {
		return 145.0;
	} else if (weight <= 3) {
		return 151.0;
	} else if (weight <= 4) {
		return 159.0;
	} else if (weight <= 5) {
		return 165.0;
	} else if (weight <= 6) {
		return 170.0;
	} else if (weight <= 7) {
		return 177.0;
	} else if (weight <= 8) {
		return 182.0;
	} else if (weight <= 9) {
		return 188.0;
	} else if (weight <= 10) {
		return 194.0;
	} else {
		// Para pesos mayores a 10 kg
		// Redondeo hacia arriba y sumamos 6 MXN por cada kg extra
		const extraKg = Math.ceil(weight - 10);
		return 194.0 + extraKg * 6.0;
	}
};

export default GetShippingCost;
