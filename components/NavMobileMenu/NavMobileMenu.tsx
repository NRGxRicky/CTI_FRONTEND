import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';

import {
	hideAll,
	showNavMobileMenu,
	blockBodyScroll,
	unlockBodyScroll,
} from '../../lib/features/showOpacityContainerSlide';
import { useEnv } from '../../context/EnvContext';

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
	const [loading, setLoading] = useState(true);
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

	const fetchData = async () => {
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
	};

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

			const newPanels = [...panels.slice(0, currentPanelIndex + 1), newPanel];
			setPanels(newPanels);
		}
	};

	const navigateBack = () => {
		if (currentPanelIndex > 0) {
			isNavigatingBack.current = true;
			setCurrentPanelIndex(currentPanelIndex - 1);
		}
	};

	const resetToMain = () => {
		setCurrentPanelIndex(0);
		setPanels(panels.slice(0, 1));
	};

	useEffect(() => {
		fetchData();
	}, []);

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

	const dispatch = useAppDispatch();
	const menuMobileOpen = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.navMobileMenu
	);
	const router = useRouter();

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

	useEffect(() => {
		if (router.pathname.startsWith('/listado') && mobileView) {
			dispatch(blockBodyScroll());
		} else {
			dispatch(unlockBodyScroll());
		}
	}, [router.pathname, mobileView]);

	const renderBreadcrumb = () => {
		const breadcrumbItems = [];
		for (let i = 0; i <= currentPanelIndex; i++) {
			if (i === 0) {
				breadcrumbItems.push('Categorías');
			} else {
				breadcrumbItems.push(panels[i].title);
			}
		}
		return breadcrumbItems.join(' > ');
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
									<h2 className='mobile-menu__panel-title'>{panel.title}</h2>
									{panel.level > 0 && (
										<div className='mobile-menu__breadcrumb'>
											{renderBreadcrumb()}
										</div>
									)}
								</div>
							</div>

							<div
								className={`mobile-menu__panel-content ${
									index === 0 ? 'main-panel-content' : 'sub-panel-content'
								}`}
							>
								{loading && index === 0 && (
									<div className='mobile-menu__loading'>
										<div className='mobile-menu__spinner'></div>
										<span>Cargando...</span>
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
									<ul className='mobile-menu__panel-list'>
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
																{item.name}
															</span>
															<div className='mobile-menu__item-info'>
																<span className='mobile-menu__item-count'>
																	{item.subcategories?.length} subcategorías
																</span>
																<svg
																	className='mobile-menu__arrow-icon'
																	viewBox='0 0 24 24'
																	fill='currentColor'
																>
																	<path d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' />
																</svg>
															</div>
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
																	{item.name}
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
						height: 100vh;
						top: 59px;
						background: #ffffff;
						position: fixed;
						z-index: 400;
						transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
						width: min(90vw, 380px);
						box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
						overflow: hidden;
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
						padding: 20px 24px;
						background-color: #474747;
						min-height: 72px;
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
						width: 22px;
						height: 22px;
					}

					.mobile-menu__header-content {
						flex: 1;
						display: flex;
						flex-direction: column;
					}

					.mobile-menu__panel-title {
						font-size: 20px;
						font-weight: 600;
						margin: 0;
						color: white;
					}

					.mobile-menu__breadcrumb {
						font-size: 12px;
						color: rgba(255, 255, 255, 0.7);
						margin-top: 4px;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.mobile-menu__panel-content {
						flex: 1;
						overflow-y: auto;
						scroll-behavior: smooth;
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
						padding: 0;
						margin: 0;
					}

					.mobile-menu__item-button,
					.mobile-menu__item-link {
						display: flex;
						justify-content: space-between;
						align-items: center;
						width: 100%;
						padding: 14px 24px;
						background: none;
						border: none;
						text-decoration: none;
						cursor: pointer;
						transition: background-color 0.2s ease, color 0.2s ease;
						text-align: left;
						color: #474747;
						border-bottom: 1px solid #edf2f7;
					}

					.mobile-menu__item-button:hover,
					.mobile-menu__item-link:hover {
						background-color: #f7fafc;
						color: var(--primary-color);
					}

					.mobile-menu__panel-item:last-child > .mobile-menu__item-button,
					.mobile-menu__panel-item:last-child > .mobile-menu__item-link {
						border-bottom: none;
					}

					.mobile-menu__item-text {
						font-weight: 500;
						font-size: 16px;
						line-height: 1.5;
						flex: 1;
					}

					.mobile-menu__item-info {
						display: flex;
						align-items: center;
						gap: 8px;
					}

					.mobile-menu__item-count {
						font-size: 12px;
						color: #a0aec0;
						font-weight: 400;
					}

					.mobile-menu__arrow-icon {
						width: 20px;
						height: 20px;
						color: #a0aec0;
						transition: color 0.2s ease;
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

					.mobile-menu__loading,
					.mobile-menu__error {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						padding: 80px 24px;
						color: #64748b;
					}

					.mobile-menu__spinner {
						width: 40px;
						height: 40px;
						border: 4px solid #f1f5f9;
						border-top: 4px solid var(--primary-color);
						border-radius: 50%;
						animation: spin 1s linear infinite;
						margin-bottom: 20px;
					}

					.mobile-menu__retry-btn {
						background: var(--primary-color);
						color: white;
						border: none;
						padding: 14px 28px;
						border-radius: 12px;
						cursor: pointer;
						margin-top: 20px;
						font-size: 15px;
						font-weight: 700;
						transition: background-color 0.2s ease;
					}

					.mobile-menu__retry-btn:hover {
						opacity: 0.9;
					}

					.mobile-menu__panel-content::-webkit-scrollbar {
						width: 6px;
					}

					.mobile-menu__panel-content::-webkit-scrollbar-track {
						background: transparent;
					}

					.mobile-menu__panel-content::-webkit-scrollbar-thumb {
						background: #d1d5db;
						border-radius: 3px;
					}

					.mobile-menu__panel-content::-webkit-scrollbar-thumb:hover {
						background: #9ca3af;
					}
				`}
			</style>
		</nav>
	);
};

export default NavMobileMenu;
