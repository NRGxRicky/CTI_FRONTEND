import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import NewProduct from '../Icons/NewProduct';
import TextTruncate from 'react-text-truncate';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { Preloader, TailSpin } from 'react-preloader-icon';

const ProductGalleryMobile = ({
	responsiveElements = 1,
	mobile = false,
	producto,
	width,
	height,
}) => {
	const [prevButton, setPrevButton] = useState(false);
	const [nextButton, setNextButton] = useState(false);
	const [stateDictImages, setStateDictImages] = useState([]);
	const [current, setCurrent] = useState(1);
	const [lengthSlides, setLengthSlides] = useState(0);
	const [currentHeight, setCurrentHeight] = useState(height);
	const [emblaRef, emblaApi] = useEmblaCarousel({
		slidesToScroll: responsiveElements,
		loop: false,
		containScroll: 'trimSnaps',
		align: 'start',
	});
	const [error, setError] = useState(null);
	const [loaded, setLoaded] = useState(false);

	const checkCurrent = () => {
		setCurrent(emblaApi.selectedScrollSnap() + 1);
	};
	useEffect(() => {
		if (emblaApi) {
			setLengthSlides(emblaApi.slideNodes().length);
			emblaApi.on('scroll', checkCurrent);
		}
	}, [emblaApi]);

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
	};

	useEffect(() => {
		setLoaded(false);
		makeDictImages(producto);
	}, [producto]);

	useEffect(() => {
		if (emblaApi && stateDictImages.length > 0) {
			emblaApi.scrollTo(0, true);
			emblaApi.reInit();
			setLengthSlides(emblaApi.slideNodes().length);
			checkCurrent();
		}
	}, [stateDictImages]);

	return (
		<div
			className='product__gallery__mobile'
			style={{ height: currentHeight / 2 }}
		>
			<div className='product__gallery__viewport' ref={emblaRef}>
				<div className='product__gallery__container'>
					{stateDictImages.map((item, index) => (
						<div className='product__gallery__item' key={index}>
							<Preloader
								use={TailSpin}
								size={30}
								strokeWidth={8}
								strokeColor='#FF002C'
								duration={900}
								style={{ display: loaded ? 'none' : undefined }}
							/>
							<Zoom
								wrapStyle={{
									width: '100%',
									height: ' 100%',
									display: loaded ? undefined : 'none',
								}}
								overlayBgColorEnd='rgba(0, 0, 0, 0.7)'
							>
								<div className='product__gallery__item__image'>
									<Image
										src={item.l ? item.l : '/images/not-available.png'}
										layout='fill'
										objectFit='contain'
										alt={Capitalize(item.title)}
										draggable='false'
										onLoad={() => setLoaded(true)}
										priority={true}
									/>
								</div>
							</Zoom>
						</div>
					))}
				</div>
				{lengthSlides !== 0 && (
					<div className='product__pagination'>
						<div className='product__pagination_current'>{current}</div>
						<div className='product__pagination__separator'>/</div>
						<div className='product__pagination__counter'>{lengthSlides}</div>
					</div>
				)}
			</div>
			<style jsx global>
				{`
					.product__pagination {
						position: absolute;
						width: 50px;
						height: 22px;
						padding: 5px;
						background-color: #000;
						opacity: 0.3;
						bottom: 20px;
						z-index: 10;
						border-radius: 10px;
						margin-left: 20px;
						display: flex;
						color: #ffffff;
						align-items: center;
						align-content: center;
						justify-content: space-evenly;
					}
					.product__gallery__mobile {
						width: 100%;
					}
					.product__gallery__viewport {
						width: 100%;
						position: relative;
						overflow: hidden;
						height: 100%;
					}

					.product__gallery__item {
						width: 100%;
						height: 100%;
						padding: 5px;
						display: flex;
						align-items: center;
						justify-content: center;
						cursor: pointer;
						flex: 0 0 100%;
					}

					.product__gallery__item__image {
						display: flex;
						position: relative;
						height: 100%;
						width: 100%;
					}

					.product__gallery__container {
						display: flex;
						user-select: none;
						-webkit-touch-callout: none;
						-khtml-user-select: none;
						-webkit-tap-highlight-color: transparent;
						width: 100%;
						height: 100%;
						align-items: center;
					}
				`}
			</style>
		</div>
	);
};

export default ProductGalleryMobile;
