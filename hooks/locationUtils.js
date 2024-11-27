// locationUtils.js
const options = {
	enableHighAccuracy: true,
	timeout: 10000,
	maximumAge: 0,
};

const STORAGE_KEY = 'locationPermission';
const SHIPPING_LOCAL_KEY = 'shippingLocal';
const LAST_PERMISSION_TIME_KEY = 'lastPermissionTime';

const range = {
	minLatitude: 18.9,
	maxLatitude: 19.15,
	minLongitude: -98.3,
	maxLongitude: -98.1,
};

export function shouldRequestLocationPermission() {
	const lastPermissionTime = localStorage.getItem(LAST_PERMISSION_TIME_KEY);
	if (!lastPermissionTime) {
		return true;
	}

	const currentTime = new Date().getTime();
	const timeDiff = currentTime - parseInt(lastPermissionTime, 10);
  const minTimeDiff = 15 * 60 * 1000; // 15 minutes

	return timeDiff >= minTimeDiff;
}

export function handleLocationSuccess(pos) {
	const crd = pos.coords;
	const isLocalShipping =
		crd.latitude >= range.minLatitude &&
		crd.latitude <= range.maxLatitude &&
		crd.longitude >= range.minLongitude &&
		crd.longitude <= range.maxLongitude;

	localStorage.setItem(SHIPPING_LOCAL_KEY, isLocalShipping.toString());

	if (isLocalShipping) {
		localStorage.setItem(STORAGE_KEY, 'true');
		localStorage.setItem(
			LAST_PERMISSION_TIME_KEY,
			new Date().getTime().toString()
		);
		window.location.reload(true);
	}
}

export function handleLocationError() {
	localStorage.setItem(STORAGE_KEY, 'false');
	localStorage.setItem(SHIPPING_LOCAL_KEY, 'false');
}

export function requestLocationPermission() {
	if (shouldRequestLocationPermission()) {
		navigator.geolocation.getCurrentPosition(
			handleLocationSuccess,
			handleLocationError,
			options
		);
	}
}

export function initializeLocalStorage() {
	if (localStorage.getItem(SHIPPING_LOCAL_KEY) === null) {
		localStorage.setItem(SHIPPING_LOCAL_KEY, 'false');
	}

		requestLocationPermission();
	
	return localStorage.getItem(SHIPPING_LOCAL_KEY) === 'true';
}