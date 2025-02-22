const GetShippingCost = (weightInKg) => {
	if (weightInKg <= 5) {
		return 139.0;
	} else if (weightInKg > 5 && weightInKg <= 10) {
		return 190.0;
	} else if (weightInKg > 10) {
		return 350.0;
	} else {
		return 139.0;
	}
};

export default GetShippingCost;