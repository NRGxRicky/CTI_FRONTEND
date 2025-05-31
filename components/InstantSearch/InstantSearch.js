import React, { useEffect, useState } from 'react';
import Spinner from '../Spinner/Spinner';
import Image from 'next/image';
import Capitalize from '../../hooks/CapitalizeTitle';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import {
	hideAll,
	showSearchBar,
} from '../../lib/features/showOpacityContainerSlide';
import {
	setQueryInInput,
	resetShouldShowSearchBar,
	hydrate,
	addToRecentSearches,
	removeFromRecentSearches,
	clearAllRecentSearches
} from '../../lib/features/searchInputSlice';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';

const InstantSearch = () => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const router = useRouter();
	const searchVisibleValue = useAppSelector(
		(state) => state.showOpacityContainerReducer.searchBar
	);
	const locationStockOnly = useAppSelector(
		(state) => state.locationSlide.locationStockOnly
	);
	const queryInInput = useAppSelector((state) => state.searchInput.queryInInput);
	const shouldShowSearchBar = useAppSelector((state) => state.searchInput.shouldShowSearchBar);
	const recentSearches = useAppSelector((state) => state.searchInput.recentSearches);
	const isHydrated = useAppSelector((state) => state.searchInput.isHydrated);
	const dispacth = useAppDispatch();

	// Función para realizar una búsqueda con una consulta reciente
	const searchWithRecentQuery = (query) => {
		dispacth(addToRecentSearches(query));
		dispacth(setQueryInInput(query));
		router.push(`/listado/all/index?q=${query}`);
		dispacth(hideAll(false));
	};

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				`https://api.pccdnapi.com/listado/instantsearch/?q=${queryInInput}&filter_available_store=${locationStockOnly}`
			);
			setData(await data.json());
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	const redirecToResults = () => {
		dispacth(addToRecentSearches(queryInInput));
		router.push(`/listado/all/index?q=${queryInInput}`);
		dispacth(hideAll(false));
	};

	// Hidratar búsquedas recientes del localStorage después del montaje
	useEffect(() => {
		if (!isHydrated) {
			dispacth(hydrate());
		}
	}, [isHydrated, dispacth]);

	useEffect(() => {
		if (queryInInput !== undefined) {
			if (queryInInput.length > 0) {
				fetchData();
				if (shouldShowSearchBar) {
					dispacth(showSearchBar());
					dispacth(resetShouldShowSearchBar());
				}
			} else if (queryInInput.length === 0) {
				// Cuando está vacío, limpiar los datos para mostrar búsquedas recientes
				setData(null);
				setError(false);
				if (shouldShowSearchBar) {
					dispacth(showSearchBar());
					dispacth(resetShouldShowSearchBar());
				}
			}
		}
	}, [queryInInput, shouldShowSearchBar]);

	if (loading) {
		return (
			<div
				className='search-box'
				style={!searchVisibleValue ? { display: 'none' } : { display: 'block' }}
			>
				<div className='search-box__loader'>
					<Spinner />
				</div>

				<style jsx>
					{`
						.search-box {
							width: 100%;
						}

						.search-box__loader {
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 10px;
							height: 200px;
						}
					`}
				</style>
			</div>
		);
	}
	if (error) {
		return (
			<div
				className='search-box'
				style={!searchVisibleValue ? { display: 'none' } : { display: 'block' }}
			>
				<div className='search-box__loader'>Error</div>

				<style jsx>
					{`
						.search-box {
							height: 200px;
						}

						.search-box__loader {
							position: absolute;
							right: 0;
							bottom: 0;
							height: 50%;
							width: 50%;
							padding: 10px;
						}

						@media only screen and (max-width: 48em) {
							.search-box {
								height: 200px;
							}
						}
					`}
				</style>
			</div>
		);
	}
	if (data) {
		return (
			<div
				className='search-box'
				style={!searchVisibleValue ? { display: 'none' } : { display: 'block' }}
			>
				{data.results.map((producto) => (
					<div
						key={producto.id}
						className='search-box__item'
						onClick={() => {
							dispacth(addToRecentSearches(queryInInput));
							dispacth(hideAll());
						}}
					>
						<Link href={`/${producto.slug}`} legacyBehavior>
							<a className='search-box__link'>
								<div className='search-box__item__box'>
									<div className='search-box_item__container'>
										<div className='search-box__item__image'>
											<div className='search-box__image'>
												<Image
													src={
														producto.imagen1xs
															? producto.imagen1xs
															: '/images/not-available.png'
													}
													fill
													style={{ objectFit: 'contain' }}
													alt={Capitalize(producto.titulo)}
													sizes='auto'
												/>
											</div>
										</div>
										<div className='search-box__item__title'>
											<div>
												<span>{Capitalize(producto.titulo)}</span>
											</div>
											<div className='search_box__item__model text--off'>
												<span>{producto.modelo.toUpperCase()}</span>
											</div>
										</div>
									</div>
									<div className='search-box__info'>
										<div className='search-box__price'>
											<span>
												{producto.precio_final_descuento > 0 && (
													<>
														<div className='text--off'>
															<span className='price--compare'>
																$ {CurrencyFormat(producto.precio_final)}
															</span>
														</div>
													</>
												)}
												$ {CurrencyFormat(producto.precio_contado, 2, '.', ',')}
											</span>
										</div>
										<div className='search-box__stock text--off'>
											<span>
												{producto.stock_total}{' '}
												{producto.stock_total > 1
													? 'disponibles'
													: 'disponible'}
											</span>
										</div>
									</div>
								</div>
							</a>
						</Link>
					</div>
				))}

				{data.count > 5 && (
					<div className='search-box__see-all' onClick={redirecToResults}>
						<span>Ver todos los {data.count} resultados</span>
					</div>
				)}
				<style jsx>
					{`
						.price--compare {
							font-size: 12px;
						}

						.search-box {
							height: 100%;
						}

						.search-box__item {
							padding: 10px;
							border-bottom: 1px solid #eaeaea;
						}

						.search-box__item:last-child {
							border: 0;
						}

						.search-box__item__box:hover {
							background-color: var(--background-price-color);
							border-radius: 0.37em;
						}

						.search-box__item__box {
							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: space-between;
							padding: 10px;
							max-width: 100%;
						}

						.search-box_item__container {
							display: flex;
							flex-direction: row;
							width: 100%;
							align-items: center;
						}

						.search-box__item__image {
							position: relative;
							min-width: 70px;
							height: 50px;
							mix-blend-mode: multiply;
						}

						.search-box__image {
							position: relative;
							height: 50px;
							width: 50px;
						}

						.search-box__info {
							text-align: right;
							width: 15%;
							min-width: 100px;
						}

						.search-box__item__title {
							font-weight: 600;
						}

						.search-box__price {
							font-weight: 600;
						}

						.search_box__item__model {
							line-height: 30px;
						}

						.search-box__link {
							width: 100%;
						}

						.search-box__see-all {
							cursor: pointer;
							text-align: center;
							line-height: 30px;
							color: var(--primary-color);
							font-weight: 600;
							padding: 10px;
						}

						.search-box__stock {
							line-height: 30px;
						}

						@media only screen and (max-width: 48em) {
							.search-box__item__box {
								flex-wrap: wrap;
							}

							.search-box__info {
								width: 100%;
								flex-grow: 1;
							}
						}
					`}
				</style>
			</div>
		);
	} else if ((!queryInInput || queryInInput.length === 0) && recentSearches.length > 0) {
		// Mostrar búsquedas recientes cuando no hay consulta y hay búsquedas guardadas
		return (
			<div
				className='search-box'
				style={!searchVisibleValue ? { display: 'none' } : { display: 'block' }}
			>
				<div className='recent-searches-header'>
					<span className='recent-searches-title'>Búsquedas recientes</span>
					<button
						className='clear-recent-btn'
						onClick={() => {
							dispacth(clearAllRecentSearches());
						}}
					>
						Borrar búsquedas recientes
					</button>
				</div>

				{recentSearches.map((searchQuery, index) => (
					<div key={index} className='recent-search-item'>
						<div
							className='recent-search-content'
							onClick={() => searchWithRecentQuery(searchQuery)}
						>
							<div className='recent-search-icon'>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<circle cx="12" cy="12" r="10" />
									<polyline points="12,6 12,12 16,14" />
								</svg>
							</div>
							<span className='recent-search-text'>{searchQuery}</span>
						</div>
						<button
							className='remove-recent-btn'
							onClick={(e) => {
								e.stopPropagation();
								dispacth(removeFromRecentSearches(searchQuery));
							}}
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				))}

				<style jsx>
					{`
						.search-box {
							height: 100%;
							padding: 10px;
						}

						.recent-searches-header {
							display: flex;
							justify-content: space-between;
							align-items: center;
							padding: 10px 0;
							border-bottom: 1px solid #eaeaea;
							margin-bottom: 10px;
						}

						.recent-searches-title {
							font-weight: 600;
							color: #333;
						}

						.clear-recent-btn {
							background: none;
							border: none;
							color: var(--primary-color);
							cursor: pointer;
							font-size: 14px;
							padding: 5px;
						}

						.clear-recent-btn:hover {
							text-decoration: underline;
						}

						.recent-search-item {
							display: flex;
							align-items: center;
							justify-content: space-between;
							padding: 12px 8px;
							border-radius: 4px;
							margin-bottom: 2px;
							cursor: pointer;
						}

						.recent-search-item:hover {
							background-color: #f5f5f5;
						}

						.recent-search-content {
							display: flex;
							align-items: center;
							flex-grow: 1;
							cursor: pointer;
						}

						.recent-search-icon {
							margin-right: 12px;
							color: #666;
							display: flex;
							align-items: center;
						}

						.recent-search-text {
							color: #333;
							font-size: 14px;
						}

						.remove-recent-btn {
							background: none;
							border: none;
							cursor: pointer;
							padding: 4px;
							color: #999;
							display: flex;
							align-items: center;
							justify-content: center;
						}

						.remove-recent-btn:hover {
							color: #666;
						}

						@media only screen and (max-width: 48em) {
							.recent-searches-header {
								flex-direction: column;
								align-items: flex-start;
								gap: 8px;
							}
						}
					`}
				</style>
			</div>
		);
	} else {
		return <div></div>;
	}
};

export default InstantSearch;