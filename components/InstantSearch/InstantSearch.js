import React, { useEffect, useState } from 'react';
import { Preloader, TailSpin } from 'react-preloader-icon';
import Image from 'next/image';
import Capitalize from '../../hooks/CapitalizeTitle';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import {
	showOpacity,
	hideOpacity,
	hideAll,
	showSearchBar,
} from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';

const InstantSearch = ({
	queryInInput,
}) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const router = useRouter();
	const searchVisibleValue = useAppSelector(
		(state) => state.showOpacityContainerReducer.searchBar
	);
	const dispacth = useAppDispatch();


	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				`https://api.pccdnapi.com/listado/instantsearch/?q=${queryInInput}`
			);
			setData(await data.json());
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	const redirecToResults = () => {
		router.push(`/listado/all/index?q=${queryInInput}`);
		dispacth(hideAll(false));
	};

	useEffect(() => {
		if (queryInInput !== undefined) {
			if (queryInInput.length > 0) {
				fetchData();
				dispacth(showSearchBar());
			}
		}
	}, [queryInInput]);

	if (loading) {
		return (
			<div
				className='search-box'
				style={
					!searchVisibleValue ? { display: 'none' } : { display: 'block' }
				}
			>
				<div className='search-box__loader'>
					<Preloader
						use={TailSpin}
						size={30}
						strokeWidth={8}
						strokeColor='#FF002C'
						duration={900}
					/>
				</div>

				<style jsx>
					{`
						.search-box {
							width: 100%;
						}

						.search-box__loader {
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 10px;
							height: 200px;
						}
					`}
				</style>
			</div>
		);
	}
	if (error) {
		return (
			<div
				className='search-box'
				style={
					!searchVisibleValue ? { display: 'none' } : { display: 'block' }
				}
			>
				<div className='search-box__loader'>Error</div>

				<style jsx>
					{`
						.search-box {
							height: 200px;
						}

						.search-box__loader {
							position: absolute;
							right: 0;
							bottom: 0;
							height: 50%;
							width: 50%;
							padding: 10px;
						}

						@media only screen and (max-width: 48em) {
							.search-box {
								height: 200px;
							}
						}
					`}
				</style>
			</div>
		);
	}
	if (data) {
		return (
			<div
				className='search-box'
				style={!searchVisibleValue ? { display: 'none' } : { display: 'block' }}
			>
				{data.results.map((producto) => (
					<div
						key={producto.id}
						className='search-box__item'
						onClick={() => dispacth(hideAll())}
					>
						<Link href={`/${producto.slug}`} legacyBehavior>
							<a className='search-box__link'>
								<div className='search-box__item__box'>
									<div className='search-box_item__container'>
										<div className='search-box__item__image'>
											<div className='search-box__image'>
												<Image
													src={
														producto.imagen1xs
															? producto.imagen1xs
															: '/images/not-available.png'
													}
													fill
													style={{ objectFit: 'contain' }}
													alt={Capitalize(producto.titulo)}
													sizes='auto'
												/>
											</div>
										</div>
										<div className='search-box__item__title'>
											<div>
												<span>{Capitalize(producto.titulo)}</span>
											</div>
											<div className='search_box__item__model text--off'>
												<span>{producto.modelo.toUpperCase()}</span>
											</div>
										</div>
									</div>
									<div className='search-box__info'>
										<div className='search-box__price'>
											<span>
												$ {CurrencyFormat(producto.precio_final, 2, '.', ',')}
											</span>
										</div>
										<div className='search-box__stock text--off'>
											<span>
												{producto.stock_total}{' '}
												{producto.stock_total > 1
													? 'disponibles'
													: 'disponible'}
											</span>
										</div>
									</div>
								</div>
							</a>
						</Link>
					</div>
				))}

				{data.count > 5 && (
					<div className='search-box__see-all' onClick={redirecToResults}>
						<span>Ver todos los {data.count} resultados</span>
					</div>
				)}
				<style jsx>
					{`
						.search-box {
							height: 100%;
						}

						.search-box__item {
							padding: 10px;
							border-bottom: 1px solid #ced4da;
						}

						.search-box__item:last-child {
							border: 0;
						}

						.search-box__item__box:hover {
							background-color: #fff8f4;
							border-radius: 0.37em;
						}

						.search-box__item__box {
							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: space-between;
							padding: 10px;
							max-width: 100%;
						}

						.search-box_item__container {
							display: flex;
							flex-direction: row;
							width: 100%;
							align-items: center;
						}

						.search-box__item__image {
							position: relative;
							min-width: 70px;
							height: 50px;
							mix-blend-mode: multiply;
						}

						.search-box__image {
							position: relative;
							height: 50px;
							width: 50px;
						}

						.search-box__info {
							text-align: right;
							width: 15%;
							min-width: 100px;
						}

						.search-box__item__title {
							font-weight: 600;
						}

						.search-box__price {
							font-weight: 600;
						}

						.search_box__item__model {
							line-height: 30px;
						}

						.search-box__link {
							width: 100%;
						}

						.search-box__see-all {
							cursor: pointer;
							text-align: center;
							line-height: 30px;
							color: #ff002c;
							font-weight: 600;
							padding: 10px;
						}

						.search-box__stock {
							line-height: 30px;
						}

						@media only screen and (max-width: 48em) {
							.search-box__item__box {
								flex-wrap: wrap;
							}

							.search-box__info {
								width: 100%;
								flex-grow: 1;
							}
						}
					`}
				</style>
			</div>
		);
	} else {
		return <div></div>;
	}
};
export default InstantSearch;
