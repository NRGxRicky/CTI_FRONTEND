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
		bodyScroll: false,
		cart: false,
		PaymentsChange: false,
		ProfileAddAddress: false,
		headerBar: false,
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
			state.bodyScroll = false;
			state.cart = false;
			state.PaymentsChange = false;
			state.ProfileAddAddress = false;
			state.headerBar = false;
		},
		showProfileAddAddress: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;
			state.navMobileSort = false;
			state.navMobileFilters = false;
			state.cart = false;
			state.PaymentsChange = false;
			state.ProfileAddAddress = true;
			state.headerBar = false;
		},
		showSearchBar: (state) => {
			state.searchBar = true;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;
			state.navMobileSort = false;
			state.navMobileFilters = false;
			state.cart = false;
			state.PaymentsChange = false;
			state.ProfileAddAddress = false;
			state.headerBar = false;
		},
		showLoginMenuState: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = true;
			state.navMobileMenu = false;
			state.navMobileSort = false;
			state.navMobileFilters = false;
			state.cart = false;
			state.PaymentsChange = false;
			state.ProfileAddAddress = false;
			state.headerBar = false;
		},
		showCart: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;
			state.navMobileSort = false;
			state.navMobileFilters = false;
			state.cart = true;
			state.PaymentsChange = false;
			state.ProfileAddAddress = false;
			state.headerBar = false;
		},
		showPaymentsChange: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;
			state.navMobileSort = false;
			state.navMobileFilters = false;
			state.cart = false;
			state.PaymentsChange = true;
			state.ProfileAddAddress = false;
			state.headerBar = false;
		},

		showNavMobileMenu: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = true;
			state.navMobileSort = false;
			state.navMobileFilters = false;
			state.bodyScroll = true;
			state.cart = false;
			state.PaymentsChange = false;
			state.ProfileAddAddress = false;
			state.headerBar = true;
		},
		showNavMobileSort: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;
			state.navMobileSort = true;
			state.navMobileFilters = false;
			state.cart = false;
			state.PaymentsChange = false;
			state.ProfileAddAddress = false;
			state.headerBar = false;
		},
		showNavMobileFilters: (state) => {
			state.searchBar = false;
			state.opacityConatiner = true;
			state.loginMenu = false;
			state.navMobileMenu = false;
			state.navMobileSort = false;
			state.navMobileFilters = true;
			state.cart = false;
			state.PaymentsChange = false;
			state.ProfileAddAddress = false;
			state.headerBar = false;
		},
		blockBodyScroll: (state) => {
			state.bodyScroll = true;
		},
		unlockBodyScroll: (state) => {
			state.bodyScroll = false;
		},
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
	unlockBodyScroll,
	showCart,
	showPaymentsChange,
	showProfileAddAddress,
} = showOpacityContainerSlide.actions;

export default showOpacityContainerSlide.reducer;
