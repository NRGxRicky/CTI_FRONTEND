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
import ProductGalleryZoom from '../ProductGalleryZoom/ProductGalleryZoom';

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
	const [current, setCurrent] = useState({
		url: '',
		index: 0,
	});
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
	const [notImages, setNotImages] = useState(false);
	const [showZoomGallery, setShowZoomGallery] = useState(false);

	const checkCurrent = () => {
		console.log(stateDictImages[emblaApi.selectedScrollSnap()]);
		setCurrent({
			url: stateDictImages[emblaApi.selectedScrollSnap()],
			index: emblaApi.selectedScrollSnap(),
		});
	};

	useEffect(() => {
		if (emblaApi) {
			emblaApi.on('select', checkCurrent);
		}
	}, [emblaApi, stateDictImages]);

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

		producto.imagen1m &&
			dictImages.push({
				title: producto.titulo,
				xs: producto.imagen1xs,
				s: producto.imagen1s,
				m: producto.imagen1m,
				l: producto.imagen1l,
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

	useEffect(() => {
		const changeProduct = async () => {
			setLoaded(false);
			const dictImages = await makeDictImages(producto);
			setStateDictImages(dictImages);
			setCurrent({ url: dictImages[0], index: 0 });
			setLengthSlides(dictImages.length - 1);
		};

		changeProduct();
	}, [producto]);

	useEffect(() => {
		if (emblaApi && stateDictImages.length > 0) {
			emblaApi.scrollTo(0, true);
			emblaApi.reInit();
		}
	}, [producto]);

	useEffect(() => {
		if (current?.url) {
			current.url.s === '/images/not-available.png' && setLoaded(true);
			current.url.s === '/images/not-available.png'
				? setNotImages(true)
				: setNotImages(false);
		}

		if (current && emblaApi)
			if (current.index !== emblaApi.selectedScrollSnap()) {
				emblaApi.scrollTo(current.index);
			}
	}, [current]);

	return (
		<div
			className='product__gallery__mobile'
			style={{ height: currentHeight / 2 }}
		>
			<div className='product__gallery__viewport' ref={emblaRef}>
				<div className='product__gallery__container'>
					{!notImages ? (
						stateDictImages.map(
							(item, index) =>
								index !== stateDictImages.length - 1 && (
									<div className='product__gallery__item' key={index}>
										<div
											className=''
											style={{
												display: loaded ? 'none' : 'flex',
												width: '100%',
												height: '100%',
											}}
										>
											<div className='product__gallery__loader'>
												<Preloader
													use={TailSpin}
													size={30}
													strokeWidth={8}
													strokeColor='#FF002C'
													duration={900}
												/>
											</div>
										</div>
										<div
											className='product__gallery__current__image'
											onClick={() => setShowZoomGallery(true)}
										>
											<Image
												src={item.m ? item.m : '/images/not-available.png'}
												fill
												style={{ objectFit: 'contain' }}
												draggable='false'
												sizes='auto'
												alt={Capitalize(item.title)}
												onLoad={() => setLoaded(true)}
											/>
										</div>
									</div>
								)
						)
					) : (
						<div className='product__gallery__item'>
							<div className='product__gallery__current__image'>
								<Image
									src={'/images/not-available.png'}
									fill
									style={{ objectFit: 'contain' }}
									alt={Capitalize(producto.titulo)}
									draggable='false'
									sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
									onLoad={() => setLoaded(true)}
								/>
							</div>
						</div>
					)}
				</div>
				{lengthSlides !== 0 && (
					<div className='product__pagination'>
						<div className='product__pagination_current'>
							{current?.index ? current.index + 1 : 1}
						</div>
						<div className='product__pagination__separator'>/</div>
						<div className='product__pagination__counter'>{lengthSlides}</div>
					</div>
				)}
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
					.product__gallery__loader {
						display: flex;
						position: relative;
						width: 100%;
						justify-content: center;
						align-items: center;
					}

					.product__gallery__current__image {
						position: relative;
						width: 100%;
						height: 100%;
					}

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
