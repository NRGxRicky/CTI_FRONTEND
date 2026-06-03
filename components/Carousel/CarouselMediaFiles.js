import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

const CarouselMediaFiles = ({
	item,
	responsiveElements = 1,
	mobile = false,
}) => {
	const [prevButton, setPrevButton] = useState(true);
	const [nextButton, setNextButton] = useState(true);
	const [sortData, setSortData] = useState(['Todos']);
	const [currentShow, setCurrentShow] = useState('Todos');
	const [emblaRef, emblaApi] = useEmblaCarousel({
		slidesToScroll: responsiveElements,
		loop: false,
		containScroll: 'trimSnaps',
		align: 'start',
	});

	let styleClass =
		'mediafiles__carousel__button mediafiles__carousel__button-next mediafiles__carousel__button--color-ligth';

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

	return (
		<div className='mediafiles'>
			<div className='mediafiles__viewport' ref={emblaRef}>
				<div className='mediafiles__container'>
					{item.mediafiles
						.filter(
							(file) =>
								file.tipo !== 'ProductStory' &&
								!file.tipo.includes('Energy Label')
						)
						.map((file) => (
							<div key={file.id} className='mediafiles__slide'>
								<a
									href={file.ArchivoMedia}
									target='_blank'
									rel='noopener noreferrer'
								>
									<div className='mediafiles__item'>
										<div className='mediafiles__item__image'>
											<Image
												fill
												style={{ objectFit: 'contain' }}
												className='mediafile__pdf'
												alt={file.tipo}
												draggable='false'
												sizes='40px'
												src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABHAAAAURCAYAAAGQrkQHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA0lpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDM2MCwgMjAyMC8wMi8xMy0wMTowNzoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTg2QjU4QjlCMEQ3MTFFQzg0NjdEMkU1N0I0QzdDNkIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTg2QjU4QjhCMEQ3MTFFQzg0NjdEMkU1N0I0QzdDNkIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjVmYTU3ODYxLTMyZTMtYmQ0Yi04MmY1LWFmNTNmY2ZkM2RjNCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjVmYTU3ODYxLTMyZTMtYmQ0Yi04MmY1LWFmNTNmY2ZkM2RjNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pu3YoRsAAGLtSURBVHja7N09axRBHMDh2RCL2KiojYWxVsEPoIifIW0CdlZCsFSLREHBUrHSxuJSCUGrtApiJ6RQDqwMlirEJinXbCCKJHe525fJ7O3zKyzyNnd7T/47G867LM/zII3bdPFPlmUDvyCfD2Q1XLYSstbd5mLiHAQHmHh92Qjh8od24dkHB5ijgVPUJjxTpkw6fb7WnuM/5eGCpxIc0wYeEweeOHBMG3hMHHjAUbp4wIEHHHjAUeJ4wIEHHHjAUeJ4wIEHHHjAUeJ4wIEHHMXDAw484CgeHnDgAUfx8IADDziKhwcceMBRPDzgwAOO4uEBBx5wFA8POCqFBxyVwgOOSuEBR6XwgKNSeMBRKTzgJNClc+3DA04KHWvf5AEnlakz2y484MBTCg848JTCA06ieFIFtIdn9yX5w0LmVUc1ViaOwBE4AkfgSOAIHIEjcASOBI7AETgCR+BI4AgcgSNwBI4EjsAROAJHXWs66Vt3/93wz7++F8LXj82u0d/5/Opy/PvW9PoVS/N/cvZK3pyFrPk1yqwV+7518lRV5QEtvreXx7udvbwdx8Uep6aDXOeDUPysmRmb44npxWa8tV5uhfB4vdk11p6BE6XjJ+Kud/5Ks5NnZdFVVa2bw2GnnV4+/qbyoK+f27mqmVsabfKU2cQmtvHtxsSJcdCLy+FinVHW6nXjpYYm41QV8ze2WOvuxdD1/OW4TN/7nZ864LRhyoEjcNTpqTMZcFLcUxLX8OBAMz6cpYmGMz3RQNpyKhl2335thLB4wcTRmJ2eDeHkGXBsXEv0/Ac4nUFz+6w9DjAl9iabPyd6erYHzuqD/R9bexLC9vZk73E+vTVxqsFZTuv2PP3W6f2Yq6oqVztd2JiDU1N33nTmOTfd2Rwf1Ua4Y9MGnCpAOp5TVZv/HAAONOC0oTqfMzzqk9jBOYLf3K3f9a5x2HOGgTm0dN8+em+T2vSDM8pmuP8+hEc36lvz1qsQrt8M4eHV6q+2AY6cqgSOBI7AETgCR+BI4AgcgSNwBI4EjsAROAJH4EjgCByBI3AEjgSOwBE4AkcCR+AIHIEjcCRwBI7AETgCRwJH4AgcgSNwJHAEjsAROAJHAkfgCByBI3AkcNQwnGwlZA6FRq3wYuKo2qnK1NGo08YeR+O2/hdQ8Yb1WfZv2OTzwZvX66A2d6bNqYFwANKg09N/HxsEByAN2/fuwpHG7Y8A7N2/axNRAMDxl1KEuqggiJNO4o9BcFTEuukiUnCq4KS73VxsKugqbqIgKHEtdHWx9dfmplTd6l9QEdqlEHMNrULTmLwml3d3ny90StqQe5+89+5iDDiKg9PtRsvU8Pv+M4ST74t1KWRzewPMaPu6EsJakaes='
											/>
										</div>
										{file.tipo === 'pdf' && (
											<div className='mediafile__label'>Guía de Usuario</div>
										)}
										{file.tipo === 'leaflet' && (
											<div className='mediafile__label'>Folleto</div>
										)}
										{file.tipo.includes('Product Fiche') && (
											<div className='mediafile__label'>Ficha Técnica</div>
										)}
										{file.tipo.includes('manual') && (
											<div className='mediafile__label'>Manual</div>
										)}
									</div>
								</a>
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
				className='mediafiles__carousel__button mediafiles__carousel__button-prev mediafiles__carousel__button--color-ligth'
				style={!prevButton || mobile ? { opacity: '0' } : { opacity: '0.9' }}
			>
				<button
					role='presentation'
					type='button'
					className='mediafiles__button__nav'
					tabIndex='-1'
				>
					<svg
						className='mediafiles__button_nav__icon'
						width='14.6'
						height='27'
						viewBox='0 0 16 27'
						xmlns='http://www.w3.org/1700/svg'
					>
						<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
					</svg>
				</button>
			</div>
			<style jsx>{`
				.mediafiles__item {
					width: 100%;
					min-height: 100px;
					height: auto;
					max-height: 300px;
					position: relative;
					padding: 0 20px;
					align-items: center;
					padding: 0 10px;
				}
				.mediafiles__container {
					display: flex;
					align-items: center;
					width: 100%;
					position: relative;
				}

				.mediafiles__viewport {
					width: 100%;
					overflow: hidden;
					position: relative;
					height: 100%;
				}

				.mediafiles__item__image {
					width: 40px;
					height: 60px;
					position: relative;
				}

				.mediafiles__slide {
					position: relative;
					flex: 1 0 46%;
				}

				.mediafile__pdf {
					width: 100%;
					height: 100%;
				}
				.mediafile__label {
					width: 100%;
					text-align: center;
				}

				.mediafiles__item {
					display: flex;
					flex-direction: column;
					align-items: center;
					align-content: center;
				}
				.mediafiles {
					margin-top: 20px;
					width: 100%;
					max-height: 350px;
					position: relative;
				}

				.mediafiles__carousel__button {
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

				.mediafiles__button__nav {
					background: none;
					color: inherit;
					border: none;
					padding: 0;
					font: inherit;
					cursor: pointer;
					user-select: none;
				}

				.mediafiles__carousel__button-prev {
					left: 0;
				}

				.mediafiles__carousel__button-next {
					right: 0;
					transform: rotate(180deg);
				}

				.mediafiles__carousel__button--color-ligth {
					background: #ffffff;
					fill: var(--primary-color);
				}

				.mediafiles__carousel__button--color-ligth:hover,
				.mediafiles__carcarousel__button--color-ligth:active {
					background: #ffffff;
				}

				@media only screen and (min-width: 48em) {
					.embla:hover .mediafiles__carousel__button {
						opacity: 1;
					}
				}

				@media only screen and (min-width: 48em) {
					.mediafiles__slide {
						flex: 0 0 220px;
					}
				}
			`}</style>
		</div>
	);
};

export default CarouselMediaFiles;
