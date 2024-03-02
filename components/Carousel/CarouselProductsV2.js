import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import NewProduct from '../Icons/NewProduct';
import TextTruncate from 'react-text-truncate';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';

const CarouselProductsV2 = ({
	responsiveElements = 2,
	mobile = false,
	typeQuery,
	filter_available_store,
	categoria,
	marca,
	q,
	exclude = null,
}) => {
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [prevButton, setPrevButton] = useState(true);
	const [nextButton, setNextButton] = useState(true);
	const [emblaRef, emblaApi] = useEmblaCarousel({
		slidesToScroll: responsiveElements,
		loop: false,
		containScroll: 'trimSnaps',
		align: 'start',
	});

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				`https://api.pccdnapi.com/section?type=${typeQuery}&marca=${marca}&categoria=${categoria}&q=${q}&filter_available_store=${filter_available_store}`
			);
			setData(await data.json());
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	let styleClass =
		'v2__carousel__button v2__carousel__button-next v2__carousel__button--color-ligth';

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
			// Embla API is ready
			emblaApi.on('select', checkAllButons);
		}
	}, [emblaApi]);

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		fetchData();
	}, [q, filter_available_store]);

	if (loading) {
		return <div></div>;
	}

	if (data.results.length >= 4) {
		return (
			<div className='list-products__section'>
				<h3>Recomendados</h3>
				<div className='list-products__section__content'>
					<div className='v2__embla'>
						<div className='v2__embla__viewport' ref={emblaRef}>
							<div className='v2__embla__container'>
								{data.results
									.filter((i) => i.id !== exclude)
									.map((producto) => (
										<div className='v2__embla__slide' key={producto.id}>
											<Link href={`/${producto.slug}`} legacyBehavior>
												<a>
													<div className='v2__card__carousel'>
														<div className='v2__card__carousel__content'>
															<div className='v2__card__carousel__image'>
																<Image
																	src={
																		producto.imagen1s
																			? producto.imagen1s
																			: '/images/not-available.png'
																	}
																	fill
																	style={{ objectFit: 'contain' }}
																	alt={Capitalize(producto.titulo)}
																	draggable='false'
																	sizes='auto'
																/>
																<NewProduct date={producto.created} />
															</div>
														</div>
														<div className='v2__card__carousel__content'>
															<div className='v2__card__carousel__title'>
																<TextTruncate
																	line={2}
																	element='span'
																	truncateText='…'
																	text={Capitalize(producto.titulo)}
																/>
															</div>
															<div className='v2__card__carousel__sku text--off'>
																<TextTruncate
																	line={3}
																	element='span'
																	truncateText='…'
																	text={Capitalize(producto.modelo)}
																/>
															</div>
															<div className='v2__card__carousel__price'>
																<span>
																	${' '}
																	{CurrencyFormat(
																		producto.precio_final,
																		2,
																		'.',
																		','
																	)}
																</span>
															</div>
															<div className='v2__card__carousel__available'>
																{!filter_available_store && (
																	<div>
																		<span
																			className={
																				producto.stock_total > 0
																					? 'text--green'
																					: 'text--red'
																			}
																		>
																			{producto.stock_total}{' '}
																			{producto.stock_total > 1
																				? 'disponibles'
																				: 'disponible'}
																		</span>
																	</div>
																)}
																{filter_available_store && (
																	<div>
																		<span
																			className={
																				producto.stock_total > 0
																					? 'text--green'
																					: 'text--red'
																			}
																		>
																			{producto.stock_puebla}{' '}
																			{producto.stock_puebla > 1
																				? 'disponibles'
																				: 'disponible'}{' '}
																			- Entrega en Puebla
																		</span>
																	</div>
																)}
															</div>
															<div className='v2__card__carousel__info'>
																{producto.envio_gratis && <FreeShipping />}
															</div>
														</div>
													</div>
												</a>
											</Link>
										</div>
									))}
							</div>
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
								className='v2__button__nav'
								tabIndex='-1'
							>
								<svg
									className='v2__button_nav__icon'
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
							className='v2__carousel__button v2__carousel__button-prev v2__carousel__button--color-ligth'
							style={
								!prevButton || mobile ? { opacity: '0' } : { opacity: '0.9' }
							}
						>
							<button
								role='presentation'
								type='button'
								className='v2__button__nav'
								tabIndex='-1'
							>
								<svg
									className='v2__button_nav__icon'
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
				<style jsx global>
					{`
						.list-products__section {
							margin-top: 20px;
							margin-bottom: 20px;
						}

						.list-products__section__content {
							margin-top: 10px;
							line-height: 1.5;
						}

						.v2__embla {
							width: 100%;
							height: 180px;
							position: relative;
						}

						.v2__embla__container {
							display: flex;
							align-items: center;
							width: 100%;
							position: relative;
							column-gap: 20px;
						}

						.v2__embla__viewport {
							width: 100%;
							overflow: hidden;
							position: relative;
							height: 100%;
						}

						.v2__embla__slide {
							position: relative;
							flex: 1 0 50%;
							background-color: #ffffff;
							border: 1px solid #eaeaea;
						}

						.v2__carousel__button {
							border-radius: 0 4px 4px 0;
							justify-content: space-around;
							position: absolute;
							top: calc(50% - 52px);
							width: 47px;
							height: 104px;
							box-shadow: 0 1px 5px 0 rgb(0 0 0 / 11%);
							transition: opacity 0.2s ease-in;
							display: flex;
							align-items: center;
							cursor: pointer;
							text-decoration: none;
							opacity: 0;
						}

						.v2__button__nav {
							background: none;
							color: inherit;
							border: none;
							padding: 0;
							font: inherit;
							cursor: pointer;
							user-select: none;
						}

						.v2__carousel__button-prev {
							left: 0;
						}

						.v2__carousel__button-next {
							right: 0;
							transform: rotate(180deg);
						}

						.v2__carousel__button--color-ligth {
							background: #ffffff;
							fill: #ff002c;
						}

						.v2__carousel__button--color-ligth:hover,
						.v2__carcarousel__button--color-ligth:active {
							background: #ffffff;
						}

						@media only screen and (min-width: 48em) {
							.v2__embla:hover .carousel__button {
								opacity: 1;
							}
						}

						.v2__card__carousel {
							width: 100%;
							min-height: 170px;
							height: auto;
							max-height: 170px;
							position: relative;
							display: flex;
							align-items: center;
							padding: 5px;
						}

						.v2__card__carousel__image {
							align-self: center;
							position: relative;
							max-width: 100%;
							width: auto;
							min-height: 140px;
							max-height: 170px;
						}

						.v2__card__carousel__content {
							flex: 0 0 50%;
							padding: 5px;
						}

						.v2__card__carousel__price {
							width: 100%;
							font-weight: 600;
							font-size: 16px;
						}

						.v2__card__carousel__title {
							width: 100%;
							height: auto;
							margin-bottom: 5px;
						}
						.v2__card__carousel__available {
							width: 100%;
							height: 20px;
							font-size: 12px;
							font-weight: 600;
						}

						.v2__card__carousel__sku {
							height: 30px;
							width: 100%;
							margin-top: 4px;
							font-size: 12px;
						}

						.v2__card__carousel__info {
							width: 100%;
							margin-top: 7px;
							font-size: 12px;
						}

						@media only screen and (min-width: 62em) {
							.v2__embla__slide {
								flex: 1 0 calc(25% - 15px);
							}
							.v2__card__carousel__image {
								min-height: 140px;
								height: 140px;
							}
						}
					`}
				</style>
			</div>
		);
	} else {
		<div></div>;
	}
};

export default CarouselProductsV2;
