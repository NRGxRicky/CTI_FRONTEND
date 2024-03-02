import { createSlice } from '@reduxjs/toolkit';

export const showOpacityContainerSlide = createSlice({
	name: 'opacityContainer',
	initialState: {
		opacityConatiner: false,
		searchBar: false,
		loginMenu: false,
		navMobileMenu: false,
		navMobileSort: false,
		navMobileFilters: false,
		bodyScroll: false
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
			state.navMobileSort = false;
			state.navMobileFilters = false;
		},
		showSearchBar: (state) => {
			state.searchBar = true;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;
			state.navMobileSort = false;
			state.navMobileFilters = false;
		},
		showLoginMenuState: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = true;
			state.navMobileMenu = false;
			state.navMobileSort = false;
			state.navMobileFilters = false;
		},
		showNavMobileMenu: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = true;
			state.navMobileSort = false;
			state.navMobileFilters = false;
		},
		showNavMobileSort: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;
			state.navMobileSort = true;
			state.navMobileFilters = false;
		},
		showNavMobileFilters: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;
			state.navMobileSort = false;
			state.navMobileFilters = true;
		},
		blockBodyScroll: (state) => {
			state.bodyScroll = true
		},
		unlockBodyScroll: (state) => {
			state.bodyScroll = false
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
	showNavMobileSort,
	showNavMobileFilters,
	blockBodyScroll,
	unlockBodyScroll
} = showOpacityContainerSlide.actions;

export default showOpacityContainerSlide.reducer;
