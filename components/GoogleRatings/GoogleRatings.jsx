import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useEnv } from '../../context/EnvContext';
import PropTypes from 'prop-types';
// Importa tus íconos de carga:
import { Preloader, TailSpin } from 'react-preloader-icon';

const GoogleRatingsCarousel = ({ mobile = false }) => {
	// --- ESTADOS ---
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalReviews, setTotalReviews] = useState(0);
	const [averageRating, setAverageRating] = useState(0);

	//	---	ENV	---
	const { storeId, googleProfileUrl } = useEnv();

	// --- CONFIG Embla ---
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			loop: true,
			align: 'start',
			slidesToScroll: 1,
		},
		[Autoplay({ playOnInit: true, delay: 6000 })] // autoplay de 6 s
	);

	// Estados para flechas
	const [prevBtnEnabled, setPrevBtnEnabled] = useState(true);
	const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

	// Control de expandir/colapsar por tarjeta
	const [expandedSet, setExpandedSet] = useState(new Set());
	const toggleExpanded = useCallback((i) => {
		setExpandedSet((prev) => {
			const next = new Set(prev);
			if (next.has(i)) next.delete(i);
			else next.add(i);
			return next;
		});
	}, []);

	// Refs a los párrafos de texto para medir líneas
	const textRefs = useRef({});
	const setTextRef = useCallback((i, el) => {
		if (!textRefs.current) textRefs.current = {};
		if (el) textRefs.current[i] = el;
	}, []);

	// Índices que realmente exceden 5 líneas y requieren Leer más
	const [canExpandSet, setCanExpandSet] = useState(new Set());
	// Guardamos la altura calculada dinámicamente por tarjeta para el wrapper colapsado
	const [cardCollapsedHeights, setCardCollapsedHeights] = useState({});

	const recalcCanExpand = useCallback(() => {
		if (typeof window === 'undefined') return;
		const next = new Set();
		const heights = {};
		Object.keys(textRefs.current).forEach((key) => {
			const i = Number(key);
			const el = textRefs.current[i];
			if (!el) return;
			const styles = window.getComputedStyle(el);
			const lineHeight = parseFloat(styles.lineHeight || '0');
			if (!lineHeight) return;

			// Contar líneas reales con más precisión
			const totalLines = Math.ceil(el.scrollHeight / lineHeight);

			// Calcular altura dinámica: hasta 5 líneas completas + pequeño ajuste
			const clampedLines = Math.min(totalLines, 5);
			heights[i] = `calc(${lineHeight}px * ${clampedLines})`;

			if (totalLines > 5) next.add(i);
		});
		setCanExpandSet(next);
		setCardCollapsedHeights(heights);
	}, []);

	// Calcular en montaje y en resize
	useEffect(() => {
		if (!reviews.length) return;
		requestAnimationFrame(() => {
			recalcCanExpand();
		});
	}, [reviews, recalcCanExpand]);

	useEffect(() => {
		if (!reviews.length) return;
		const handler = () => {
			recalcCanExpand();
		};
		window.addEventListener('resize', handler);
		window.addEventListener('orientationchange', handler);
		return () => {
			window.removeEventListener('resize', handler);
			window.removeEventListener('orientationchange', handler);
		};
	}, [reviews, recalcCanExpand]);

	// --- LÓGICA PARA ACTIVAR/DESACTIVAR BOTONES ---
	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setPrevBtnEnabled(emblaApi.canScrollPrev());
		setNextBtnEnabled(emblaApi.canScrollNext());
	}, [emblaApi]);

	const scrollPrev = useCallback(() => {
		emblaApi && emblaApi.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		emblaApi && emblaApi.scrollNext();
	}, [emblaApi]);

	// --- Cargar reseñas ---
	useEffect(() => {
		const fetchReviews = async () => {
			try {
				const res = await fetch(`/api/${storeId}/google-reviews`);
				const data = await res.json();

				if (data.status === 'OK' && data.result?.reviews) {
					setReviews(data.result.reviews);
					setTotalReviews(data.result?.user_ratings_total);
					setAverageRating(data.result?.rating);
				} else {
					setError('No se pudieron obtener las reseñas');
				}
			} catch (err) {
				setError('Hubo un error al obtener los datos');
			} finally {
				setLoading(false);
			}
		};
		fetchReviews();
	}, []);

	// --- Cuando Embla esté listo, checar las flechas ---
	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		emblaApi.on('select', onSelect);
	}, [emblaApi, onSelect]);

	// --- Preloader mientras se cargan las reseñas ---
	if (loading) {
		return (
			<div className='embla'>
				<div className='carousel__loader'>
					<Preloader
						use={TailSpin}
						size={30}
						strokeWidth={8}
						strokeColor='var(--primary-color)' // ajusta tu color
						duration={900}
					/>
				</div>
				{/* eslint-disable-next-line react/no-unknown-property */}
				<style jsx>{`
					.embla {
						margin-top: 20px;
						width: 100%;
						height: 350px;
						position: relative;
					}
					.carousel__loader {
						position: absolute;
						right: 0;
						bottom: 0;
						height: calc(50% + 30px);
						width: calc(50% + 30px);
					}
				`}</style>
			</div>
		);
	}

	// --- Manejo de error / sin reseñas ---
	if (error) return <div>{error}</div>;
	if (!reviews.length) return <div>No hay calificaciones disponibles.</div>;

	return (
		<div className='reviews-carousel'>
			<div className='reviews-carousel__head'>
				<div className='reviews-carousel__logo'>
					<Image
						src={'/images/google-logo.webp'}
						alt={`Google`}
						fill
						sizes='48px'
						style={{ objectFit: 'cover' }}
					/>
				</div>
				<div>
					<div className='reviews-carousel__header'>OPINIONES EN GOOGLE</div>

					{/* Bloque de promedio y contador, debajo del título */}
					<div className='review-overall'>
						<div className='stars'>
							{'★'.repeat(Math.round(averageRating))}
							{'☆'.repeat(5 - Math.round(averageRating))}
						</div>
						<Link legacyBehavior href={googleProfileUrl}>
							<a>
								<p className='reviews-count text--off'>
									{totalReviews} Reseñas de Google
								</p>
							</a>
						</Link>
					</div>
				</div>
			</div>

			<div className='embla' ref={emblaRef}>
				<div className='embla__container'>
					{reviews.map((review, index) => (
						<div className='embla__slide' key={index}>
							<div className='review-card' data-index={index}>
								{/* Datos del usuario (foto y nombre) */}
								<div className='review-card__user'>
									<div className='review-card__avatar'>
										<Image
											src={
												review.profile_photo_url
													? review.profile_photo_url
													: '/images/default-avatar.png'
											}
											alt={`Foto de ${review.author_name}`}
											fill
											sizes='48px'
											style={{ objectFit: 'cover' }}
										/>
									</div>
									<div>
										<p className='author'>{review.author_name}</p>
										<p className='date'>{review.relative_time_description}</p>
									</div>
								</div>

								{/* Estrellas por reseña */}
								<div className='stars'>
									{'★'.repeat(review.rating)}
									{'☆'.repeat(5 - review.rating)}
								</div>

								{/* Texto con Leer más */}
								<div className='review-text-container'>
									<div
										className={`review-text-wrapper ${
											expandedSet.has(index) ? 'expanded' : 'collapsed'
										}`}
										style={
											!expandedSet.has(index) && cardCollapsedHeights[index]
												? { maxHeight: cardCollapsedHeights[index] }
												: undefined
										}
									>
										<p
											ref={(el) => setTextRef(index, el)}
											className='review-text'
										>
											{review.text}
										</p>
									</div>
									<div className='review-actions'>
										{canExpandSet.has(index) ? (
											<button
												type='button'
												className='read-more text--off'
												onClick={() => toggleExpanded(index)}
											>
												{expandedSet.has(index) ? 'Leer menos' : 'Leer más'}
											</button>
										) : (
											<span
												className='read-more-placeholder'
												aria-hidden='true'
											>
												Leer más
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Botón “Next” */}
				<div
					className='carousel__button carousel__button-next carousel__button--color-ligth'
					onClick={scrollNext}
					style={
						!nextBtnEnabled || mobile ? { opacity: '0' } : { opacity: '0.9' }
					}
				>
					<button type='button' className='button__nav' tabIndex='-1'>
						<svg
							className='button_nav__icon'
							width='14.6'
							height='27'
							viewBox='0 0 16 27'
							xmlns='http://www.w3.org/1700/svg'
						>
							<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z' />
						</svg>
					</button>
				</div>

				{/* Botón “Prev” */}
				<div
					className='carousel__button carousel__button-prev carousel__button--color-ligth'
					onClick={scrollPrev}
					style={
						!prevBtnEnabled || mobile ? { opacity: '0' } : { opacity: '0.9' }
					}
				>
					<button type='button' className='button__nav' tabIndex='-1'>
						<svg
							className='button_nav__icon'
							width='14.6'
							height='27'
							viewBox='0 0 16 27'
							xmlns='http://www.w3.org/1700/svg'
						>
							<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z' />
						</svg>
					</button>
				</div>
			</div>

			{/* Estilos */}
			{/* eslint-disable-next-line react/no-unknown-property */}
			<style jsx>{`
				.reviews-carousel__logo {
					position: relative;
					width: 48px;
					height: 48px;
					margin: 0 15px;
				}

				.reviews-carousel__head {
					display: flex;
					align-items: center;
				}

				.reviews-carousel__header {
					margin: 5px 0;
					font-size: 20px;
					font-weight: 700;
				}

				.reviews-carousel {
					position: relative;
					width: 100%;
					margin: 0 auto;
					padding: 1rem 0;
				}

				/* Promedio y contador */
				.review-overall {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					margin-bottom: 1rem;
				}

				.reviews-count {
					font-weight: 600;
				}

				.reviews-count:hover {
					text-decoration: underline;
					color: var(--primary-color);
				}

				.embla {
					width: 100%;
					overflow: hidden;
					position: relative;
				}

				.embla__container {
					display: flex;
					align-items: flex-start; /* evita que todas las slides igualen la altura máxima */
				}

				/* 3 tarjetas en escritorio, 1 en mobile */
				.embla__slide {
					position: relative;
					flex: 0 0 25%; /* ~4 en desktop */
					padding: 0.5rem;
					box-sizing: border-box;
				}

				@media (max-width: 1024px) {
					.embla__slide {
						flex: 0 0 50%; /* ~2 en desktop */
					}
				}

				@media (max-width: 768px) {
					.embla__slide {
						flex: 0 0 100%; /* 1 en mobile */
					}
				}

				.review-card {
					background: #fff;
					border: 1px solid #eaeaea;
					border-radius: 8px;
					padding: 1rem;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
					height: auto; /* permite crecimiento individual solo en la tarjeta expandida */
					min-height: 220px; /* altura mínima uniforme para todas las tarjetas */
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
				}

				.review-card__user {
					display: flex;
					align-items: center;
					gap: 0.75rem;
				}

				.review-card__avatar {
					position: relative;
					width: 48px;
					height: 48px;
					border-radius: 50%;
					overflow: hidden;
					flex-shrink: 0;
				}

				.author {
					font-weight: bold;
					margin: 0;
					font-size: 1rem;
				}

				.date {
					margin: 0;
					font-size: 0.8rem;
					color: #666;
				}

				.stars {
					color: #f5a623;
					font-size: 1.2rem;
					line-height: 1;
				}

				.review-text {
					font-size: 0.95rem;
					line-height: 1.3;
					margin: 0;
				}

				/* Contenedor de texto y botón */
				.review-text-container {
					display: flex;
					flex-direction: column;
					gap: 0; /* evitamos sumar espacio extra al margen propio del botón */
				}

				/* Envoltura con transición para efecto de deslizamiento */
				.review-text-wrapper {
					overflow: hidden;
					transition: max-height 300ms cubic-bezier(0.4, 0, 0.2, 1);
					will-change: max-height;
				}
				.review-text-wrapper.collapsed {
					/* max-height ahora se aplica dinámicamente vía style inline por tarjeta */
				}
				.review-text-wrapper.expanded {
					max-height: 2000px !important; /* suficiente para la mayoría de textos, sobreescribe inline */
				}

				/* Mantener la misma altura incluso cuando no hay botón real */
				.review-actions {
					min-height: 0; /* sin reserva de espacio, se ajusta al contenido */
				}

				/* Colapsado: el texto usa line-clamp como respaldo */
				.review-text.collapsed {
					display: -webkit-box;
					-webkit-line-clamp: 5; /* número de líneas visibles */
					-webkit-box-orient: vertical;
					overflow: hidden;
				}

				/* Expandido: muestra todo */
				.review-text.expanded {
					display: block;
					max-height: none;
					min-height: 0;
				}

				.read-more {
					align-self: flex-start;
					background: transparent;
					border: none;
					padding: 0;
					margin-top: 0.5em; /* menos separación para equilibrar alturas */
					/* color heredado de .text--off para que coincida con el contador */
					font-weight: 600;
					cursor: pointer;
				}

				.read-more-placeholder {
					visibility: hidden; /* ocupa espacio sin mostrarse */
					display: inline-block;
					margin-top: 0.5em;
					font-weight: 600;
				}
				.read-more:hover {
					color: var(--primary-color);
					text-decoration: underline;
				}

				/* FLECHAS */
				.carousel__button {
					position: absolute;
					top: calc(50% - 38px);
					width: 40px;
					height: 75px;
					box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.11);
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					user-select: none;
					opacity: 0; /* Por defecto oculto */
					transition: opacity 0.2s ease-in;
					z-index: 2;
				}

				.carousel__button-next {
					right: 0;
					transform: rotate(180deg);
					border-radius: 4px 0 0 4px;
				}
				.carousel__button-prev {
					left: 0;
					border-radius: 0 4px 4px 0;
				}

				.carousel__button--color-ligth {
					background: #ffffff;
					fill: var(--primary-color, #ed1c24);
				}
				.carousel__button--color-ligth:hover {
					background: #f2f2f2;
				}

				.button__nav {
					background: none;
					border: none;
					cursor: pointer;
					user-select: none;
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.button_nav__icon {
					width: 14px;
					height: 27px;
				}

				/* Mostrar flechas al hacer hover en desktop (si mobile=false) */
				@media (min-width: 768px) {
					.embla:hover .carousel__button {
						opacity: 1;
					}
				}
			`}</style>
		</div>
	);
};

export default GoogleRatingsCarousel;

GoogleRatingsCarousel.propTypes = {
	mobile: PropTypes.bool,
};
