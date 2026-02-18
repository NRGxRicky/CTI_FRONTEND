import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useAppSelector } from '../../lib/hooks';
import TruncateMarkup from 'react-truncate-markup';
import { useApi } from '../../hooks/useApi';

const BestCategoriesMini = ({
	parentCategorie,
	title,
	filter_available_store,
}) => {
	const { buildUrl } = useApi();
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				buildUrl(`/categories/bestcategories/?parentcategorie=${encodeURIComponent(parentCategorie)}&filter_available_store=${filter_available_store}`)
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
	}, [parentCategorie]);

	return (
		data.results.length > 0 && (
			<div className='product__categories__recommended'>
				{title}
				<div className='categories__mini'>
					{data.results
						.filter((i) => i.portada)
						.slice(0, 4)
						.map((categorie, index) => (
							<Link
								href={`/listado/all/${categorie.slug}?page_size=${maxPageResults}`}
								key={index}
								legacyBehavior
							>
								<a>
									<div className='categories__mini__item'>
										<div className='categories__mini__item__container'>
											<div className='categories__mini__image'>
												<Image
													src={
														categorie.portada
															? categorie.portada
															: '/images/not-available.png'
													}
													fill
													style={{ objectFit: 'contain' }}
													draggable='false'
													sizes='auto'
													alt={Capitalize(categorie.name)}
												/>
											</div>
										</div>
										<div className='categories__mini__item__title'>
											<TruncateMarkup lines={1}>
												<span>{Capitalize(categorie.name)}</span>
											</TruncateMarkup>
										</div>
									</div>
								</a>
							</Link>
						))}
				</div>
				<style jsx>
					{`
						.categories__mini__item__container {
							margin-left: 20px;
							max-width: 150px;
							padding: 5px;
							width: 100px;
							height: 100px;
						}
						.categories__mini {
							margin-top: 10px;
							width: 100%;
							display: flex;
							flex-direction: column;
						}

						.categories__mini__item__title {
							font-weight: 600;
							margin-left: 20px;
							font-size: 16px;
						}

						.categories__mini__item {
							display: flex;
							align-items: center;

							border: 1px solid #eaeaea;
							margin-top: 10px;
							border-radius: 5px;
						}
						.categories__mini__image {
							position: relative;
							width: 100%;
							height: 100%;
						}
						.product__categories__recommended {
							background-color: #ffffff;
							padding: 15px;
							border: 1px solid #eaeaea;
						}
					`}
				</style>
			</div>
		)
	);
};

export default BestCategoriesMini;
