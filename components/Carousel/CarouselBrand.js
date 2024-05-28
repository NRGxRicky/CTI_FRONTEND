import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useAppSelector } from '../../lib/hooks';
import Link from 'next/link';

const CarouselBrand = ({ responsiveElements = 3, mobile = false }) => {
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [prevButton, setPrevButton] = useState(true);
	const [nextButton, setNextButton] = useState(true);
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			slidesToScroll: responsiveElements,
			loop: false,
		},
		[Autoplay({ playOnInit: true, delay: 6000 })]
	);

	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(`https://api.pccdnapi.com/brands/bestbrands/`);
			setData(await data.json());
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	let styleClass =
		'carousel__button carousel__button-next carousel__button--color-ligth';

	if (mobile) {
		styleClass = styleClass.concat(' brand__button__show_mobile');
	}

	const checkButtonNext = () => {
		if (!emblaApi.canScrollNext()) {
			setNextButton(false);
		} else {
			setNextButton(true);
		}
	};

	const checkButtonPrev = () => {
		if (!emblaApi.canScrollPrev()) {
			setPrevButton(false);
		} else {
			setPrevButton(true);
		}
	};

	const checkAllButons = () => {
		checkButtonNext();
		checkButtonPrev();
	};

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev();
		checkButtonPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
		checkButtonNext();
	}, [emblaApi]);

	useEffect(() => {
		if (emblaApi) {
			checkAllButons();
			//  API is ready
			emblaApi.on('select', checkAllButons);
		}
	}, [emblaApi]);

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) {
		return (
			<div className=''>
				<style jsx>
					{`
						. {
							position: relative;
							width: 100%;
							height: 200px;
						}
					`}
				</style>
			</div>
		);
	}
	return (
		<div>
			<div className='brand__carousel'>
				<div className='brand__header'>
					<h1>LAS MEJORES MARCAS</h1>
				</div>
				<div className='brand____viewport' ref={emblaRef}>
					<div className='brand____container'>
						{data.results.map((brand) => (
							<div className='brand____slide' key={brand.id}>
								<div className='brand__imagen'>
									<Link
										href={`/listado/${brand.slug}/index/?page_size=${maxPageResults}`}
										legacyBehavior
									>
										<Image
											src={
												brand.imagen
													? brand.imagen
													: '/images/not-available.png'
											}
											fill
											style={{
												objectFit: 'contain',
												mixBlendMode: 'multiply',
												padding: 10,
											}}
											draggable='false'
											alt={brand.nombre}
											sizes='auto'
										/>
									</Link>
								</div>
							</div>
						))}
					</div>
					<div
						onClick={scrollNext}
						className={styleClass}
						style={
							!nextButton || mobile ? { opacity: '0' } : { opacity: '0.9' }
						}
					>
						<button
							role='presentation'
							type='button'
							className='button__nav'
							tabIndex='-1'
						>
							<svg
								className='button_nav__icon'
								width='14.6'
								height='27'
								viewBox='0 0 16 27'
								xmlns='http://www.w3.org/1700/svg'
							>
								<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
							</svg>
						</button>
					</div>
					<div
						onClick={scrollPrev}
						className='carousel__button carousel__button-prev carousel__button--color-ligth'
						style={
							!prevButton || mobile ? { opacity: '0' } : { opacity: '0.9' }
						}
					>
						<button
							role='presentation'
							type='button'
							className='button__nav'
							tabIndex='-1'
						>
							<svg
								className='button_nav__icon'
								width='14.6'
								height='27'
								viewBox='0 0 16 27'
								xmlns='http://www.w3.org/1700/svg'
							>
								<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
							</svg>
						</button>
					</div>
				</div>
			</div>
			<style jsx>
				{`
					.brand__header {
						margin: 15px 0;
						font-size: 16px;
					}

					.brand__header h1 {
						font-size: 18px;
					}

					.brand__imagen {
						position: relative;
						height: 80px;
						width: 80px;
						background-color: #f7f7f7;
						border-radius: 10px;
						display: flex;
						align-items: center;
						justify-content: center;
						cursor: pointer;
					}
					.brand__carousel {
						width: 100%;
						position: relative;
						padding-top: 10px;
						padding-left: 15px;
						margin-bottom: 30px;

					.brand____container {
						display: flex;
					}

					.brand____viewport {
						width: 100%;
						overflow: hidden;
						position: relative;
					}

					.brand____slide {
						position: relative;

						flex: 0 0 100px;
					}

					.carousel__button {
						border-radius: 0 4px 4px 0;
						justify-content: space-around;
						position: absolute;
						top: calc(50% - 38px);
						width: 40px;
						height: 75px;
						box-shadow: 0 1px 5px 0 rgb(0 0 0 / 11%);
						transition: opacity 0.2s ease-in;
						display: flex;
						align-items: center;
						cursor: pointer;
						text-decoration: none;
						opacity: 0;
						user-select: none;
					}

					.button__nav {
						background: none;
						color: inherit;
						border: none;
						padding: 0;
						font: inherit;
						cursor: pointer;
						user-select: none;
					}

					.carousel__button-prev {
						left: 0;
					}

					.carousel__button-next {
						right: 0;
						transform: rotate(180deg);
					}

					.carousel__button--color-ligth {
						background: #ffffff;
						fill: #ff002c;
					}

					.carousel__button--color-ligth:hover,
					.carcarousel__button--color-ligth:active {
						background: #ffffff;
					}

					@media only screen and (min-width: 48em) {
						.embla:hover .carousel__button {
							opacity: 1;
						}
					}
				`}
			</style>
		</div>
	);
};

export default CarouselBrand;
