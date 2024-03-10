import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import NewProduct from '../Icons/NewProduct';
import TextTruncate from 'react-text-truncate';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.min.css';
import { Preloader, TailSpin } from 'react-preloader-icon';

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

	const makeDictImages = (producto) => {
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
		setStateDictImages([...dictImages]);

		setCurrent(dictImages[0]);
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
		makeDictImages(producto);
		setLoaded(false);
	}, [producto]);

	useEffect(() => {
		setLoaded(false);
	}, [current]);

	return (
		<div className='product__gallery__container'>
			<div className='product__gallery__thumbnails'>
				<div className='product__gallery__embla__container'>
					{stateDictImages.map((item, index) => (
						<div
							className='product__gallery__embla__slide'
							key={index}
							onMouseOver={() => {
								setCurrent(item);
							}}
							onClick={() => {
								setCurrent(item);
							}}
						>
							<div
								className={
									current == item
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
					))}
				</div>
			</div>
			{stateDictImages.length > 0 && (
				<div className='product__gallery__current'>
					<Preloader
						use={TailSpin}
						size={30}
						strokeWidth={8}
						strokeColor='#FF002C'
						duration={900}
						style={{ display: loaded ? 'none' : undefined }}
					/>

					<div
						className='product__gallery__current__image'
						style={{
							display: loaded ? undefined : 'none',
						}}
					>
						<InnerImageZoom
							src={current.l ? current.l : '/images/not-available.png'}
							imgAttributes={{
								onLoad: () => setLoaded(true),
							}}
							fullscreenOnMobile={true}
							className='zoom__container'
						/>
					</div>
				</div>
			)}
			<style jsx>
				{`
					.product__gallery__container {
						display: flex;
						width: 100%;
						min-height: 550px;
						padding: 20px;
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
					}

					.product__gallery__current__image {
						width: 100%;
						position: relative;
						padding: 20px;
					}

					.product__gallery__item {
						width: 50px;
						height: 50px;
						border: 0.5px solid #eaeaea;
						padding: 5px;
						display: flex;
						align-items: center;
						cursor: pointer;
					}

					.product__gallery__item__active {
						border: 2px solid #ff002c;
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
					}

					.product__gallery__embla__slide {
						position: relative;
						flex: 0 0 50px;
					}

					.zoom__container {
						width: 100%;
						height: 100%;
					}
				`}
			</style>
		</div>
	);
};

export default ProductGallery;
