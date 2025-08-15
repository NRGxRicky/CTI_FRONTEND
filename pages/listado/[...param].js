import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar/Navbar';
import ListProducts from '../../components/ListProducts/ListProducts';
import fetchData from '../../hooks/GetData';
import ListProductsPagination from '../../components/ListProductsPagination/ListProductsPagination';
import { useRouter } from 'next/router';
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
import { setLocationStockOnly } from '../../lib/features/locationSlide';
import { useEnv } from '../../context/EnvContext';
import { hideAll } from '../../lib/features/showOpacityContainerSlide';

import Capitalize from '../../hooks/CapitalizeTitle';


export const getServerSideProps = async (context) => {
	let order = '-visitas';
	let q = '';
	let page = '1';
	let filter_available = false;
	let filter_available_store = false;
	let filter_free_shipping = false;
	let filter_discount = false;
	let brands = [];
	let categories = [];
	let attributes = [];
	let categoria = 'index';
	let marca = 'all';
	let page_size = 0;

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
	} else {
		filter_available = true;
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

	if (context.query.filter_discount) {
		if (context.query.filter_discount) {
			filter_discount = context.query.filter_discount.toLowerCase() === 'true';
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
			filter_discount,
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
	filter_discount,
	brands,
	categories,
	attributes,
	marca,
	categoria,
	page_size,
}) => {
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
	const [itemsAvailablesFreeShipping, setItemsAvailablesFreeShipping] =
		useState(0);
	const [itemsAvailablesDiscount, setItemsAvailablesDiscount] = useState(0);
	const [brandsAvailables, setBrandsAvailables] = useState([]);
	const [categoriesAvailables, setcategoriesAvailables] = useState([]);
	const [attributesAvailables, setAttributesAvailables] = useState([]);
	const router = useRouter();
	const { height } = WindowDimensions();
	const [mobileScroll, setMobileScroll] = useState(0);
	const [convertTitle, setConvertTitle] = useState(q);
	const dispatch = useAppDispatch();
	const [applyFilters, setApplyFilters] = useState(false);
	const locationStockOnly = useAppSelector(
		(state) => state.locationSlide.locationStockOnly
	);
	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);
	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);
	const { storeName, titlePostDescription } = useEnv();

	useEffect(() => {
		itemsPerPage === 0 && setItemsPerPage(maxPageResults);
	}, [mobileView]);

	let defaultFilters = {
		brands: brands,
		categories: categories,
		attributes: attributes,
		filter_available: filter_available,
		filter_available_store: locationStockOnly,
		filter_free_shipping: filter_free_shipping,
		filter_discount: filter_discount,
	};

	const [filtersActive, setFiltersActive] = useState(defaultFilters);

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
		dispatch(hideAll());
		await router.replace({
			pathname: router.pathname,
			query: { ...router.query, order: order },
		});
	};

	const handleFiltersClear = async () => {
		dispatch(hideAll());

		setFiltersActive({
			brands: [],
			categories: [],
			attributes: [],
			filter_available: false,
			filter_available_store: false,
			filter_free_shipping: false,
			filter_discount: false,
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
					locationStockOnly,
					filter_free_shipping,
					filter_discount,
					brands,
					categories,
					attributes,
					marca,
					categoria,
					itemsPerPage
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
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const handleFiltersToApply = async () => {
		dispatch(hideAll());

		await router.replace({
			pathname: router.pathname,
			query: { ...router.query, ...filtersActive, page: 1 },
		});
	};

	useEffect(() => {
		setSecondLoading(true);
		if (filtersActive !== defaultFilters && !loadingData) {
			handleFiltersToApply();
		}
	}, [filtersActive]);

	const getFilters = async () => {
		setLoadingFilters(true);
		const filters = await fetchFilterData(
			q,
			'-visitas',
			1,
			filter_available,
			locationStockOnly,
			filter_free_shipping,
			filter_discount,
			brands,
			categories,
			attributes,
			marca,
			categoria
		);

		setItemsAvailables(filters.available_count);
		setItemsAvailableStore(filters.available_store_count);
		setItemsAvailablesFreeShipping(filters.free_shipping_count);
		setItemsAvailablesDiscount(filters.available_discount);
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
		itemsAvailablesDiscount,
		brandsAvailables,
		categoriesAvailables,
		attributesAvailables,
	]);

	useEffect(() => {
		getFilters();
	}, [q, filtersActive]);

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

	const getData = async () => {
		setLoadingData(true);
		if (!mobileView) {
			const datares = await fetchData(
				q,
				order,
				page,
				filter_available,
				locationStockOnly,
				filter_free_shipping,
				filter_discount,
				brands,
				categories,
				attributes,
				marca,
				categoria,
				itemsPerPage
			);
			setData(datares);
		} else {
			if (page > 1) {
				const datares = await fetchData(
					q,
					order,
					1,
					filter_available,
					locationStockOnly,
					filter_free_shipping,
					filter_discount,
					brands,
					categories,
					attributes,
					marca,
					categoria,
					itemsPerPage * page
				);
				setData(datares);
			} else {
				const datares = await fetchData(
					q,
					order,
					page,
					filter_available,
					locationStockOnly,
					filter_free_shipping,
					filter_discount,
					brands,
					categories,
					attributes,
					marca,
					categoria,
					itemsPerPage
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
		setApplyFilters(false);
		getData();
		setFiltersActive(defaultFilters);
		setInternalOrder(order);

		parseInt(page) === 1 && setPageActual(1);
		parseInt(page) === 1 && sessionStorage.removeItem('scrollPosition');
		parseInt(page) === 1 && setMobileScroll(0);
		parseInt(page) === 1 && setLastUpdatedPage(1);
		mobileView && setFirtsLoading(true);

		if (categoria !== 'index') {
			let newNameCategory = String(categoria).split('index-').join('');
			q
				? setConvertTitle(
					` | ${Capitalize(newNameCategory.split('-').join(' '))}`
				)
				: setConvertTitle(
					`${Capitalize(String(newNameCategory).split('-').join(' '))}`
				);
		} else if (marca !== 'all') {
			q
				? setConvertTitle(
					` | Tienda de Marca ${Capitalize(
						String(marca).split('-').join(' ')
					)}`
				)
				: setConvertTitle(
					`Tienda de Marca ${Capitalize(String(marca).split('-').join(' '))}`
				);
		} else if (!q && filter_discount) {
			setConvertTitle(`OFERTAS`);
		} else {
			setConvertTitle(q);
		}
	}, [
		q,
		page,
		order,
		filter_available,
		filter_free_shipping,
		filter_discount,
		filter_available_store,
		brands,
		categories,
		attributes,
		marca,
		categoria,
		applyFilters,
		itemsPerPage,
	]);

	useEffect(() => {
		if (filtersActive.filter_available_store !== locationStockOnly) {
			dispatch(setLocationStockOnly(filtersActive.filter_available_store));
		}
	}, [filtersActive.filter_available_store]);

	useEffect(() => {
		if (filtersActive.filter_available_store !== locationStockOnly) {
			let copyState = filtersActive;
			copyState.filter_available_store = locationStockOnly;
			setFiltersActive((prevState) => ({
				...prevState,
				...copyState,
			}));
		}
	}, [locationStockOnly]);

	if (firstLoading) {
		return (
			<div className='list-products__container'>
				<div className='list-products__loader'>
					<Preloader
						use={TailSpin}
						size={30}
						strokeWidth={8}
						strokeColor='var(--primary-color)'
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
			{mobileView && (
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
						itemsAvailablesDiscount={itemsAvailablesDiscount}
						brandsAvailables={brandsAvailables}
						origin_filter_available={filter_available}
						origin_filter_available_store={locationStockOnly}
						origin_filter_free_shipping={filter_free_shipping}
						origin_filter_discount={filter_discount}
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
						<title>{`${convertTitle} | ${storeName}`}</title>
						<meta
							name='description'
							content={`${convertTitle} en ${storeName} - ${titlePostDescription}`}
						/>

						{/* Meta tags adicionales para SEO */}
						<meta name="robots" content="index, follow" />
						<meta name="googlebot" content="index, follow" />

						{/* Canonical URL para evitar contenido duplicado */}
						<link rel="canonical" href={`${process.env.NEXT_PUBLIC_PAGE_URL}${router.asPath.split('?')[0]}`} />

						{/* Open Graph para redes sociales */}
						<meta property="og:title" content={`${convertTitle} | ${storeName}`} />
						<meta property="og:description" content={`Encuentra ${convertTitle} en ${storeName}. ${results.length} productos disponibles con envío gratis y mejores precios.`} />
						<meta property="og:type" content="website" />
						<meta property="og:url" content={`${process.env.NEXT_PUBLIC_PAGE_URL}${router.asPath}`} />
						<meta property="og:site_name" content={storeName} />
						<meta property="og:locale" content="es_MX" />
						{results[0]?.imagen1s && (
							<>
								<meta property="og:image" content={results[0].imagen1s} />
								<meta property="og:image:width" content="1200" />
								<meta property="og:image:height" content="630" />
								<meta property="og:image:alt" content={`${convertTitle} en ${storeName}`} />
							</>
						)}

						{/* Twitter Cards */}
						<meta name="twitter:card" content="summary_large_image" />
						<meta name="twitter:title" content={`${convertTitle} | ${storeName}`} />
						<meta name="twitter:description" content={`Encuentra ${convertTitle} en ${storeName}. ${results.length} productos disponibles.`} />
						{results[0]?.imagen1s && <meta name="twitter:image" content={results[0].imagen1s} />}

						{/* Paginación para SEO */}
						{parseInt(pageActual) > 1 && (
							<link rel="prev" href={`${router.asPath.split('?')[0]}?${new URLSearchParams({ ...router.query, page: (parseInt(pageActual) - 1).toString() }).toString()}`} />
						)}
						{results.length === itemsPerPage && (
							<link rel="next" href={`${router.asPath.split('?')[0]}?${new URLSearchParams({ ...router.query, page: (parseInt(pageActual) + 1).toString() }).toString()}`} />
						)}

						{/* Datos estructurados para resultados de búsqueda */}
						<script
							type="application/ld+json"
							dangerouslySetInnerHTML={{
								__html: JSON.stringify({
									"@context": "https://schema.org",
									"@type": "SearchResultsPage",
									"url": `${process.env.NEXT_PUBLIC_PAGE_URL}${router.asPath}`,
									"name": `${convertTitle} | ${storeName}`,
									"description": `Resultados de búsqueda para ${convertTitle} en ${storeName}`,
									"provider": {
										"@type": "Organization",
										"name": storeName,
										"url": process.env.NEXT_PUBLIC_PAGE_URL
									},
									"mainEntity": {
										"@type": "ItemList",
										"numberOfItems": results.length,
										"itemListElement": results.slice(0, 10).map((product, index) => ({
											"@type": "ListItem",
											"position": index + 1,
											"item": {
												"@type": "Product",
												"name": product.titulo,
												"description": product.descripcion || `${product.titulo} disponible en ${storeName}`,
												"image": product.imagen1s,
												"url": `${process.env.NEXT_PUBLIC_PAGE_URL}/${product.id}`,
												"offers": {
													"@type": "Offer",
													"price": product.precio_contado,
													"priceCurrency": "MXN",
													"availability": product.stock_total > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
													"seller": {
														"@type": "Organization",
														"name": storeName
													}
												},
												"brand": {
													"@type": "Brand",
													"name": product.marca
												}
											}
										}))
									}
								})
							}}
						/>
					</Head>
					{!mobileView ? (
						<div className='container'>
							<div className='list-products__aside'>
								<div className='list-products__aside__filters'>
									<FiltersOptionsMain
										q={q}
										itemsAvailables={itemsAvailables}
										itemsAvailableStore={itemsAvailableStore}
										itemsAvailablesFreeShipping={itemsAvailablesFreeShipping}
										itemsAvailablesDiscount={itemsAvailablesDiscount}
										brandsAvailables={brandsAvailables}
										origin_filter_available={filter_available}
										origin_filter_available_store={locationStockOnly}
										origin_filter_free_shipping={filter_free_shipping}
										origin_filter_discount={filter_discount}
										origin_brands={brands}
										categoriesAvailables={categoriesAvailables}
										origin_categories={categories}
										attributesAvailables={attributesAvailables}
										origin_attributes={attributes}
										loading={loadingFilters}
										filtersActive={filtersActive}
										setFiltersActive={setFiltersActive}
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
														className='list-products__sort__option sort-active text--light bold'
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
													strokeColor='var(--primary-color)'
													duration={900}
												/>
											</div>
										) : (
											<>
												<ListProducts
													results={results}
													filter_available_store={locationStockOnly}
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
								filter_available_store={locationStockOnly}
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
								strokeColor='var(--primary-color)'
								duration={900}
							/>
						</div>
					) : (
						<ListProductsMobile
							results={results}
							filter_available_store={locationStockOnly}
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
					style={{ height: mobileView ? height - 108 : 'calc(100vh - 108px)' }}
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
							locationStockOnly ||
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

			{!mobileView && <Footer />}
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
						margin-top: 20px;
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
						border-radius: 5px;
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
