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

	useEffect(() => {
		setTempMobile(isMobile);
	}, [isMobile]);
	
	return (
		<div>
			<Head>
				<title>{`${convertTitle} | PcStore.mx`}</title>
				<meta
					name='description'
					content={`Compra tu ${convertTitle} en PcStore.mx - Compra protegida, envíos asegurados y pagos seguros con el mejor servicio, calidad y precio.`}
				/>
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
						<h2>Productos relacionados</h2>
						<CarouselProductsRelated data={item.compatibleProductos} />
					</div>
				)}
				<div className='product__recommended'>
					<h2>También te puede interesar</h2>
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
					/>
				</div>

				<div className='product__body'>
					<div className='product__primary__container'>
						<ProductSpecs item={item} />
					</div>
					<div className='product__secondary__container'>
						<div className='product__categories__recommended'>
							<h2>Categorías que te podrían interesar</h2>
							<BestCategoriesMini parentCategorie={item.parent__slug} />
						</div>
						<div className='product__same-brand__recommended'>
							<BrandSimilarMini
								categoria={item.categoria}
								marca={item.marca}
								item={item}
							/>
						</div>
					</div>
				</div>
				<div className='product__recommended__bk__off'>
					<h2>Otros clientes que vieron este producto también compraron</h2>
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
						/>
					)}
				</div>
			</div>
			<Footer />
			<style jsx>
				{`
					.product__same-brand__recommended,
					.product__categories__recommended {
						background-color: #ffffff;
						padding: 20px;
						border: 1px solid #eaeaea;
					}
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
						background-color: #ffffff;
						padding: 10px 20px;
						border: 1px solid #eaeaea;
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

					.product__recommended {
						margin-top: 20px;
						background-color: #ffffff;
						padding-top: 20px;
						border: 1px solid #eaeaea;
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
