import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import Autoplay from 'embla-carousel-autoplay';
const BenefitCarousel = () => {
	const [viewportWidth, setViewportWidth] = useState(0);

	// Configurar Embla con el plugin Autoplay
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: false,
		slidesToScroll: 1,
		draggable: true,
		speed: 10,
		
  }, [Autoplay({ playOnInit: true, delay: 6000 })]
  );

	// Actualizar el tamaño de la ventana
	useEffect(() => {
		const updateViewportWidth = () => {
			setViewportWidth(window.innerWidth);
		};
		updateViewportWidth(); // Llamada inicial
		window.addEventListener('resize', updateViewportWidth);

		return () => {
			window.removeEventListener('resize', updateViewportWidth);
		};
	}, []);

	const slidesPerView = viewportWidth <= 768 ? 1 : 4; // Mostrar 1 slide en móviles y 4 en escritorio

	useEffect(() => {
		if (emblaApi) {
			emblaApi.reInit(); // Re-inicializa el carrusel cada vez que las opciones cambian
		}
	}, [emblaApi, slidesPerView]);

	return (
		<div className='carousel-container'>
			<div className='carousel' ref={emblaRef}>
				<div className='carousel__container'>
					{/* Beneficio 1 */}
					<div className='carousel__slide'>
						<div className='card'>
							<svg
								focusable='false'
								viewBox='0 0 24 22'
								role='presentation'
								className='card-image'
							>
								<g
									transform='translate(1 1)'
									strokeWidth='1.5'
									fill='none'
									fillRule='evenodd'
								>
									<path
										d='M5 10H2M5 15H4'
										stroke='#ff002c'
										strokeLinecap='square'
									></path>
									<path
										stroke='#474747'
										d='M16.829 16H22v-6l-4-2-1-4H9v12h2.171'
									></path>
									<path
										d='M0 5h5'
										stroke='#ff002c'
										strokeLinecap='square'
									></path>
									<path
										stroke='#474747'
										strokeLinecap='square'
										d='M0 0h9v4'
									></path>
									<circle
										stroke='#474747'
										strokeLinecap='square'
										cx='14'
										cy='17'
										r='3'
									></circle>
									<path
										stroke='#474747'
										strokeLinecap='square'
										d='M13 7v2h2'
									></path>
								</g>
							</svg>
							<div className='card-content'>
								<h3 className='card-title'>Envío Rápido y Seguro</h3>
								<p className='card-description'>
									Nos comprometemos a brindarte un servicio de envío rápido,
									seguro y confiable.
								</p>
							</div>
						</div>
					</div>

					{/* Beneficio 2 */}
					<div className='carousel__slide'>
						<div className='card'>
							<svg
								focusable='false'
								viewBox='0 0 23 24'
								role='presentation'
								className='card-image'
							>
								<g
									transform='translate(1 1)'
									strokeWidth='1.5'
									fill='none'
									fillRule='evenodd'
								>
									<path stroke='#ff002c' d='M8 4h8v7'></path>
									<path
										stroke='#ff002c'
										strokeLinecap='square'
										d='M11 7L8 4l3-3'
									></path>
									<circle
										stroke='#474747'
										strokeLinecap='square'
										cx='6'
										cy='20'
										r='2'
									></circle>
									<circle
										stroke='#474747'
										strokeLinecap='square'
										cx='18'
										cy='20'
										r='2'
									></circle>
									<path
										stroke='#474747'
										strokeLinecap='square'
										d='M21 5l-2 10H5L3 0H0'
									></path>
								</g>
							</svg>
							<div className='card-content'>
								<h3 className='card-title'>
									Devolución si no es lo que esperabas
								</h3>
								<p className='card-description'>
									Si no estás satisfecho con tu compra, puedes solicitar una
									devolución en un plazo de 30 días.
								</p>
							</div>
						</div>
					</div>

					{/* Beneficio 3 */}
					<div className='carousel__slide'>
						<div className='card'>
							<svg
								focusable='false'
								viewBox='0 0 24 20'
								role='presentation'
								className='card-image'
							>
								<g
									strokeWidth='1.5'
									fill='none'
									fillRule='evenodd'
									strokeLinecap='square'
								>
									<path
										d='M1 5h22M1 9h22M21 19H3c-1.105 0-2-.895-2-2V3c0-1.105.895-2 2-2h18c1.105 0 2 .895 2 2v14c0 1.105-.895 2-2 2z'
										stroke='#474747'
									></path>
									<path d='M5 14h5M18 14h1' stroke='#ff002c'></path>
								</g>
							</svg>
							<div className='card-content'>
								<h3 className='card-title'>Paga a Meses sin Intereses</h3>
								<p className='card-description'>
									Disfruta de hasta 3 Meses sin intereses con tarjetas de
									crédito participantes.
								</p>
							</div>
						</div>
					</div>

					{/* Beneficio 4 */}
					<div className='carousel__slide'>
						<div className='card'>
							<svg
								focusable='false'
								viewBox='0 0 24 24'
								role='presentation'
								className='card-image'
							>
								<g
									strokeWidth='1.5'
									fill='none'
									fillRule='evenodd'
									strokeLinecap='square'
								>
									<path
										d='M1 5h22M1 9h22M9 17H3c-1.105 0-2-.895-2-2V3c0-1.105.895-2 2-2h18c1.105 0 2 .895 2 2v10M5 13h5'
										stroke='#474747'
									></path>
									<path
										stroke='#ff002c'
										d='M13 16h8v7h-8zM15 16v-2c0-1.1.9-2 2-2s2 .9 2 2v2M17 19v1'
									></path>
								</g>
							</svg>
							<div className='card-content'>
								<h3 className='card-title'>
									Compra Protegida con PayPal, KueskiPay y Aplazo
								</h3>
								<p className='card-description'>
									Paga con PayPal, KueskiPay y Aplazo y disfruta de una garantía
									de compra segura y protegida.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				.carousel-container {
					position: relative;
					width: 100%;
					margin: auto;
				}
				.carousel {
					display: flex;
					overflow: hidden;
				}
				.carousel__container {
					display: flex;
					width: 100%;
				}
				.carousel__slide {
					flex: 0 0 auto;
					width: 100%;
					padding: 10px;
				}

				.card {
					background-color: #f2f2f2;
					border-radius: 8px;

					text-align: center;
					transition: transform 0.3s ease;
					display: flex;
					flex-direction: column;
					height: 100%;
				}
				.card:hover {
					transform: scale(1.05);
				}

				.card-image {
					border-radius: 8px;
					width: 100%;
					height: 30px;
					object-fit: cover;
					margin-top: 20px;
				}

				.card-content {
					padding: 15px;
					flex-grow: 1;
				}

				.card-title {
					font-size: 18px;
					font-weight: bold;
					color: #333;
				}

				.card-description {
					font-size: 14px;
					color: #777;
					margin: 10px 0;
				}

				@media (max-width: 768px) {
					.carousel__slide {
						width: 100% !important;
					}
				}

				@media (min-width: 769px) {
					.carousel__slide {
						width: calc(50%) !important;
					}
				}

				@media (min-width: 1080px) {
					.carousel__slide {
						width: calc(25%) !important;
					}
				}
			`}</style>
		</div>
	);
};

export default BenefitCarousel;
