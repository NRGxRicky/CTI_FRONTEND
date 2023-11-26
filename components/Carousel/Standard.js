import React from 'react';
import { CarouselContainer, CarouselChild } from './Carousel';
import { useEffect, useState } from 'react';
import { Preloader, TailSpin } from 'react-preloader-icon';
import Link from 'next/link';

const Standard = () => {
	const [windowsSize, setWindowsSize] = useState(0);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				'https://api.pccdnapi.com/banners/index/standard'
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
		const updateWindowDimensions = () => {
			const newWidth = window.innerWidth;
			setWindowsSize(newWidth);
		};

		window.addEventListener('resize', updateWindowDimensions);
		if (windowsSize === 0) {
			updateWindowDimensions();
		}
		return () => window.removeEventListener('resize', updateWindowDimensions);
	}, [windowsSize]);

	if (loading) {
		return (
			<div className='carousel'>
				<div className='carousel__loader'>
					<Preloader
						use={TailSpin}
						size={30}
						strokeWidth={8}
						strokeColor='#ff002c'
						duration={900}
					/>
				</div>
				<style jsx>
					{`
						.carousel {
							position: relative;
							overflow: hidden;
							max-width: 83rem;
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
			<CarouselContainer interval={10000}>
				{data.results.map((banner) => (
					<CarouselChild key={banner.id}>
						<Link href={banner.enlace} legacyBehavior>
							<a>
								<div
									className='carousel__slide'
									style={{
										backgroundImage:
											windowsSize > 1024
												? `url(${banner.imagen})`
												: `url(${banner.imagen_mobil})`,
									}}
								/>
							</a>
						</Link>
					</CarouselChild>
				))}
			</CarouselContainer>
			<style jsx>
				{`
					.carousel {
						height: 40vw;
						max-height: 550px;
					}

					.carousel__slide {
						max-width: 83rem;
						max-height: 550px;
						height: 40vw;
						background-repeat: no-repeat;
						background-size: cover;
						background-position: center;
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;
						padding: 0;
					}
				`}
			</style>
		</div>
	);
};

export default Standard;
