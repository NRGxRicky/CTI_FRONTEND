import React from 'react';
import Standard from '../components/Carousel/Standard';
import Head from 'next/head';
import CarouselProducts from '../components/Carousel/CarouselProducts';
import CarouselBrand from '../components/Carousel/CarouselBrand';
import InfoPageFooter from '../components/InfoPageFooter/InfoPageFooter';
import Footer from '../components/Footer/Footer';
import { useAppSelector } from '../lib/hooks';
import BestCategories from '../components/BestCategories/BestCategories';
import CarouselProductsV4 from '../components/Carousel/CarouselProductsv4';
import BenefitCarousel from '../components/BenefitCarousel/BenefitCarousel';
import { useEnv } from '../context/EnvContext';

const Home = () => {
	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);
	const { storeName, titlePostDescription, metaDescription } = useEnv();

	return (
		<div>
			<Head>
				<title>{`${storeName}: ${titlePostDescription}`}</title>
				<meta name='description' content={`${metaDescription}`} />
			</Head>
			<Standard />
			<div className='container'>
				<BestCategories mobile={mobileView} />
				<div className='section best'>
					<div className='section-products'>
						<div className='section-products__title section__offers'>
							<h1>🔥 OFERTAS</h1>
							<span>¡Aprovecha estas ofertas mientras están activas!</span>
						</div>
						<CarouselProductsV4 typeQuery={'-visitas'} mobile={mobileView} />
					</div>
				</div>
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

				<CarouselBrand mobile={mobileView} />

				<div className='section best'>
					<div className='section-products'>
						<div className='section-products__title'>
							<h1>MÁS VENDIDOS</h1>
						</div>
						<CarouselProducts typeQuery={'-ventas'} mobile={mobileView} />
					</div>
				</div>

				<div className='section best section-gamer'>
					<div className='section-products'>
						<div className='section-products__title section__offers'>
							<h1>🎮 ZONA GAMER</h1>
							<span>
								Visita nuestra sección con todo lo que necesitas para tu Setup
								Gamer.
							</span>
						</div>
						<CarouselProducts
							typeQuery={'-ventas'}
							mobile={mobileView}
							q={'gamer'}
						/>
					</div>
				</div>

				<BenefitCarousel />

				<InfoPageFooter />
			</div>
			<Footer />

			<style jsx>
				{`
					.section-gamer .section-products__title {
						background-color: var(--primary-color);
						color: #fff;
						border-bottom-left-radius: 0;
						border-bottom-right-radius: 0;
					}

					.section-gamer {
						border-radius: 5px;
					}

					.section {
						position: relative;
						margin-top: 20px;
					}

					.section-products__title {
						padding: 15px 20px;
					}

					.section-products {
					}

					.section__offers {
						color: var(--primary-color);
						border-radius: 5px;
						line-height: 1.5;
						display: flex;
						align-items: center;
						gap: 20px;
						margin-bottom: 5px;
					}

					h1 {
						font-size: 18px;
					}

					@media only screen and (max-width: 48em) {
						.button__show_mobile {
							opacity: 1 !important;
						}

						.section__offers {
							border-radius: 0;
						}
					}
				`}
			</style>
		</div>
	);
};

export default Home;
