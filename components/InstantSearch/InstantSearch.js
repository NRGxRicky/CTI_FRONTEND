import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Link from 'next/link';
import TruncateMarkup from 'react-truncate-markup';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { hideAll } from '../../lib/features/showOpacityContainerSlide';

// Hook personalizado para efecto de escritura tipo IA
const useTypewriter = (text, speed = 50, enabled = true) => {
	const [displayText, setDisplayText] = useState('');
	const [isComplete, setIsComplete] = useState(false);

	useEffect(() => {
		if (!enabled || !text) {
			setDisplayText(text);
			setIsComplete(true);
			return;
		}

		setDisplayText('');
		setIsComplete(false);
		let i = 0;

		const timer = setInterval(() => {
			setDisplayText(text.slice(0, i + 1));
			i++;
			if (i >= text.length) {
				setIsComplete(true);
				clearInterval(timer);
			}
		}, speed);

		return () => clearInterval(timer);
	}, [text, speed, enabled]);

	return { displayText, isComplete };
};

// Componente TypewriterText
const TypewriterText = ({
	children,
	speed = 50,
	delay = 0,
	enabled = true,
	highlight = null,
	className = '',
	style = {}
}) => {
	const [startTyping, setStartTyping] = useState(false);
	const text = typeof children === 'string' ? children : '';
	const { displayText, isComplete } = useTypewriter(text, speed, enabled && startTyping);

	useEffect(() => {
		if (delay > 0) {
			const timer = setTimeout(() => setStartTyping(true), delay);
			return () => clearTimeout(timer);
		} else {
			setStartTyping(true);
		}
	}, [delay]);

	// Si no está habilitado el efecto, no mostrar nada (evitar flash de contenido)
	if (!enabled) {
		return <span className={className} style={style}></span>;
	}

	// Si aún no ha comenzado a escribir (debido al delay), no mostrar nada
	if (!startTyping) {
		return <span className={className} style={style}></span>;
	}

	// Si es texto simple y tenemos highlight
	if (typeof children === 'string' && highlight) {
		return (
			<span className={className} style={style}>
				{highlight(displayText)}
				{!isComplete && <span className="typewriter-cursor">|</span>}
			</span>
		);
	}

	// Si es texto simple sin highlight
	if (typeof children === 'string') {
		return (
			<span className={className} style={style}>
				{displayText}
				{!isComplete && <span className="typewriter-cursor">|</span>}
			</span>
		);
	}

	// Si es JSX, mostrar tal como está (para casos complejos)
	return <span className={className} style={style}>{children}</span>;
};

TypewriterText.propTypes = {
	children: PropTypes.node.isRequired,
	speed: PropTypes.number,
	delay: PropTypes.number,
	enabled: PropTypes.bool,
	highlight: PropTypes.func,
	className: PropTypes.string,
	style: PropTypes.object,
};

const IconSearch = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconClock = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const IconClose = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

function highlightWords(text, words, color = '#333') {
	if (!words || words.length === 0 || !text) return text;

	// Validar color de forma simple
	const safeColor = color.includes('var(--') || color.startsWith('#') || color.match(/^[a-zA-Z]+$/) ? color : '#333';

	// Crear regex para todas las palabras
	const wordsPattern = words.filter(word => word && word.trim()).join('|');
	if (!wordsPattern) return text;

	const regex = new RegExp(`(${wordsPattern})`, 'gi');
	const parts = text.split(regex);

	return (
		<span>
			{parts.map((part, index) => {
				const isMatch = words.some(word =>
					word && part.toLowerCase() === word.toLowerCase()
				);

				return isMatch ? (
					<b key={index} style={{ color: safeColor }}>
						{part}
					</b>
				) : (
					part
				);
			})}
		</span>
	);
}

const InstantSearch = ({ query, recentSearches, onSelect, onRemoveRecentSearch }) => {
	const [suggestions, setSuggestions] = useState({ products: [], queries: [], brands: [], categories: [], query_words: [] });
	const [showDropdown, setShowDropdown] = useState(true);
	const [containerWidth, setContainerWidth] = useState(0);
	const [showTypewriterEffect, setShowTypewriterEffect] = useState(true);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const { searchBar } = useAppSelector((state) => state.showOpacityContainerReducer);
	const dispatch = useAppDispatch();

	// Función para trackear búsquedas
	const trackSearch = async (query) => {
		if (!query || query.length < 2) return;

		try {
			await fetch('https://api.pccdnapi.com/search/track/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query: query.trim().toLowerCase() })
			});

		} catch (error) {
			console.error('Error al trackear búsqueda:', error);
		}
	};

	// Función para sanitizar una cadena simple - solo lo básico
	const sanitizeString = (str) => {
		if (!str) return '';
		return String(str)
			.replace(/[<>]/g, '') // Solo remover < >
			.trim();
	};

	// Sanitizar query y búsquedas recientes
	const safeQuery = sanitizeString(query);
	const safeRecentSearches = recentSearches.map(sanitizeString).filter(Boolean);

	// Función para sanitizar datos del API - simplificada
	const sanitizeApiData = (data) => {
		const sanitizeObject = (obj) => {
			const sanitized = {};
			Object.keys(obj).forEach(key => {
				if (typeof obj[key] === 'string') {
					sanitized[key] = sanitizeString(obj[key]);
				} else {
					sanitized[key] = obj[key];
				}
			});
			return sanitized;
		};

		return {
			products: (data.products || []).map(sanitizeObject),
			queries: (data.queries || []).map(sanitizeString),
			brands: (data.brands || []).map(sanitizeObject),
			categories: (data.categories || []).map(sanitizeObject),
			query_words: (data.query_words || []).map(sanitizeString)
		};
	};

	// Hook para detectar cambios de tamaño de ventana
	useEffect(() => {
		const handleResize = () => {
			setContainerWidth(window.innerWidth);
		};

		handleResize(); // Calcular inicial
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		let debounceTimeout;
		let abortController = null;

		if (!safeQuery || safeQuery.trim() === '') {
			setSuggestions({ products: [], queries: [], brands: [], categories: [], query_words: [] });
			setShowTypewriterEffect(false);
			setIsTransitioning(false);
			setShowDropdown(true); // Asegurarse de que el dropdown se muestre para búsquedas recientes
			return;
		}

		debounceTimeout = setTimeout(() => {
			abortController = new AbortController();
			fetch(
				`https://api.pccdnapi.com/search/suggestions/?q=${encodeURIComponent(safeQuery)}`,
				{ signal: abortController.signal }
			)
				.then((res) => res.json())
				.then((data) => {
					// Primero preparar los datos pero no mostrarlos aún
					const newSuggestions = sanitizeApiData(data);

					// Iniciar transición fade out
					setIsTransitioning(true);
					setShowTypewriterEffect(false);

					// Fade out completo, luego cambiar datos y fade in
					setTimeout(() => {
						setSuggestions(newSuggestions);
						setShowDropdown(true);

						// Pequeño delay para que se rendericen los nuevos datos
						setTimeout(() => {
							setIsTransitioning(false);
							setShowTypewriterEffect(true);
						}, 50);
					}, 200); // Tiempo del fade out
				})
				.catch((err) => {
					if (err.name !== 'AbortError') {
						console.error('Error al obtener sugerencias:', err);
					}
				});
		}, 300);

		return () => {
			clearTimeout(debounceTimeout);
			if (abortController) abortController.abort();
		};
	}, [safeQuery]);

	const queryWords = (suggestions.query_words || []).map(w => w.toLowerCase());

	// Calcular ancho dinámico para el título
	const calculateTitleMaxWidth = () => {
		let maxWidth;
		if (containerWidth <= 320) maxWidth = containerWidth - 60;
		else if (containerWidth <= 480) maxWidth = containerWidth - 80;
		else if (containerWidth <= 768) maxWidth = containerWidth - 100;
		else maxWidth = containerWidth - 120;

		// Límite máximo para pantallas grandes - permite que TruncateMarkup funcione
		return Math.min(maxWidth, 800);
	};

	// Filtrar búsquedas recientes según el query
	const filteredRecentSearches = !safeQuery
		? safeRecentSearches.slice(0, 8) // Si no hay query, solo mostrar primeros 8
		: safeRecentSearches.filter(r =>
			r.toLowerCase().includes(safeQuery.toLowerCase())
		); // Si hay query, mostrar todos los que coincidan

	// Excluir de sugerencias las que ya están en recientes filtradas
	const filteredSuggestedQueries = suggestions.queries
		? suggestions.queries.filter(
			q => !filteredRecentSearches.some(r => r.toLowerCase() === q.toLowerCase())
		)
		: [];

	return (
		showDropdown && (
			<div className={`search-dropdown ${searchBar ? 'search-dropdown--show' : 'search-dropdown--hide'} ${isTransitioning ? 'search-dropdown--fading' : ''}`}>
				{/* Producto destacado */}
				{suggestions.products && suggestions.products.length > 0 && (
					<Link href={suggestions.products[0].url} legacyBehavior>
						<a className="search-dropdown__featured" onClick={() => dispatch(hideAll())}>
							{suggestions.products[0].image && (
								<Image
									src={`https://api.pccdnapi.com${suggestions.products[0].image}`}
									alt={suggestions.products[0].original_title}
									width={40}
									height={40}
									style={{ objectFit: 'contain', marginRight: 12, borderRadius: 4 }}
								/>
							)}
							<div style={{ flex: 1, minWidth: 0 }}>
								<div
									className="search-dropdown__featured-title"
									style={{ maxWidth: `${calculateTitleMaxWidth()}px` }}
								>
									<TruncateMarkup lines={1}>
										<TypewriterText
											speed={30}
											enabled={showTypewriterEffect}
											highlight={(text) => highlightWords(text, queryWords)}
										>
											{suggestions.products[0].original_title}
										</TypewriterText>
									</TruncateMarkup>
								</div>
								{suggestions.products[0].category && (
									<div className="search-dropdown__featured-category">
										en <TypewriterText
											speed={25}
											delay={200}
											enabled={showTypewriterEffect}
											highlight={(text) => highlightWords(text, queryWords, 'var(--primary-color)')}
										>
											{suggestions.products[0].category}
										</TypewriterText>
									</div>
								)}
							</div>
						</a>
					</Link>
				)}
				{/* Búsquedas recientes */}
				{filteredRecentSearches.length > 0 && (
					<div>
						{filteredRecentSearches.map((r, i) => (
							<div key={r + '-' + i} className="dropdown-item dropdown-item--with-remove">
								<div className="dropdown-item__content" onClick={() => {
									trackSearch(r);
									onSelect(r);
								}}>
									<span className="dropdown-item__icon"><IconClock /></span>
									<span className="dropdown-item__text">
										{!safeQuery ? (
											// Si no hay query, mostrar texto normal sin efecto
											highlightWords(r, queryWords)
										) : (
											// Si hay query, usar efecto typewriter
											<TypewriterText
												speed={40}
												delay={i * 100}
												enabled={showTypewriterEffect}
												highlight={(text) => highlightWords(text, queryWords)}
											>
												{r}
											</TypewriterText>
										)}
									</span>
								</div>
								<button
									className="remove-item-btn"
									onClick={(e) => {
										e.stopPropagation();
										onRemoveRecentSearch(r);
									}}
									title={`Eliminar "${r}"`}
								>
									<IconClose />
								</button>
							</div>
						))}
					</div>
				)}
				{/* Queries sugeridas */}
				{filteredSuggestedQueries.length > 0 && (
					<div>
						{filteredSuggestedQueries.map((s, i) => (
							<div key={s + '-' + i} tabIndex={0} onClick={() => {
								trackSearch(s);
								onSelect(s);
							}} className="dropdown-item">
								<span className="dropdown-item__icon"><IconSearch /></span>
								<TypewriterText
									speed={35}
									delay={300 + i * 80}
									enabled={showTypewriterEffect}
									highlight={(text) => highlightWords(text, queryWords)}
								>
									{s}
								</TypewriterText>
							</div>
						))}
					</div>
				)}
				{/* Marcas sugeridas */}
				{suggestions.brands && suggestions.brands.length > 0 && (
					<div>
						<div className="dropdown-title">Marcas</div>
						{suggestions.brands.map((b, i) => (
							<Link key={b.name + '-' + i} href={`/listado/${encodeURIComponent(b.slug)}/index`} legacyBehavior>
								<a className="dropdown-item" onClick={() => {
									trackSearch(b.name);
									onSelect(b.name);
									dispatch(hideAll());
								}}>
									<span className="dropdown-item__icon"><IconSearch /></span>
									<TypewriterText
										speed={30}
										delay={500 + i * 100}
										enabled={showTypewriterEffect}
										highlight={(text) => highlightWords(text, queryWords)}
									>
										{b.name}
									</TypewriterText>
								</a>
							</Link>
						))}
					</div>
				)}
				{/* Categorías sugeridas */}
				{suggestions.categories && suggestions.categories.length > 0 && (
					<div>
						<div className="dropdown-title">Categorías</div>
						{suggestions.categories.map((c, i) => (
							<Link key={c.name + '-' + i} href={`/listado/all/${c.slug}`} legacyBehavior>
								<a className="dropdown-item" onClick={() => {
									trackSearch(c.name);
									onSelect(c.name);
									dispatch(hideAll());
								}}>
									<span className="dropdown-item__icon"><IconSearch /></span>
									<TypewriterText
										speed={30}
										delay={700 + i * 120}
										enabled={showTypewriterEffect}
										highlight={(text) => highlightWords(text, queryWords)}
									>
										{c.name}
									</TypewriterText>
								</a>
							</Link>
						))}
					</div>
				)}
				{/* eslint-disable-next-line react/no-unknown-property */}
				<style jsx>{`
					a:hover {
						color: inherit;
					}

					:global(.typewriter-cursor) {
						animation: typewriter-blink 1s infinite;
						color: var(--primary-color, #007bff);
						font-weight: normal;
					}

					@keyframes typewriter-blink {
						0%, 50% { opacity: 1; }
						51%, 100% { opacity: 0; }
					}

					.search-dropdown {
						background: #fff;
						box-shadow: 0 2px 8px rgba(0,0,0,0.08);
						z-index: 500;
						border-radius: 8px;

						height: 100%;
						overflow-y: auto;
						min-width: 50px;
						width: 100%;
						position: relative;
						opacity: 1;
						transition: opacity 0.2s ease-in-out;
					}

					.search-dropdown--show {
						display: block;
					}

					.search-dropdown--hide {
						display: none;
					}

					.search-dropdown--fading {
						opacity: 0.3;
					}

					.search-dropdown__featured {
						display: flex;
						align-items: center;
						padding: 12px 16px;
						border-bottom: 1px solid #f0f0f0;
						cursor: pointer;
						text-decoration: none;
						transition: background 0.2s;
						width: 100%;
						min-width: 0;
						position: relative;
					}

					.search-dropdown__featured:hover {
						background: #f5f5f5;
					}

					.search-dropdown__featured-title {
						font-weight: 500;
						width: 100%;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
					}

					.search-dropdown__featured-category {
						color: var(--primary-color);
						font-size: 13px;
					}

					.dropdown-title {
						font-weight: bold;
						color: #888;
						padding: 10px 16px;
						font-size: 13px;
						background: #f7f7f7;
					}

					.dropdown-item--with-remove {
						display: flex;
						align-items: center;
						justify-content: space-between;
						padding: 12px 16px;
						transition: background 0.2s;
					}

					.dropdown-item--with-remove:hover {
						background: #f5f5f5;
					}

					.dropdown-item__content {
						flex: 1;
						padding: 0;
						cursor: pointer;
						display: flex;
						align-items: center;
						transition: none;
						white-space: pre-line;
						color: #6d6d6d;
						min-width: 0;
					}

					.dropdown-item__text {
						flex: 1;
						min-width: 0;
					}

					.remove-item-btn {
						background: none;
						border: none;
						cursor: pointer;
						padding: 8px;
						color: #aaa;
						transition: all 0.2s;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-left: 8px;
						border-radius: 4px;
						opacity: 0.7;
						min-width: 30px;
						height: 30px;
					}

					.remove-item-btn:hover {
						background: #e0e0e0;
						color: #666;
						opacity: 1;
					}

					.dropdown-item {
						padding: 12px 16px;
						cursor: pointer;
						display: flex;
						align-items: center;
						transition: background 0.2s;
						white-space: pre-line;
						text-decoration: none;
						color: #6d6d6d;
					}

					.dropdown-item:hover {
						background: #f5f5f5;
						text-decoration: none;
						color: inherit;
					}

					.dropdown-item__icon {
						margin-right: 8px;
						display: flex;
						align-items: center;
						color: #333;
					}

					@media only screen and (max-width: 62em) {
						.search-dropdown {
							z-index: 500;
							border-radius: 0;
							box-shadow: 0 2px 12px rgba(0,0,0,0.15);
							margin-top: 0;
						}
					}
				`}</style>
			</div>
		)
	);
};

InstantSearch.propTypes = {
	query: PropTypes.string.isRequired,
	recentSearches: PropTypes.array.isRequired,
	onSelect: PropTypes.func.isRequired,
	onRemoveRecentSearch: PropTypes.func.isRequired,
};

export default InstantSearch;