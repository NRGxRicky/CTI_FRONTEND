import { createSlice } from '@reduxjs/toolkit';

export const showOpacityContainerSlide = createSlice({
	name: 'opacityContainer',
	initialState: {
		opacityConatiner: false,
		searchBar: false,
	},
	reducers: {
		showOpacity: (state) => {
			state.opacityConatiner = true;
		},
		hideOpacity: (state) => {
			state.opacityConatiner = false;
		},
		hideAll: (state) => {
			state.searchBar = false;
			state.opacityConatiner = false;
		},
		hideSearchBar: (state) => {
			state.searchBar = false;
		},
		showSearchBar: (state) => {
			state.searchBar = true;
			state.opacityConatiner = true;
		},
	},
});

export const { showOpacity, hideOpacity, hideAll, hideSearchBar, showSearchBar } =
	showOpacityContainerSlide.actions;

export default showOpacityContainerSlide.reducer;
