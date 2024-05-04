import React, { UseState, useEffect, useRef } from 'react';
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

const ListProducts = ({ results, filter_available_store }) => {
	if (results === null) {
		return null;
	}

	return (
		<div className={'products-list__container'} id='products-list__container'>
			{results.map((producto) => (
				<div className='products-list__item' key={producto.id}>
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
								<div className='card__content'>
									<div className='card__title'>
										<TextTruncate
											line={3}
											element='span'
											truncateText='…'
											text={Capitalize(producto.titulo)}
										/>
									</div>
									<div className='product__brand'>
										<div className='product__brand__image'>
											{producto.marca_imagen ? (
												<Link
													href={`/listado/${producto.marca_slug}/index`}
													legacyBehavior
												>
													<Image
														src={`https://api.pccdnapi.com/media/${producto.marca_imagen}`}
														fill
														style={{ objectFit: 'contain' }}
														alt={Capitalize(producto.marca_nombre)}
														draggable='false'
														sizes='auto'
													/>
												</Link>
											) : (
												<Link
													href={`/listado/${producto.marca_slug}/index`}
													legacyBehavior
												>
													<div className='text--off'>{`${Capitalize(
														producto.marca_nombre
													)}`}</div>
												</Link>
											)}
										</div>
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
			<style jsx>
				{`

				.card__content {
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					position: relative;
					width: 100%;
					max-height: 500px;
				}
					.product__brand__image {
						position: relative;
						max-width: 50px;
						height: auto;
						max-height: 50px;
						min-height: 50px;
						display: flex;
						align-items: center;

					}
					.product__brand {
						width: 100px;
						font-size: 12px;
						background-color: #ffffff;
					}

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

					.list-products__loader {
						padding: 30px 0;
						width: 100%;
						height: 90px;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.list__container__mobile_fix {
						height: 54px;
						width: 100%;
					}

					.products-list__container {
						display: flex;
						flex-wrap: wrap;
						align-items: stretch;
						width: 100%;
						position: relative;
					}

					.products-list__container__mobile {
						overflow-y: auto;
					}

					.products-list__item {
						flex: 1 0 50%;
						background-color: #ffffff;
					}

					.card {
						width: 100%;
						min-height: 325px;
						height: auto;
						position: relative;
						padding: 8px 15px;
						background-color: #ffffff;
						height: 100%;
					}

					.card__image {
						align-self: center;
						position: relative;
						max-width: 100%;
						width: auto;
						min-height: 140px;
						height: 140px;
						margin-bottom: 7px;
					}

					.card__price {
						width: 100%;
						font-weight: 600;
						font-size: 16px;
					}

					.card__title {
						width: 100%;
						height: 70px;
						justify-self: first baseline;
					}
					.card__available {
						width: 100%;
						font-size: 12px;
						font-weight: 600;
						line-height: 2;
					}

					.card__sku {
						width: 100%;
						font-size: 12px;
						line-height: 2;
					}

					.card__info {
						width: 100%;
						font-size: 12px;
					}

					@media only screen and (min-width: 48em) {
						.products-list__item {
							flex: 0 0 calc(25% - 5px);
							max-width: 24%;
							min-height: 400px;
						}
						.card__image {
							min-height: 180px;
							height: auto;
						}

						.card {
							border: 1px solid #eaeaea;
						}

						.products-list__container {
							gap: 5px;
						}
					}
				`}
			</style>
		</div>
	);
};

export default ListProducts;
