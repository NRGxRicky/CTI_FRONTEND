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

const DetailProduct = ({
	item,
	width,
	height,
	tempMobile = false,
	filter_available_store,
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
			shippingStart = addDays(newToday, 1);
		} else if (dayOfWeek === 'sábado') {
			shippingStart = addDays(newToday, 3);
		} else if (dayOfWeek === 'domingo') {
			shippingStart = addDays(newToday, 2);
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
				return item.stock_total
			}
				else {
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
			}
			else {
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
		setCartQuantity(1)

	}, [item])
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
							<span className='text--off'>Vendidos {item.ventas}</span>
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
							<span className='text--off'>Vendidos {item.ventas}</span>
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
							<div className='product__price__item'>
								<div className='product__price__header'>A un pago:</div>
								<span className='text--light'>
									$ {CurrencyFormat(item.precio_contado)}
								</span>
								<div className='product__tax text--off'>Incluye IVA</div>
							</div>
							<div className='product__price__item'>
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
									Vendido y enviado por <b>PCSTORE</b>
								</div>

								<InfoMini />
							</div>
						</div>
					) : (
						<div className='product__out_sotck'>
							<div className='product__out_sotck__label'>
								<div className='shipping-local__icon'>
									<Image
										src={
											'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAGDf+RsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDM2MCwgMjAyMC8wMi8xMy0wMTowNzoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTg2QjU4QzBCMEQ3MTFFQzg0NjdEMkU1N0I0QzdDNkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTg2QjU4QzFCMEQ3MTFFQzg0NjdEMkU1N0I0QzdDNkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBODZCNThCRUIwRDcxMUVDODQ2N0QyRTU3QjRDN0M2QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBODZCNThCRkIwRDcxMUVDODQ2N0QyRTU3QjRDN0M2QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuauAFoAAJR4SURBVHja5FtP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'
										}
										fill
										style={{ objectFit: 'contain' }}
										draggable='false'
										alt={Capitalize('Local Shipping')}
									/>
								</div>
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
						background-color: #f8d3d1;
						border-radius: 10px;
						display: flex;
						align-items: center;
						padding: 10px;
						color: #73403e;
						width: 100%;
						align-items: center;
						justify-content: center;
						text-align: center;
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
						margin-left: 20px;
						font-size: 14px;
					}

					.product_resume__stock__action__quantity_current {
						width: 30px;
						text-align: center;
						border: 0;
					}

					.product__resume__stock__action {
						width: 90px;
						display: flex;
						margin-left: 20px;
						border: 1px solid #ff002c;
						border-radius: 25px;
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
						color: #ff002c;
						cursor: pointer;
					}
					.product__resume__stock {
						width: 100%;
						display: flex;
						align-items: center;
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
