import React, { useState, useEffect } from 'react';
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
import BestCategoriesMini from '../components/BestCategories/BestCategoriesMini';
import BrandSimilarMini from '../components/BrandSimilarMini/BrandSimilarMini';
import InfoMini from '../components/InfoMini/InfoMini';
import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile,
} from 'react-device-detect';
import CarouselProductsRelated from '../components/Carousel/CarouselProductsRelated';
import Footer from '../components/Footer/Footer';

export const getServerSideProps = async (context) => {
	const { productId } = context.query;
	const data = await FetchGetDetailProduct(productId);
	return {
		props: data,
	};
};

const ProductItem = ({ item }) => {
	const convertTitle = Capitalize(item.titulo);
	const [tempMobile, setTempMobile] = useState(false);
	const { height, width } = WindowDimensions();
	const router = useRouter();
	const urlCurrent = `${process.env.NEXT_PUBLIC_BASE_URL}${router.asPath}`;
	
	useEffect(() => {
		setTempMobile(isMobile);
	}, [isMobile]);

	return (
		<div>
			<Head>
				<title>{`${convertTitle} | PCStore.mx`}</title>
				<meta
					name='description'
					content={`Compra tu ${convertTitle} en PCStore.mx - Compra protegida, envíos asegurados y pagos seguros con el mejor servicio, calidad y precio.`}
				/>
				<meta property='og:title' content={`${convertTitle} en PCStore.mx`} />
				<meta
					property='og:description'
					content={`Compra protegida, envíos asegurados y pagos seguros con el mejor servicio, calidad y precio.`}
				/>
				<meta
					property='og:image'
					content={item.imagen1s ? item.imagen1s : '/images/not-available.png'}
				/>
				<meta property='og:url' content={urlCurrent} />
				<meta name='twitter:card' content='summary_large_image' />
			</Head>
			<div className='container'>
				{!tempMobile && (
					<div className='product__breadcrumblist'>
						<Navbar
							marca={item.marca}
							breadcrumblist={item.breadcrumblist}
							label={true}
						/>
					</div>
				)}
				<DetailProduct
					item={item}
					width={width}
					height={height}
					tempMobile={tempMobile}
				/>
				{item.compatibleProductos.length > 0 && (
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
						filter_available_store={false}
						q={''}
						exclude={item.id}
						mobile={tempMobile}
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
						/>
						<BrandSimilarMini
							categoria={item.categoria}
							marca={item.marca}
							item={item}
						/>
					</div>
				</div>
				<div className='product__recommended__bk__off'>
					{!tempMobile ? (
						<CarouselProductsV2
							typeQuery={'-ventas'}
							responsiveElements={1}
							slideDimensions={'25%'}
							categoria={item.parent__slug}
							marca={'all'}
							filter_available_store={false}
							q={''}
							exclude={item.id}
							mobile={tempMobile}
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
							filter_available_store={false}
							q={''}
							exclude={item.id}
							mobile={tempMobile}
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
			<style jsx>
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
