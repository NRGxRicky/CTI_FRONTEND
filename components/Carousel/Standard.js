/* eslint-disable react/no-unknown-property */
import React from 'react';
import { CarouselContainer, CarouselChild } from './Carousel';
import { useEffect, useState } from 'react';
import { Preloader, TailSpin } from 'react-preloader-icon';
import Link from 'next/link';
import Image from 'next/image';
import { bannersData } from '../../data/bannersData';

const Standard = () => {
	// 🎯 USANDO DATOS LOCALES EN LUGAR DE API
	const [data, setData] = useState(bannersData);
	const [loading, setLoading] = useState(false); // Ya no hay loading porque los datos están en local
	const [error, setError] = useState(false);

	// ⚠️ CÓDIGO DE API COMENTADO - Descomentar si quieres volver a usar la API
	// const { storeId } = useEnv();
	// const { buildUrl } = useApi();

	// const fetchData = async () => {
	// 	try {
	// 		setLoading(true);
	// 		const data = await fetch(
	// 			buildUrl(`/banners/index/standard?store_id=${storeId}`)
	// 		);
	// 		const json_data = await data.json()
	// 		setData(json_data);
	// 	} catch (error) {
	// 		setError(error);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// useEffect(() => {
	// 	fetchData();
	// }, []);

	if (loading) {
		return (
			<div className='carousel'>
				<div className='carousel__loader'>
					<Preloader
						use={TailSpin}
						size={30}
						strokeWidth={8}
						strokeColor='var(--primary-color)'
						duration={900}
					/>
				</div>
				<style jsx>
					{`
						.carousel {
							position: relative;
							overflow: hidden;
								max-width: 1500px;
								margin: 0 auto;
							height: 40vw;
							max-height: 550px;
						}

						.carousel__loader {
							position: absolute;
							right: 0;
							bottom: 0;
							height: calc(50% + 30px);
							width: calc(50% + 30px);
							padding: 10px;
						}
					`}
				</style>
			</div>
		);
	}

	if (error) {
		return (
			<div className='carousel'>
				<p>Error</p>
			</div>
		);
	}

	return (
		<div className='carousel'>
			<CarouselContainer interval={10000} peekPercent={6} initialIndex={1} edgeOffsetTop={20}>
				{data.results.map((banner, index) => (
					<CarouselChild key={banner.id}>
						<Link href={banner.enlace} legacyBehavior>
							<a>
								<div className='carousel__slide'>
									<Image
										src={banner.imagen}
										alt={banner.nombre || 'Banner'}
										fill
										sizes="(min-width: 1024px) 100vw, 100vw"
										quality={75}
										priority={index === 1}
										style={{ objectFit: 'cover' }}
									/>
								</div>
							</a>
						</Link>
					</CarouselChild>
				))}
			</CarouselContainer>
			<style jsx>
				{`
					.carousel {
						max-height: 550px;
						max-width: 100dvw;
						margin: 0 auto;
					}

					.carousel__slide {
						position: relative;
						aspect-ratio: 1920 / 640;
						width: 100%;
						max-height: 550px;
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;
						padding: 0;
						border-radius: 8px; /* bordes redondeados */
						overflow: hidden; /* asegura el recorte del borde con Image fill */
					}
				`}
			</style>
		</div>
	);
};

export default Standard;
