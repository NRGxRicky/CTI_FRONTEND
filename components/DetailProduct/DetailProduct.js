import React, { useState } from 'react';
import Capitalize from '../../hooks/CapitalizeTitle';
import ProductGallery from '../ProductGallery/ProductGallery';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import Image from 'next/image';
import Link from 'next/link';
import ProductGalleryMobile from '../ProductGalleryMobile/ProductGalleryMobile';
import InfoMini from '../InfoMini/InfoMini';

const DetailProduct = ({ item, width, height, tempMobile = false }) => {
	let today = new Date();
	const currentDay = new Date();

	const lastday = function (y, m) {
		return new Date(y, m + 1, 0).getDate();
	};

	function addDays(d, qty) {
		let dd = d.getDate();
		let mm = d.getMonth();
		let yyyy = d.getFullYear();
		if (lastday(yyyy, mm) <= parseInt(dd + qty)) {
			return new Date(yyyy, mm++, dd + qty);
		}
		return new Date(yyyy, mm, dd + qty);
	}

	if (
		today.getHours() > 13 &&
		currentDay.toLocaleDateString('es-ES', { weekday: 'long' }) !== 'sábado' &&
		currentDay.toLocaleDateString('es-ES', { weekday: 'long' }) !== 'domingo'
	) {
		today = addDays(today, 1);
	}
	if (
		currentDay.toLocaleDateString('es-ES', { weekday: 'long' }) === 'sábado'
	) {
		today = addDays(today, 2);
	}

	if (
		currentDay.toLocaleDateString('es-ES', { weekday: 'long' }) === 'domingo'
	) {
		today = addDays(today, 1);
	}

	let ShippingIntervalStart = addDays(today, 1);
	let ShippingIntervalEnd = addDays(today, 5);

	if (item === null) {
		return null;
	}
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
												<span className='product__brand text--ligth'>
													{item.marca.imagen ? (
														<Image
															src={item.marca.imagen}
															fill
															style={{ objectFit: 'contain' }}
															alt={Capitalize(item.marca.nombre)}
															draggable='false'
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
					<div className='product__info__header'>
						{!tempMobile && (
							<div className='product__info__header__sub'>
								<span className='text--off'>Nuevo</span>
								<span className='text--off'>|</span>
								<span className='text--off'>Vendidos {item.ventas}</span>
							</div>
						)}
					</div>
					<div className='product__title --show-mobile'>
						<h1>{Capitalize(item.titulo)}</h1>
					</div>
					<div className='product__price'>
						<span className='text--ligth'>
							$ {CurrencyFormat(item.precio_final)}
						</span>
						<span className='product__tax text--off'>Incluye IVA</span>
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
														ShippingIntervalStart.toLocaleDateString('es-ES', {
															weekday: 'long',
														})
													)} y el ${Capitalize(
														ShippingIntervalEnd.toLocaleDateString('es-ES', {
															weekday: 'long',
														})
													)}, (${Capitalize(
														ShippingIntervalStart.toLocaleDateString('es-ES', {
															month: 'long',
														})
													)}  ${ShippingIntervalStart.getDate()} 
											y ${Capitalize(
												ShippingIntervalEnd.toLocaleDateString('es-ES', {
													month: 'long',
												})
											)}  ${ShippingIntervalEnd.getDate()})`}
												/>
											) : (
												<FreeShipping
													modeCard={true}
													label={`Recíbelo por $99.00 entre el ${Capitalize(
														ShippingIntervalStart.toLocaleDateString('es-ES', {
															weekday: 'long',
														})
													)} y el ${Capitalize(
														ShippingIntervalEnd.toLocaleDateString('es-ES', {
															weekday: 'long',
														})
													)}, (${Capitalize(
														ShippingIntervalStart.toLocaleDateString('es-ES', {
															month: 'long',
														})
													)}  ${ShippingIntervalStart.getDate()} 
											y ${Capitalize(
												ShippingIntervalEnd.toLocaleDateString('es-ES', {
													month: 'long',
												})
											)}  ${ShippingIntervalEnd.getDate()})`}
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
											<span className='product_resume__stock__action__quantity'>
												<span>+</span>
											</span>
											<input
												type='number'
												defaultValue={1}
												pattern='[0-9]*'
												className='bold product_resume__stock__action__quantity_current no-spin'
												min={1}
											/>
											<span className='product_resume__stock__action__quantity'>
												<span>-</span>
											</span>
										</div>
										<div>
											<span className='text--off product_resume__stock__action__available'>
												{' '}
												({item.stock_total} Disponibles)
											</span>
										</div>
									</div>
									{item.stock_puebla > 0 && (
										<div className='product_resume__stock__local'>
											<div className='shipping-local__icon'>
												<Image
													src={
														'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAGDf+RsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDM2MCwgMjAyMC8wMi8xMy0wMTowNzoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTg2QjU4QkNCMEQ3MTFFQzg0NjdEMkU1N0I0QzdDNkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTg2QjU4QkRCMEQ3MTFFQzg0NjdEMkU1N0I0QzdDNkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBODZCNThCQUIwRDcxMUVDODQ2N0QyRTU3QjRDN0M2QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBODZCNThCQkIwRDcxMUVDODQ2N0QyRTU3QjRDN0M2QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtGRQLoAAHwBSURBVHja7Fs9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'
													}
													fill
													style={{ objectFit: 'contain' }}
													draggable='false'
												/>
											</div>
											<div className='shipping-local__label'>
												<span>
													Para entrega{' '}
													{currentDay.toLocaleDateString('es-ES', {
														weekday: 'long',
													}) === 'sábado' ||
													currentDay.toLocaleDateString('es-ES', {
														weekday: 'long',
													}) === 'domingo'
														? 'el Lunes '
														: today.getHours() < 18
														? 'Hoy '
														: 'Mañana '}
													en Ciudad de Puebla hay{' '}
													<span className='bold'>{item.stock_puebla}</span>{' '}
													Disponibles.
													<div className='shipping-local__label_mini'>
														(Hasta las 6:00 p.m. por $ 30.00)
													</div>
												</span>
											</div>
										</div>
									)}
								</div>

								<div className='product__actions'>
									<a className='product__actions__add-to-cart'>
										Añadir al Carrito
									</a>
									<a className='product__actions__buy'>Comprar</a>
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
					.product__info__container {
						padding-right: 20px;
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
						color: #3e734e;
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
						padding: 20px;
					}
					.product__brand {
						width: 100px;
						height: 50px;
						position: relative;
						display: flex;
						align-items: center;
					}
					.product__actions {
						margin-top: 15px;
						display: flex;
						gap: 10px;
					}

					.product__actions__add-to-cart {
						line-height: 48px;
						height: 48px;
						position: relative;
						min-width: 150px;
						text-align: center;
						font-size: 16px;
						cursor: pointer;
						background-color: #ffb116;
						color: #ffffff;
						font-weight: 600;
						border-radius: 2px;
						padding: 0 10px;
						flex-grow: 1;
					}

					.product__actions__buy {
						line-height: 48px;
						height: 48px;
						position: relative;
						padding: 0 10px;
						min-width: 150px;
						text-align: center;
						font-size: 16px;
						cursor: pointer;
						background-color: #ff002c;
						color: #ffffff;
						font-weight: 600;
						border-radius: 2px;
						flex-grow: 2;
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
						border-radius: 2px;
					}

					.product__price {
						font-size: 32px;
						font-weight: 600;
						margin-top: 10px;
					}

					.product__tax {
						font-size: 14px;
						margin-left: 10px;
						font-weight: 100;
					}
					.product__title h1 {
						font-size: 24px;
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
							padding: 10px;
							order: 3;
						}
						.product__info {
							border: 0;
						}

						.product__specs__container {
							border: 1px solid #eaeaea;
							border-radius: 2px;
							padding: 10px;
						}
						.product {
							flex-wrap: wrap;
						}

						.product__title h1 {
							font-size: 18px;
							border: 0;
						}

						.product__actions {
							flex-wrap: wrap;
						}
						.product__actions__add-to-cart,
						.product__actions__buy {
							flex: 0 0 100%;
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
