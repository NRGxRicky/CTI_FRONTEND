'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import NewProduct from '../Icons/NewProduct';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import { Preloader, TailSpin } from 'react-preloader-icon';
import ProductGalleryZoom from '../ProductGalleryZoom/ProductGalleryZoom';
import ReactImageMagnify from 'react-image-magnify';

const ProductGallery = ({
	responsiveElements = 1,
	mobile = false,
	producto,
	width,
}) => {
	const [prevButton, setPrevButton] = useState(true);
	const [nextButton, setNextButton] = useState(true);
	const [stateDictImages, setStateDictImages] = useState([]);
	const [current, setCurrent] = useState(null);
	const [emblaRef, emblaApi] = useEmblaCarousel({
		slidesToScroll: responsiveElements,
		loop: false,
		containScroll: 'trimSnaps',
		align: 'start',
	});
	const [error, setError] = useState(null);
	const [loaded, setLoaded] = useState(false);
	const [showZoomGallery, setShowZoomGallery] = useState(false);
	const [dictImagesloaded, setDictImagesloaded] = useState([]);
	const [offsetY, setOffsetY] = useState(0);
	const [parentDimensionsHeight, setParentDimensionsHeight] = useState(0);
	const [parentDimensionsWidth, setParentDimensionsWidth] = useState(0);
	const floatContainer = useRef();
	const imgCurrentRef = useRef();
	const [notImages, setNotImages] = useState(false);

	const makeDictImages = async (producto) => {
		let dictImages = [];
		producto.imagen1m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen1xs,
				s: producto.imagen1s,
				m: producto.imagen1m,
				l: producto.imagen1l,
			});
		producto.imagen2m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen2xs,
				s: producto.imagen2s,
				m: producto.imagen2m,
				l: producto.imagen2l,
			});
		producto.imagen3m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen3xs,
				s: producto.imagen3s,
				m: producto.imagen3m,
				l: producto.imagen3l,
			});
		producto.imagen4m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen4xs,
				s: producto.imagen4s,
				m: producto.imagen4m,
				l: producto.imagen4l,
			});
		producto.imagen5m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen5xs,
				s: producto.imagen5s,
				m: producto.imagen5m,
				l: producto.imagen5l,
			});
		producto.imagen6m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen6xs,
				s: producto.imagen6s,
				m: producto.imagen6m,
				l: producto.imagen6l,
			});
		producto.imagen7m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen7xs,
				s: producto.imagen7s,
				m: producto.imagen7m,
				l: producto.imagen7l,
			});
		producto.imagen8m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen8xs,
				s: producto.imagen8s,
				m: producto.imagen8m,
				l: producto.imagen8l,
			});
		producto.imagen9m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen9xs,
				s: producto.imagen9s,
				m: producto.imagen9m,
				l: producto.imagen9l,
			});
		producto.imagen10m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen10xs,
				s: producto.imagen10s,
				m: producto.imagen10m,
				l: producto.imagen10l,
			});

		dictImages.length < 1 &&
			dictImages.push({
				title: 'not-available',
				xs: '/images/not-available.png',
				s: '/images/not-available.png',
				m: '/images/not-available.png',
				l: '/images/not-available.png',
			});

		return dictImages;
	};

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
		const makeImages = async () => {
			setLoaded(false);
			setStateDictImages([]);
			if (producto !== null && producto !== undefined) {
				const images = await makeDictImages(producto);
				setStateDictImages(images);
				setCurrent({
					url: images[parseInt(images.length) - 1],
					index: 0,
				});
			}
		};

		makeImages();
	}, [producto]);

	useEffect(() => {
		if (current) {
			if (!dictImagesloaded.find((image) => image == current.url.m)) {
				dictImagesloaded.push(current.url.m);
			}
			setParentDimensionsHeight(floatContainer.current.parentNode.offsetHeight);
			setParentDimensionsWidth(
				floatContainer.current.parentNode.parentNode.parentNode.offsetWidth
			);
		}
	}, [current]);

	const handleScroll = () => {
		const scrollLimit =
			floatContainer.current.parentNode.offsetHeight -
			floatContainer.current.offsetHeight;
		document.body.scrollTop < scrollLimit
			? setOffsetY(document.body.scrollTop)
			: setOffsetY(scrollLimit);
		setParentDimensionsHeight(floatContainer.current.parentNode.offsetHeight);
		setParentDimensionsWidth(
			floatContainer.current.parentNode.parentNode.parentNode.offsetWidth
		);
	};

	useEffect(() => {
		document.body.addEventListener('scroll', handleScroll);
		return () => {
			document.body.removeEventListener('scroll', handleScroll);
		};
	}, []);

	useEffect(() => {
		window.addEventListener('resize', handleScroll);
		return () => {
			window.removeEventListener('resize', handleScroll);
		};
	}, []);

	useEffect(() => {
		if (current) {
			current.url.s === '/images/not-available.png' && setLoaded(true);
			current.url.s === '/images/not-available.png'
				? setNotImages(true)
				: setNotImages(false);
		}
	}, [current]);

	stateDictImages.length === 0 && (
		<div className='product__gallery__loader'>
			<Preloader
				use={TailSpin}
				size={30}
				strokeWidth={8}
				strokeColor='var(--primary-color)'
				duration={900}
				style={{ display: loaded ? 'none' : 'block' }}
			/>
		</div>
	);

	return (
		<div
			className='product__gallery__container'
			style={{
				top: `${offsetY}px`,
			}}
			ref={floatContainer}
		>
			<div className='product__gallery__thumbnails'>
				<div className='product__gallery__embla__container'>
					{stateDictImages.map(
						(item, index) =>
							index !== stateDictImages.length - 1 && (
								<div
									className='product__gallery__embla__slide'
									key={index}
									onMouseOver={() => {
										setCurrent({ url: item, index: index });
									}}
									onClick={() => {
										setCurrent({ url: item, index: index });
									}}
								>
									<div
										className={
											current.index == index
												? 'product__gallery__item product__gallery__item__active'
												: 'product__gallery__item'
										}
									>
										<div className='product__gallery__item__image'>
											<Image
												src={item.xs ? item.xs : '/images/not-available.png'}
												fill
												style={{ objectFit: 'contain' }}
												alt={Capitalize(item.title)}
												draggable='false'
												sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
											/>
										</div>
									</div>
								</div>
							)
					)}
				</div>
			</div>
			<div className='product__gallery__current'>
				<div
					className='product__gallery__loader'
					style={{ display: loaded ? 'none' : 'block' }}
				>
					<Preloader
						use={TailSpin}
						size={30}
						strokeWidth={8}
						strokeColor='var(--primary-color)'
						duration={900}
					/>
				</div>
				<div
					className='product__gallery__current__image'
					onClick={() => !notImages && setShowZoomGallery(true)}
					style={{ display: loaded ? 'block' : 'none' }}
				>
					<div
						className='zoom__container'
						onMouseOver={async () => {
							if (current.index === 0) {
								setCurrent({ url: stateDictImages[1], index: 1 });
								setCurrent({ url: stateDictImages[0], index: 0 });
							}
						}}
						ref={imgCurrentRef}
					>
						{current && !notImages ? (
							<ReactImageMagnify
								{...{
									smallImage: {
										alt: Capitalize(producto.titulo),
										isFluidWidth: true,
										src: current.url.m
											? current.url.m
											: '/images/not-available.png',
										onLoad: () => setLoaded(true),
									},
									style: {
										maxWidth: '100%',
										display: loaded ? 'block' : 'none',
										zIndex: 1,
									},
									imageStyle: {
										objectFit: 'contain',
										width: '100%',
										height: '100%',
										maxHeight: '500px',
									},
									largeImage: {
										src: current?.url.l
											? current.url.l
											: '/images/not-available.png',
										width: imgCurrentRef
											? imgCurrentRef?.current?.offsetWidth * 3
											: 0,
										height: imgCurrentRef
											? imgCurrentRef?.current?.offsetHeight * 3
											: 0,
									},

									enlargedImageContainerStyle: {
										border: '1px solid var(--primary-color)',
										top:
											imgCurrentRef?.current?.offsetWidth +
												imgCurrentRef?.current?.offsetWidth / 2 >=
											parentDimensionsWidth
												? imgCurrentRef?.current?.offsetHeight + 10
												: 0,
										left:
											imgCurrentRef?.current?.offsetWidth +
												imgCurrentRef?.current?.offsetWidth / 2 >=
											parentDimensionsWidth
												? -10
												: imgCurrentRef?.current?.offsetWidth,
									},

									enlargedImageContainerDimensions: {
										width: imgCurrentRef
											? imgCurrentRef?.current?.offsetWidth
											: 0,
										height: imgCurrentRef
											? imgCurrentRef?.current?.offsetHeight
											: 0,
									},
								}}
							/>
						) : (
							<Image
								src={'/images/not-available.png'}
								fill
								style={{ objectFit: 'contain' }}
								alt={Capitalize(producto.titulo)}
								draggable='false'
								sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
								onLoad={() => setLoaded(true)}
							/>
						)}
					</div>
				</div>
			</div>
			{current && !notImages && (
				<ProductGalleryZoom
					visible={showZoomGallery}
					setVisible={setShowZoomGallery}
					current={current}
					stateDictImages={stateDictImages}
					setCurrent={setCurrent}
				/>
			)}
			<style jsx>
				{`
					.product__gallery__container {
						display: flex;
						min-width: 100%;
						width: 100%;
						min-height: 250px;
						padding: 20px;
						position: relative;
					}
					.product__gallery__thumbnails {
						width: 50px;
						position: relative;
						display: flex;
						flex-direction: column;
						height: 100%;
					}

					.product__gallery__current {
						width: 100%;
						position: relative;
						display: flex;
						align-items: center;
						justify-content: center;
						max-height: 550px;
					}

					.product__gallery__current__image {
						width: 100%;
						position: relative;
						padding: 10px;
						height: 100%;
					}

					.product__gallery__item {
						width: 50px;
						height: 50px;
						border: 0.5px solid #eaeaea;
						border-radius: 5px;
						padding: 5px;
						display: flex;
						align-items: center;
						cursor: pointer;
					}

					.product__gallery__item__active {
						border: 2px solid var(--primary-color);
					}

					.product__gallery__item__image {
						display: flex;
						position: relative;
						width: 100%;
						height: 100%;
					}

					.product__gallery__embla__container {
						display: flex;
						user-select: none;
						-webkit-touch-callout: none;
						-khtml-user-select: none;
						-webkit-tap-highlight-color: transparent;
						flex-direction: column;
						height: 100%;
						gap: 5px;
					}

					.product__gallery__embla__slide {
						position: relative;
						flex: 0 0 50px;
					}

					.zoom__container {
						position: relative;
						width: 100%;
						height: 100%;
					}
				`}
			</style>
		</div>
	);
};

export default ProductGallery;
