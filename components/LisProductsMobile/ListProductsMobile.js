import React, { useState, useEffect, useRef } from 'react';
import Router, { useRouter } from 'next/router';
import { BrowserView, MobileView } from 'react-device-detect';
import Link from 'next/link';
import Image from 'next/image';
import Capitalize from '../../hooks/CapitalizeTitle';
import TextTruncate from 'react-text-truncate';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import NewProduct from '../Icons/NewProduct';
import { Preloader, TailSpin } from 'react-preloader-icon';
import WindowDimensions from '../../hooks/WindowDimensions';
import InfiniteScroll from 'react-infinite-scroll-component';
import { hideAll } from '../../lib/features/showOpacityContainerSlide';

const ListProductsMobile = ({
	results,
	filter_available_store,
	hasMore,
	loadMore,
	mobileScroll,
	setMobileScroll,
}) => {
	if (results === null) {
		return null;
	}
	const { height, width } = WindowDimensions();
	const [mobileInitialScrollY, setMobileInitialScrollY] = useState(0);
	const mobileProductListContainter = useRef();
	useEffect(() => {
		mobileScroll &&
			sessionStorage.setItem('scrollPosition', mobileScroll.toString());
	}, [mobileScroll]);

	useEffect(() => {
		const scrollPosition = sessionStorage.getItem('scrollPosition');
		if (scrollPosition) {
			mobileProductListContainter.current.scrollTop = parseInt(scrollPosition);
		}
	}, []);

	return (
		<div
			id='products-list__container'
			onScroll={(e) => setMobileScroll(e.currentTarget.scrollTop)}
			style={{ height: height - 58, overflow: 'auto' }}
			ref={mobileProductListContainter}
		>
			<InfiniteScroll
				dataLength={results.length}
				next={loadMore}
				hasMore={hasMore}
				initialScrollY={mobileInitialScrollY}
				scrollableTarget={'products-list__container'}
				className='products-list__container'
				style={{ overflow: 'hidden' }}
				loader={
					<div className='list-products__loader'>
						<Preloader
							use={TailSpin}
							size={30}
							strokeWidth={8}
							strokeColor='#FF002C'
							duration={900}
						/>
					</div>
				}
				scrollThreshold={'10px'}
			>
				<div className='list__container__mobile_fix'></div>
				{results.map((producto) => (
					<div
						className='products-list__item'
						key={producto.id}
						style={{ border: '0.5px solid #eaeaea', maxWidth: '50%' }}
					>
						<Link href={`/${producto.slug}`} legacyBehavior>
							<a>
								<div className='card'>
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
									<div className='card__image'>
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
											priority={true}
										/>
										<NewProduct date={producto.created} />
									</div>
									<div>
										<div className='card__title'>
											<TextTruncate
												line={4}
												element='span'
												truncateText='…'
												text={Capitalize(producto.titulo)}
											/>
										</div>
										<div className='card__sku text--off'>
											<TextTruncate
												line={2}
												element='span'
												truncateText='…'
												text={Capitalize(producto.modelo)}
											/>
										</div>
										<div className='card__price'>
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
												$ {CurrencyFormat(producto.precio_contado, 2, '.', ',')}
											</span>
										</div>
										<div className='card__available'>
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
															: 'disponible'}
														{' - '}
														Entrega en Puebla
													</span>
												</div>
											)}
										</div>
										<div className='card__info'>
											{producto.envio_gratis && <FreeShipping />}
										</div>
									</div>
								</div>
							</a>
						</Link>
					</div>
				))}
			</InfiniteScroll>
			<style jsx>
				{`
					.product__price__label {
						z-index: 1;
						position: absolute;
						left: 0;
						border-top-left-radius: 0;
						border-bottom-left-radius: 0;
					}

					.price--compare {
						font-size: 14px;
					}
				`}
			</style>
		</div>
	);
};

export default ListProductsMobile;
