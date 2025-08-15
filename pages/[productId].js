'use client';

import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar/Navbar';
import DetailProduct from '../components/DetailProduct/DetailProduct';
import FetchGetDetailProduct from '../hooks/DetailProduct';
import Capitalize from '../hooks/CapitalizeTitle';
import WindowDimensions from '../hooks/WindowDimensions';
import CarouselProductsV3 from '../components/Carousel/CarouselProductsV3';
import CarouselProductsV2 from '../components/Carousel/CarouselProductsV2';
import ProductSpecs from '../components/ProductSpecs/ProductSpecs';
import BestCategoriesMini from '../components/BestCategoriesMini/BestCategoriesMini';
import BrandSimilarMini from '../components/BrandSimilarMini/BrandSimilarMini';

import CarouselProductsRelated from '../components/Carousel/CarouselProductsRelated';
import Footer from '../components/Footer/Footer';
import { useAppSelector } from '../lib/hooks';
import { useEnv } from '../context/EnvContext';
import { trackViewItem } from '../utils/analytics';
import SocialShare from '../components/SocialShare/SocialShare';

export const getServerSideProps = async (context) => {
	const { productId } = context.query;
	const data = await FetchGetDetailProduct(productId);

	return {
		props: data,
	};
};

const ProductItem = ({ item }) => {


	const convertTitle = Capitalize(item.titulo);

	const { height, width } = WindowDimensions();
	const router = useRouter();

	// Enviar evento de Google Analytics cuando se visualiza el producto
	useEffect(() => {
		if (item && item.id) {
			trackViewItem({
				id: item.id,
				title: item.titulo,
				nombre: item.titulo,
				categoria: { nombre: item.categoria },
				marca: { nombre: item.marca },
				precio_contado: item.precio_contado,
				price: item.precio_contado
			});
		}
	}, [item]);

	const { sellerDefaultName, pageUrl, storeName, titlePostDescription } =
		useEnv();

	const urlCurrent = `${pageUrl}${router.asPath}`;
	const headerLocationStock = useAppSelector(
		(state) => state.locationSlide.headerLocationStock
	);
	const locationStockOnly = useAppSelector(
		(state) => state.locationSlide.locationStockOnly
	);

	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

	return (
		<div>
			<Head>
				<title>{`${convertTitle} | ${storeName}`}</title>
				<meta
					name='description'
					content={`Compra tu ${convertTitle} en ${storeName} - ${titlePostDescription}`}
				/>
				<meta property='og:title' content={`${convertTitle} en ${storeName}`} />
				<meta
					property='og:description'
					content={`Compra tu ${convertTitle} en ${storeName} - ${titlePostDescription}`}
				/>
				<meta
					property='og:image'
					content={item.imagen1s ? item.imagen1s : '/images/not-available.png'}
				/>
				<meta
					property='og:image:secure_url'
					content={item.imagen1s ? item.imagen1s : '/images/not-available.png'}
				/>
				<meta property='og:image:width' content='1200' />
				<meta property='og:image:height' content='630' />
				<meta property='og:image:alt' content={`${convertTitle} - ${storeName}`} />
				<meta property='og:url' content={urlCurrent} />
				<meta property='product:price:currency' content='MXN' />
				<meta property='product:price:amount' content={item.precio_contado} />
				<meta property='product:availability' content={item.stock_total > 0 ? 'in stock' : 'out of stock'} />
				<meta property='product:condition' content='new' />
				<meta name='twitter:card' content='summary_large_image' />
				<meta
					property='twitter:title'
					content={`${convertTitle} en  ${storeName}`}
				/>
				<meta
					name='twitter:image'
					content={item.imagen1s ? item.imagen1s : '/images/not-available.png'}
				/>
				<meta
					property='twitter:description'
					content={`Compra tu ${convertTitle} en ${storeName} - ${titlePostDescription}`}
				/>
				<meta property='og:type' content='product' />
				<meta property='og:site_name' content={storeName} />

				{/* URL canónica */}
				<link rel='canonical' href={`${process.env.NEXT_PUBLIC_PAGE_URL}/${item.id}`} />
			</Head>
			<div className='container'>
				{!mobileView && (
					<div className='product__breadcrumblist'>
						<Navbar
							marca={item.marca}
							breadcrumblist={item.breadcrumblist}
							label={true}
						/>
					</div>
				)}
				<div className='product__detail-container'>
					<DetailProduct
						item={item}
						width={width}
						height={height}
						tempMobile={mobileView}
						filter_available_store={headerLocationStock}
						sellerDefaultName={sellerDefaultName}
					/>

					{/* Botón para compartir el producto - flotante encima de la imagen */}
					<div className='product__social-share'>
						<SocialShare
							url={urlCurrent}
							title={`${convertTitle} - ${storeName}`}
							description={`Compra ${convertTitle} en ${storeName} - ${titlePostDescription}`}
							image={item.imagen1s || '/images/not-available.png'}
							product={item}
						/>
					</div>
				</div>
				{item.compatibleProductos.filter((p) => p.stock_total > 1).length >
					0 && (
						<div className='product__recommended'>
							<CarouselProductsRelated
								data={item.compatibleProductos}
								title={<h2>Productos relacionados</h2>}
							/>
						</div>
					)}
				<div className='product__recommended'>
					<CarouselProductsV3
						typeQuery={'-visitas'}
						responsiveElements={1}
						slideDimensions={'25%'}
						categoria={item.parent__slug}
						marca={'all'}
						filter_available_store={locationStockOnly}
						q={''}
						exclude={item.id}
						mobile={mobileView}
						title={<h2>También te puede interesar</h2>}
					/>
				</div>

				<div className='product__body'>
					<div className='product__primary__container'>
						{(item.descripcion ||
							(item.specs && Object.keys(item.specs).length > 0)) && (
								<ProductSpecs item={item} />
							)}
					</div>
					<div className='product__secondary__container'>
						<BestCategoriesMini
							parentCategorie={item.parent__slug}
							title={<h2>Categorías que te podrían interesar</h2>}
							filter_available_store={locationStockOnly}
						/>
						<BrandSimilarMini
							categoria={item.categoria}
							marca={item.marca}
							item={item}
							filter_available_store={locationStockOnly}
						/>
					</div>
				</div>
				<div className='product__recommended__bk__off'>
					{!mobileView ? (
						<CarouselProductsV2
							typeQuery={'-ventas'}
							responsiveElements={1}
							slideDimensions={'25%'}
							categoria={item.parent__slug}
							marca={'all'}
							filter_available_store={locationStockOnly}
							q={''}
							exclude={item.id}
							mobile={mobileView}
							title={
								<h2>
									Otros clientes que vieron este producto también compraron
								</h2>
							}
						/>
					) : (
						<CarouselProductsV3
							typeQuery={'-ventas'}
							responsiveElements={1}
							slideDimensions={'25%'}
							categoria={item.parent__slug}
							marca={'all'}
							filter_available_store={locationStockOnly}
							q={''}
							exclude={item.id}
							mobile={mobileView}
							title={
								<h3>
									Otros clientes que vieron este producto también compraron
								</h3>
							}
						/>
					)}
				</div>
			</div>
			<Footer />
			<style>
				{`
					.product__same-brand__recommended {
						margin-top: 20px;
					}

					.product__recommended__bk__off {
						margin-top: 20px;
					}

					.product__body {
						margin-top: 20px;
						display: flex;
						flex-wrap: wrap;
						justify-content: space-between;
						gap: 20px;
					}
					.product__primary__container {
						flex-basis: calc(65% - 10px);
					}

					.product__secondary__container {
						flex-basis: calc(35% - 10px);
					}

					.product__breadcrumblist {
						line-height: 4;
					}

					.product__detail-container {
						position: relative;
					}

					.product__social-share {
						position: absolute;
						top: 16px;
						right: 16px;
						z-index: 10;
					}

					@media (max-width: 768px) {
						.product__social-share {
							top: 12px;
							right: 12px;
						}
					}

					.product__recommended h2,
					.product__recommended__bk__off h2 {
						margin-left: 10px;
					}

					.product__recommended__bk__off h2 {
						line-height: 3;
					}

					.container {
						margin-top: 0;
					}

					@media only screen and (max-width: 42em) {
						.product__primary__container,
						.product__secondary__container {
							flex-basis: 100%;
						}

						.product__secondary__container {
							margin-top: 10px;
						}

						.product__recommended__bk__off h2 {
							margin-top: 20px;
							line-height: 1.5;
						}

						.product__recommended__bk__off {
							background-color: #ffffff;
							border-top: 1px solid #eaeaea;
							border-bottom: 1px solid #eaeaea;
						}

						.product__recommended__bk__off,
						.product__recommended,
						.product__same-brand__recommended,
						.product__categories__recommended,
						.product__primary__container {
							border-left: 0 !important;
							border-right: 0 !important;
						}
					}
				`}
			</style>
		</div>
	);
};

export default ProductItem;
