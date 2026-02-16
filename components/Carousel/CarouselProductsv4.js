import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import NewProduct from '../Icons/NewProduct';
import TruncateMarkup from 'react-truncate-markup';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import { Preloader, TailSpin } from 'react-preloader-icon';
import { useApi } from '../../hooks/useApi';

const CarouselProductsV4 = ({
	responsiveElements = 2,
	mobile = false,
	typeQuery,
	filter_available_store = false,
	categoria = 'index',
	marca = 'all',
	q = '',
	exclude = null,
}) => {
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [prevButton, setPrevButton] = useState(true);
	const [nextButton, setNextButton] = useState(true);
	const { buildUrl } = useApi();
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
				buildUrl(`/section?type=${typeQuery}&marca=${marca}&categoria=${categoria}&q=${q}&filter_discount=true`),
				{
					headers: {
						'X-Store-ID': 'cti',
					},
				}
			);
			setData(await data.json());
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	let styleClass =
		'carousel__button carousel__button-next carousel__button--color-ligth';

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

	if (loading) {
		return (
			<div className='carousel'>
				<div className='carousel__loader'>
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
						.carousel {
							margin-top: 20px;
							width: 100%;
							height: 350px;
							position: relative;
						}

						.carousel__loader {
							position: absolute;
							right: 0;
							bottom: 0;
							height: calc(50% + 30px);
							width: calc(50% + 30px);
						}
					`}
				</style>
			</div>
		);
	}

	if (error) {
		return (
			<div className='carousel-error'>
				<div className='carousel-error__content'>
					<p className='carousel-error__icon'>⚠️</p>
					<p className='carousel-error__message'>
						No se pudieron cargar las ofertas en este momento.
					</p>
					<button onClick={fetchData} className='carousel-error__retry'>
						🔄 Intentar de nuevo
					</button>
				</div>
				<style jsx>{`
					.carousel-error {
						width: 100%;
						min-height: 200px;
						display: flex;
						align-items: center;
						justify-content: center;
						margin: 20px 0;
					}

					.carousel-error__content {
						text-align: center;
						padding: 30px;
						background: #fff3cd;
						border-radius: 8px;
						border: 2px solid #ffc107;
					}

					.carousel-error__icon {
						font-size: 48px;
						margin: 0 0 10px 0;
					}

					.carousel-error__message {
						font-size: 16px;
						color: #856404;
						margin: 10px 0;
					}

					.carousel-error__retry {
						margin-top: 15px;
						padding: 12px 24px;
						background: var(--primary-color);
						color: white;
						border: none;
						border-radius: 6px;
						font-size: 14px;
						font-weight: 600;
						cursor: pointer;
						transition: all 0.3s ease;
					}

					.carousel-error__retry:hover {
						transform: translateY(-2px);
						box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
					}
				`}</style>
			</div>
		);
	}
	return (
		<div>
			<div className='carousel'>
				<div className='carousel__viewport' ref={emblaRef}>
					<div className='carousel__container'>
						{(data?.results || [])
							.filter((i) => i.id !== exclude)
							.map((producto) => (
								<div className='carousel__slide' key={producto.id}>
									<Link href={`/${producto.slug}`} legacyBehavior>
										<a>
											<div className='card__carousel'>
												<div className='card__carousel__content'>
													{producto.precio_final_descuento > 0 && (
														<>
															<div className='product__price__label on-sale'>
																Ahorra{' '}
																{Math.ceil(
																	((producto.precio_final -
																		producto.precio_final_descuento) *
																		100) /
																	producto.precio_final
																)}
																%
															</div>
														</>
													)}
													<div className='card__carousel__image'>
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
												<div className='card__carousel__content'>
													<div className='card__carousel__title'>
														<TruncateMarkup lines={2}>
															<span>{Capitalize(producto.titulo)}</span>
														</TruncateMarkup>
													</div>
													<div className='card__carousel__sku text--off'>
														<TruncateMarkup lines={2}>
															<span>{Capitalize(producto.modelo)}</span>
														</TruncateMarkup>
													</div>
													<div className='card__carousel__price'>
														{producto.precio_final_descuento > 0 && (
															<>
																<div className='text--off'>
																	<span className='price--compare'>
																		$ {CurrencyFormat(producto.precio_final)}
																	</span>
																</div>
															</>
														)}
														<span>
															${' '}
															{CurrencyFormat(
																producto.precio_contado,
																2,
																'.',
																','
															)}
														</span>
													</div>
													<div className='card__carousel__available'>
														{!filter_available_store && (
															<div>
																<span className='text--green'>
																	{producto.stock_total}{' '}
																	{producto.stock_total > 1
																		? 'disponibles'
																		: 'disponible'}
																</span>
															</div>
														)}
														{filter_available_store && (
															<div>
																<span className='text--green'>
																	{producto.stock_puebla}{' '}
																	{producto.stock_puebla > 1
																		? 'disponibles'
																		: 'disponible'}{' '}
																	en Tienda
																</span>
															</div>
														)}
													</div>
													<div className='card__carousel__info'>
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
					style={!nextButton || mobile ? { opacity: '0' } : { opacity: '0.9' }}
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
					style={!prevButton || mobile ? { opacity: '0' } : { opacity: '0.9' }}
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
			<style jsx>
				{`
					.product__price__label {
						z-index: 1;
						position: absolute;
						left: 0;
					}

					.price--compare {
						font-size: 14px;
					}

					.carousel {
						width: 100%;
						max-height: 400px;
						position: relative;
						height: 300px;
					}

					.carousel__container {
						display: flex;
						align-items: center;
						width: 100%;
						position: relative;
						gap: 10px;
					}

					.carousel__viewport {
						width: 100%;
						overflow: hidden;
						position: relative;
						height: 100%;
					}

					.carousel__slide {
						position: relative;
						flex: 1 0 46%;
					}

					.carousel__button {
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
						fill: var(--primary-color);
					}

					.carousel__button--color-ligth:hover,
					.carcarousel__button--color-ligth:active {
						background: #ffffff;
					}

					@media only screen and (min-width: 48em) {
						.carousel:hover .carousel__button {
							opacity: 1;
						}
					}
					.on-sale {
						border-top-left-radius: 0;
						border-bottom-left-radius: 0;
					}

					.card__carousel {
						width: 100%;
						min-height: 170px;
						height: auto;
						max-height: 400px;
						position: relative;
						padding: 0 10px;
						align-items: center;
						background-color: #f7f7f7;
						border-radius: 10px;
					}

					.card__carousel__image {
						align-self: center;
						position: relative;
						max-width: 100%;
						width: auto;
						min-height: 140px;
						height: 140px;
						mix-blend-mode: multiply;
					}

					.card__carousel__content {
						padding: 5px;
					}

					.card__carousel__price {
						width: 100%;
						font-weight: 600;
						font-size: 16px;
					}

					.card__carousel__title {
						width: 100%;
						height: auto;
						margin-bottom: 5px;
						font-weight: 600;
						line-height: 1.5;
					}

					.card__carousel__available {
						width: 100%;
						height: 20px;
						font-size: 12px;
						line-height: 1.5;
						font-weight: 600;
					}

					.card__carousel__sku {
						height: 30px;
						width: 100%;
						margin-top: 4px;
						font-size: 12px;
					}

					.card__carousel__info {
						width: 100%;
						margin-top: 7px;
						font-size: 12px;
					}

					@media only screen and (min-width: 48em) {
						.carousel__slide {
							flex: 0 0 220px;
						}
						.card__carousel__image {
							min-height: 140px;
							height: 140px;
						}
					}
				`}
			</style>
		</div>
	);
};

export default CarouselProductsV4;
