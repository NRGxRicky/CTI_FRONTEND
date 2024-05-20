import React, { useEffect, useState } from 'react';
import Standard from '../components/Carousel/Standard';
import Head from 'next/head';
import CarouselProducts from '../components/Carousel/CarouselProducts';
import CarouselBrand from '../components/Carousel/CarouselBrand';
import InfoPageFooter from '../components/InfoPageFooter/InfoPageFooter';
import Footer from '../components/Footer/Footer';
import { useAppSelector } from '../lib/hooks';
import BestCategories from '../components/BestCategories/BestCategories';

const Home = () => {
	const [responsiveElements, setResponsiveElements] = useState(6);
	const [windowsSize, setWindowsSize] = useState(0);
	const [slideDimensions, setSlideDimensions] = useState('100%');

	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

	useEffect(() => {
		const updateWindowDimensions = () => {
			const newWidth = window.innerWidth;
			setWindowsSize(newWidth);
			if (newWidth < 579) {
				setResponsiveElements(2);
			} else if (newWidth > 579 && newWidth < 1200) {
				setResponsiveElements(4);
			} else if (newWidth > 900) {
				setResponsiveElements(6);
			}
		};
		let dimensions = 100 / responsiveElements;
		dimensions = dimensions + '%';
		setSlideDimensions(dimensions);

		window.addEventListener('resize', updateWindowDimensions);
		if (windowsSize === 0) {
			updateWindowDimensions();
		}
		return () => window.removeEventListener('resize', updateWindowDimensions);
	}, [windowsSize]);

	return (
		<div>
			<Head>
				<title>PCStore.mx: Tu tienda en Tecnología, Cómputo, Accesorios</title>
				<meta
					name='description'
					content={`PCStore.mx Tienda líder en cómputo, accesorios, hardware, tecnología y más. Compra protegida, envíos asegurados y pagos seguros con los mejores precios, productos y marcas.`}
				/>
			</Head>
			<Standard />
			<div className='container'>
				<BestCategories />
				<div className='section best'>
					<div className='section-products'>
						<div className='section-products__title'>
							<h1>RECOMENDADOS</h1>
						</div>
						<CarouselProducts typeQuery={'-visitas'} mobile={mobileView} />
					</div>
				</div>
				<div className='section best-categories'>
					<div className='section-products'>
						<div className='section-products__title'>
							<h1>NUEVOS</h1>
						</div>
						<CarouselProducts typeQuery={'-created'} mobile={mobileView} />
					</div>
				</div>
				<div className='section best-brands'>
					<div className='section-products'>
						<div className='section-products__title'>
							<h1>LAS MEJORES MARCAS</h1>
						</div>
						<CarouselBrand
							responsiveElements={responsiveElements}
							slideDimensions={slideDimensions}
						/>
					</div>
				</div>

				<div className='section best'>
					<div className='section-products'>
						<div className='section-products__title'>
							<h1>MÁS VENDIDOS</h1>
						</div>
						<CarouselProducts typeQuery={'-ventas'} mobile={mobileView} />
					</div>
				</div>
				<InfoPageFooter />
			</div>
			<Footer />
			<style jsx>
				{`
					.section {
						position: relative;
						margin-top: 20px;
						border: 1px solid #eaeaea;
						background: #ffffff;
					}

					.section-products__title {
						padding: 15px 20px;
						border-bottom: 1px solid #eaeaea;
					}

					.section-products {
						background: #ffffff;
					}

					h1 {
						font-size: 18px;
					}

					@media only screen and (max-width: 48em) {
						.button__show_mobile {
							opacity: 1 !important;
						}
					}
				`}
			</style>
		</div>
	);
};

export default Home;
