'use client';

import React, {
	useState,
	useEffect,
	useRef,
	ChangeEvent,
	FormEvent,
} from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import InstantSearch from '../InstantSearch/InstantSearch';
import LoginMenu from '../LoginMenu/LoginMenu';
import { useAuth } from '../../hooks/auth';
import TruncateManual from '../../hooks/TruncateManual';
import HeaderMenu from '../HeaderMenu/HeaderMenu';
import NavMobileMenu from '../NavMobileMenu/NavMobileMenu';
import HeaderBarLocalStock from '../../components/HeaderBarLocalStock/HeaderBarLocalStock';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
	showOpacity,
	hideOpacity,
	hideAll,
	showSearchBar,
	showLoginMenuState,
	showCart,
} from '../../lib/features/showOpacityContainerSlide';
import {
	setQueryInInput,
	setQueryInInputWithSearchBar,
	clearQueryInInput,
	clearQueryInInputKeepSearchBar,
	addToRecentSearches,
	addRecentSearchBackend,
	fetchRecentSearchesBackend,
	hydrate,
} from '../../lib/features/searchInputSlice';
import { isMobile as detectIsMobile } from 'react-device-detect';
import { setMobileView } from '../../lib/features/mobileSlide';
import CartSummaryMini from '../CartSummaryMini/CartSummaryMini';
import useCart from '../../hooks/useCart';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import { useEnv } from '../../context/EnvContext';

const HeaderBar: React.FC = () => {
	/**
	 * Refs
	 */
	const textInput = useRef<HTMLInputElement | null>(null); // Mobile
	const desktopInput = useRef<HTMLInputElement | null>(null); // Desktop
	const searchButton = useRef<HTMLButtonElement | null>(null);
	const syncDone = useRef(false);

	/**
	 * Router & Search params (App Router)
	 */
	const router = useRouter();
	const searchParams = useSearchParams();
	const q = searchParams.get('q') ?? '';

	/**
	 * Global state selectors
	 */
	const { nombres, loading, isAuthenticated, accessToken } = useAuth();
	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);
	const headerBar = useAppSelector(
		(state) => state.showOpacityContainerReducer.headerBar
	);
	const inputSearch = useAppSelector(
		(state) => state.showOpacityContainerReducer.inputSearch
	);
	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);
	const queryInInput = useAppSelector(
		(state) => state.searchInput.queryInInput
	);
	const { cart, total } = useCart();
	const recentSearches = useAppSelector(
		(state) => state.searchInput.recentSearches
	);

	/**
	 * Local state
	 */
	const dispatch = useAppDispatch();
	const { storeName, logoUrl } = useEnv();
	const [windowWidth, setWindowWidth] = useState(0);

	/**
	 * Sync query param → searchInput slice
	 */
	useEffect(() => {
		dispatch(setQueryInInput(q));
	}, [q, dispatch]);

	/**
	 * Initial mobile detection (only once)
	 */
	useEffect(() => {
		dispatch(setMobileView(detectIsMobile));
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	/**
	 * Update mobileView on resize
	 */
	useEffect(() => {
		const update = () => setWindowWidth(window.innerWidth);
		window.addEventListener('resize', update);
		update(); // first run
		return () => window.removeEventListener('resize', update);
	}, []);

	useEffect(() => {
		dispatch(setMobileView(windowWidth < 1024));
	}, [windowWidth, dispatch]);

	/**
	 * Hidratación inicial de búsquedas recientes desde localStorage
	 */
	useEffect(() => {
		dispatch(hydrate());
	}, [dispatch]);

	/**
	 * Handlers
	 */
	const handleInputChange = (value: string) => {
		if (value === '') {
			dispatch(clearQueryInInputKeepSearchBar());
		} else {
			dispatch(setQueryInInputWithSearchBar(value));
		}
	};

	const handleInputFocus = (e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setQueryInInputWithSearchBar(e.target.value));
		dispatch(showOpacity());
		dispatch(showSearchBar());
	};

	const handleInputBlur = () => {
		dispatch(hideAll());
	};

	const handleShowSummaryCartmini = () => {
		dispatch(showCart());
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!queryInInput) return;

		if (!isAuthenticated && !loading) {
			dispatch(addToRecentSearches(queryInInput));
		}

		if (accessToken) {
			dispatch(
				addRecentSearchBackend({ query: queryInInput, accessToken })
			).then(() => {
				dispatch(fetchRecentSearchesBackend(accessToken));
			});
		}

		const url = `/listado/all/index?q=${encodeURIComponent(
			queryInInput
		)}&page_size=${maxPageResults}&page=1&filter_available=true`;
		router.replace(url);
		dispatch(hideAll());
		textInput.current?.blur();
		desktopInput.current?.blur();
	};

	const handleMobileSearch = () => {
		dispatch(showSearchBar());
		dispatch(showOpacity());
		textInput.current?.focus();
	};

	// Derived UI state selectors
	const searchVisibleValue = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.searchBar
	);
	const showLoginMenu = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.loginMenu
	);
	const showSummaryCartmini = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.cart
	);

	// Sync both inputs with global value
	useEffect(() => {
		if (textInput.current && textInput.current.value !== queryInInput) {
			textInput.current.value = queryInInput;
		}
		if (desktopInput.current && desktopInput.current.value !== queryInInput) {
			desktopInput.current.value = queryInInput;
		}
	}, [queryInInput]);

	const handleSelectSuggestion = (text: string) => {
		if (loading) return;

		dispatch(setQueryInInputWithSearchBar(text));
		if (!isAuthenticated) {
			dispatch(addToRecentSearches(text));
		}
		if (accessToken) {
			dispatch(addRecentSearchBackend({ query: text, accessToken })).then(
				() => {
					dispatch(fetchRecentSearchesBackend(accessToken));
				}
			);
		}
		const url = `/listado/all/index?q=${encodeURIComponent(
			text
		)}&page_size=${maxPageResults}&page=1&filter_available=true`;
		router.replace(url);
		dispatch(hideAll());
	};

	useEffect(() => {
		if (accessToken && !syncDone.current) {
			syncDone.current = true;
			const localRecents = JSON.parse(
				localStorage.getItem('recentSearches') || '[]'
			);
			dispatch(fetchRecentSearchesBackend(accessToken)).then(() => {
				setTimeout(() => {
					const backendRecents = recentSearches;
					const toSync = localRecents.filter(
						(item) =>
							!backendRecents.some(
								(b) => b.toLowerCase() === item.toLowerCase()
							)
					);
					toSync.forEach((query) => {
						dispatch(addRecentSearchBackend({ query, accessToken }));
					});
					// Eliminar los recientes locales después de sincronizar
					localStorage.removeItem('recentSearches');
				}, 0);
			});
		}
	}, [accessToken, dispatch, recentSearches]);

	return (
		<div>
			<div
				className={`header-bar ${mobileView ? 'header-bar--mobile' : ''} ${
					headerBar ? 'header-bar--show' : ''
				}`}
			>
				<div className='header-bar__container'>
					<div className='header-bar__primary header-bar--left row around-xs middle-xs center-xs'>
						{/*  Logo — Option B responsive (fill) */}
						<div className='header-bar__section col-xs-4 col-sm-4 col-md-2 col-lg-2 header-bar__logo'>
							<NavMobileMenu />
							<a href='/'>
								<div
									style={{
										width: 98, // ← puedes ajustar vía media‑queries
										height: 42,
										position: 'relative',
									}}
								>
									<Image
										src={logoUrl}
										alt={storeName}
										fill
										sizes='98px' // breakpoints opcionales
										style={{ objectFit: 'contain' }}
										priority
										draggable={false}
									/>
								</div>
							</a>
						</div>

						{/* Search bar (desktop) */}
						<div className='header-bar__search-bar'>
							<div className='header-bar__box'>
								<form onSubmit={handleSubmit}>
									<div className='header-bar__form-container'>
										<input
											ref={desktopInput}
											onFocus={handleInputFocus}
											onChange={(e) => handleInputChange(e.target.value)}
											className='header-bar__input'
											type='search'
											name='q'
											placeholder='Buscar...'
											defaultValue={q}
											autoComplete='off'
											required
											style={{
												zIndex: inputSearch ? 200 : 0,
											}}
										/>
										<button
											type='submit'
											className='header-bar__button-search'
											ref={searchButton}
											style={{
												zIndex: inputSearch ? 200 : 0,
											}}
										>
											{/* svg lupa */}
											<svg
												className='header-bar__icon'
												width='25'
												height='20'
												viewBox='5 0 20 20'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													d='M18.319 14.4326C20.7628 11.2941 20.542 6.75347 17.6569 3.86829C14.5327 0.744098 9.46734 0.744098 6.34315 3.86829C3.21895 6.99249 3.21895 12.0578 6.34315 15.182C9.22833 18.0672 13.769 18.2879 16.9075 15.8442C16.921 15.8595 16.9351 15.8745 16.9497 15.8891L21.1924 20.1317C21.5829 20.5223 22.2161 20.5223 22.6066 20.1317C22.9971 19.7412 22.9971 19.1081 22.6066 18.7175L18.364 14.4749C18.3493 14.4603 18.3343 14.4462 18.319 14.4326ZM16.2426 5.28251C18.5858 7.62565 18.5858 11.4246 16.2426 13.7678C13.8995 16.1109 10.1005 16.1109 7.75736 13.7678C5.41421 11.4246 5.41421 7.62565 7.75736 5.28251C10.1005 2.93936 13.8995 2.93936 16.2426 5.28251Z'
													fill='currentColor'
												/>
											</svg>
										</button>
									</div>
								</form>
								{!loading && (
									<div className='search-box'>
										<InstantSearch
											query={queryInInput}
											recentSearches={recentSearches}
											onSelect={handleSelectSuggestion}
										/>
									</div>
								)}
							</div>
						</div>
						<div className='header-bar__section header-bar__section__icons header-bar--right col-xs-6 col-sm-6 col-md-5 col-lg-4'>
							<div
								className='header-bar__section-icon header-bar__mobile__search-icon__mobile'
								onClick={handleMobileSearch}
							>
								<div className='header-bar__mobile__search-icon'>
									<svg
										className='header-bar__icon icon__ligth'
										width='25'
										height='25'
										viewBox='0 0 25 25'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path d='M18.319 14.4326C20.7628 11.2941 20.542 6.75347 17.6569 3.86829C14.5327 0.744098 9.46734 0.744098 6.34315 3.86829C3.21895 6.99249 3.21895 12.0578 6.34315 15.182C9.22833 18.0672 13.769 18.2879 16.9075 15.8442C16.921 15.8595 16.9351 15.8745 16.9497 15.8891L21.1924 20.1317C21.5829 20.5223 22.2161 20.5223 22.6066 20.1317C22.9971 19.7412 22.9971 19.1081 22.6066 18.7175L18.364 14.4749C18.3493 14.4603 18.3343 14.4462 18.319 14.4326ZM16.2426 5.28251C18.5858 7.62565 18.5858 11.4246 16.2426 13.7678C13.8995 16.1109 10.1005 16.1109 7.75736 13.7678C5.41421 11.4246 5.41421 7.62565 7.75736 5.28251C10.1005 2.93936 13.8995 2.93936 16.2426 5.28251Z' />
									</svg>
								</div>
							</div>
							<div className='header-bar__section-icon'>
								<div
									className='header-bar__profile-icon'
									onClick={() =>
										showLoginMenu
											? dispatch(hideAll())
											: dispatch(showLoginMenuState())
									}
								>
									<svg
										className='header-bar__icon icon__ligth'
										fill='none'
										width='25'
										height='25'
										stroke='#ffffff'
										viewBox='0 0 25 25'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
										/>
									</svg>
									{!loading && nombres !== 'Iniciar sesión / Registrarse' ? (
										<span className='--capitalize'>
											{TruncateManual(nombres, 10)}
										</span>
									) : (
										<span>{nombres}</span>
									)}
								</div>
							</div>
							<div
								className='header-bar__section-icon'
								style={{
									zIndex: showSummaryCartmini ? 2000 : 0,
									backgroundColor: '#fff',
								}}
								onClick={() =>
									showSummaryCartmini
										? dispatch(hideAll())
										: handleShowSummaryCartmini()
								}
							>
								<div className='header-bar__cart'>
									{!showSummaryCartmini ? (
										<div className='header-bar__cart-icon'>
											<svg
												className='header-bar__icon icon__ligth'
												width='25'
												height='25'
												viewBox='0 0 25 25'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path d='M5.79166 2H1V4H4.2184L6.9872 16.6776H7V17H20V16.7519L22.1932 7.09095L22.5308 6H6.6552L6.08485 3.38852L5.79166 2ZM19.9869 8H7.092L8.62081 15H18.3978L19.9869 8Z' />
												<path d='M10 22C11.1046 22 12 21.1046 12 20C12 18.8954 11.1046 18 10 18C8.89543 18 8 18.8954 8 20C8 21.1046 8.89543 22 10 22Z' />
												<path d='M19 20C19 21.1046 18.1046 22 17 22C15.8954 22 15 21.1046 15 20C15 18.8954 15.8954 18 17 18C18.1046 18 19 18.8954 19 20Z' />
											</svg>
											{cart.length > 0 && (
												<span className='header-bar__cart-counter'>
													{cart.reduce(
														(total, item) => total + item.quantity,
														0
													)}
												</span>
											)}
										</div>
									) : (
										<div className='header-bar__cart-icon'>
											<span className='close cart-close'></span>
										</div>
									)}
									<div className='header-bar__cart-total'>
										<span>
											${' '}
											{cart.length > 0
												? CurrencyFormat(total.toString())
												: CurrencyFormat('0')}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					{showSummaryCartmini && <CartSummaryMini />}
					{showLoginMenu && <LoginMenu />}
					{!mobileView && <HeaderMenu />}
				</div>
				<HeaderBarLocalStock />
			</div>

			<div
				className='header-bar__mobile'
				style={{ top: searchVisibleValue ? '0' : '-54px' }}
			>
				<div className='header-bar__box'>
					<form onSubmit={(e) => handleSubmit(e)}>
						<div className='header-bar__form-container header-bar__mobile__form-container'>
							<div
								className='header-bar__mobile__close'
								onClick={() => dispatch(hideAll())}
							>
								<svg
									className='header-bar__mobile__close__icon icon__ligth'
									version='1.1'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 31.494 31.494'
									width='30px'
									height='30px'
								>
									<path
										d='M10.273,5.009c0.444-0.444,1.143-0.444,1.587,0c0.429,0.429,0.429,1.143,0,1.571l-8.047,8.047h26.554
	c0.619,0,1.127,0.492,1.127,1.111c0,0.619-0.508,1.127-1.127,1.127H3.813l8.047,8.032c0.429,0.444,0.429,1.159,0,1.587
	c-0.444,0.444-1.143,0.444-1.587,0l-9.952-9.952c-0.429-0.429-0.429-1.143,0-1.571L10.273,5.009z'
									/>
								</svg>
							</div>
							<input
								ref={textInput}
								onFocus={handleInputFocus}
								onChange={(e) => handleInputChange(e.target.value)}
								className='header-bar__input'
								type='search'
								name='q'
								placeholder='Buscar...'
								defaultValue={q}
								autoComplete='off'
								required
							/>
							<div
								className='header-bar__clear'
								onClick={() => {
									if (textInput.current) {
										textInput.current.value = '';
										dispatch(clearQueryInInputKeepSearchBar());
										textInput.current.focus();
									}
								}}
							>
								<div className='close --close-search'></div>
							</div>
							<button type='submit' className='header-bar__button-search'>
								<svg
									className='header-bar__icon'
									width='25'
									height='20'
									viewBox='5 0 20 20'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M18.319 14.4326C20.7628 11.2941 20.542 6.75347 17.6569 3.86829C14.5327 0.744098 9.46734 0.744098 6.34315 3.86829C3.21895 6.99249 3.21895 12.0578 6.34315 15.182C9.22833 18.0672 13.769 18.2879 16.9075 15.8442C16.921 15.8595 16.9351 15.8745 16.9497 15.8891L21.1924 20.1317C21.5829 20.5223 22.2161 20.5223 22.6066 20.1317C22.9971 19.7412 22.9971 19.1081 22.6066 18.7175L18.364 14.4749C18.3493 14.4603 18.3343 14.4462 18.319 14.4326ZM16.2426 5.28251C18.5858 7.62565 18.5858 11.4246 16.2426 13.7678C13.8995 16.1109 10.1005 16.1109 7.75736 13.7678C5.41421 11.4246 5.41421 7.62565 7.75736 5.28251C10.1005 2.93936 13.8995 2.93936 16.2426 5.28251Z'
										fill='currentColor'
									/>
								</svg>
							</button>
						</div>
					</form>
				</div>
				{!loading && searchVisibleValue && (
					<div className='col-sm-12 col-md-12 col-lg-12 search-box search-box__mobile'>
						<InstantSearch
							query={queryInInput}
							recentSearches={recentSearches}
							onSelect={handleSelectSuggestion}
						/>
					</div>
				)}
			</div>
			<div
				className='mobile__clear-fix'
				style={{ height: mobileView ? '60px' : '0' }}
			></div>

			<style jsx>{`
				.header-bar__mobile__close {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 30px;
					height: 30px;
				}

				.header-bar--show {
					z-index: 1000;
				}

				.header-bar__cart-icon {
					position: relative;
					margin-top: 3px;
				}

				.header-bar__section__icons {
					position: relative;
					display: flex;
					align-items: center;
					justify-content: right;

					gap: 25px;
				}

				.header-bar__primary {
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: space-between;
				}

				.cart-close {
					width: 25px;
					height: 25px;
					display: block !important;
					margin-left: 0 !important;
				}
				.header-bar__cart {
					display: flex;
					position: relative;
					align-items: center;
					border-radius: 2px;
					max-height: 25px;
				}
				.header-bar__cart-counter {
					left: 10px;
					top: -10px;
					background-color: var(--primary-color);
					border-radius: 15px;
					border: 2px solid #fff;
					color: #ffffff !important;
					width: 1.5rem;
					height: 1.5rem;
					display: flex !important;
					align-items: center !important;
					justify-content: center !important;
					font-size: 0.7rem;
					line-height: 1.3rem;
					z-index: 200;
					display: block !important;
					margin: 0 !important;
					text-align: center !important;
					position: absolute !important;
				}

				.header-bar__profile-icon {
					display: flex;
					align-items: center;
					max-height: 25px;
				}
				.--close-search {
					width: 20px;
					height: 20px;
				}
				.header-bar__clear {
					position: absolute;
					right: 55px;
					height: 40px;
					width: 50px;
					cursor: pointer;
					z-index: 1032;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				input {
					background-color: #fff;
					background-clip: padding-box;
					border: 1px solid #eaeaea;
					border-radius: 5px;
				}

				input {
					border-radius: 0;
					-webkit-appearance: none;
					-moz-appearance: none;
					appearance: none;
				}

				.header-bar {
					margin: 0;
					max-width: 100dvw;
					background-color: #fff;
					position: relative;
					padding: 2px 0;
					border-bottom: 1px solid #eaeaea;
				}

				.header-bar--mobile {
					top: 0;
					width: 100%;
					z-index: 200;
					position: fixed;
				}

				.header-bar--right {
					text-align: right;
				}

				.header-bar--left {
					text-align: left;
				}

				.header-bar__container {
					position: relative;
					min-height: 54px;
					padding: 5px 0;
					max-width: 1350px;
					margin: 0 auto;
					align-items: center;
				}

				.header-bar__logo {
					display: flex;
					align-items: center;
					gap: 10px;
				}

				.header-bar__search-bar {
					margin: 0;
					padding: 0;
					display: none;
					flex: 1;
					width: auto;
				}

				.header-bar__form-container {
					display: flex;
					flex: auto;
					align-content: center;
					justify-content: center;
				}

				.header-bar__input {
					width: 100%;
					height: 40px;
					padding: 10px;
					border-bottom-right-radius: 0;
					border-top-right-radius: 0;
					font-size: 1rem;
					font-weight: 300;
					color: #474747;
					transition: z-index 3s ease;
				}

				.header-bar__input:focus {
					outline: 0;
				}
				.header-bar__form-container:focus-within .header-bar__button-search,
				.header-bar__form-container:focus-within .header-bar__input {
					z-index: 200;
				}

				.header-bar__button-search {
					border: 1px solid var(--primary-color);
					background-color: var(--primary-color);
					height: 40px;
					width: 50px;
					color: #ffffff;
					border-top-right-radius: 2px;
					border-bottom-right-radius: 2px;
					cursor: pointer;
					transition: z-index 3s ease;
				}

				.header-bar__section-icon {
					align-items: center;
					color: #474747;
					display: flex;
					align-items: center;
					min-height: 42px;
				}

				.header-bar__icon {
					cursor: pointer;
				}

				.icon__ligth {
					fill: #474747;
					stroke: #474747;
				}

				.header-bar__section-icon span {
					margin-left: 5px;
				}

				.header-bar__section-icon:hover .header-bar__icon,
				.header-bar__section-icon:hover span {
					fill: var(--primary-color);
					stroke: var(--primary-color);
					color: var(--primary-color);
					cursor: pointer;
				}

				.header-bar__mobile__search-icon {
					display: block;
					max-height: 25px;
				}

				.header-bar__mobile {
					top: 0;
					position: absolute;
					width: 100%;
					background-color: #fff;
					z-index: 300;
					transition: top 0.3s ease;
				}

				.header-bar__mobile__form-container {
					padding: 8px;
				}

				.search-box {
					z-index: 400;
					padding: 0;
					position: absolute;
					border-radius: 0 0 5px 5px;
					background: #fff;
				}

				.search-box__mobile {
					border-radius: 0;
					margin-top: -2px;
					height: calc(100% - 54px);
					overflow: auto;
				
				}

				.header-bar__mobile__close {
					width: 40px;
					height: 40px;
				}

				.header-bar__mobile__close__icon {
					padding: 5px 5px 5px 0;
				}

				@media only screen and (min-width: 62em) {
					/* === Anchura idéntica al input === */
					.header-bar__box {
						position: relative; /* ancla para search-box */
					}

					.search-box {
						position: absolute;
						top: 100%; /* justo debajo del form */
						left: 0;
						width: 100%;
						min-width: 0; /* evita desbordes */
						z-index: 400; /* ya lo tenías */
					}
					/* ⬅️ Contenedor principal en una sola fila */
					.header-bar__primary {
						display: flex;
						align-items: center;
						flex-wrap: nowrap; /* evita saltos de línea */
						gap: 1rem; /* separa los elementos */
					}

					/* ⬅️ Logo e íconos NO crecen  */
					.header-bar__logo,
					.header-bar__section__icons {
						flex: 0 0 auto;
					}

					/* ⬅️ La barra ocupa lo que sobre, pero sin forzar 100 % */
					.header-bar__search-bar {
						display: flex;
						flex: 1 1 auto; /* grow = 1, shrink = 1, basis = auto */
						min-width: 0; /* permite que el input se encoja */
					}

					/* El wrapper interno también se estira */
					.header-bar__box {
						flex: 1;
						width: 100%;
					}

					/* Ocultamos versión móvil */
					.header-bar__mobile__search-icon__mobile,
					.header-bar__mobile {
						display: none;
					}

					.header-bar__cart {
						padding: 0 10px;
					}
				}

				@media only screen and (max-width: 62em) {
					.header-bar {
						top: 0;
						width: 100dvw;
					}

					.header-bar__section-icon span {
						display: none;
					}

					.header-bar,
					.search-box,
					.header-bar__mobile {
						z-index: 200;
						position: fixed;
						width: 100dvw;
					}

					.mobile__clear-fix {
						height: 58px !important;
					}
				}
			`}</style>
		</div>
	);
};

export default HeaderBar;
