import React, { useState, useEffect } from 'react';
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
import KueskiPayWidget from '../KueskiPayWidget/KueskiPayWidget';
import SocialShare from '../SocialShare/SocialShare';

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
			currentHour <= 12

		let shippingStart;

		if (currentHour >= 13 && isWeekend) {
			shippingStart = addDays(newToday, 2);
		} else if (dayOfWeek === 'sábado') {
			shippingStart = addDays(newToday, 4);
		} else if (dayOfWeek === 'domingo') {
			shippingStart = addDays(newToday, 3);
		}

		const endTime = new Date();
		if (isLaboral && currentHour <= 12) {
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
						{/* Botón de compartir flotante */}
						<div className='product__social-share'>
							<SocialShare
								url={typeof window !== 'undefined' ? window.location.href : ''}
								title={item.titulo || 'Producto'}
								description={`Compra ${item.titulo || 'este producto'} - Disponible ahora`}
								image={item.imagen1s || ''}
								product={item}
							/>
						</div>
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
								className={`product__price__item ${internalCartMsi ? 'payment-disable' : 'payment-enable'
									}`}
								onClick={() => {
									internalCartMsi && dispatch(showPaymentsChange());
								}}
							>
								<div className='product__price__header'>
									<div className='radio-wrapper'>
										<input
											id='payment-one-pay'
											type='radio'
											name='payment-one-pay'
											checked={!internalCartMsi}
											readOnly
										></input>
									</div>
									<div>
										A un Pago
									</div>
								</div>
								<span className='text--light'>
									$ {CurrencyFormat(item.precio_contado)}
								</span>
								<div className='product__tax text--off'>Incluye IVA</div>
							</div>
							<div
								className={`product__price__item ${!internalCartMsi ? 'payment-disable' : 'payment-enable'
									}`}
								onClick={() => {
									!internalCartMsi && dispatch(showPaymentsChange());
								}}
							>
								<div className='product__price__header'>
									<div className='radio-wrapper'>
										<input
											id='payment-msi'
											type='radio'
											name='payment-msi'
											checked={internalCartMsi}
											readOnly
										></input>
									</div>
									<div>
										A Pagos
									</div>
								</div>
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

					{/* KUESKIPAY WIDGET */}
					<KueskiPayWidget product_title={Capitalize(item.titulo)} product_price={
						item.precio_final_descuento > 0
							? CurrencyFormat(item.precio_final_descuento)
							: CurrencyFormat(item.precio_final)
					} />

					{/* APLAZO WIDGET */}
					<div className='aplazo-widget' style={{ marginTop: 10 }}>
						<aplazo-placement product-price={
							item.precio_final_descuento > 0
								? parseFloat(item.precio_final_descuento * 100)
								: parseFloat(item.precio_final * 100)
						}
						></aplazo-placement>
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
													label={`Recíbelo por $ ${item.costo_envio
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
										{/* <ShippingQuote productId={item.id} / > */}
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
												<svg fill="#00aa00" height="24px" width="24px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
													viewBox="0 0 422.518 422.518" xmlSpace="preserve">
													<path d="M422.512,215.424c0-0.079-0.004-0.158-0.005-0.237c-0.116-5.295-4.368-9.514-9.727-9.514h-2.554l-39.443-76.258
	c-1.664-3.22-4.983-5.225-8.647-5.226l-67.34-0.014l2.569-20.364c0.733-8.138-1.783-15.822-7.086-21.638
	c-5.293-5.804-12.683-9.001-20.81-9.001h-209c-5.255,0-9.719,4.066-10.22,9.308l-2.095,16.778h119.078
	c7.732,0,13.836,6.268,13.634,14c-0.203,7.732-6.635,14-14.367,14H126.78c0.007,0.02,0.014,0.04,0.021,0.059H10.163
	c-5.468,0-10.017,4.432-10.16,9.9c-0.143,5.468,4.173,9.9,9.641,9.9H164.06c7.168,1.104,12.523,7.303,12.326,14.808
	c-0.216,8.242-7.039,14.925-15.267,14.994H54.661c-5.523,0-10.117,4.477-10.262,10c-0.145,5.523,4.215,10,9.738,10h105.204
	c7.273,1.013,12.735,7.262,12.537,14.84c-0.217,8.284-7.109,15-15.393,15H35.792v0.011H25.651c-5.523,0-10.117,4.477-10.262,10
	c-0.145,5.523,4.214,10,9.738,10h8.752l-3.423,35.818c-0.734,8.137,1.782,15.821,7.086,21.637c5.292,5.805,12.683,9.001,20.81,9.001
	h7.55C69.5,333.8,87.3,349.345,109.073,349.345c21.773,0,40.387-15.545,45.06-36.118h94.219c7.618,0,14.83-2.913,20.486-7.682
	c5.172,4.964,12.028,7.682,19.514,7.682h1.55c3.597,20.573,21.397,36.118,43.171,36.118c21.773,0,40.387-15.545,45.06-36.118h6.219
	c16.201,0,30.569-13.171,32.029-29.36l6.094-67.506c0.008-0.091,0.004-0.181,0.01-0.273c0.01-0.139,0.029-0.275,0.033-0.415
	C422.52,215.589,422.512,215.508,422.512,215.424z M109.597,329.345c-13.785,0-24.707-11.214-24.346-24.999
	c0.361-13.786,11.87-25.001,25.655-25.001c13.785,0,24.706,11.215,24.345,25.001C134.89,318.131,123.382,329.345,109.597,329.345z
	 M333.597,329.345c-13.785,0-24.706-11.214-24.346-24.999c0.361-13.786,11.87-25.001,25.655-25.001
	c13.785,0,24.707,11.215,24.345,25.001C358.89,318.131,347.382,329.345,333.597,329.345z M396.457,282.588
	c-0.52,5.767-5.823,10.639-11.58,10.639h-6.727c-4.454-19.453-21.744-33.882-42.721-33.882c-20.977,0-39.022,14.429-44.494,33.882
	h-2.059c-2.542,0-4.81-0.953-6.389-2.685c-1.589-1.742-2.337-4.113-2.106-6.676l12.609-139.691l28.959,0.006l-4.59,50.852
	c-0.735,8.137,1.78,15.821,7.083,21.637c5.292,5.806,12.685,9.004,20.813,9.004h56.338L396.457,282.588z"/>
												</svg>
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
														: today.getHours() <= 12
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
						display: flex;
						flex-direction: row-reverse;

						justify-content: space-between;
					}
					.product__info__container {
					}

					.shipping-local__label_mini {
						font-size: 12px;
						font-weight: 100;
					}
					.shipping-local__label {
						flex-basis: 100%;
						margin-left: 15px;
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
    				display: flex;
    				flex-direction: column;
    				gap: 10px;
					}
					.shipping-local__icon {
						height: 40px;
						flex-basis: 40px;
						position: relative;
						display: flex;
						align-items: center;
						justify-content: center;
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

					.product__social-share {
						position: absolute;
						top: 16px;
						right: 16px;
						z-index: 10;
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

						.product__social-share {
							top: 12px;
							right: 12px;
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
