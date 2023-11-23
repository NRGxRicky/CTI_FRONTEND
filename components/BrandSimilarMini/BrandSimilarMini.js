import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import TextTruncate from 'react-text-truncate';

const BrandSimilarMini = ({
	marca = 'all',
	categoria = 'index',
	typeQuery = '-visitas',
	q = '',
	item,
}) => {
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				`https://api.pccdnapi.com/section?type=${typeQuery}&marca=${marca.slug}&categoria=${categoria.slug}&q=${q}`
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
											<Image
												src={
													item.imagen1s
														? item.imagen1s
														: '/images/not-available.png'
												}
												layout='fill'
												objectFit='contain'
												draggable='false'
											/>
										</div>
									</div>
									<div className='brand__mini__item__content'>
										<div className='brand__mini__item__price'>
											{CurrencyFormat(item.precio_final, 2, '.', ',')}
										</div>
										<div>{item.envio_gratis && <FreeShipping />}</div>
										<div>
											<TextTruncate
												line={2}
												element='span'
												truncateText='…'
												text={Capitalize(item.titulo)}
											/>
										</div>
									</div>
								</div>
							</a>
						</Link>
					))}
			</div>
			<style jsx>
				{`
				.brand__mini__item__container{
				padding: 5px;
						width: 100px;
						height: 100px;
            flex-basis: 100px;
            border: 1px solid #eaeaea;
            border border-radius: 2px;
				}

				.brand__mini__item__price{
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
            border border-radius: 2px;
            padding: 10px;
					}

          		.brand__mini h2 {
                margin-left: 10px;
								line-height: 2;
        				}
                				`}
			</style>
		</div>
	);
};

export default BrandSimilarMini;
