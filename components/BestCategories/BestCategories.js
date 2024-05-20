import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useAppSelector } from '../../lib/hooks';
import useEmblaCarousel from 'embla-carousel-react';

const BestCategories = () => {
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [prevButton, setPrevButton] = useState(true);
	const [nextButton, setNextButton] = useState(true);

	const [emblaRef, emblaApi] = useEmblaCarousel({
		slidesToScroll: 1,
		loop: false,
	});

	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);

	const checkButtonNext = () => {
		if (!emblaApi.canScrollNext()) {
			setNextButton(false);
		} else {
			setNextButton(true);
		}
	};

	const checkButtonPrev = () => {
		if (!emblaApi.canScrollPrev()) {
			setPrevButton(false);
		} else {
			setPrevButton(true);
		}
	};

	const checkAllButons = () => {
		checkButtonNext();
		checkButtonPrev();
	};

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev();
		checkButtonPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
		checkButtonNext();
	}, [emblaApi]);

	useEffect(() => {
		if (emblaApi) {
			checkAllButons();
			// Embla API is ready
			emblaApi.on('select', checkAllButons);
		}
	}, [emblaApi]);

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				`https://api.pccdnapi.com/categories/bestcategories/?parentcategorie=index`
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
	}, [data]);

	return (
		data.results.length > 1 && (
			<div className='best-categories-carousel'>
				<div className='best-categories-carousel__header'>
					<h2>Las Mejores Categorías</h2>
				</div>
				<div className='best-categories-carousel__viewport' ref={emblaRef}>
					<div className='best-categories-carousel__container'>
						{data.results
							.filter((i) => i.slug !== 'index')
							.map((item, index) => (
								<Link
									href={`/listado/all/${item.slug}?page_size=${maxPageResults}`}
									key={index}
									legacyBehavior
								>
									<a>
										<div className='best-categories-carousel__item'>
											<div className='best-categories-carousel__image'>
												<Image
													src={
														item.portada
															? item.portada
															: '/images/not-available.png'
													}
													fill
													style={{
														objectFit: 'contain',
														mixBlendMode: 'multiply',
														padding: 10,
													}}
													draggable='false'
													sizes='auto'
													alt={Capitalize(item.name)}
												/>
											</div>

											<div className='best-categories-carousel__title'>
												<span>{Capitalize(item.name)}</span>
											</div>
										</div>
									</a>
								</Link>
							))}
					</div>
				</div>
				<style jsx>
					{`
						.best-categories-carousel__header {
							line-height: 4;
							font-size: 18px;
						}

						.best-categories-carousel__title {
							line-height: 2;
							min-height: 30px;
							font-weight: 600;
							font-size: 16px;
						}

						.best-categories-carousel__image {
							position: relative;
							height: 150px;
							width: 100%;
							background-color: #f7f7f7;
							border-radius: 10px;
						}

						.best-categories-carousel__container {
							display: flex;
							gap: 30px;
						}

						.best-categories-carousel__viewport {
							overflow: hidden;
						}

						.best-categories-carousel__item {
							flex: 0 0 100%;
							min-width: 0;
							width: 160px;
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;
							gap: 15px;
						}

						.best-categories-carousel {
							margin-top: 20px;
						}
					`}
				</style>
			</div>
		)
	);
};

export default BestCategories;
