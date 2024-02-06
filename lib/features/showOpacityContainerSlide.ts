import { createSlice } from '@reduxjs/toolkit';

export const showOpacityContainerSlide = createSlice({
	name: 'opacityContainer',
	initialState: {
		opacityConatiner: false,
		searchBar: false,
		loginMenu: false,
		navMobileMenu: false
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
			state.loginMenu = false;
			state.navMobileMenu = false;
		},
		showSearchBar: (state) => {
			state.searchBar = true;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;

		},
		showLoginMenuState: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = true;
			state.navMobileMenu = false;

		},
		showNavMobileMenu: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = true;

		}
	},
});

export const {
	showOpacity,
	hideOpacity,
	hideAll,
	showSearchBar,
	showLoginMenuState,
	showNavMobileMenu,
} = showOpacityContainerSlide.actions;

export default showOpacityContainerSlide.reducer;
