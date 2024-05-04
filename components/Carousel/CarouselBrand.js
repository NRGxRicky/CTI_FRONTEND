import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

const CarouselBrand = ({
	responsiveElements = 2,
	slideDimensions = '50%',
	mobile = false,
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
			const data = await fetch(`https://api.pccdnapi.com/brands/bestbrands/`);
			setData(await data.json());
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	let styleClass =
		'brand__carousel__button carousel__button-next carousel__button--color-ligth';

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
			// Embla API is ready
			emblaApi.on('select', checkAllButons);
		}
	}, [emblaApi]);

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) {
		return (
			<div className='embla'>
				<style jsx>
					{`
						.embla {
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
			<div className='brand__embla'>
				<div className='brand__embla__viewport' ref={emblaRef}>
					<div className='brand__embla__container'>
						{data.results.map((brand) => (
							<div
								className='brand__embla__slide'
								key={brand.id}
								style={{ minWidth: slideDimensions }}
							>
								<div className='brand__imagen'>
									<Image
										src={
											brand.imagen ? brand.imagen : '/images/not-available.png'
										}
										fill
										style={{ objectFit: 'contain' }}
										draggable='false'
										alt={brand.nombre}
										sizes="auto"
									/>
								</div>
							</div>
						))}
					</div>
				</div>
				<div
					onClick={scrollNext}
					className={styleClass}
					style={!nextButton ? { opacity: '0' } : { opacity: '0.9' }}
				>
					<button
						role='presentation'
						type='button'
						className='brand__button__nav'
						tabIndex='-1'
					>
						<svg
							className='brand__button_nav__icon'
							width='14.6'
							height='27'
							viewBox='0 0 16 27'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
						</svg>
					</button>
				</div>
				<div
					onClick={scrollPrev}
					className='brand__carousel__button brand__carousel__button-prev brand__carousel__button--color-ligth'
					style={!prevButton ? { opacity: '0' } : { opacity: '0.9' }}
				>
					<button
						role='presentation'
						type='button'
						className='brand__button__nav'
						tabIndex='-1'
					>
						<svg
							className='brand__button_nav__icon'
							width='14.6'
							height='27'
							viewBox='0 0 16 27'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
						</svg>
					</button>
				</div>
			</div>
			<style jsx>
				{`
					.brand__imagen {
						position: relative;
						width: 100%;
						height: 100%;
					}
					.brand__embla {
						width: 100%;
						height: 200px;
						postion: relative;
					}

					.brand__embla__container {
						display: flex;
					}

					.brand__embla__viewport {
						width: 100%;
						overflow: hidden;
					}

					.brand__embla__slide {
						padding: 0 20px;
						position: relative;
						height: 200px;
					}
					.brand__carousel__content {
						width: 100%;
						position: relative;
						overflow: hidden;
						max-width: 1350px;
						margin: 0 auto;
						-webkit-tap-highlight-color: transparent;
						touch-action: pan-y;
						user-drag: none;
						user-select: none;
						-moz-user-select: none;
						-webkit-user-drag: none;
						-webkit-user-select: none;
						-ms-user-select: none;
					}

					.brand__carousel__container {
						display: flex;
						flex-direction: row;
						flex-wrap: nowrap;
						overflow: hidden;
						position: relative;
					}

					.brand__carousel__button {
						border-radius: 0 4px 4px 0;
						justify-content: space-around;
						position: absolute;
						top: calc(50% - 20px);
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

					.brand__carousel__button-prev {
						left: 0;
					}

					.brand__carousel__button-next {
						right: 0;
						transform: rotate(180deg);
					}

					.brand__carousel__button--color-ligth {
						background: #ffffff;
						fill: #ff002c;
					}

					.brand__carousel__button--color-ligth:hover,
					.brand__carcarousel__button--color-ligth:active {
						background: #ffffff;
					}

					@media only screen and (min-width: 48em) {
						.brand__embla:hover .carousel__button {
							opacity: 1;
						}
					}
				`}
			</style>
		</div>
	);
};

export default CarouselBrand;
