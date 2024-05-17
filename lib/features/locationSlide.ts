import { createSlice } from '@reduxjs/toolkit';

const initialLocationStockOnly = () => {
	if (typeof window !== 'undefined') {
		const savedValue = localStorage.getItem('locationStockOnly');
		return savedValue === 'true';
	}
	return false;
};

export const locationSlide = createSlice({
	name: 'locationSlide',
	initialState: {
		headerLocationStock: false,
		locationStockOnly: initialLocationStockOnly(),
		headerLocationStockHeight: 0,
	},
	reducers: {
		showHeaderLocationStock: (state) => {
			state.headerLocationStock = true;
		},
		setLocationStockOnly: (state, action) => {
			state.locationStockOnly = action.payload;
			if (typeof window !== 'undefined') {
				localStorage.setItem('locationStockOnly', action.payload.toString());
			}
		},
		setHeaderLocationStockHeight: (state, action) => {
			state.headerLocationStockHeight = action.payload;
		},
	},
});

export const {
	showHeaderLocationStock,
	setLocationStockOnly,
	setHeaderLocationStockHeight,
} = locationSlide.actions;

export default locationSlide.reducer;
