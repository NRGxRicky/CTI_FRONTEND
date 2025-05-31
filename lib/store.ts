import { configureStore } from '@reduxjs/toolkit';
import showOpacityContainerReducer from './features/showOpacityContainerSlide';
import locationSlide from './features/locationSlide';
import mobileSlide from './features/mobileSlide';
import searchInputSlice from './features/searchInputSlice';

export const store = configureStore({
	reducer: {
		showOpacityContainerReducer,
		locationSlide,
		mobileSlide,
		searchInput: searchInputSlice,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
