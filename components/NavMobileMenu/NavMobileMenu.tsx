import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { useEnv } from '../../context/EnvContext';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useAuth } from '../../hooks/auth';
import { Preloader, TailSpin } from 'react-preloader-icon';
import TruncateMarkup from 'react-truncate-markup';
import Image from 'next/image';

import {
	hideAll,
	showNavMobileMenu,
	blockBodyScroll,
	unlockBodyScroll,
} from '../../lib/features/showOpacityContainerSlide';

interface Subcategory {
	id: number;
	name: string;
	slug: string;
	imagen?: string;
	portada?: string;
	subcategories?: Subcategory[];
}

interface Category {
	id: number;
	name: string;
	slug: string;
	imagen?: string;
	portada?: string;
	subcategories?: Subcategory[];
}

interface CategoriesData {
	results: Category[];
	count: number;
}

interface Panel {
	id: string;
	title: string;
	items: Category[] | Subcategory[];
	parentId?: string;
	level: number;
}

const NavMobileMenu = () => {
	const [data, setData] = useState<CategoriesData>({ results: [], count: 0 });
	const [popularCategories, setPopularCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [panels, setPanels] = useState<Panel[]>([]);
	const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
	const isNavigatingBack = useRef(false);
	const [currentView, setCurrentView] = useState('main');

	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);
	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);
	const { contactEmail, instagramUrl, facebookUrl, tiktokUrl, phone } =
		useEnv();
	const { isAuthenticated, nombres, logout, isVerified } = useAuth();

	const fetchData = useCallback(async () => {
		const initializePanels = (categories: Category[]) => {
			const mainPanel: Panel = {
				id: 'main',
				title: 'Categorías',
				items: categories,
				level: 0,
			};
			setPanels([mainPanel]);
			setCurrentPanelIndex(0);
		};

		setLoading(true);
		setError(false);

		try {
			const [categoriesResponse, popularResponse] = await Promise.all([
				fetch(`https://api.pccdnapi.com/categories/mobile-menu/`),
				fetch(`https://api.pccdnapi.com/categories/bestcategories/?limit=10`),
			]);

			if (!categoriesResponse.ok) {
				console.error(
					'Error principal, intentando fallback:',
					categoriesResponse.statusText
				);
				const fallbackResponse = await fetch(
					`https://api.pccdnapi.com/categories/bestcategories/?parentcategorie=index`
				);
				if (!fallbackResponse.ok)
					throw new Error('Fallback endpoint also failed');
				const fallbackData = await fallbackResponse.json();
				const transformedData: CategoriesData = {
					results:
						fallbackData.results?.map((category: any) => ({
							...category,
							subcategories: [],
						})) || [],
					count: fallbackData.results?.length || 0,
				};
				setData(transformedData);
				initializePanels(transformedData.results);
			} else {
				const data: CategoriesData = await categoriesResponse.json();
				if (data && Array.isArray(data.results)) {
					setData(data);
					initializePanels(data.results);
				} else {
					throw new Error('Estructura de datos de categorías incorrecta');
				}
			}

			if (popularResponse.ok) {
				const popularData = await popularResponse.json();
				if (popularData && Array.isArray(popularData.results)) {
					setPopularCategories(popularData.results.slice(0, 10));
				}
			} else {
				console.error(
					'No se pudieron cargar las categorías populares:',
					popularResponse.statusText
				);
			}
		} catch (err) {
			console.error('Error fetching menu data:', err);
			setError(true);
		} finally {
			setLoading(false);
		}
	}, []);

	const navigateToPanel = (category: Category | Subcategory) => {
		const hasSubcategories =
			category.subcategories && category.subcategories.length > 0;

		if (hasSubcategories) {
			const newPanel: Panel = {
				id: `category-${category.id}`,
				title: category.name,
				items: category.subcategories!,
				parentId: panels[currentPanelIndex].id,
				level: panels[currentPanelIndex].level + 1,
			};

			const newPanels = [...panels.slice(0, currentPanelIndex + 1), newPanel];
			setPanels(newPanels);
		}
	};

	const navigateBack = () => {
		if (currentPanelIndex > 0) {
			isNavigatingBack.current = true;
			setCurrentPanelIndex(currentPanelIndex - 1);
			setPanels(panels.slice(0, currentPanelIndex));
		}
	};

	const resetToMain = () => {
		setCurrentPanelIndex(0);
		setPanels(panels.slice(0, 1));
	};

	const dispatch = useAppDispatch();
	const menuMobileOpen = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.navMobileMenu
	);
	const router = useRouter();

	useEffect(() => {
		if (menuMobileOpen && data.results.length === 0 && !loading) {
			fetchData();
		}
	}, [menuMobileOpen, data.results.length, fetchData, loading]);

	useEffect(() => {
		if (router.pathname.startsWith('/listado') && mobileView) {
			dispatch(blockBodyScroll());
		} else {
			dispatch(unlockBodyScroll());
		}
	}, [router.pathname, mobileView]);

	useEffect(() => {
		if (isNavigatingBack.current) {
			isNavigatingBack.current = false;
			return;
		}
		if (panels.length > currentPanelIndex + 1) {
			setCurrentPanelIndex(panels.length - 1);
		}
	}, [panels, currentPanelIndex]);

	const renderBreadcrumb = () => {
		const breadcrumbItems = [];
		for (let i = 0; i <= currentPanelIndex; i++) {
			if (i === 0) {
				breadcrumbItems.push('Categorías');
			} else {
				const title =
					panels[i].title.length > 15
						? panels[i].title.substring(0, 15) + '...'
						: panels[i].title;
				breadcrumbItems.push(Capitalize(title));
			}
		}

		return breadcrumbItems.map((item, index) => (
			<React.Fragment key={index}>
				<span className='breadcrumb-item'>{item}</span>
				{index < breadcrumbItems.length - 1 && (
					<svg
						className='breadcrumb-arrow'
						viewBox='0 0 24 24'
						fill='currentColor'
						width='12'
						height='12'
					>
						<path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
					</svg>
				)}
			</React.Fragment>
		));
	};

	const toggleMenu = () => {
		if (!menuMobileOpen) {
			if (data.results.length === 0 && !loading) {
				fetchData();
			}
			setCurrentView('main');
			dispatch(showNavMobileMenu());
		} else {
			dispatch(hideAll());
			setTimeout(() => {
				resetToMain();
			}, 300);
		}
	};

	const handleLogout = () => {
		logout();
		dispatch(hideAll());
	};

	const goBackToMainMenu = () => {
		setCurrentView('main');
	};

	return (
		<nav className='header__mobile-nav-toggle'>
			<button
				className={`burger-button ${menuMobileOpen ? 'active' : ''}`}
				onClick={toggleMenu}
				aria-label='Menú de navegación'
			>
				<div className='burger-line'></div>
				<div className='burger-line'></div>
				<div className='burger-line'></div>
			</button>

			<div
				className='mobile-menu__container'
				style={{
					left: menuMobileOpen ? 0 : '-100%',
					opacity: menuMobileOpen ? 1 : 0,
				}}
			>
				{/* --- Vista del Menú Principal --- */}
				<div
					className='mobile-menu__view'
					style={{
						transform:
							currentView === 'main' ? 'translateX(0%)' : 'translateX(-100%)',
					}}
				>
					<div className='main-menu__header'>
						{isAuthenticated ? (
							<Link href='/profile' legacyBehavior>
								<a className='main-menu__user-info' onClick={toggleMenu}>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 24 24'
										fill='currentColor'
									>
										<path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
									</svg>
									<span className='--capitalize'>Hola, {nombres}</span>
								</a>
							</Link>
						) : (
							<div className='main-menu__user-info'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									fill='currentColor'
								>
									<path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
								</svg>
								<span>Hola</span>
							</div>
						)}
						<button
							className='mobile-menu__close-button'
							onClick={toggleMenu}
							aria-label='Cerrar menú'
						>
							<svg
								className='mobile-menu__close-icon'
								viewBox='0 0 24 24'
								fill='currentColor'
							>
								<path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
							</svg>
						</button>
					</div>
					<div className='main-menu__content'>
						{loading ? (
							<div className='mobile-menu__loading'>
								<div className='mobile-menu__spinner'></div>
							</div>
						) : (
							<>
								<ul className='main-menu__list main-menu__account-list'>
									<h2 className='main-menu__section-title'>Cuenta</h2>
									{isAuthenticated ? (
										<>
											<li className='main-menu__list-item'>
												<Link href='/profile' legacyBehavior>
													<a onClick={toggleMenu}>
														<svg
															className='main-menu__account-icon'
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															fill='currentColor'
														>
															<path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' />
														</svg>
														<span>Mi Cuenta</span>
													</a>
												</Link>
											</li>
											<li className='main-menu__list-item'>
												<Link href='/mis-compras' legacyBehavior>
													<a onClick={toggleMenu}>
														<svg
															className='main-menu__account-icon'
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															fill='currentColor'
														>
															<path d='M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5zM17 17H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z' />
														</svg>
														<span>Mis Compras</span>
													</a>
												</Link>
											</li>
											<li className='main-menu__list-item'>
												<Link href='/mis-cotizaciones' legacyBehavior>
													<a onClick={toggleMenu}>
														<svg
															className='main-menu__account-icon'
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															fill='currentColor'
														>
															<path d='M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.91 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z' />
														</svg>
														<span>Mis Cotizaciones</span>
													</a>
												</Link>
											</li>
										</>
									) : (
										<div className='main-menu__login-container'>
											<Link href='/login' legacyBehavior>
												<a
													className='main-menu__logout-btn btn-gradient'
													onClick={toggleMenu}
												>
													<span>Iniciar Sesión</span>
												</a>
											</Link>
										</div>
									)}
								</ul>

								<ul className='main-menu__list main-menu__card'>
									<h2 className='main-menu__section-title'>
										Categorías Populares
									</h2>
									<li className='main-menu__list-item'>
										<Link
											href={`/listado/all/index?q=&filter_available=true&filter_available_store=false&filter_free_shipping=false&page=1&order=-ventas&filter_discount=true&page_size=${maxPageResults}`}
											legacyBehavior
										>
											<a
												onClick={toggleMenu}
												className='main-menu__category-link'
											>
												<div
													className='category-image'
													style={{ display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
													}}
												>
													<svg
														className='mobile-menu__offers-icon'
														xmlns='http://www.w3.org/2000/svg'
														viewBox='0 0 24 24'
													>
														<defs>
															<linearGradient
																id='offers-icon-gradient'
																x1='0%'
																y1='0%'
																x2='100%'
																y2='100%'
															>
																<stop
																	offset='0%'
																	stopColor='var(--primary-color)'
																/>
																<stop
																	offset='100%'
																	stopColor='color-mix(in srgb, var(--primary-color) 70%, white 30%)'
																/>
															</linearGradient>
														</defs>
														<path
															fill='url(#offers-icon-gradient)'
															d='M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.76-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z'
														/>
													</svg>
												</div>

												<span className='main-menu__category-name offers-gradient'>
													{Capitalize('Ofertas')}
												</span>
											</a>
										</Link>
									</li>
									{popularCategories.map((cat) => (
										<li key={cat.id} className='main-menu__list-item'>
											<Link
												href={`/listado/all/${cat.slug}?page_size=${maxPageResults}`}
												legacyBehavior
											>
												<a
													onClick={toggleMenu}
													className='main-menu__category-link'
												>
													{cat.portada && (
														<div className='category-image'>
															<Image
																src={cat.portada}
																alt={cat.name}
																fill
																sizes='40px'
																style={{
																	objectFit: 'contain',
																	mixBlendMode: 'multiply',
																}}
															/>
														</div>
													)}
													<TruncateMarkup lines={1}>
														<span className='main-menu__category-name'>
															{Capitalize(cat.name)}
														</span>
													</TruncateMarkup>
												</a>
											</Link>
										</li>
									))}
									<li className='main-menu__list-item'>
										<button onClick={() => setCurrentView('categories')}>
											<span>Todas las categorías</span>
											<svg
												className='main-menu__arrow-icon'
												viewBox='0 0 24 24'
												fill='currentColor'
											>
												<path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
											</svg>
										</button>
									</li>
								</ul>

							
									<div className='main-menu__footer'>
											{isAuthenticated && (
										<button
											className='main-menu__logout-btn btn-gradient'
											onClick={handleLogout}
										>
											<span>Cerrar Sesión</span>
											</button>
										)}
									</div>
								
							</>
						)}
					</div>
				</div>

				{/* --- Vista del Navegador de Categorías --- */}
				<div
					className='mobile-menu__view'
					style={{
						transform:
							currentView === 'categories'
								? 'translateX(0%)'
								: 'translateX(100%)',
					}}
				>
					<div className='mobile-menu__panels-wrapper'>
						{panels.map((panel, index) => (
							<div
								key={panel.id}
								className='mobile-menu__panel'
								style={{
									transform: `translateX(${
										(index - currentPanelIndex) * 100
									}%)`,
								}}
							>
								<div className='mobile-menu__panel-header'>
									<button
										className='mobile-menu__back-button'
										onClick={index > 0 ? navigateBack : goBackToMainMenu}
										aria-label='Volver'
									>
										<svg
											className='mobile-menu__back-icon'
											viewBox='0 0 24 22'
											fill='currentColor'
										>
											<path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
										</svg>
									</button>
									<div className='mobile-menu__header-content'>
										<h2 className='mobile-menu__panel-title'>
											{Capitalize(panel.title)}
										</h2>
										{panel.level > 0 && (
											<div className='mobile-menu__breadcrumb'>
												{renderBreadcrumb()}
											</div>
										)}
									</div>
									<button
										className='mobile-menu__close-button'
										onClick={toggleMenu}
										aria-label='Cerrar menú'
									>
										<svg
											className='mobile-menu__close-icon'
											viewBox='0 0 24 24'
											fill='currentColor'
										>
											<path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
										</svg>
									</button>
								</div>

								<div
									className={`mobile-menu__panel-content ${
										index === 0 ? 'main-panel-content' : 'sub-panel-content'
									}`}
								>
									{loading && index === 0 && (
										<div className='mobile-menu__loading'>
											<div className='mobile-menu__spinner'></div>
										</div>
									)}

									{error && index === 0 && !loading && (
										<div className='mobile-menu__error'>
											<span>Error al cargar categorías</span>
											<button
												onClick={fetchData}
												className='mobile-menu__retry-btn'
											>
												Reintentar
											</button>
										</div>
									)}

									{!loading && !error && (
										<div className='mobile-menu__grid'>
											{panel.items.map((item) => {
												const hasSubcategories =
													item.subcategories && item.subcategories.length > 0;
												const imageUrl =
													item.portada ||
													item.imagen ||
													'/images/not-available.png';

												const content = (
													<>
														<div className='mobile-menu__grid-image-container'>
															<Image
																src={imageUrl}
																alt={item.name}
																fill
																sizes='(max-width: 480px) 30vw, 100px'
																style={{
																	objectFit: 'contain',
																	mixBlendMode: 'multiply',
																	padding: '1rem',
																}}
															/>
														</div>
														<span className='mobile-menu__grid-text'>
															{Capitalize(item.name)}
														</span>
													</>
												);

												return (
													<div key={item.id}>
														{hasSubcategories ? (
															<button
																className='mobile-menu__grid-item'
																onClick={() => navigateToPanel(item)}
															>
																{content}
															</button>
														) : (
															<Link
																href={`/listado/all/${item.slug}?page_size=${maxPageResults}`}
																legacyBehavior
															>
																<a
																	className='mobile-menu__grid-item'
																	onClick={toggleMenu}
																>
																	{content}
																</a>
															</Link>
														)}
													</div>
												);
											})}
										</div>
									)}

									{index === 0 && !loading && !error && (
										<div className='mobile-menu__panel-content-inner'></div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<style jsx>
				{`
					.mobile-menu__container {
						height: 100dvh;
						top: 0;
						background: #ffffff;
						position: fixed;
						z-index: 5000;
						transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
						width: min(90dvw, 380px);
						box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
						overflow: hidden;
						display: flex;
					}
					.mobile-menu__view {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
						display: flex;
						flex-direction: column;
						background-color: #f7f8fa;
					}

					.main-menu__header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 10px 1rem;
						background-color: #474747;
						color: white;
						flex-shrink: 0;
					}
					.main-menu__user-info {
						display: flex;
						align-items: center;
						gap: 0.75rem;
						font-size: 1.1rem;
						font-weight: 600;
						text-decoration: none;
						color: white;
					}
					.main-menu__user-info svg {
						width: 28px;
						height: 28px;
						background: rgba(255, 255, 255, 0.1);
						border-radius: 50%;
						padding: 4px;
					}
					.main-menu__content {
						overflow-y: auto;
						flex-grow: 1;
					}
					.main-menu__list {
						list-style: none;
						padding: 0;
						margin: 0;
						/* Estilo de lista simple, sin tarjeta */
					}
					.main-menu__section-title {
						font-size: 1.1rem;
						font-weight: 700;
						color: #1a202c;
						padding: 1rem 1.25rem 0.75rem;
						margin: 0;
						background: transparent;
					}
					.main-menu__list-item button,
					.main-menu__list-item a {
						display: flex;
						align-items: center;
						justify-content: space-between;
						gap: 1rem;
						width: 100%;
						padding: 0.5rem 1.25rem;
						min-height: 56px;
						font-size: 1rem;
						background: transparent;
						border: none;
						cursor: pointer;
						text-align: left;
						text-decoration: none;
						border-bottom: 1px solid #edf2f7;
					}
					.main-menu__list-item:hover {
						background-color: #f7f8fa;
					}

					.main-menu__list-item:first-child button,
					.main-menu__list-item:first-child a {
						border-top: 1px solid #edf2f7;
					}
					.main-menu__list-item span {
						flex-grow: 1;
					}
					.main-menu__arrow-icon {
						width: 16px;
						height: 16px;
						color: #474747;
					}

					.main-menu__footer {
						padding: 4rem 1rem 3rem 1rem;
						margin-top: auto;
					}
					.main-menu__logout-btn {
						display: flex;
						align-items: center;
						justify-content: center;
						gap: 0.75rem;
						width: 100%;
						padding: 0.8rem;
						color: white;
						border: none;
						border-radius: 6px;
						font-size: 1rem;
						font-weight: 600;
						cursor: pointer;
						text-decoration: none;
					}

					.main-menu__logout-btn:hover {
						color: white;
					}

					.main-menu__logout-btn svg {
						width: 22px;
						height: 22px;
					}

					.--capitalize {
						text-transform: capitalize;
					}

					.mobile-menu__panels-wrapper {
						position: relative;
						width: 100%;
						height: 100%;
						display: flex;
					}

					.mobile-menu__panel {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
						display: flex;
						flex-direction: column;
					}

					.mobile-menu__panel-header {
						display: flex;
						align-items: center;
						padding: 10px 1rem;
						background-color: #474747;
						min-height: 60px;
						color: white;
						flex-shrink: 0;
					}

					.mobile-menu__back-button {
						background: rgba(255, 255, 255, 0.1);
						border: none;
						padding: 4px;
						margin-right: 16px;
						cursor: pointer;
						color: white;
						border-radius: 12px;
						transition: background-color 0.2s ease;
					}

					.mobile-menu__back-button:hover {
						background: rgba(255, 255, 255, 0.2);
					}

					.mobile-menu__back-icon {
						width: 24px;
						height: 24px;
					}

					.mobile-menu__header-content {
						flex: 1;
						display: flex;
						flex-direction: column;
					}

					.mobile-menu__panel-title {
						font-size: 18px;
						font-weight: 600;
						margin: 0;
						color: white;
					}

					.mobile-menu__breadcrumb {
						font-size: 10px;
						color: rgba(255, 255, 255, 0.7);
						margin-top: 4px;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
						max-width: 100%;
						line-height: 1.2;
						display: flex;
						align-items: center;
						gap: 4px;
					}

					.breadcrumb-item {
						display: inline-block;
					}

					.breadcrumb-arrow {
						display: inline-block;
						vertical-align: middle;
						margin: 0 2px;
						color: rgba(255, 255, 255, 0.5);
					}

					.mobile-menu__level-indicator {
						font-size: 10px;
						color: rgba(255, 255, 255, 0.5);
						margin-top: 2px;
						font-weight: 400;
						text-transform: uppercase;
						letter-spacing: 0.5px;
					}

					.mobile-menu__panel-content {
						flex: 1;
						overflow-y: auto;
						background: #ffffff;
					}

					.main-panel-content {
						background-color: #ffffff;
						color: #474747;
					}

					.sub-panel-content {
						background-color: #ffffff;
					}

					.mobile-menu__grid {
						display: grid;
						grid-template-columns: repeat(3, 1fr);
						gap: 1rem;
						padding: 1rem;
					}

					.mobile-menu__grid-item {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: flex-start;
						text-decoration: none;
						background-color: #ffffff;
						border-radius: 6px;
						text-align: center;
						width: 100%;
						height: 100%;
						border: none;
						cursor: pointer;
						font-family: inherit;
					}

					.mobile-menu__grid-image-container {
						position: relative;
						width: 100%;
						height: 80px;
						background-color: #f7f7f7;
						border-radius: 10px;
					}

					.mobile-menu__grid-item:hover .mobile-menu__grid-image-container {
						background-color: #e9e9e9;
					}

					.mobile-menu__grid-item:hover {
						color: var(--primary-color);
					}

					.mobile-menu__grid-image {
						position: relative;
						width: 100%;
						height: 100%;
						object-fit: contain;
						mix-blend-mode: multiply;
						padding: 0.5rem;
					}

					.mobile-menu__grid-text {
						margin-top: 0.75rem;
						font-size: 12px;
						font-weight: 500;
						line-height: 1.3;
						min-height: 31px; /* Fallback for 2 lines */
					}

					.mobile-menu__panel-list {
						list-style: none;
						margin: 0;
						padding: 0 0 30px 0;
					}

					.mobile-menu__panel-item {
						border-bottom: 1px solid #eaeaea;
					}

					.mobile-menu__panel-item:last-child {
						border-bottom: none;
					}

					.mobile-menu__item-button,
					.mobile-menu__item-link {
						display: flex;
						align-items: center;
						justify-content: space-between;
						width: 100%;
						padding: 16px 20px;
						background: none;
						border: none;
						text-align: left;
						cursor: pointer;
						text-decoration: none;
						color: inherit;
						transition: background-color 0.2s ease;
					}

					.mobile-menu__item-button:hover,
					.mobile-menu__item-link:hover {
						background-color: #f7f7f7;
					}

					.mobile-menu__item-button:active,
					.mobile-menu__item-link:active {
						background-color: #f0f0f0;
					}

					.mobile-menu__item-text {
						font-size: 14px;
						font-weight: 500;

						flex: 1;
						margin-right: 12px;
					}

					.mobile-menu__arrow-icon {
						width: 16px;
						height: 16px;
						transition: color 0.2s ease;
					}

					.mobile-menu__item-button:hover .mobile-menu__arrow-icon,
					.mobile-menu__item-link:hover .mobile-menu__arrow-icon {
						color: var(--primary-color);
					}

					.mobile-menu__panel-content-inner {
						padding: 24px;
					}

					.burger-button {
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						width: 30px;
						height: 16px;
						background: none;
						border: none;
						cursor: pointer;
						align-items: center;
						transition: all 0.3s ease;
					}

					.burger-line {
						width: 20px;
						height: 2px;
						background-color: #474747;
						transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
						border-radius: 1px;
					}

					.burger-button.active .burger-line:nth-child(1) {
						transform: rotate(-45deg) translate(-4px, 6px);
						background-color: var(--primary-color);
					}

					.burger-button.active .burger-line:nth-child(2) {
						opacity: 0;
						transform: scale(0);
					}

					.burger-button.active .burger-line:nth-child(3) {
						transform: rotate(45deg) translate(-4px, -6px);
						background-color: var(--primary-color);
					}

					@keyframes spin {
						0% {
							transform: rotate(0deg);
						}
						100% {
							transform: rotate(360deg);
						}
					}

					.mobile-menu__loading {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						padding: 40px 20px;
						color: #666;
						height: 100%;
						width: 100%;
					}

					.mobile-menu__spinner {
						width: 24px;
						height: 24px;
						border: 2px solid #eaeaea;
						border-top: 2px solid var(--primary-color);
						border-radius: 50%;
						animation: spin 1s linear infinite;
						margin-bottom: 12px;
					}

					.mobile-menu__error {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						padding: 40px 20px;
						color: #666;
						text-align: center;
					}

					.mobile-menu__retry-btn {
						margin-top: 12px;
						padding: 8px 16px;
						background: var(--primary-color);
						color: #ffffff;
						border: none;
						border-radius: 4px;
						font-size: 12px;
						cursor: pointer;
						transition: background-color 0.2s ease;
					}

					.mobile-menu__retry-btn:hover {
						background: #e6001e;
					}

					@media (max-width: 480px) {
						.mobile-menu__container {
							
						}

						.mobile-menu__item-button,
						.mobile-menu__item-link {
							padding: 14px 16px;
						}

						.mobile-menu__panel-title {
							font-size: 14px;
						}

						.mobile-menu__item-text {
							font-size: 13px;
						}
					}

					.mobile-menu__item-offers {
						
						) !important;
						border: none;
						margin: 0;
						width: 100%;
					}

					.mobile-menu__item-offers:hover {
						transform: none;
						box-shadow: none;
						filter: brightness(1.1);
					}

					.mobile-menu__item-offers .mobile-menu__item-text {
						color: white !important;
					}

					.mobile-menu__item-offers .mobile-menu__arrow-icon {
						color: white !important;
					}

					.mobile-menu__item-offers-content {
						display: flex;
						align-items: center;
					}

					.mobile-menu__offers-icon {
						width: 20px;
						height: 20px;
						margin-right: 10px;
					}

					.mobile-menu__item-offers-text {
						font-weight: 700;
					}

					.mobile-menu__close-button {
						background: transparent;
						border: none;
						padding: 8px;
						margin-left: 16px;
						cursor: pointer;
						color: white;
						line-height: 0;
						border-radius: 50%;
						transition: background-color 0.2s ease;
					}

					.mobile-menu__close-button:hover {
						background-color: #474747;
					}

					.mobile-menu__close-icon {
						width: 24px;
						height: 24px;
					}

					.category-image {
						position: relative;
						width: 40px;
						height: 40px;
						margin-right: 1rem;
						border-radius: 4px;
						flex-shrink: 0;
					}

					.main-menu__category-link,
					.mobile-menu__item-content {
						display: flex;
						align-items: center;
						flex-grow: 1;
					}

					.main-menu__offers-container {
						padding: 0 1rem 1rem 1rem;
					}

					.main-menu__offers-container
						.mobile-menu__item-offers
						.mobile-menu__item-text {
						color: white !important;
					}

					.main-menu__offers-container
						.mobile-menu__item-offers
						.mobile-menu__arrow-icon {
						color: white !important;
					}

					.main-menu__card {
						background: #ffffff;
						margin-top: 1rem;
					}

					.main-menu__account-list {
						margin-top: 1rem;
					}

					.main-menu__account-section {
						background: #ffffff;
						margin-top: 1rem;
					}

					.main-menu__category-name {
						flex-grow: 1;
					}

					.main-menu__account-list .main-menu__list-item a {
						justify-content: flex-start;
					}

					.main-menu__account-icon {
						width: 22px;
						height: 22px;
						flex-shrink: 0;
					}

					.main-menu__offers-item {
						padding: 0;
						border-bottom: none;
					}

					.main-menu__offers-item > a {
						border-radius: 6px;
						border-bottom: none;
						padding: 1rem 1.25rem;
					}

					.main-menu__login-container {
						padding: 0.5rem 1.25rem 1rem;
					}

					.offers-gradient {
						font-weight: 700;
						background: linear-gradient(
							45deg,
							var(--primary-color),
							color-mix(in srgb, var(--primary-color) 100%, white 100%)
						);
						-webkit-background-clip: text;
						background-clip: text;
						-webkit-text-fill-color: transparent;
						color: transparent;
					}

					.mobile-menu__close-icon {
						width: 24px;
						height: 24px;
					}

					.mobile-menu__offers-icon {
						width: 24px;
						height: 24px;
					}

					.mobile-menu__item-offers-text {
						font-weight: 700;
					}

					.offers-gradient {
						mix-blend-mode: multiply;
						flex-shrink: 0;
						display: flex;
						align-items: center;
						font-size: 18px;
					}

					.main-menu__category-link,
					.mobile-menu__item-content {
						align-items: center;
						flex-grow: 1;
					}

					.main-menu__offers-container
						.mobile-menu__item-offers
						.mobile-menu__item-text {
						color: white !important;
					}

					.main-menu__offers-container
						.mobile-menu__item-offers
						.mobile-menu__arrow-icon {
						color: white !important;
					}
				`}
			</style>
		</nav>
	);
};

export default NavMobileMenu;
