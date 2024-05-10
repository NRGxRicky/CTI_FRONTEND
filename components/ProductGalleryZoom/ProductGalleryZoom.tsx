import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
	blockBodyScroll,
	unlockBodyScroll,
	showOpacity,
	hideOpacity,
} from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import Capitalize from '../../hooks/CapitalizeTitle';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.min.css';
import useEmblaCarousel from 'embla-carousel-react';
import CurrencyFormat from '../../hooks/CurrencyFormat';

const ProductGalleryZoom = ({
	visible,
	setVisible,
	current,
	stateDictImages,
	setCurrent,
}) => {
	const dispatch = useAppDispatch();
	const containerRef = useRef(null);
	const [emblaRef, emblaApi] = useEmblaCarousel({
		slidesToScroll: 1,
		loop: false,
	});
	const [prevButton, setPrevButton] = useState(true);
	const [nextButton, setNextButton] = useState(true);

	let styleClass =
		'product__gallery_zoom__carousel__button product__gallery_zoom__carousel__button-next product__gallery_zoom__carousel__button--color-ligth';

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

	const checkCurrent = (item, index) => {
		if (current.index !== index) {
			emblaApi.scrollTo(index);
		}
	};

	const checkCurrentScroll = () => {
		setCurrent({
			url: stateDictImages[emblaApi.selectedScrollSnap()],
			index: emblaApi.selectedScrollSnap(),
		});
	};

	useEffect(() => {
		if (emblaApi && visible) {
			emblaApi.on('select', checkCurrentScroll);
		}
	}, [visible]);

	useEffect(() => {
		if (visible) {
			dispatch(blockBodyScroll());
			dispatch(showOpacity());

			document.addEventListener('mousedown', handleClickOutside);
		} else {
			dispatch(unlockBodyScroll());
			dispatch(hideOpacity());
			document.removeEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [visible]);

	const handleClickOutside = (e: { target: any }) => {
		if (containerRef.current && !containerRef.current.contains(e.target)) {
			setVisible(false);
		}
	};

	useEffect(() => {
		if (emblaApi) {
			emblaApi.reInit({ startIndex: current.index });
		}
	}, [visible]);

	return (
		<div
			className='product__gallery_zoom'
			style={{ display: visible ? 'flex' : 'none' }}
		>
			<div className='product__gallery_zoom__container' ref={containerRef}>
				<div className='close_zoom' onClick={() => setVisible(false)}>
					<button className='close --close_zoom'></button>
				</div>
				<div
					className='product__gallery_zoom__carousel__viewport'
					ref={emblaRef}
				>
					<div className='product__gallery_zoom__carousel__container'>
						{stateDictImages.map(
							(item, index) =>
								index !== stateDictImages.length - 1 && (
									<div
										className='product__gallery_zoom__carousel__item'
										key={index}
									>
										<InnerImageZoom
											src={item.m ? item.m : '/images/not-available.png'}
											hideHint={true}
											zoomPreload={true}
											zoomSrc={item.l ? item.l : '/images/not-available.png'}
											className='product__gallery_zoom__carousel__item__image'
										/>
									</div>
								)
						)}
					</div>
				</div>
				<div className='product__gallery_zoom__thumbnails'>
					{stateDictImages.map(
						(item, index) =>
							index !== stateDictImages.length - 1 && (
								<div
									className={
										current.index == index
											? 'product__gallery_zoom__thumbnails__item active'
											: 'product__gallery_zoom__thumbnails__item'
									}
									key={index}
									onMouseOver={() => {
										checkCurrent(item, index);
									}}
									onClick={() => {
										checkCurrent(item, index);
									}}
								>
									<div className='product__gallery_zoom__thumbnails__item__image'>
										<Image
											src={item.s ? item.s : '/images/not-available.png'}
											fill
											style={{ objectFit: 'contain' }}
											alt={Capitalize(item.title)}
											draggable='false'
											sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
										/>
									</div>
								</div>
							)
					)}
				</div>
				<div onClick={scrollNext} className={styleClass}>
					<button
						role='presentation'
						type='button'
						className='product__gallery_zoom__button__nav'
						tabIndex={-1}
					>
						<svg
							className='product__gallery_zoom__button_nav__icon'
							width='15'
							height='30'
							viewBox='0 0 15 30'
							xmlns='http://www.w3.org/1700/svg'
						>
							<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
						</svg>
					</button>
				</div>
				<div
					onClick={scrollPrev}
					className='product__gallery_zoom__carousel__button product__gallery_zoom__carousel__button-prev product__gallery_zoom__carousel__button--color-ligth'
				>
					<button
						role='presentation'
						type='button'
						className='button__nav'
						tabIndex={-1}
					>
						<svg
							className='product__gallery_zoom__button_nav__icon'
							width='15'
							height='30'
							viewBox='0 0 15 30'
							xmlns='http://www.w3.org/1700/svg'
						>
							<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
						</svg>
					</button>
				</div>
			</div>

			<style jsx>
				{`
					.product__gallery_zoom__carousel__button {
						justify-content: space-around;
						position: absolute;
						top: calc(50% - 52px);
						width: 15px;
						height: 30px;
						display: flex;
						align-items: center;
						cursor: pointer;
						text-decoration: none;
						opacity: 1;
					}

					.product__gallery_zoom__button__nav {
						background: none;
						color: inherit;
						border: none;
						padding: 0;
						font: inherit;
						cursor: pointer;
						user-select: none;
					}

					.product__gallery_zoom__carousel__button-prev {
						left: 15vh;
						top: calc(50% - 45px);
					}

					.product__gallery_zoom__carousel__button-next {
						right: 15vh;
						transform: rotate(180deg);
					}

					.product__gallery_zoom__carousel__button--color-ligth {
						fill: #ff002c;
					}

					.product__gallery_zoom__carousel__container {
						display: flex;
						flex-direction: row;
						width: 100%;
						height: 100%;
					}

					.product__gallery_zoom__carousel__viewport {
						overflow: hidden;
						width: 100%;
						height: auto;
					}

					.product__gallery_zoom {
						width: 100%;
						position: fixed;
						z-index: 100;
						inset: 1px;
						padding: 4rem;
						top: 0;
						left: 0;
						height: 100%;
					}

					.product__gallery_zoom__container {
						width: 100%;
						background-color: #ffffff;
						flex-direction: column;
						padding: 1rem;
						justify-content: space-between;
						height: 100%;
						display: flex;
						gap: 5px;
					}

					.--close_zoom {
						height: 20px;
						width: 20px;
					}

					.close_zoom {
						display: flex;
						align-items: center;
						justify-content: center;
						height: 50px;
						width: 50px;
						align-self: flex-end;
						border: 1px solid #ced4da;
						border-radius: 4px;
						cursor: pointer;
					}

					.close_zoom:hover {
						background-color: #ced4da;
					}

					.product__gallery_zoom__carousel__item {
						align-items: center;
						flex: 0 0 100%;
						min-width: 0;
						justify-content: center;
						display: flex;
					}

					.product__gallery_zoom__thumbnails {
						display: flex;
						width: 100%;
						max-height: 10vh;
						height: auto;
						position: relative;
						flex-direction: row;
						flex-wrap: nowrap;
						align-items: flex-end;
						justify-content: center;
						gap: 10px;
					}

					.product__gallery_zoom__thumbnails__item {
						width: 10vh;
						height: 10vh;
						position: relative;
						border: 1px solid #ced4da;
						border-radius: 4px;
						cursor: pointer;
						padding: 5px;
					}

					.active {
						border: 2px solid #ff002c;
					}

					.product__gallery_zoom__thumbnails__item__image {
						position: relative;
						width: 100%;
						height: 100%;
					}
				`}
			</style>
		</div>
	);
};

export default ProductGalleryZoom;
