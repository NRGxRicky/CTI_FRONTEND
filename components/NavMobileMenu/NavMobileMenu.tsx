import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { useEnv } from '../../context/EnvContext';
import Capitalize from '../../hooks/CapitalizeTitle';

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
	subcategories?: Subcategory[];
}

interface Category {
	id: number;
	name: string;
	slug: string;
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
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [panels, setPanels] = useState<Panel[]>([]);
	const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
	const isNavigatingBack = useRef(false);

	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);
	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);
	const { contactEmail, instagramUrl, facebookUrl, tiktokUrl, phone } =
		useEnv();

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

		try {
			setLoading(true);
			setError(false);

			const response = await fetch(
				`https://api.pccdnapi.com/categories/mobile-menu/`,
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			const data: CategoriesData = await response.json();

			if (data && Array.isArray(data.results)) {
				setData(data);
				setError(false);
				initializePanels(data.results);
			} else {
				throw new Error('Estructura de datos incorrecta');
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
			setError(true);

			try {
				const fallbackResponse = await fetch(
					`https://api.pccdnapi.com/categories/bestcategories/?parentcategorie=index`,
					{
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);

				if (fallbackResponse.ok) {
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
					setError(false);
					initializePanels(transformedData.results);
				}
			} catch (fallbackError) {
				console.error('Error with fallback endpoint:', fallbackError);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const navigateToPanel = (category: Category | Subcategory) => {
		// Verificar si tiene subcategorías
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

			// Añadir el nuevo panel y actualizar el índice
			const newPanels = [...panels.slice(0, currentPanelIndex + 1), newPanel];
			setPanels(newPanels);
			// El índice se actualizará automáticamente en el useEffect
		}
	};

	const navigateBack = () => {
		if (currentPanelIndex > 0) {
			isNavigatingBack.current = true;
			setCurrentPanelIndex(currentPanelIndex - 1);
			// Limpiar paneles innecesarios al navegar hacia atrás
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
		if (menuMobileOpen && data.results.length === 0) {
			fetchData();
		}
	}, [menuMobileOpen, data.results.length, fetchData]);

	useEffect(() => {
		if (router.pathname.startsWith('/listado') && mobileView) {
			dispatch(blockBodyScroll());
		} else {
			dispatch(unlockBodyScroll());
		}
	}, [router.pathname, mobileView]);

	useEffect(() => {
		// Esta bandera evita que el efecto se dispare al navegar hacia atrás.
		if (isNavigatingBack.current) {
			isNavigatingBack.current = false;
			return;
		}

		// Si el número de paneles ha aumentado, significa que hemos navegado hacia adelante.
		// Actualizamos el índice para disparar la animación de deslizamiento.
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
				// Truncar títulos muy largos para el breadcrumb
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
			dispatch(showNavMobileMenu());
		} else {
			dispatch(hideAll());
			setTimeout(() => {
				resetToMain();
			}, 300);
		}
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
				<div className='mobile-menu__panels-wrapper'>
					{panels.map((panel, index) => (
						<div
							key={panel.id}
							className='mobile-menu__panel'
							style={{
								transform: `translateX(${(index - currentPanelIndex) * 100}%)`,
							}}
						>
							<div className='mobile-menu__panel-header'>
								{index > 0 && (
									<button
										className='mobile-menu__back-button'
										onClick={navigateBack}
										aria-label='Volver'
									>
										<svg
											className='mobile-menu__back-icon'
											viewBox='0 0 24 24'
											fill='currentColor'
										>
											<path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
										</svg>
									</button>
								)}
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
									<ul className='mobile-menu__panel-list divide-y divide-gray-200'>
										{/* Botón de OFERTAS como primer elemento */}
										<li className='mobile-menu__panel-item'>
											<Link
												href={`/listado/all/index?q=&filter_available=true&filter_available_store=false&filter_free_shipping=false&page=1&order=-ventas&filter_discount=true&page_size=${maxPageResults}`}
												legacyBehavior
											>
												<a
													className='mobile-menu__item-link mobile-menu__item-offers'
													onClick={toggleMenu}
												>
													<div className='mobile-menu__item-offers-content'>
														<svg
															className='mobile-menu__offers-icon'
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															fill='currentColor'
														>
															<path d='M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.76-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z' />
														</svg>
														<span className='mobile-menu__item-text mobile-menu__item-offers-text'>
															{Capitalize('Ofertas')}
														</span>
													</div>
													<svg
														className='mobile-menu__arrow-icon'
														viewBox='0 0 24 24'
														fill='currentColor'
													>
														<path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
													</svg>
												</a>
											</Link>
										</li>

										{panel.items.map((item) => {
											const hasSubcategories =
												item.subcategories && item.subcategories.length > 0;

											return (
												<li key={item.id} className='mobile-menu__panel-item'>
													{hasSubcategories ? (
														<button
															className='mobile-menu__item-button'
															onClick={() => navigateToPanel(item)}
														>
															<span className='mobile-menu__item-text'>
																{Capitalize(item.name)}
															</span>
															<svg
																className='mobile-menu__arrow-icon'
																viewBox='0 0 24 24'
																fill='currentColor'
															>
																<path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
															</svg>
														</button>
													) : (
														<Link
															href={`/listado/all/${item.slug}?page_size=${maxPageResults}`}
															legacyBehavior
														>
															<a
																className='mobile-menu__item-link'
																onClick={toggleMenu}
															>
																<span className='mobile-menu__item-text'>
																	{Capitalize(item.name)}
																</span>
															</a>
														</Link>
													)}
												</li>
											);
										})}
									</ul>
								)}

								{index === 0 && !loading && !error && (
									<div className='mobile-menu__panel-content-inner'></div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			<style jsx>
				{`
					.mobile-menu__container {
						height: 100dvh;
						top: 0;
						background: #ffffff;
						position: fixed;
						transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
						width: min(90vw, 380px);
						box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
						overflow: hidden;
						z-index: 1000;
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
						padding: 10px 24px;
						background-color: #474747;
						min-height: 60px;
						color: white;
						flex-shrink: 0;
					}

					.mobile-menu__back-button {
						background: rgba(255, 255, 255, 0.1);
						border: none;
						padding: 12px;
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
						width: 28px;
						height: 28px;
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
						color: #474747;
						flex: 1;
						margin-right: 12px;
					}

					.mobile-menu__arrow-icon {
						width: 16px;
						height: 16px;
						color: #666;
						transition: color 0.2s ease;
					}

					.mobile-menu__item-button:hover .mobile-menu__arrow-icon,
					.mobile-menu__item-link:hover .mobile-menu__arrow-icon {
						color: var(--primary-color);
					}

					.mobile-menu__panel-content-inner {
						padding: 24px;
					}

					/* Burger button styles */
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
						background-color: #374151;
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

					/* Responsive adjustments */
					@media (max-width: 480px) {
						.mobile-menu__container {
							width: 100vw;
						}

						.mobile-menu__panel-header {
							padding: 14px 16px;
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

					/* Estilos para el botón de ofertas */
					.mobile-menu__item-offers {
						background: linear-gradient(
							45deg,
							var(--primary-color),
							color-mix(in srgb, var(--primary-color) 70%, white 30%)
						) !important;
						border: none;
						margin: 0;
						width: 100%;
					}

					.mobile-menu__item-offers:hover {
						background: linear-gradient(
							45deg,
							var(--primary-color),
							color-mix(in srgb, var(--primary-color) 70%, white 30%)
						) !important;
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
						color: white;
					}

					.mobile-menu__item-offers-text {
						color: white !important;
						font-weight: 700 !important;
						font-size: 18px;
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
						background-color: rgba(255, 255, 255, 0.1);
					}

					.mobile-menu__close-icon {
						width: 24px;
						height: 24px;
					}
				`}
			</style>
		</nav>
	);
};

export default NavMobileMenu;
