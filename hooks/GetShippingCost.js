const GetShippingCost = (weightInKg) => {
	// Convertimos a número por si llega como string
	const weight = parseFloat(weightInKg);

	// Manejo de caso especial: peso <= 0
	if (weight <= 0) {
		return 0;
	} else if (weight <= 1) {
		return 140.0;
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
		// Lógica para pesos mayores a 10 kg
		// (Podrías dejar el costo en 194, 
		//  escalarlo por cada kg extra, o aplicar otra fórmula)
		return 194.0;
	}
};

export default GetShippingCost;