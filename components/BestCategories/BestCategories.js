/* eslint-disable react/no-unknown-property */
import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useAppSelector } from '../../lib/hooks';
import useEmblaCarousel from 'embla-carousel-react';
import TruncateMarkup from 'react-truncate-markup';
import { useApi } from '../../hooks/useApi';

const BestCategories = ({ mobile = false }) => {
	const [data, setData] = useState({ results: [] });
	const [prevButton, setPrevButton] = useState(true);
	const [nextButton, setNextButton] = useState(true);
	const { buildUrl } = useApi();
	let styleClass =
		'carousel__button carousel__button-next carousel__button--color-ligth';

	const [emblaRef, emblaApi] = useEmblaCarousel({
		slidesToScroll: 3,
		loop: false,
	});

	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);

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

	const fetchData = async () => {
		try {
			const data = await fetch(
				buildUrl('/categories/bestcategories/?parentcategorie=index')
			);
			setData(await data.json());
		} catch (_e) {
			// Silently ignore; UI can render empty state
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (data.results.length === 0) {
		return (
			<div className='best-categories-carousel'>
				<style jsx>
					{`
						.best-categories-carousel {
							margin-top: 20px;
							margin-bottom: 20px;
							min-height: 110px;
						}
					`}
				</style>
			</div>
		);
	}

	return (
		data.results.length > 1 && (
			<div className='best-categories-carousel'>
				<div className='best-categories-carousel__viewport' ref={emblaRef}>
					<div className='best-categories-carousel__container'>
						{(() => {
							const seen = new Set();
							return data.results
								.filter((i) => i.slug !== 'index')
								.filter((i) => i.portada)
								.filter((i) => {
									if (seen.has(i.name.toLowerCase())) {
										return false;
									}
									seen.add(i.name.toLowerCase());
									return true;
								});
						})().map((item, index) => (
							<div className='best-categories-carousel__item' key={index}>
								<div className='best-categories-carousel__image'>
									<Link
										href={`/listado/all/${item.slug}?page_size=${maxPageResults}`}
										legacyBehavior
									>
										<a className='best-categories-carousel__a'>
											<Image
												src={
													item.portada
														? item.portada
														: '/images/not-available.png'
												}
												fill
												style={{
													objectFit: 'contain',
													mixBlendMode: 'multiply',
													padding: 10,
												}}
												draggable='false'
												sizes='auto'
												alt={Capitalize(item.name)}
											/>
										</a>
									</Link>
								</div>

								<div className='best-categories-carousel__title'>
									<Link
										href={`/listado/all/${item.slug}?page_size=${maxPageResults}`}
										legacyBehavior
									>
										<a>
											<TruncateMarkup lines={1}>
												<span>{Capitalize(item.name)}</span>
											</TruncateMarkup>
										</a>
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

				<style jsx>
					{`
						.best-categories-carousel__a {
							position: relative;
							width: 100%;
							height: 100%;
						}

						.carousel__button {
							border-radius: 0 4px 4px 0;
							justify-content: space-around;
							position: absolute;
							top: calc(50% - 52px);
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
							fill: var(--primary-color);
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

						.best-categories-carousel__header {
							line-height: 3;
							font-size: 14px;
							margin-left: 15px;
						}

						.best-categories-carousel__title {
							line-height: 2;
							font-weight: 600;
							font-size: 12px;
							width: 100%;
							display: flex;
							align-items: center;
							justify-content: center;
						}

						.best-categories-carousel__image {
							position: relative;
							height: 100px;
							width: 100px;
							background-color: #f7f7f7;
							border-radius: 10px;
							display: flex;
							align-items: center;
							justify-content: center;
						
						}

						.best-categories-carousel__container {
							display: flex;
						}

						.best-categories-carousel__viewport {
							overflow: hidden;
							position: relative;
						}

						.best-categories-carousel__item {
							flex: 0 0 120px;
							min-width: 0;
						
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;
							gap: 10px;
						}

						.best-categories-carousel {
							margin-top: 20px;
							
							min-height: 110px;
						}
						@media only screen and (max-width: 48em) {
							.best-categories-carousel {
								margin-top: 10px;
							}
						}
					`}
				</style>
			</div>
		)
	);
};

export default BestCategories;

BestCategories.propTypes = {
	mobile: PropTypes.bool,
};
