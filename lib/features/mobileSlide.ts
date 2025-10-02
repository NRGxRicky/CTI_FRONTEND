import { isMobile } from 'react-device-detect';
import { createSlice } from '@reduxjs/toolkit';

export const mobileSlide = createSlice({
	name: 'mobileSlide',
	initialState: {
		mobileView: false,
		maxPageResults: 40,
	},
	reducers: {
		setMobileView: (state, action) => {
			state.mobileView = action.payload;

			action.payload ? (state.maxPageResults = 8) : (state.maxPageResults = 40);
		},
		setMaxPageResults: (state, action) => {
			state.maxPageResults = action.payload;
		},
	},
});

export const { setMobileView, setMaxPageResults } = mobileSlide.actions;

export default mobileSlide.reducer;
