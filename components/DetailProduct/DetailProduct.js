import React, { useState, useEffect, useRef } from 'react';
import Capitalize from '../../hooks/CapitalizeTitle';
import ProductGallery from '../ProductGallery/ProductGallery';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import Image from 'next/image';
import Link from 'next/link';
import ProductGalleryMobile from '../ProductGalleryMobile/ProductGalleryMobile';
import InfoMini from '../InfoMini/InfoMini';
import ProductsButtonsActions from '../ProductsButtonsActions/ProductsButtonsActions';
import { useAuth } from '../../hooks/auth';
import { showPaymentsChange } from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch } from '../../lib/hooks';

const DetailProduct = ({
	item,
	width,
	height,
	tempMobile = false,
	filter_available_store,
	sellerDefaultName,
}) => {
	const lastday = function (y, m) {
		return new Date(y, m + 1, 0).getDate();
	};

	const [labelTimeRemaining, setLabelTimeRemaining] = useState('');
	const [today, setToday] = useState(new Date());
	const [shippingIntervalStart, setShippingIntervalStart] = useState(
		addDays(today, 2)
	);
	const [shippingIntervalEnd, setShippingIntervalEnd] = useState(
		addDays(today, 5)
	);
	const [cartQuantity, setCartQuantity] = useState(1);
	const [internalCartMsi, setInternalCartMsi] = useState(false);
	const { cartMsi } = useAuth();

	useEffect(() => {
		setInternalCartMsi(cartMsi);
	}, [cartMsi]);

	const dispatch = useAppDispatch();

	function addDays(d, qty) {
		let dd = d.getDate();
		let mm = d.getMonth();
		let yyyy = d.getFullYear();
		if (lastday(yyyy, mm) <= parseInt(dd + qty)) {
			return new Date(yyyy, mm++, dd + qty);
		}
		return new Date(yyyy, mm, dd + qty);
	}

	const timeRemainingFunction = () => {
		const newToday = new Date();
		setToday(newToday);
		const dayOfWeek = newToday.toLocaleDateString('es-ES', {
			weekday: 'long',
		});
		const currentHour = newToday.getHours();
		const isWeekend = dayOfWeek !== 'sábado' || dayOfWeek !== 'domingo';

		const isLaboral =
			dayOfWeek !== 'domingo' &&
			dayOfWeek !== 'sabado' &&
			currentHour >= 9 &&
			currentHour < 18;

		let shippingStart;
		if (currentHour > 13 && isWeekend) {
			shippingStart = addDays(newToday, 2);
		} else if (dayOfWeek === 'sábado') {
			shippingStart = addDays(newToday, 4);
		} else if (dayOfWeek === 'domingo') {
			shippingStart = addDays(newToday, 3);
		}

		const endTime = new Date();
		if (isLaboral && currentHour <= 16) {
			endTime.setHours(16, 0, 0, 0);
			const timeRemaining = endTime - newToday;
			const hoursRemaining = Math.floor(timeRemaining / 3600000);
			const minutesRemaining = Math.floor((timeRemaining % 3600000) / 60000);
			setLabelTimeRemaining(
				` (Comprando dentro de ${hoursRemaining} horas, ${minutesRemaining} minutos)`
			);
		}
		/* else {
			
			setLabelTimeRemaining(` (Por $40.00)`);
		}
		*/

		if (shippingStart) {
			setShippingIntervalStart(shippingStart);
			setShippingIntervalEnd(addDays(shippingStart, 5));
		}
	};

	const handleIncrement = () => {
		setCartQuantity((prev) => {
			const newQuantity = prev + 1;
			if (newQuantity > item.stock_total) {
				return item.stock_total;
			} else {
				return newQuantity;
			}
		});
	};

	const handleDecrement = () => {
		setCartQuantity((prev) => {
			const newQuantity = prev > 1 ? prev - 1 : 1;
			return newQuantity;
		});
	};

	const handleInputChange = (e) => {
		const value = parseInt(e.target.value, 10);
		if (!isNaN(value) && value > 0) {
			if (value > item.stock_total) {
				setCartQuantity(item.stock_total);
			} else {
				setCartQuantity(value);
			}
		} else {
			setCartQuantity(1);
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			timeRemainingFunction();
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	if (item === null) {
		return null;
	}

	useEffect(() => {
		setCartQuantity(1);
	}, [item]);
	return (
		<div className='product'>
			<div className='product__gallery'>
				{!tempMobile ? (
					<ProductGallery producto={item} width={width} />
				) : (
					<div>
						<div className='product__info__header__sub product__info__header__sub--mobile'>
							<span className='text--off'>Nuevo</span>
							<span className='text--off'>|</span>
								<span className='text--off'>{item.ventas} vendidos</span>
						</div>

						<ProductGalleryMobile producto={item} height={height} />
					</div>
				)}
			</div>

			<div className='product__specs__resume'>
				<div className='product__info__header'>
					{!tempMobile && (
						<div className='product__info__header__sub'>
							<span className='text--off'>Nuevo</span>
							<span className='text--off'>|</span>
							<span className='text--off'>{item.ventas} vendidos</span>
						</div>
					)}
				</div>
				<div className='product__title --hidden-mobile'>
					<h1>{Capitalize(item.titulo)}</h1>
				</div>
				<div className='product__specs__container'>
					<h3>Características del producto</h3>
					<ul>
						{Object.entries(item.specs_resume).length > 0 && (
							<div className='specs__resume'>
								{Object.entries(item.specs_resume)
									.slice(0, 1)
									.map(([key, value], index) =>
										Object.entries(value).map(([inkey, invalue], index2) => (
											<li key={index2} className='specs__resume__spec'>
												<span className='bold'>{inkey}:</span>
												<span> {invalue}</span>
											</li>
										))
									)}
							</div>
						)}
						<li className='specs__resume__spec'>
							<span className='bold'>Modelo:</span>
							<span> {item.modelo}</span>
						</li>

						{item.ean && (
							<li className='specs__resume__spec'>
								<span className='bold'>UPC:</span>
								<span> {item.ean}</span>
							</li>
						)}

						<li>
							<span className='product__resume__item'>
								<span className='product__resume__title'>Marca:</span>
								<span>
									<Link
										href={`/listado/${item.marca.slug}/index`}
										legacyBehavior
									>
										<a>
											<span className='product__resume__detail'>
												<span className='product__brand text--light'>
													{item.marca.imagen ? (
														<Image
															src={item.marca.imagen}
															fill
															style={{ objectFit: 'contain' }}
															alt={Capitalize(item.marca.nombre)}
															draggable='false'
															sizes='auto'
														/>
													) : (
														`${Capitalize(item.marca.nombre)}`
													)}
												</span>
											</span>
										</a>
									</Link>
								</span>
							</span>
						</li>
					</ul>
				</div>
			</div>

			<div className='product__info'>
				<div className='product__info__container'>
					<div className='product__title --show-mobile'>
						<h1>{Capitalize(item.titulo)}</h1>
					</div>
					{item.precio_final_descuento > 0 && (
						<>
							<div className='product__price__label on-sale'>
								Ahorra{' '}
								{Math.ceil(
									((item.precio_final - item.precio_final_descuento) * 100) /
										item.precio_final
								)}
								%
							</div>
							<div className='text--off'>
								Antes:{' '}
								<span className='price--compare'>
									$ {CurrencyFormat(item.precio_final)}
								</span>
							</div>
						</>
					)}
					<div className='product__price'>
						<div className='product__price__container__type_of_payments'>
							<div
								className={`product__price__item ${
									internalCartMsi ? 'payment-disable' : 'payment-enable'
								}`}
								onClick={() => {
									internalCartMsi && dispatch(showPaymentsChange());
								}}
							>
								<div className='product__price__header'>A un pago:</div>
								<span className='text--light'>
									$ {CurrencyFormat(item.precio_contado)}
								</span>
								<div className='product__tax text--off'>Incluye IVA</div>
							</div>
							<div
								className={`product__price__item ${
									!internalCartMsi ? 'payment-disable' : 'payment-enable'
								}`}
								onClick={() => {
									!internalCartMsi && dispatch(showPaymentsChange());
								}}
							>
								<div className='product__price__header'>A MSI:</div>
								<span className='text--light'>
									${' '}
									{item.precio_final_descuento > 0
										? CurrencyFormat(item.precio_final_descuento)
										: CurrencyFormat(item.precio_final)}
								</span>
								<div className='product__tax text--off'>Incluye IVA</div>
							</div>
						</div>
						<div className='payments-change__label-help text--off'>
							*Haz clic en la opción de pago que prefieras.
						</div>
						<div className='product__price__item'>
							<span className='product_price__info_payment'>
								Hasta{' '}
								<span className='text--red'>
									3 meses sin intereses de ${' '}
									{CurrencyFormat(
										item.precio_final_descuento > 0
											? item.precio_final_descuento / 3
											: item.precio_final / 3
									)}
								</span>
							</span>
							<div className='product_price__info_payment text--off'>
								(Con tarjetas de crédito participantes)
							</div>
						</div>
					</div>
					{item.stock_total > 0 ? (
						<div className='product__description'>
							<div className='product__description__content'>
								<div className='product__resume'>
									<div className='product__resume__shipping'>
										<span>
											{item.envio_gratis ? (
												<FreeShipping
													modeCard={true}
													label={`Recíbelo gratis entre el ${Capitalize(
														shippingIntervalStart.toLocaleDateString('es-ES', {
															weekday: 'long',
														})
													)} y el ${Capitalize(
														shippingIntervalEnd.toLocaleDateString('es-ES', {
															weekday: 'long',
														})
													)}, (${Capitalize(
														shippingIntervalStart.toLocaleDateString('es-ES', {
															month: 'long',
														})
													)}  ${shippingIntervalStart.getDate()} 
											y ${Capitalize(
												shippingIntervalEnd.toLocaleDateString('es-ES', {
													month: 'long',
												})
											)}  ${shippingIntervalEnd.getDate()})`}
												/>
											) : (
												<FreeShipping
													modeCard={true}
													label={`Recíbelo por $${
														item.costo_envio
													} entre el ${Capitalize(
														shippingIntervalStart.toLocaleDateString('es-ES', {
															weekday: 'long',
														})
													)} y el ${Capitalize(
														shippingIntervalEnd.toLocaleDateString('es-ES', {
															weekday: 'long',
														})
													)}, (${Capitalize(
														shippingIntervalStart.toLocaleDateString('es-ES', {
															month: 'long',
														})
													)}  ${shippingIntervalStart.getDate()} 
											y ${Capitalize(
												shippingIntervalEnd.toLocaleDateString('es-ES', {
													month: 'long',
												})
											)}  ${shippingIntervalEnd.getDate()})`}
													color={false}
												/>
											)}
										</span>
									</div>

									<div className='product__resume__stock'>
										<div>
											<span className='bold'>Cantidad:</span>
										</div>
										<div className='product__resume__stock__action'>
											<span
												className='product_resume__stock__action__quantity'
												onClick={handleDecrement}
											>
												<span>-</span>
											</span>
											<input
												type='number'
												value={cartQuantity}
												pattern='[0-9]*'
												onChange={handleInputChange}
												className='bold product_resume__stock__action__quantity_current no-spin'
												min={1}
												max={item.stock_total}
											/>

											<span
												className='product_resume__stock__action__quantity'
												onClick={handleIncrement}
											>
												<span>+</span>
											</span>
										</div>
										<div>
											<span className='text--off product_resume__stock__action__available'>
												{' '}
												({item.stock_total} Disponibles)
											</span>
										</div>
									</div>

									{item.stock_puebla > 0 && filter_available_store && (
										<div className='product_resume__stock__local'>
											<div className='shipping-local__icon'>
												<Image
													src={
														'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAGDf+RsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAxIDc5LmE4ZDQ3NTM0OSwgMjAyMy8wMy8yMy0xMzowNTo0NSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RERFMzJCQUYyMTQyMTFFRThFNzk5MTFFMzM4QzQyQzciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RERFMzJCQUUyMTQyMTFFRThFNzk5MTFFMzM4QzQyQzciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBODZCNThCQ0IwRDcxMUVDODQ2N0QyRTU3QjRDN0M2QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBODZCNThCREIwRDcxMUVDODQ2N0QyRTU3QjRDN0M2QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpR6MRQAAIXSSURBVHja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'
													}
													fill
													style={{ objectFit: 'contain' }}
													draggable='false'
													alt={Capitalize('Local Shipping Icon')}
												/>
											</div>
											<div className='shipping-local__label'>
												<span>
													Para entrega{' '}
													{today.toLocaleDateString('es-ES', {
														weekday: 'long',
													}) === 'sábado' ||
													today.toLocaleDateString('es-ES', {
														weekday: 'long',
													}) === 'domingo'
														? 'el Lunes '
														: today.getHours() < 16
														? 'Hoy '
														: 'Mañana '}
													en Ciudad de Puebla hay{' '}
													<span className='bold'>{item.stock_puebla}</span>{' '}
													Disponibles.
													<div className='shipping-local__label_mini'>
														{labelTimeRemaining}
													</div>
												</span>
											</div>
										</div>
									)}
								</div>

								<ProductsButtonsActions
									product={item}
									quantity={cartQuantity}
								/>

								<div className='product__seller_current'>
									Vendido y enviado por <b>{sellerDefaultName}</b>
								</div>

								<InfoMini />
							</div>
						</div>
					) : (
						<div className='product__out_sotck'>
							<div className='product__out_sotck__label'>
									<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet" className='shipping-local__icon'>
										<g className='product-out-of-stock__icon'>
											<path d="M145.2 414.6 c-53.6 -23.9 -98.4 -44.3 -99.5 -45.5 l-2.2 -2.2 0 -121.4 0 -121.5 2.5 -2.4 c3.4 -3.4 195.2 -88.6 199.4 -88.6 1.9 0 39.5 16.2 100.5 43.3 77.5 34.4 97.9 43.9 99.5 46.1 2.1 2.7 2.1 3.7 2.1 58.9 0 53.1 -0.1 56.3 -1.9 58.9 -2.6 4 -8.3 5.5 -12.4 3.4 -6.2 -3.2 -6.2 -2.8 -6.2 -53.6 0 -25.3 -0.2 -46 -0.4 -46 -0.2 0 -40.3 17.8 -89.2 39.5 -55.6 24.7 -90.1 39.5 -92 39.5 -2 0 -36 -14.6 -91 -39.1 -48.4 -21.5 -88.5 -39.3 -89.1 -39.6 -1 -0.4 -1.3 21.1 -1.3 105.8 l0.1 106.4 90.5 40.2 90.5 40.1 5.4 -2.4 c5 -2.3 5.6 -2.4 8.8 -1 6.6 2.7 8.7 9.7 4.6 15 -2.6 3.3 -14.9 9.6 -18.6 9.5 -1.6 0 -46.6 -19.5 -100.1 -43.3z m184.1 -249.6 c44.9 -20 81.7 -36.6 81.7 -37 0 -0.4 -17 -8.2 -37.7 -17.4 l-37.7 -16.8 -82.8 36.8 c-45.5 20.3 -82.8 37.1 -82.8 37.5 0 1.1 74.4 33.9 76 33.6 0.9 -0.2 38.3 -16.7 83.3 -36.7z m-102.3 -45 c44.8 -19.9 81.8 -36.5 82.2 -36.9 0.5 -0.4 -13.7 -7.1 -31.3 -14.9 -25.1 -11.2 -32.6 -14.1 -34.4 -13.5 -4.9 1.7 -164.4 72.8 -164.4 73.3 0 0.9 63.4 28.8 64.9 28.6 0.8 -0.2 38.2 -16.6 83 -36.6z" />
											<path d="M344.3 456.6 c-40.6 -7.8 -72 -36.3 -83.9 -76.3 -3.7 -12.6 -4.5 -35.5 -1.6 -49.3 5.2 -25.3 19.6 -48.2 39.7 -63.2 20.6 -15.5 43.8 -22.7 69.4 -21.5 68.1 3.1 115.6 69.6 96.6 135.1 -10.3 35.6 -39.5 63.9 -75.3 73.3 -12.1 3.1 -33.6 4 -44.9 1.9z m37.6 -21.1 c26 -6 47.3 -23.4 58.7 -48.1 10.7 -23.1 9.9 -52.6 -2.1 -75.1 -12 -22.7 -30.5 -37 -56.5 -43.9 -9.6 -2.6 -29.9 -2.3 -40.5 0.5 -30.2 8.1 -53 30.5 -61.7 60.6 -3 10.5 -3.2 33.2 -0.4 43.5 9.4 34.2 36.5 58.6 71.1 64 8.1 1.2 22.4 0.5 31.4 -1.5z" />
											<path d="M325.1 392.4 c-3.4 -2.4 -5.3 -7.6 -4 -11.1 0.5 -1.5 6.9 -8.8 14.2 -16 l13.1 -13.3 -13.7 -13.8 c-13.1 -13.3 -13.7 -14 -13.7 -18 0 -5.6 3.1 -9.1 8.8 -9.9 l4.3 -0.6 13.7 13.7 c7.6 7.5 14.2 13.6 14.7 13.6 0.5 0 7 -6.1 14.5 -13.5 12.5 -12.4 14 -13.5 17.3 -13.5 5.6 0 10.2 4.5 10.2 9.9 0 4 -0.6 4.7 -14 18.1 l-13.9 14 14.2 14.3 c15 15.1 15.7 16.3 13 22.2 -1.4 3.2 -5.6 5.5 -9.9 5.5 -2.8 0 -5 -1.8 -16.9 -13.5 -7.5 -7.4 -14 -13.5 -14.5 -13.5 -0.5 0 -7 6.1 -14.5 13.5 -12.2 12.1 -14 13.5 -17.1 13.5 -1.9 0 -4.5 -0.7 -5.8 -1.6z" />
										</g>
									</svg>
								<div>
									<span>
										Actualmente este producto está agotado esperamos tenerlo de
										regreso pronto.
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<style jsx>
				{`
					.payments-change__label-help {
						font-size: 12px;
						font-weight: 300;
						line-height: 2;
					}

					.payment-disable {
						cursor: pointer;
					}

					.payment-enable {
						border-color: var(--primary-color) !important;
						background-color: var(--background-price-color);
					}

					.product-out-of-stock__icon {
						fill: var(--primary-color);
					}

					.product__seller_current {
						line-height: 2;
						margin-top: 15px;
					}

					.product__price__label {
						margin-bottom: 10px;
					}
					.price--compare {
						font-size: 16px;
					}
					.product__price__container__type_of_payments {
						display: flex;
						justify-content: space-between;
						flex-wrap: nowrap;
						gap: 10px;
					}
					.product__price__item {
						line-height: 1.5 !important;
					}

					.product__price__container__type_of_payments .product__price__item {
						border: 1px solid #eaeaea;
						border-radius: 5px;
						margin-bottom: 10px;
						padding: 10px;
						width: 100%;
					}

					.product_price__info_payment {
						font-size: 14px;
						line-height: 1.5 !important;
						font-weight: 100;
					}

					.product__price__header {
						font-size: 16px;
					}
					.product__info__container {
					}

					.shipping-local__label_mini {
						font-size: 12px;
						font-weight: 100;
					}
					.shipping-local__label {
						flex-basis: 100%;
						margin-left: 25px;
						font-weight: 600;
					}

					.product__out_sotck {
						margin-top: 20px;
						background-color: var(--background-price-color);
						border-radius: 10px;
						display: flex;
						align-items: center;
						padding: 10px;
						color: var(--primary-color);
						width: 100%;
						align-items: center;
						justify-content: center;
						text-align: center;
						border: 1px solid var(--primary-color);
					}

					.product__out_sotck__label {
						flex-basis: 100%;
					}
					.shipping-local__icon {
						height: 50px;
						flex-basis: 50px;
						position: relative;
					}
					.product__specs__container {
						margin-top: 20px;
						border-top: 1px solid #eaeaea;
					}

					.product__specs__container ul {
						margin-left: 20px;
					}
					.product__resume__shipping {
						font-size: 14px;
						display: flex;
						justify-content: center;
						margin-top: 20px;
					}
					.product_resume__stock__local {
						margin-top: 20px;
						background-color: #d9f8d1;
						border-radius: 10px;
						display: flex;
						align-items: center;
						padding: 10px;
						color: #00aa00;
						width: 100%;
					}
					.product_resume__stock__action__available {
						font-size: 12px;
					}

					.product_resume__stock__action__quantity_current {
						width: 30px;
						text-align: center;
						border: 0;
					}

					.product__resume__stock__action {
						width: 90px;
						display: flex;
						border: 1px solid var(--primary-color);
						border-radius: 5px;
						background-color: #ffffff;
					}
					.product_resume__stock__action__quantity {
						font-size: 18px;
						padding: 5px;
						width: 30px;
						align-items: center;
						height: 30px;
						display: flex;
						justify-content: center;
					}

					.product_resume__stock__action__quantity:hover,
					.product_resume__stock__action__quantity:active {
						color: var(--primary-color);
						cursor: pointer;
					}
					.product__resume__stock {
						width: 100%;
						display: flex;
						align-items: center;
						gap: 20px;
						margin-top: 20px;
						font-size: 16px;
					}

					.product__specs__container h3 {
						margin-top: 20px;
						margin-bottom: 20px;
					}
					.product__specs__resume {
						line-height: 2;
						flex-basis: 30%;
						padding: 15px;
					}
					.product__brand {
						width: 100px;
						height: 50px;
						position: relative;
						display: flex;
						align-items: center;
					}

					.product {
						display: flex;
						flex-wrap: nowrap;
						background-color: #ffffff;
						border: 1px solid #eaeaea;
					}

					.product__gallery {
						width: 100%;
						height: auto;
						position: relative;
						flex-basis: 45%;
					}

					.product__info {
						flex-basis: 25%;
						padding: 15px;
						border-radius: 5px;
					}

					.product__price {
						font-size: 20px;
						font-weight: 600;
						margin-top: 10px;
					}

					.product__tax {
						font-size: 14px;
						font-weight: 100;
					}
					.product__title h1 {
						font-size: 22px;
						line-height: 1.5;
						margin-bottom: 10px;
					}

					.product__info__header {
						line-height: 36px;
					}

					.product__info__header__sub span {
						margin-right: 10px;
						font-size: 12px;
					}

					.product__info__header__sub--mobile {
						margin-left: 10px;
						margin-top: 20px;
						margin-bottom: 10px;
					}
					.product__description {
						position: relative;
						width: 100%;
						max-width: 100%;
					}

					.product__description__title {
						font-size: 16px;
						font-weight: 600;
						margin-top: 10px;
					}

					.product__description__content {
						margin-top: 10px;
					}

					.product__resume {
						line-height: 24px;
						display: flex;
						flex-wrap: wrap;
					}

					.product__resume__item {
						flex: 0 0 100%;
						display: flex;
						margin-left: ;

						align-items: center;
					}
					.product__resume__title {
						font-weight: 600;
					}
					.product__resume__detail {
						margin-left: 10px;
						display: flex;
					}
					@media only screen and (max-width: 62em) {
						.product__info,
						.product__gallery,
						.product__specs__resume {
							flex-basis: 100%;
						}

						.product__specs__resume {
							margin: 0;
							padding: 15px;
							order: 3;
						}
						.product__info {
							border: 0;
						}

						.product__specs__container {
							border: 1px solid #eaeaea;
							border-radius: 5px;
							padding: 10px;
						}
						.product {
							flex-wrap: wrap;
						}

						.product__title h1 {
							font-size: 18px;
							border: 0;
						}

						.--show-mobile {
							display: block;
						}

						.--hidden-mobile {
							display: none;
						}
						.product {
							border-left: 0 !important;
							border-right: 0 !important;
						}
					}
				`}
			</style>
		</div>
	);
};

export default DetailProduct;
