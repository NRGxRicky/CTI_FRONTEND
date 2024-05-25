import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import TruncateMarkup from 'react-truncate-markup';

const BrandSimilarMini = ({
	marca = 'all',
	categoria = 'index',
	typeQuery = '-visitas',
	q = '',
	item,
	filter_available_store,
}) => {
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				`https://api.pccdnapi.com/section?type=${typeQuery}&marca=${marca.slug}&categoria=${categoria.slug}&q=${q}&filter_available_store=${filter_available_store}`
			);
			setData(await data.json());
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};
	
	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		fetchData();
	}, [marca, categoria]);

	if (data.results.filter((i) => i.id !== item.id).length < 1) {
		return <div></div>;
	}

	return (
		data.results.length > 1 && (
			<div className='product__same-brand__recommended'>
				<div className='brand__mini'>
					<h2>
						Mas de {Capitalize(marca.nombre)} en {Capitalize(categoria.name)}
					</h2>
					<div className='brand__mini__results'>
						{data.results
							.filter((i) => i.id !== item.id)
							.filter((i) => i.imagen1s)
							.slice(0, 4)
							.map((item, index) => (
								<Link href={`/${item.slug}`} key={index} legacyBehavior>
									<a>
										<div className='brand__mini__item'>
											<div className='brand__mini__item__container'>
												<div className='brand__mini__item__image'>
													{item.precio_final_descuento > 0 && (
														<>
															<div className='product__price__label on-sale'>
																Ahorra{' '}
																{Math.ceil(
																	((item.precio_final -
																		item.precio_final_descuento) *
																		100) /
																		item.precio_final
																)}
																%
															</div>
														</>
													)}
													<Image
														src={
															item.imagen1s
																? item.imagen1s
																: '/images/not-available.png'
														}
														fill
														style={{ objectFit: 'contain' }}
														draggable='false'
														sizes='auto'
														alt={Capitalize(item.titulo)}
													/>
												</div>
											</div>
											<div className='brand__mini__item__content'>
												<div className='brand__mini__item__price'>
													{item.precio_final_descuento > 0 && (
														<>
															<div className='text--off'>
																<span className='price--compare'>
																	$ {CurrencyFormat(item.precio_final)}
																</span>
															</div>
														</>
													)}
													$ {CurrencyFormat(item.precio_contado, 2, '.', ',')}
												</div>
												<div>{item.envio_gratis && <FreeShipping />}</div>
												<div>
													<TruncateMarkup lines={2}>
														<span>{Capitalize(item.titulo)}</span>
													</TruncateMarkup>
												</div>
											</div>
										</div>
									</a>
								</Link>
							))}
					</div>
				</div>
				<style jsx>
					{`
				.product__price__label {
					z-index: 1;
					position: absolute;
					left: 0;
					font-size: 10px;
					max-width: 75% !important;
				}

				.price--compare {
					font-size: 14px;
				}
				.brand__mini__item__container {
					padding: 5px;
					width: 100px;
					height: 100px;
          flex-basis: 100px;
          border: 1px solid #eaeaea;
          border border-radius: 5px;
				}

				.brand__mini__item__price {
					font-size: 18px;
					font-weight: 600;
					line-height: 1.5;
				}
					.brand__mini__item {
						margin-top: 10px;
            display: flex;
            width: 100%;
        		align-items: center;
            flex-direction: row;
            justify-content: space-between;
          }

         .brand__mini__item__content {     
					 margin-left: 10px;
          flex-basis: 70%;
          }
          .brand__mini__item__image {
						position: relative;
						height: 100%;
						width: 100%;
					
					}
					.brand__mini__results {
            display: flex;
            flex-direction: column;
					}
					.brand__mini {
						margin-top: 10px;
            border: 1px solid #eaeaea;
            border border-radius: 5px;
            padding: 10px;
					}
					.brand__mini h2 {
						margin-left: 5px;
						line-height: 2;
					}
					.product__same-brand__recommended {
						background-color: #ffffff;
						padding: 20px;
						border: 1px solid #eaeaea;
						margin-top: 20px;
					}
					`}
				</style>
			</div>
		)
	);
};

export default BrandSimilarMini;
