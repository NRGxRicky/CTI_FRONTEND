import React, { UseState, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import { BrowserView, MobileView } from 'react-device-detect';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import Capitalize from '../../hooks/CapitalizeTitle';
import TextTruncate from 'react-text-truncate';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import NewProduct from '../Icons/NewProduct';

const ListProducts = ({ results, filter_available_store, tempMobile }) => {
	if (results === null) {
		return null;
	}

 useEffect(() => {
		const handleBeforeUnload = () => {
			const productsListContainer = document.getElementById(
				'products-list__container'
			);
			const scrollPosition = productsListContainer.scrollTop;
			sessionStorage.setItem('scrollPosition', scrollPosition.toString());
		};

		const productsListContainer = document.getElementById(
			'products-list__container'
		);
		productsListContainer.addEventListener('scroll', handleBeforeUnload);

		return () => {
			productsListContainer.removeEventListener('scroll', handleBeforeUnload);
		};
 }, []);
	
	return (
		<div
			className={
				tempMobile
					? 'products-list__container products-list__container__mobile'
					: 'products-list__container'
			}
			id='products-list__container'
		>
			{results.map((producto) => (
				<div
					className='products-list__item'
					key={producto.id}
					style={{ border: tempMobile && '0.5px solid #eaeaea' }}
				>
					<Link href={`/${producto.slug}`} legacyBehavior>
						<a>
							<div className='card'>
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
										<span>
											$ {CurrencyFormat(producto.precio_final, 2, '.', ',')}
										</span>
									</div>
									<div className='card__available'>
										{!filter_available_store && (
											<div>
												<span>
													{producto.stock_total}{' '}
													{producto.stock_total > 1
														? 'disponibles'
														: 'disponible'}
												</span>
											</div>
										)}
										{filter_available_store && (
											<div>
												<span>
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
					.products-list__container {
						display: flex;
						flex-wrap: wrap;
						align-items: stretch;
						width: 100%;
						position: relative;
					}

					.products-list__container__mobile {
						overflow-y: auto;
						height: calc(100vh - 113px);
					}

					.products-list__item {
						flex: 1 0 50%;
					}

					.card {
						width: 100%;
						min-height: 325px;
						height: auto;
						max-height: 450px;
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
						height: auto;
						margin-bottom: 5px;
					}
					.card__available {
						width: 100%;
						height: 20px;
						font-size: 12px;
					}

					.card__sku {
						height: 30px;
						width: 100%;
						margin-top: 4px;
						font-size: 12px;
					}

					.card__info {
						width: 100%;
						margin-top: 7px;
						font-size: 12px;
					}

					@media only screen and (min-width: 48em) {
						.products-list__item {
							flex: 0 0 calc(25% - 5px);
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
