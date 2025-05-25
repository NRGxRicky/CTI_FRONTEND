import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '../../hooks/auth';
import { useRouter } from 'next/router';
import { useAppSelector } from '../../lib/hooks';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Preloader, TailSpin } from 'react-preloader-icon';
import Capitalize from '../../hooks/CapitalizeTitle';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import ListProductsPagination from '../ListProductsPagination/ListProductsPagination';
import Link from 'next/link';
import useCart from '../../hooks/useCart';

function UserQuotesList() {
	const { accessToken, updateDataUser } = useAuth();
	const router = useRouter();
	// Obtener funciones del carrito
	const { clearCart, addToCart } = useCart();

	// Referencia para mantener el foco en el input de búsqueda
	const searchInputRef = useRef(null);
	// Referencia para el timeout de debounce
	const debounceTimerRef = useRef(null);

	// Flag para diferenciar móvil vs escritorio
	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

	// Estados base
	const [quotes, setQuotes] = useState([]);
	const [count, setCount] = useState(0);

	const [pageActive, setPageActive] = useState(1);
	const pageSize = 5;
	const totalPages = Math.ceil(count / pageSize);

	const [loading, setLoading] = useState(true);
	// Estado para rastrear si se ha realizado una búsqueda
	const [hasSearched, setHasSearched] = useState(false);
	// Estado para controlar la carga de una compra de cotización
	const [isConvertingQuote, setIsConvertingQuote] = useState(false);
	const [convertingQuoteId, setConvertingQuoteId] = useState(null);

	// Filtros de búsqueda
	const [searchTerm, setSearchTerm] = useState('');
	const [dateRange, setDateRange] = useState('3');

	// Para infinite scroll
	const [hasMore, setHasMore] = useState(true);

	// Estado que controla cuándo se debe realizar una búsqueda
	const [shouldFetch, setShouldFetch] = useState(true);

	// ------------------------------------------
	// fetchQuotes => recibe isConcat (opcional)
	// ------------------------------------------
	const fetchQuotes = async (
		{ page = 1, search = '', range = '3' },
		isConcat = false
	) => {
		setLoading(true);
		try {
			const url = new URL('https://api.pccdnapi.com/quotes/list/');
			url.searchParams.append('page', page);
			url.searchParams.append('search', search);
			url.searchParams.append('date_range', range);
			url.searchParams.append('page_size', pageSize);

			const resp = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (resp.ok) {
				const data = await resp.json();
				setCount(data.count || 0);

				if (isConcat) {
					// Modo infinite scroll => concatenar
					setQuotes((prev) => [...prev, ...data.results]);
				} else {
					// Reemplazar
					setQuotes(data.results);
				}

				// Actualizar hasMore
				if (!data.next) {
					setHasMore(false);
				} else {
					setHasMore(true);
				}
			} else {
				console.error('Error al obtener las cotizaciones:', resp.statusText);
			}
		} catch (err) {
			console.error('Error de conexión:', err);
		} finally {
			setLoading(false);
			// Después de cargar, mantener el foco en el campo de búsqueda
			if (searchInputRef.current && search) {
				searchInputRef.current.focus();
			}
		}
	};

	// -----------------------------------------------------
	// useEffect principal - simplificado para evitar bucles
	// -----------------------------------------------------
	useEffect(() => {
		if (!accessToken || !shouldFetch) return;

		// Reseteamos el flag para evitar llamadas repetidas
		setShouldFetch(false);

		if (mobileView && pageActive > 1) {
			// En móvil, solo cargamos más si pageActive > 1 (infinite scroll)
			fetchQuotes(
				{
					page: pageActive,
					search: searchTerm,
					range: dateRange,
				},
				true // concat = true
			);
		} else {
			// Para la primera página o escritorio, siempre reemplazamos
			fetchQuotes(
				{
					page: pageActive,
					search: searchTerm,
					range: dateRange,
				},
				false // concat = false
			);
		}
	}, [accessToken, shouldFetch]); // Solo depende de accessToken y shouldFetch

	// -----------------------------------------------------
	// Función debounce para búsqueda mientras se escribe
	// -----------------------------------------------------
	const debouncedSearch = useCallback((term) => {
		// Limpiar cualquier timer anterior
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Establecer un nuevo timer (500ms de espera)
		debounceTimerRef.current = setTimeout(() => {
			// Solo buscamos si hay al menos 2 caracteres
			if (term.length >= 2 || term.length === 0) {
				setHasSearched(term.trim() !== '');
				setPageActive(1);
				setShouldFetch(true);
			}
		}, 500);
	}, []);

	// -----------------------------------------------------
	// Manejador de cambio en el input de búsqueda
	// -----------------------------------------------------
	const handleSearchInputChange = (e) => {
		const newTerm = e.target.value;
		setSearchTerm(newTerm);
		debouncedSearch(newTerm);
	};

	// -----------------------------------------------------
	// Búsqueda => click "Buscar" o Enter
	// -----------------------------------------------------
	const handleSearch = () => {
		// Limpiar cualquier timer pendiente
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Marcar que se ha realizado una búsqueda si hay término de búsqueda
		setHasSearched(searchTerm.trim() !== '');

		// Resetear a página 1
		setPageActive(1);

		// Activar el useEffect para realizar la búsqueda
		setShouldFetch(true);
	};

	const clearSearch = () => {
		setSearchTerm('');
		setHasSearched(false);

		// Resetear a página 1
		setPageActive(1);

		// Activar el useEffect para realizar la búsqueda
		setShouldFetch(true);

		// Mantener el foco en el campo de búsqueda después de limpiar
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}
	};

	// -----------------------------------------------------
	// Rango de meses => cambio
	// -----------------------------------------------------
	const handleDateRangeChange = (e) => {
		const newRange = e.target.value;
		setDateRange(newRange);

		// Resetear a página 1
		setPageActive(1);

		// Activar el useEffect para realizar la búsqueda
		setShouldFetch(true);
	};

	// -----------------------------------------------------
	// Paginación normal => Desktop
	// -----------------------------------------------------
	const refreshPage = (page) => {
		// Si NO es móvil, scrollea al top antes de cambiar la página
		if (!mobileView) {
			// Limpiamos las cotizaciones pero mantenemos el estado anterior para evitar parpadeos
			// setQuotes([]);
			document.body.scrollTo({ top: 0 });
		}

		// Mostrar carga inmediatamente
		setLoading(true);

		// Actualizar la página y activar la búsqueda
		setPageActive(page);
		setShouldFetch(true);
	};

	// -----------------------------------------------------
	// Eliminar cotización
	// -----------------------------------------------------
	const handleDeleteQuote = async (quoteId) => {
		if (!accessToken) return;

		if (
			window.confirm('¿Estás seguro de que deseas eliminar esta cotización?')
		) {
			try {
				const resp = await fetch(
					`https://api.pccdnapi.com/quotes/delete/${quoteId}/`,
					{
						method: 'DELETE',
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);

				if (resp.ok) {
					// Eliminar la cotización del estado
					setQuotes((prevQuotes) =>
						prevQuotes.filter((quote) => quote.id !== quoteId)
					);
					// Actualizar el conteo
					setCount((prevCount) => prevCount - 1);
				} else {
					const error = await resp.json();
					console.error('Error al eliminar la cotización:', error);
					alert(
						'No se pudo eliminar la cotización. Inténtelo de nuevo más tarde.'
					);
				}
			} catch (err) {
				console.error('Error de conexión:', err);
				alert('Error de conexión. Inténtelo de nuevo más tarde.');
			}
		}
	};

	// -----------------------------------------------------
	// loadMore => infinite scroll => concat
	// -----------------------------------------------------
	const loadMore = async () => {
		if (loading) return;
		if (pageActive >= totalPages) {
			setHasMore(false);
			return;
		}

		// Incrementar página y activar el efecto
		setPageActive((prevPage) => prevPage + 1);
		setShouldFetch(true);
	};

	// -----------------------------------------------------
	// Función para comprar cotización
	// -----------------------------------------------------
	const handleBuyQuote = async (quote) => {
		try {
			// Verificar si la cotización no tiene más de 10 días de creada
			const quoteDate = new Date(quote.created);
			const today = new Date();
			const diffTime = Math.abs(today - quoteDate);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays > 10) {
				alert(
					'Esta cotización ha superado los 10 días de vigencia y no puede ser procesada.'
				);
				return;
			}

			// Mostrar indicador de carga para esta cotización específica
			setIsConvertingQuote(true);
			setConvertingQuoteId(quote.id);

			// 1. Limpiar carrito actual
			await clearCart();

			// 2. Esperar un momento para asegurar que el carrito se haya limpiado
			await new Promise((resolve) => setTimeout(resolve, 500));

			// 3. Configurar el método de pago (MSI/contado) según la cotización
			// Usamos updateDataUser para actualizar el estado de MSI
			updateDataUser(quote.is_msi);

			// 4. Agregar productos de la cotización al carrito con sus precios especiales
			if (quote.items && quote.items.length > 0) {
				// Añadir cada producto al carrito
				for (const item of quote.items) {
					try {
						// Verificar que el ítem tenga product_id
						if (!item.product_id) {
							console.error('El ítem no tiene product_id:', item);
							continue;
						}
						const product = {
							id: item.product_id,
						};

						// Usar el addToCart con el quote_id para aplicar precios especiales
						await addToCart(product, item.quantity, true, quote.id);
					} catch (itemError) {
						console.error('Error al procesar ítem:', itemError);
					}

					// Pequeña pausa para evitar problemas de sincronización
					await new Promise((resolve) => setTimeout(resolve, 300));
				}

				// 5. Redireccionar al carrito
				router.push('/carrito');
			}
		} catch (error) {
			console.error('Error al comprar cotización:', error);
			alert(
				'Hubo un problema al procesar tu cotización. Por favor intenta de nuevo.'
			);
		} finally {
			setIsConvertingQuote(false);
			setConvertingQuoteId(null);
		}
	};

	// -----------------------------------------------------
	// Función para renderizar la lista de cotizaciones
	// -----------------------------------------------------
	function renderQuotesList() {
		// Si no hay cotizaciones, renderizamos un div vacío para evitar parpadeos
		if (quotes.length === 0) {
			return <div className='quotes-list'></div>;
		}

		return (
			<div className='quotes-list'>
				{quotes.map((quote) => {
					// Mapeo de estado a texto amigable
					let statusLabel;
					switch (quote.status) {
						case 'DRAFT':
							statusLabel = 'Borrador';
							break;
						case 'SENT':
							statusLabel = 'Enviada';
							break;
						case 'EXPIRED':
							statusLabel = 'Expirada';
							break;
						case 'CONVERTED':
							statusLabel = 'Convertida a compra';
							break;
						default:
							statusLabel = 'Pendiente';
					}

					// Calcular vigencia de tiempo (valid_until)
					const validUntil = quote.valid_until
						? new Date(quote.valid_until)
						: null;
					const today = new Date();
					const isExpired =
						quote.status === 'EXPIRED' || (validUntil && validUntil < today);

					// Calcular si han pasado más de 10 días desde su creación
					const createdDate = new Date(quote.created);
					const diffTime = Math.abs(today - createdDate);
					const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
					const isTooOld = diffDays > 10;

					// Si la cotización es muy antigua, también se considera expirada
					const isEffectivelyExpired = isExpired || isTooOld;

					// Crear clase de estilo para el estado
					let statusClass = '';
					if (isEffectivelyExpired) {
						statusClass = 'expired';
					} else if (quote.status === 'CONVERTED') {
						statusClass = 'converted';
					} else if (quote.status === 'SENT') {
						statusClass = 'active';
					}

					// Fecha formateada
					const quoteDate = quote.created
						? new Date(quote.created).toLocaleDateString('es-MX')
						: '';

					// Fecha de validez formateada
					const validUntilDate = validUntil
						? validUntil.toLocaleDateString('es-MX')
						: '';

					// Mensaje de validez personalizado
					let validityMessage = '';
					if (isExpired) {
						validityMessage = 'Esta cotización ha expirado';
					} else if (isTooOld) {
						validityMessage =
							'Esta cotización ha superado los 10 días de vigencia';
					} else {
						validityMessage = `Válida hasta: ${validUntilDate}`;
					}

					return (
						<div key={quote.id} className='quote-card'>
							{/* Encabezado principal de la cotización */}
							<div className='quote-card__header'>
								<div className='quote-card__header-left'>
									<span className='quote-card__status'>
										Estado:{' '}
										<strong className={statusClass}>{statusLabel}</strong>
									</span>
									<p className='quote-card__validity'>{validityMessage}</p>
								</div>
								<div className='quote-card__header-right'>
									<a
										href='#'
										className='delete-quote-link'
										onClick={(e) => {
											e.preventDefault();
											handleDeleteQuote(quote.id);
										}}
									>
										Eliminar cotización
									</a>
									<p className='quote-card__id'>
										<strong>Cotización #{quote.id}</strong>
									</p>
								</div>
							</div>

							{/* Contenido principal - 3 columnas como en UserQuoteDetail */}
							<div className='quote-card__content'>
								{/* Col izq: datos globales de la cotización */}
								<div className='quote-card__content-left'>
									<p>
										<strong>Fecha de creación:</strong> {quoteDate}
									</p>
									<p>
										<strong>Tipo de pago:</strong>{' '}
										{quote.is_msi ? 'MSI / Pagos' : 'Contado'}
									</p>
									{quote.cliente_nombre && (
										<div className='client-data'>
											<h4>Datos del cliente</h4>
											<p>
												<strong>Nombre:</strong> {quote.cliente_nombre}
											</p>
											{quote.cliente_email && (
												<p>
													<strong>Email:</strong> {quote.cliente_email}
												</p>
											)}
											{quote.cliente_telefono && (
												<p>
													<strong>Teléfono:</strong> {quote.cliente_telefono}
												</p>
											)}
										</div>
									)}
									{quote.facturacion_razon_social && (
										<div className='invoice-data'>
											<h4>Datos de facturación</h4>
											<p>
												<strong>Razón social:</strong>{' '}
												{quote.facturacion_razon_social}
											</p>
											{quote.facturacion_rfc && (
												<p>
													<strong>RFC:</strong> {quote.facturacion_rfc}
												</p>
											)}
											
										</div>
									)}
								</div>

								{/* Col central: productos incluidos */}
								<div className='quote-card__content-center'>
									<h4>Productos</h4>
									<div className='products-list'>
										{quote.items && quote.items.length > 0 ? (
											<div className='table-responsive'>
												{quote.items.map((item) => (
													<div key={item.id} className='order-product'>
														<div className='order-product__image__container'>
															<div className='order-product__image__container__inner'>
																<div className='order-product__image'>
																	<Image
																		src={
																			item.product_image_url ||
																			'/images/not-available.png'
																		}
																		alt={Capitalize(item.product_titulo || '')}
																		fill
																		style={{ objectFit: 'contain' }}
																		sizes='auto'
																	/>
																</div>
															</div>
														</div>
														<div className='order-product__info'>
															<p>
																<strong>{item.quantity} x</strong>{' '}
																{item.product_slug ? (
																	<Link
																		href={`/${item.product_slug}`}
																		legacyBehavior
																	>
																		<a>{item.product_titulo}</a>
																	</Link>
																) : (
																	item.product_titulo
																)}
															</p>
															<p className='sku'>SKU: {item.product_sku}</p>
															<p className='price'>
																Precio: ${CurrencyFormat(item.price_unit)} |
																Subtotal: ${CurrencyFormat(item.subtotal)}
															</p>
														</div>
													</div>
												))}
											</div>
										) : (
											<p>No hay productos en esta cotización.</p>
										)}
									</div>
								</div>

								{/* Col derecha: resumen y acciones */}
								<div className='quote-card__content-right'>
									<div className='quote-summary'>
										<h4>Resumen</h4>
										<div className='summary-row'>
											<span>Subtotal:</span>
											<span>$ {CurrencyFormat(quote.subtotal)}</span>
										</div>
										<div className='summary-row'>
											<span>IVA:</span>
											<span>$ {CurrencyFormat(quote.iva)}</span>
										</div>
										<div className='summary-row'>
											<span>Envío:</span>
											<span>$ {CurrencyFormat(quote.envio)}</span>
										</div>
										<div className='summary-row summary-row--total'>
											<span>Total:</span>
											<span>$ {CurrencyFormat(quote.total)}</span>
										</div>
									</div>

									{/* Botones de acciones */}
									{!isEffectivelyExpired && (
										<div className='quote-actions'>
											{quote.pdf && (
												<a
													href={quote.pdf}
													target='_blank'
													rel='noreferrer'
													className='btn-action btn-download'
												>
													<span className='download-icon'>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															width='18'
															height='18'
															fill='currentColor'
														>
															<path d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' />
														</svg>
													</span>
													Descargar PDF
												</a>
											)}
											{quote.status !== 'CONVERTED' && (
												<button
													className='btn-action'
													onClick={() => handleBuyQuote(quote)}
													disabled={
														isConvertingQuote && convertingQuoteId === quote.id
													}
												>
													{isConvertingQuote &&
													convertingQuoteId === quote.id ? (
														<span className='loading-text'>
															<span className='loading-dots'></span>
														</span>
													) : (
														'Comprar cotización'
													)}
												</button>
											)}

											{/* Botón para ver detalle */}
											<Link href={`/cotizacion/${quote.id}`} legacyBehavior>
												<a className='btn-action btn-view'>
													<span className='view-icon'>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															width='18'
															height='18'
															fill='currentColor'
														>
															<path d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' />
														</svg>
													</span>
													Ver detalle
												</a>
											</Link>
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
				<style jsx>{`
					.quotes-list {
						display: flex;
						flex-direction: column;
						gap: 15px;
					}

					.quote-card {
						border: 1px solid #eaeaea;
						border-radius: 8px;
						background-color: #fff;
						overflow: hidden;
						margin-bottom: 15px;
						box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
					}

					.quote-card__header {
						display: flex;
						justify-content: space-between;
						padding: 15px 20px;
						background-color: #f7f7f7;
						border-bottom: 1px solid #eaeaea;
					}

					.quote-card__header-left {
						display: flex;
						flex-direction: column;
					}

					.quote-card__header-right {
						display: flex;
						flex-direction: column;
						align-items: flex-end;
						justify-content: center;
					}

					.quote-card__id {
						margin: 0;
						color: #333;
					}

					.quote-card__status {
						font-size: 15px;
						margin-bottom: 4px;
					}

					.quote-card__status strong {
						font-weight: 600;
					}

					.quote-card__status strong.expired {
						color: #dc3545;
					}

					.quote-card__status strong.converted {
						color: #28a745;
					}

					.quote-card__status strong.active {
						color: #007bff;
					}

					.quote-card__validity {
						font-size: 13px;
						color: #666;
						margin: 0;
					}

					.delete-quote-link {
						color: #dc3545;
						text-decoration: none;
						font-size: 13px;
						margin-bottom: 8px;
					}

					.delete-quote-link:hover {
						text-decoration: underline;
					}

					.quote-card__content {
						display: grid;
						grid-template-columns: 1fr 1.5fr 1fr;
						gap: 20px;
						padding: 20px;
					}

					.quote-card__content-left,
					.quote-card__content-center,
					.quote-card__content-right {
						display: flex;
						flex-direction: column;
					}

					.quote-card__content-left p,
					.quote-card__content-center p {
						margin: 0 0 10px;
					}

					.client-data,
					.invoice-data {
						margin-top: 15px;
					}

					.client-data h4,
					.invoice-data h4,
					.quote-card__content-center h4,
					.quote-card__content-right h4 {
						font-size: 16px;
						margin: 0 0 12px;
						padding-bottom: 6px;
						border-bottom: 1px solid #eee;
					}

					.products-list {
						margin-top: 5px;
					}

					.table-responsive {
						display: flex;
						flex-direction: column;
						gap: 15px;
					}

					.order-product {
						display: flex;
						gap: 15px;
						padding-bottom: 15px;
						border-bottom: 1px solid #f0f0f0;
					}

					.order-product:last-child {
						border-bottom: none;
					}

					.order-product__image__container {
						flex-shrink: 0;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.order-product__image__container__inner {
						width: 60px;
						height: 60px;
						position: relative;
						overflow: hidden;
						background-color: #f7f7f7;
						padding: 5px;
						border-radius: 4px;
					}

					.order-product__image {
						width: 100%;
						height: 100%;
						position: relative;
						overflow: hidden;
						mix-blend-mode: multiply;
					}

					.order-product__info {
						flex-grow: 1;
					}

					.order-product__info p {
						margin: 0 0 5px;
						line-height: 1.4;
					}

					.order-product__info a {
						text-decoration: none;
					}

					.sku {
						font-size: 12px;
						color: #666;
					}

					.price {
						font-size: 13px;
						color: #333;
					}

					.quote-summary {
						display: flex;
						flex-direction: column;
						gap: 8px;
						margin-bottom: 30px;
					}

					.summary-row {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 6px 0;
					}

					.summary-row--total {
						font-weight: 700;
						font-size: 18px;
						border-top: 1px solid #eee;
						margin-top: 8px;
						padding-top: 12px;
					}

					.quote-actions {
						display: flex;
						flex-direction: column;
						gap: 10px;
					}

					.btn-action {
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 12px 15px;
						background-color: var(--primary-color);
						color: white;
						border: none;
						border-radius: 4px;
						font-weight: 600;
						font-size: 15px;
						cursor: pointer;
						text-align: center;
						transition: background-color 0.2s;
						text-decoration: none;
					}

					.btn-action:disabled {
						opacity: 0.7;
						cursor: not-allowed;
					}

					.btn-download {
						background-color: transparent;
						border: 1px solid var(--primary-color);
						color: var(--primary-color);
					}

					.btn-view {
						background-color: #6c757d;
						color: white;
					}

					.btn-view:hover {
						background-color: #5a6268;
					}

					.download-icon,
					.view-icon {
						display: inline-flex;
						margin-right: 8px;
					}

					.loading-text {
						display: flex;
						align-items: center;
						justify-content: center;
						gap: 8px;
					}

					.loading-dots {
						position: relative;
						width: 16px;
						height: 16px;
						border-radius: 50%;
						background-color: white;
						opacity: 0.7;
						animation: bounce 1.4s infinite ease-in-out both;
					}

					.loading-dots:before,
					.loading-dots:after {
						content: '';
						position: absolute;
						top: 0;
						width: 16px;
						height: 16px;
						border-radius: 50%;
						background-color: white;
						opacity: 0.7;
						animation: bounce 1.4s infinite ease-in-out both;
					}

					.loading-dots:before {
						left: -25px;
						animation-delay: -0.32s;
					}

					.loading-dots:after {
						right: -25px;
						animation-delay: 0.16s;
					}

					@keyframes bounce {
						0%,
						80%,
						100% {
							transform: scale(0);
						}
						40% {
							transform: scale(1);
						}
					}

					@media (max-width: 992px) {
						.quotes__wrapper {
							padding: 0px !important;
							margin: 0;
						}
						.quotes-filters,
						.quotes-header {
							padding: 10px;
							margin: 0;
							border-bottom: 1px solid #eaeaea;
						}
						.quote-card__header {
							flex-direction: column;
							gap: 10px;
						}
						.quote-card__content {
							grid-template-columns: 1fr;
						}
						.quote-card__header {
							margin-bottom: 10px;
						}
						.quote-actions {
							margin-top: 15px;
						}
						.quote-card__header-right {
							align-items: flex-start;
						}

						.delete-quote-link {
							margin-bottom: 5px;
						}
					}
				`}</style>
			</div>
		);
	}

	// -----------------------------------------------------
	// Render principal
	// -----------------------------------------------------
	return (
		<div className='quotes__wrapper'>
			{/* Header: búsqueda y rango (solo desktop si no está cargando) */}
			{!mobileView && (
				<div className='quotes-header'>
					<h2>Mis Cotizaciones</h2>
					<div className='quotes-header__info'>
						{quotes.length > 0 && !loading && (
							<span className='text--off'>
								Mostrando {(pageActive - 1) * pageSize + 1} -{' '}
								{(pageActive - 1) * pageSize + quotes.length} de {count}{' '}
								cotizaciones
							</span>
						)}
					</div>
				</div>
			)}
			{/* Barra de filtros */}
			<div className='quotes-filters'>
				<div className='search-bar'>
					<input
						type='text'
						placeholder='Buscar en mis cotizaciones'
						value={searchTerm}
						onChange={handleSearchInputChange}
						onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						ref={searchInputRef}
					/>

					{/* BOTÓN X para limpiar, se muestra solo si searchTerm tiene algo */}
					{searchTerm.length > 0 && (
						<button className='search-bar__clear' onClick={clearSearch}>
							✕
						</button>
					)}

					<button
						className='search-bar__submit'
						onClick={handleSearch}
						type='button'
					>
						<svg
							className='search-bar__icon icon__ligth'
							width='25'
							height='20'
							viewBox='5 0 20 20'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M18.319 14.4326C20.7628 11.2941 20.542 6.75347 17.6569 3.86829C14.5327 0.744098 9.46734 0.744098 6.34315 3.86829C3.21895 6.99249 3.21895 12.0578 6.34315 15.182C9.22833 18.0672 13.769 18.2879 16.9075 15.8442C16.921 15.8595 16.9351 15.8745 16.9497 15.8891L21.1924 20.1317C21.5829 20.5223 22.2161 20.5223 22.6066 20.1317C22.9971 19.7412 22.9971 19.1081 22.6066 18.7175L18.364 14.4749C18.3493 14.4603 18.3343 14.4462 18.319 14.4326ZM16.2426 5.28251C18.5858 7.62565 18.5858 11.4246 16.2426 13.7678C13.8995 16.1109 10.1005 16.1109 7.75736 13.7678C5.41421 11.4246 5.41421 7.62565 7.75736 5.28251C10.1005 2.93936 13.8995 2.93936 16.2426 5.28251Z' />
						</svg>
					</button>
				</div>
				<div className='date-range'>
					<select value={dateRange} onChange={handleDateRangeChange}>
						<option value='1'>Último mes</option>
						<option value='3'>Últimos 3 meses</option>
						<option value='6'>Últimos 6 meses</option>
						<option value='12'>Últimos 12 meses</option>
						<option value='all'>Todas</option>
					</select>
				</div>
			</div>

			{/* MOBILE => SCROLL INFINITO | DESKTOP => PAGINACIÓN */}
			{mobileView ? (
				<div
					id='quotesScroll'
					style={{
						maxHeight: 'calc(100vh - 165px)',
						overflow: 'auto',
					}}
				>
					<InfiniteScroll
						dataLength={quotes.length}
						next={loadMore}
						hasMore={hasMore}
						scrollableTarget='quotesScroll'
						scrollThreshold={'10px'}
						loader={
							quotes.length > 0 && (
								<div className='loading-container'>
									<Preloader
										use={TailSpin}
										size={30}
										strokeWidth={8}
										strokeColor='var(--primary-color)'
										duration={900}
									/>
								</div>
							)
						}
					>
						{/* Contenido principal - versión móvil */}
						{loading && quotes.length === 0 ? (
							<div className='cart__loading'>
								<div className='cart__loading__container'>
									<Preloader
										use={TailSpin}
										size={30}
										strokeWidth={8}
										strokeColor='var(--primary-color)'
										duration={900}
									/>
								</div>
							</div>
						) : (
							renderQuotesList()
						)}
					</InfiniteScroll>
				</div>
			) : (
				<>
					{/* Contenido principal - versión desktop */}
					{loading ? (
						<div className='cart__loading'>
							<div className='cart__loading__container'>
								<Preloader
									use={TailSpin}
									size={30}
									strokeWidth={8}
									strokeColor='var(--primary-color)'
									duration={900}
								/>
							</div>
						</div>
					) : (
						renderQuotesList()
					)}

					{/* Paginación - solo en Desktop */}
					{!loading && quotes.length > 0 && totalPages > 1 && (
						<div className='quotes-pagination'>
							<ListProductsPagination
								pages={totalPages}
								pageActive={pageActive}
								refreshPage={refreshPage}
							/>
						</div>
					)}
				</>
			)}

			{/* MENSAJE DE NO HAY COTIZACIONES - Solo se muestra cuando NO está cargando y realmente no hay resultados */}
			{!loading && quotes.length === 0 && (
				<div className='no-quotes'>
					{hasSearched ? (
						<p>No se encontraron cotizaciones que coincidan con tu búsqueda.</p>
					) : (
						<p>No tienes cotizaciones en este período.</p>
					)}
					<Link href='/'>
						<button className='btn-shop'>Explorar productos</button>
					</Link>
				</div>
			)}

			{/* Estilos globales */}
			<style jsx>{`
				.quotes__wrapper {
					padding: 20px;
					max-width: 100%;
					margin-left: 40px;
				}
				.quotes-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 20px;
				}
				.quotes-header__info {
					font-size: 14px;
					color: #666;
				}
				.quotes-filters {
					display: flex;
					gap: 15px;
					align-items: center;
					margin-bottom: 20px;
					justify-content: space-between;
				}
				.search-bar {
					display: flex;
					border: 1px solid #ccc;
					border-radius: 5px;
					overflow: hidden;
					flex: 1;
					justify-content: space-between;
					position: relative;
				}
				.search-bar input {
					border: none;
					padding: 8px;
					width: 100%;
					outline: none;
				}
				.search-bar__submit {
					background: #fff;
					border: none;
					cursor: pointer;
					padding: 8px 12px;
					display: flex;
					align-items: center;
					color: #666;
				}
				.search-bar__submit:hover {
					background: #f5f5f5;
				}

				/* Botón X para limpiar */
				.search-bar__clear {
					position: absolute;
					right: 45px;
					top: 50%;
					transform: translateY(-50%);
					border: none;
					background: transparent;
					color: #999;
					font-size: 16px;
					cursor: pointer;
					padding: 0 5px;
				}
				.search-bar__clear:hover {
					color: #000;
				}

				.date-range select:hover {
					background: #f5f5f5;
				}

				.date-range select {
					padding: 10.5px 12px;
					border: 1px solid #ccc;
					border-radius: 5px;
					cursor: pointer;
					background: #fff;
					color: #333;
				}

				.no-quotes {
					text-align: center;
					padding: 3rem 1rem;
				}

				.btn-shop {
					margin-top: 1rem;
					background-color: var(--primary-color);
					color: white;
					border: none;
					padding: 0.75rem 1.5rem;
					border-radius: 4px;
					cursor: pointer;
					font-weight: 500;
				}

				.quotes-pagination {
					margin-top: 2rem;
					display: flex;
					justify-content: center;
				}

				.text--off {
					color: #777;
					font-size: 0.9rem;
				}

				.loading-container {
					display: flex;
					justify-content: center;
					padding: 40px 0;
					width: 100%;
				}

				.cart__loading {
					position: relative;
					width: 100%;
					min-height: 50dvh;
					opacity: 0.8;
					display: flex;
					justify-content: center;
					align-items: center;
					z-index: 1000;
				}

				.cart__loading__container {
					position: relative;
					height: 25%;
					width: 25%;
					background-color: #fff;
					opacity: 1;
					border-radius: 2px;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				@media (max-width: 992px) {
					.quotes__wrapper {
						padding: 0px !important;
						margin: 0;
					}
					.quotes-filters,
					.quotes-header {
						padding: 10px;
						margin: 0;
						border-bottom: 1px solid #eaeaea;
					}
					.quote-card__header {
						flex-direction: column;
						gap: 10px;
					}
					.quote-card__content {
						grid-template-columns: 1fr;
					}
					.quote-card__header {
						margin-bottom: 10px;
					}
					.quote-actions {
						margin-top: 15px;
					}
					.quote-card__header-right {
						align-items: flex-start;
					}

					.delete-quote-link {
						margin-bottom: 5px;
					}
				}
			`}</style>
		</div>
	);
}

export default UserQuotesList;
