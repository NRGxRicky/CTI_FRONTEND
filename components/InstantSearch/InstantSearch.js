import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Link from 'next/link';
import TruncateMarkup from 'react-truncate-markup';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { hideAll } from '../../lib/features/showOpacityContainerSlide';

const IconSearch = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconClock = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

function highlightWords(text, words, color = '#333') {
	if (!words || words.length === 0) return text;

	let result = text;
	words.forEach(word => {
		const regex = new RegExp(word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'gi');
		result = result.replace(regex, `<b style="color: ${color};">$&</b>`);
	});

	return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

const InstantSearch = ({ query, recentSearches, onSelect }) => {
	const [suggestions, setSuggestions] = useState({ products: [], queries: [], brands: [], categories: [], query_words: [] });
	const [showDropdown, setShowDropdown] = useState(true);
	const [containerWidth, setContainerWidth] = useState(0);
	const { searchBar } = useAppSelector((state) => state.showOpacityContainerReducer);
	const dispatch = useAppDispatch();

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

		if (!query || query.trim() === '') {
			setSuggestions({ products: [], queries: [], brands: [], categories: [], query_words: [] });
			return;
		}


		debounceTimeout = setTimeout(() => {
			abortController = new AbortController();
			fetch(
				`https://api.pccdnapi.com/search/suggestions/?q=${encodeURIComponent(query)}`,
				{ signal: abortController.signal }
			)
				.then((res) => res.json())
				.then((data) => {
					setSuggestions(data);
					setShowDropdown(true);
					console.log(data);
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
	}, [query]);

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
	const filteredRecentSearches = !query
		? recentSearches.slice(0, 8) // Si no hay query, solo mostrar primeros 8
		: recentSearches.filter(r =>
			r.toLowerCase().includes(query.toLowerCase())
		); // Si hay query, mostrar todos los que coincidan

	// Excluir de sugerencias las que ya están en recientes filtradas
	const filteredSuggestedQueries = suggestions.queries
		? suggestions.queries.filter(
			q => !filteredRecentSearches.some(r => r.toLowerCase() === q.toLowerCase())
		)
		: [];

	return (
		showDropdown && (
			<div className={`search-dropdown ${searchBar ? 'search-dropdown--show' : 'search-dropdown--hide'}`}>
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
										<span>
											{highlightWords(suggestions.products[0].original_title, queryWords)}
										</span>
									</TruncateMarkup>
								</div>
								{suggestions.products[0].category && <div className="search-dropdown__featured-category">en {highlightWords(suggestions.products[0].category, queryWords, 'var(--primary-color)')}</div>}
							</div>
						</a>
					</Link>
				)}
				{/* Búsquedas recientes */}
				{filteredRecentSearches.length > 0 && (
					<div>
						{filteredRecentSearches.map((r, i) => (
							<div key={r + '-' + i} tabIndex={0} onClick={() => onSelect(r)} className="dropdown-item">
								<span className="dropdown-item__icon"><IconClock /></span> {highlightWords(r, queryWords)}
							</div>
						))}
					</div>
				)}
				{/* Queries sugeridas */}
				{filteredSuggestedQueries.length > 0 && (
					<div>
						{filteredSuggestedQueries.map((s, i) => (
							<div key={s + '-' + i} tabIndex={0} onClick={() => onSelect(s)} className="dropdown-item">
								<span className="dropdown-item__icon"><IconSearch /></span> {highlightWords(s, queryWords)}
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
								<a className="dropdown-item" onClick={() => dispatch(hideAll())}>
									<span className="dropdown-item__icon"><IconSearch /></span> {highlightWords(b.name, queryWords)}
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
								<a className="dropdown-item" onClick={() => dispatch(hideAll())}>
									<span className="dropdown-item__icon"><IconSearch /></span> {highlightWords(c.name, queryWords)}
								</a>
							</Link>
						))}
					</div>
				)}
				<style jsx>{`
					.search-dropdown {
						background: #fff;
						box-shadow: 0 2px 8px rgba(0,0,0,0.08);
						z-index: 500;
						border-radius: 8px;
						margin-top: 2px;
						height: 100%;
						overflow-y: auto;
						min-width: 50px;
						width: 100%;
						position: relative;
					}

					.search-dropdown--show {
						display: block;
					}

					.search-dropdown--hide {
						display: none;
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
						padding: 8px 16px;
						font-size: 13px;
						background: #f7f7f7;
					}

					.dropdown-item {
						padding: 10px 16px;
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
							color: #6d6d6d;
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
};

export default InstantSearch;