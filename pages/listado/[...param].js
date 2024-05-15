import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar/Navbar';
import ListProducts from '../../components/ListProducts/ListProducts';
import fetchData from '../../hooks/GetData';
import ListProductsPagination from '../../components/ListProductsPagination/ListProductsPagination';
import Router, { useRouter } from 'next/router';
import { Preloader, TailSpin } from 'react-preloader-icon';
import MobileNavBar from '../../components/MobileNavBar/MobileNavBar';
import fetchFilterData from '../../hooks/GetFiltersData';
import FiltersOptios from '../../components/FiltersOptions/FiltersOptios';
import WindowDimensions from '../../hooks/WindowDimensions';
import IconNoSearch from '../../components/IconNoSearch/IconNoSearch';
import FiltersOptionsMain from '../../components/FiltersOptionsMain/FiltersOptionsMain';
import CarouselProductsV2 from '../../components/Carousel/CarouselProductsV2';
import Footer from '../../components/Footer/Footer';
import ListProductsMobile from '../../components/LisProductsMobile/ListProductsMobile';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
	hideAll,
	blockBodyScroll,
} from '../../lib/features/showOpacityContainerSlide';

import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile,
} from 'react-device-detect';
import Capitalize from '../../hooks/CapitalizeTitle';
import { isConstructorDeclaration } from 'typescript';

export const getServerSideProps = async (context) => {
	let order = '-visitas';
	let q = '';
	let page = '1';
	let filter_available = false;
	let filter_available_store = false;
	let filter_free_shipping = false;
	let brands = [];
	let categories = [];
	let attributes = [];
	let categoria = 'index';
	let marca = 'all';
	let page_size = 40;

	if (context.query.page_size) {
		page_size = context.query.page_size;
	}

	if (context.query.param) {
		categoria = context.query.param[1];
		marca = context.query.param[0];
	}

	if (context.query.q) {
		q = context.query.q;
	}
	if (context.query.order) {
		order = context.query.order;
	}

	if (context.query.page) {
		if (context.query.page) {
			page = context.query.page;
		}
	}

	if (context.query.filter_available) {
		if (context.query.filter_available) {
			filter_available =
				context.query.filter_available.toLowerCase() === 'true';
		}
	}

	if (context.query.filter_available_store) {
		if (context.query.filter_available_store) {
			filter_available_store =
				context.query.filter_available_store.toLowerCase() === 'true';
		}
	}

	if (context.query.filter_free_shipping) {
		if (context.query.filter_free_shipping) {
			filter_free_shipping =
				context.query.filter_free_shipping.toLowerCase() === 'true';
		}
	}

	if (context.query.brands) {
		if (context.query.brands) {
			if (typeof context.query.brands === 'string') {
				brands.push(context.query.brands);
			} else {
				brands = context.query.brands;
			}
		}
	}

	if (context.query.categories) {
		if (context.query.categories) {
			if (typeof context.query.categories === 'string') {
				categories.push(context.query.categories);
			} else {
				categories = context.query.categories;
			}
		}
	}

	if (context.query.attributes) {
		if (context.query.attributes) {
			if (typeof context.query.attributes === 'string') {
				attributes.push(context.query.attributes);
			} else {
				attributes = context.query.attributes;
			}
		}
	}

	return {
		props: {
			q,
			order,
			page,
			filter_available,
			filter_available_store,
			filter_free_shipping,
			brands,
			categories,
			attributes,
			marca,
			categoria,
			page_size,
		},
	};
};

const Listado = ({
	page,
	q,
	order,
	filter_available,
	filter_available_store,
	filter_free_shipping,
	brands,
	categories,
	attributes,
	marca,
	categoria,
	page_size,
}) => {
	let defaultFilters = {
		brands: brands,
		categories: categories,
		attributes: attributes,
		filter_available: filter_available,
		filter_available_store: filter_available_store,
		filter_free_shipping: filter_free_shipping,
	};

	const [tempMobile, setTempMobile] = useState(false);
	const [loadingData, setLoadingData] = useState(false);
	const [data, setData] = useState({ results: [] });
	const [pageActual, setPageActual] = useState(parseInt(page));
	const [lastUpdatedPage, setLastUpdatedPage] = useState(parseInt(page));
	const [internalOrder, setInternalOrder] = useState(order);
	const [itemsPerPage, setItemsPerPage] = useState(page_size);
	const [totalItems, setTotalItems] = useState(data.count);
	const [results, setResults] = useState([]);
	const [pages, setPages] = useState(Math.ceil(totalItems / itemsPerPage));
	const [loading, setLoading] = useState(true);
	const [firstLoading, setFirtsLoading] = useState(true);
	const [secondLoading, setSecondLoading] = useState(true);
	const [loadingFilters, setLoadingFilters] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [itemsAvailables, setItemsAvailables] = useState(0);
	const [itemsAvailableStore, setItemsAvailableStore] = useState(0);
	const [itemsAvailablesFreeShipping, seiIemsAvailablesFreeShipping] =
		useState(0);
	const [brandsAvailables, setBrandsAvailables] = useState([]);
	const [categoriesAvailables, setcategoriesAvailables] = useState([]);
	const [attributesAvailables, setAttributesAvailables] = useState([]);
	const [filtersActive, setFiltersActive] = useState(defaultFilters);
	const [filtersActiveMain, setFiltersActiveMain] = useState(defaultFilters);
	const router = useRouter();
	const { height, width } = WindowDimensions();
	const [mobileScroll, setMobileScroll] = useState(0);

	const dispacth = useAppDispatch();

	const convertTitle = Capitalize(q);

	const dictSortLabel = {
		'-ventas': 'Más vendidos',
		'-visitas': 'Más relevantes',
		precio: 'Menor precio',
		'-precio': 'Mayor precio',
		'-stock_total': 'Disponibilidad',
		'-created': ' Más recientes',
	};

	const handleSort = async (order) => {
		setInternalOrder(order);
		setSecondLoading(true);
		dispacth(hideAll());
		await router.replace({
			pathname: router.pathname,
			query: { ...router.query, order: order },
		});
	};

	const handleFiltersClear = async () => {
		dispacth(hideAll());

		await router.replace({
			pathname: router.pathname,
			query: { q, param: [marca, categoria] },
		});
	};

	const refreshPage = async (page) => {
		document.body.scrollTo(0, 0);
		setSecondLoading(true);
		await router.replace({
			pathname: router.pathname,
			query: { ...router.query, page },
		});
	};

	const updatePage = async () => {
		if (pageActual + 1 === lastUpdatedPage) {
			return;
		}

		await router.push(
			{
				pathname: router.pathname,
				query: { ...router.query, page: pageActual + 1 },
			},
			undefined,
			{ shallow: true, scroll: false }
		);
		setLastUpdatedPage(pageActual + 1);
		setPageActual((pageActual) => pageActual + 1);
	};

	const loadMore = async () => {
		try {
			if (loading) {
				return;
			}

			setLoading(true);

			if (hasMore && !firstLoading) {
				const moreResults = await fetchData(
					q,
					order,
					pageActual + 1,
					filter_available,
					filter_available_store,
					filter_free_shipping,
					brands,
					categories,
					attributes,
					marca,
					categoria,
					page_size
				);

				if (moreResults.results.length > 0) {
					setResults([...results, ...moreResults.results]);

					if (parseInt(pageActual) + 1 >= parseInt(pages)) {
						setHasMore(false);
					} else {
						updatePage();
					}
				}

				setLoading(false);
			}
		} catch (error) {}
	};

	const handleFiltersToApply = async () => {
		dispacth(hideAll());

		await router.replace({
			pathname: router.pathname,
			query: { ...router.query, ...filtersActiveMain, page: 1 },
		});
	};

	useEffect(() => {
		setSecondLoading(true);
		if (filtersActiveMain !== defaultFilters && !loadingData) {
			handleFiltersToApply();
		}
	}, [filtersActiveMain]);

	const getFilters = async () => {
		setLoadingFilters(true);
		const filters = await fetchFilterData(
			q,
			'-visitas',
			1,
			filter_available,
			filter_available_store,
			filter_free_shipping,
			brands,
			categories,
			attributes,
			marca,
			categoria
		);
		setItemsAvailables(filters.available_count);
		setItemsAvailableStore(filters.available_store_count);
		seiIemsAvailablesFreeShipping(filters.free_shipping_count);
		setBrandsAvailables(filters.brands);
		setcategoriesAvailables(filters.categories);
		setAttributesAvailables(filters.attributes);
	};

	useEffect(() => {
		setLoadingFilters(false);
	}, [
		itemsAvailables,
		itemsAvailableStore,
		itemsAvailablesFreeShipping,
		brandsAvailables,
		categoriesAvailables,
		attributesAvailables,
	]);

	useEffect(() => {
		getFilters();
	}, [q, filtersActive, filtersActiveMain]);

	useEffect(() => {
		setFirtsLoading(true);
		setLoading(true);
		setResults(data.results);
		setTotalItems(data.count);
		setPages(Math.ceil(data.count / itemsPerPage));
		setLoading(false);

		if (data.count > 10) {
			setHasMore(true);
		} else {
			setHasMore(false);
		}

		setFirtsLoading(false);
		setSecondLoading(false);
	}, [data]);

	useEffect(() => {
		setTempMobile(isMobile);
	}, [isMobile]);

	const getData = async () => {
		setLoadingData(true);
		if (!isMobile) {
			const datares = await fetchData(
				q,
				order,
				page,
				filter_available,
				filter_available_store,
				filter_free_shipping,
				brands,
				categories,
				attributes,
				marca,
				categoria,
				page_size
			);
			setData(datares);
		} else {
			if (page > 1) {
				const datares = await fetchData(
					q,
					order,
					1,
					filter_available,
					filter_available_store,
					filter_free_shipping,
					brands,
					categories,
					attributes,
					marca,
					categoria,
					page_size * page
				);
				setData(datares);
			} else {
				const datares = await fetchData(
					q,
					order,
					page,
					filter_available,
					filter_available_store,
					filter_free_shipping,
					brands,
					categories,
					attributes,
					marca,
					categoria,
					page_size
				);
				setData(datares);
			}
		}
		setLoadingData(false);
	};

	useEffect(() => {
		setTotalItems(0);
		setSecondLoading(true);
		if (data.results.length === 0) {
			setFirtsLoading(true);
		}
		getData();
		setFiltersActive(defaultFilters);
		setFiltersActiveMain(defaultFilters);
		setInternalOrder(order);

		parseInt(page) === 1 && setPageActual(1);
		parseInt(page) === 1 && sessionStorage.removeItem('scrollPosition');
		parseInt(page) === 1 && setMobileScroll(0);
		parseInt(page) === 1 && setLastUpdatedPage(1);
		isMobile && setFirtsLoading(true);
	}, [
		q,
		page,
		order,
		filter_available,
		filter_available_store,
		filter_free_shipping,
		brands,
		categories,
		attributes,
		marca,
		categoria,
	]);

	if (firstLoading) {
		return (
			<div className='list-products__container'>
				<div className='list-products__loader'>
					<Preloader
						use={TailSpin}
						size={30}
						strokeWidth={8}
						strokeColor='#FF002C'
						duration={900}
					/>
				</div>
				<style jsx>
					{`
						.list-products__loader {
							padding: 30px 0;
							width: 100%;
							display: flex;
							align-items: center;
							justify-content: center;
							position: relative;
							height: 50vh;
						}

						.mobile__clear-fix__filters {
							height: 54px;
						}

						.list-products__container {
							position: relative;
						}
					`}
				</style>
			</div>
		);
	}

	return (
		<div>
			{tempMobile && (
				<div>
					<MobileNavBar
						sortList={order}
						setSecondLoading={setSecondLoading}
						q={q}
						mobileScroll={mobileScroll}
						filtersActive={filtersActive}
					/>
					<FiltersOptios
						q={q}
						itemsAvailables={itemsAvailables}
						itemsAvailableStore={itemsAvailableStore}
						itemsAvailablesFreeShipping={itemsAvailablesFreeShipping}
						brandsAvailables={brandsAvailables}
						origin_filter_available={filter_available}
						origin_filter_available_store={filter_available_store}
						origin_filter_free_shipping={filter_free_shipping}
						origin_brands={brands}
						categoriesAvailables={categoriesAvailables}
						origin_categories={categories}
						attributesAvailables={attributesAvailables}
						origin_attributes={attributes}
						loading={loadingFilters}
						filtersActive={filtersActive}
						setFiltersActive={setFiltersActive}
						handleFiltersToApply={handleFiltersToApply}
						marca={marca}
						categoria={categoria}
					/>
				</div>
			)}
			{results.length > 0 ? (
				<div>
					<Head>
						<title>{`${convertTitle} | PCStore.mx`}</title>
						<meta
							name='description'
							content={`Compra tu ${convertTitle} en PCStore.mx - Compra protegida, envíos asegurados y pagos seguros con el mejor servicio, calidad y precio.`}
						/>
					</Head>
					{!tempMobile ? (
						<div className='container'>
							<div className='list-products__aside'>
								<div className='list-products__aside__filters'>
									<FiltersOptionsMain
										q={q}
										itemsAvailables={itemsAvailables}
										itemsAvailableStore={itemsAvailableStore}
										itemsAvailablesFreeShipping={itemsAvailablesFreeShipping}
										brandsAvailables={brandsAvailables}
										origin_filter_available={filter_available}
										origin_filter_available_store={filter_available_store}
										origin_filter_free_shipping={filter_free_shipping}
										origin_brands={brands}
										categoriesAvailables={categoriesAvailables}
										origin_categories={categories}
										attributesAvailables={attributesAvailables}
										origin_attributes={attributes}
										loading={loadingFilters}
										filtersActive={filtersActiveMain}
										setFiltersActive={setFiltersActiveMain}
										marca={marca}
										categoria={categoria}
										handleFiltersClear={handleFiltersClear}
									/>
								</div>
								<div className='list-products__main__results'>
									<div className='list-products__breadcrumblist'>
										<Navbar
											marca={data.brand}
											q={q}
											totalItems={totalItems}
											breadcrumblist={data.breadcrumblist}
										/>
									</div>
									<div className='list-products__sort'>
										<div className='list-products__sort__header'>
											<span className='bold'>Ordenar por:</span>
										</div>
										{Object.entries(dictSortLabel).map(([id, value]) => {
											if (id === internalOrder) {
												return (
													<div
														className='list-products__sort__option sort-active text--ligth bold'
														onClick={() => handleSort(id)}
														key={id}
													>
														{value}
													</div>
												);
											} else {
												return (
													<div
														className='list-products__sort__option'
														onClick={() => handleSort(id)}
														key={id}
													>
														{value}
													</div>
												);
											}
										})}
									</div>
									<div className='list-products__items'>
										{secondLoading ? (
											<div className='list-products__products__loader'>
												<Preloader
													use={TailSpin}
													size={30}
													strokeWidth={8}
													strokeColor='#FF002C'
													duration={900}
												/>
											</div>
										) : (
											<>
												<ListProducts
													results={results}
													filter_available_store={filter_available_store}
												/>
												<ListProductsPagination
													pages={pages}
													pageActive={page}
													refreshPage={refreshPage}
												/>
											</>
										)}
									</div>
								</div>
							</div>
							<CarouselProductsV2
								typeQuery={'-ventas'}
								responsiveElements={1}
								slideDimensions={'25%'}
								filter_available_store={filter_available_store}
								categoria={categoria}
								marca={marca}
								q={q}
								title={<h3>Recomendados</h3>}
							/>
						</div>
					) : secondLoading ? (
						<div className='list-products__products__loader'>
							<Preloader
								use={TailSpin}
								size={30}
								strokeWidth={8}
								strokeColor='#FF002C'
								duration={900}
							/>
						</div>
					) : (
						<ListProductsMobile
							results={results}
							filter_available_store={filter_available_store}
							hasMore={hasMore}
							setMobileScroll={setMobileScroll}
							loadMore={loadMore}
							mobileScroll={mobileScroll}
						/>
					)}
				</div>
			) : (
				<div
					className='list-products___container --no-results'
					style={{ height: tempMobile ? height - 108 : 'calc(100vh - 108px)' }}
				>
					<div>
						<div>
							<div className='no-results__icon__container'>
								<div className='no-results__icon'>
									<div>
										<IconNoSearch />
									</div>
								</div>
							</div>
							<span className='text--off'>
								Lo sentimos, no se encontraron resultados.
							</span>
						</div>
						{data.count > 0 ||
						filter_available ||
						filter_available_store ||
						filter_free_shipping ||
						brands.length !== 0 ||
						attributes.length !== 0 ||
						categories.length !== 0 ? (
							<div>
								<div className='list-products__label'>
									<span>
										Tienes filtros activados recomendamos limpiarlos para ver
										los resultados completos.
									</span>
								</div>
								<div className='list-products --no-result__clear-button'>
									<a
										className='filters__button-clear'
										onClick={() => handleFiltersClear()}
									>
										Limpiar Filtros
									</a>
								</div>
							</div>
						) : (
							<div className='list-products__label'>
								<span>
									Revisa la ortografía o intenta buscar con otra palabra más
									corta.
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{!isMobile && <Footer />}
			<style jsx>
				{`
					.list-products__products__loader {
						padding: 30px 0;
						width: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
						position: relative;
						height: 50vh;
					}

					.list-products__items {
						margin-top: 20px;
					}

					.list-products__sort__header {
						padding: 10px 0 5px;
					}

					.list-products__sort__option {
						padding: 10px 0 5px;
						margin: 0 10px;
						cursor: pointer;
					}

					.sort-active {
						cursor: default;
						border-bottom: 2px solid;
					}

					.list-products__sort {
						border-bottom: 1px solid #eaeaea;
						display: flex;
						align-content: center;
						line-height: 2;
					}

					.list-products__aside {
						display: flex;
					}

					.list-products__aside__filters {
						flex: 0 0 20%;
						min-width: 300px;
						width: auto;
					}

					.list-products__main__results {
						flex: 0 0 calc(100% - 300px);
					}

					.no-results__icon__container {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 100%;
						height: 100px;
					}

					.no-results__icon {
						fill: rgb(114 114 114);
						width: 100px;
						height: 200px;
					}
					.--no-result__clear-button {
						margin: 40px;
					}
					.list-products__label {
						font-size: 14px;
						min-height: 30px;
						height: auto;
						display: block;
						line-height: 2;
					}
					.--no-results {
						font-size: 16px;
						text-align: center;
					}

					.filters__button-clear {
						background-color: #ffb116;
						color: #ffffff;
						padding: 15px;
						border-radius: 2px;
						font-weight: 600;
						font-size: 16px;
						cursor: pointer;
					}

					.list-products___container {
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 20px;
					}

					.list-products__loader {
						padding: 30px 0;
						width: 100%;
						height: 90px;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.mobile__clear-fix__filters {
						height: 54px;
					}
				`}
			</style>
		</div>
	);
};

export default Listado;
