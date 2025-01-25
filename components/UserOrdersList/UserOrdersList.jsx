import React, { useEffect, useState } from 'react';
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
import TruncateMarkup from 'react-truncate-markup';

function UserOrdersList() {
	const { accessToken } = useAuth();
	const router = useRouter();

	// Flag para diferenciar móvil vs escritorio
	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

	// Estados base
	const [orders, setOrders] = useState([]);
	const [count, setCount] = useState(0);

	const [pageActive, setPageActive] = useState(1);
	const pageSize = 5;
	const totalPages = Math.ceil(count / pageSize);

	const [loading, setLoading] = useState(true);

	// Filtros de búsqueda
	const [searchTerm, setSearchTerm] = useState('');
	const [dateRange, setDateRange] = useState('3');

	// Para infinite scroll
	const [hasMore, setHasMore] = useState(true);

	// Opciones de pago
	const paymentOptions = [
		{
			id: 'paypal',
			title: 'PayPal',
			subtitle: 'Disfruta de un pago único con PayPal.',
			imgSrc: '/images/paypal-logo-footer.png',
		},
		{
			id: 'mercadopago',
			title: 'Mercado Pago',
			subtitle:
				'Hasta 3 MSI con tarjetas participantes o 12 con Mercado Crédito.',
			imgSrc: '/images/logo-mercado-pago.png',
		},
		{
			id: 'kueskipay',
			title: 'Kueski Pay',
			subtitle: 'Paga en hasta 12 quincenas con Kueski Pay.',
			imgSrc: '/images/Logotipo_Kueski_pay.png',
		},
		{
			id: 'aplazo',
			title: 'Aplazo',
			subtitle: 'Divide tus pagos en quincenas con Aplazo.',
			imgSrc: '/images/logo-aplazo.png',
		},
		{
			id: 'deposit',
			title: 'Depósito/Transferencia Interbancaria',
			subtitle: '',
			imgSrc: '/images/logos/deposit-3banks.png',
		},
	];

	// Mapear ID de método de pago a su info
	const selectedPayment = (paymentMethod) =>
		paymentOptions.find((opt) => opt.id === paymentMethod);

	// ------------------------------------------
	// fetchOrders => recibe isConcat (opcional)
	// ------------------------------------------
	const fetchOrders = async (
		{ page = 1, search = '', range = '3' },
		isConcat = false
	) => {
		setLoading(true);
		try {
			const url = new URL('https://api.pccdnapi.com/orders/list/');
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
					setOrders((prev) => [...prev, ...data.results]);
				} else {
					// Reemplazar
					setOrders(data.results);
				}

				// Actualizar hasMore
				if (!data.next) {
					setHasMore(false);
				} else {
					setHasMore(true);
				}
			} else {
				console.error('Error al obtener las órdenes:', resp.statusText);
				const data = await resp.json();
				console.log(data);
			}
		} catch (err) {
			console.error('Error de conexión:', err);
		} finally {
			setLoading(false);
		}
	};

	// -----------------------------------------------------
	// useEffect principal
	// -----------------------------------------------------
	useEffect(() => {
		if (!accessToken) return;

		if (!mobileView) {
			// Desktop: recarga cada vez que cambie pageActive, searchTerm, dateRange
			fetchOrders(
				{
					page: pageActive,
					search: searchTerm,
					range: dateRange,
				},
				false
			);
		} else {
			// Móvil: sólo recarga normal si pageActive == 1
			if (pageActive === 1) {
				fetchOrders(
					{
						page: 1,
						search: searchTerm,
						range: dateRange,
					},
					false
				);
			}
		}
	}, [accessToken, searchTerm, dateRange, pageActive, mobileView]);

	// -----------------------------------------------------
	// Búsqueda => click “Buscar” o Enter
	// -----------------------------------------------------
	const handleSearch = () => {
		setPageActive(1);
  };
  
  const clearSearch = () => {
		setSearchTerm('');
		refreshPage(1);
	};

	// -----------------------------------------------------
	// Rango de meses => cambio
	// -----------------------------------------------------
	const handleDateRangeChange = (e) => {
		setDateRange(e.target.value);
		setPageActive(1);
	};

	// -----------------------------------------------------
	// Paginación normal => Desktop
	// -----------------------------------------------------
	const refreshPage = (page) => {
		// Si NO es móvil, scrollea al top antes de cambiar la página
		if (!mobileView) {
			setOrders([]);
			document.body.scrollTo({ top: 0 });
		}
		setPageActive(page);
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
		const nextPage = pageActive + 1;
		setPageActive(nextPage);

		await fetchOrders(
			{
				page: nextPage,
				search: searchTerm,
				range: dateRange,
			},
			true
		);
	};

	// -----------------------------------------------------
	// Helper para formatear la fecha
	// -----------------------------------------------------
	const formatDate = (rawDate) => {
		if (!rawDate) return '';
		const dateObj = new Date(rawDate);
		const day = dateObj.getDate();
		const months = [
			'Enero',
			'Febrero',
			'Marzo',
			'Abril',
			'Mayo',
			'Junio',
			'Julio',
			'Agosto',
			'Septiembre',
			'Octubre',
			'Noviembre',
			'Diciembre',
		];
		const monthName = months[dateObj.getMonth()] || '';
		return `${day} de ${monthName}`;
	};

	// -----------------------------------------------------
	// Render “loading” si Desktop, no hay orders
	// -----------------------------------------------------
	if (!mobileView && loading && orders.length === 0) {
		return (
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
				<style jsx>
					{`
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
					`}
				</style>
			</div>
		);
	}

	// -----------------------------------------------------
	// Render principal
	// -----------------------------------------------------
	return (
		<div className='orders__wrapper'>
			{/* Header: búsqueda y rango (solo desktop si no está cargando) */}
			{!mobileView && !loading && (
				<div className='orders-header'>
					<h2>Mis Compras</h2>
					<div className='orders-header__info'>
						{orders.length > 0 && (
							<span className='text--off'>
								Mostrando {(pageActive - 1) * pageSize + 1} -{' '}
								{(pageActive - 1) * pageSize + orders.length} de {count} pedidos
							</span>
						)}
					</div>
				</div>
			)}

			{/* Barra de filtros */}
			{/* Barra de filtros (Search y Rango) */}
			<div className='orders-filters'>
				<div className='search-bar'>
					<input
						type='text'
						placeholder='Buscar en mis pedidos'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					/>

					{/* BOTÓN X para limpiar, se muestra solo si searchTerm tiene algo */}
					{searchTerm.length > 0 && (
						<button className='search-bar__clear' onClick={clearSearch}>
							✕
						</button>
					)}

					<button onClick={handleSearch} className='search-bar__submit'>
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
					</select>
				</div>
			</div>

			{/* MOBILE => SCROLL INFINITO | DESKTOP => PAGINACIÓN */}
			{mobileView ? (
				<div
					id='ordersScroll'
					style={{
						maxHeight: 'calc(100vh - 165px)',
						overflow: 'auto',
					}}
				>
					<InfiniteScroll
						dataLength={orders.length}
						next={loadMore}
						hasMore={hasMore}
						scrollableTarget='ordersScroll'
						scrollThreshold={'10px'}
						loader={
							orders.length > 0 && (
								<div
									style={{
										textAlign: 'center',
										padding: 20,
										display: 'flex',
										width: '100%',
										position: 'relative',
										justifyContent: 'center',
									}}
								>
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
						{/* Mapeo de órdenes - Versión MÓVIL */}
						{orders.map((order) => {
							const orderNumber = `#${order.id}`;
							const overallStatus = order.overall_status || 'En preparación';
							const dateLabel = formatDate(order.overall_date);
							const deliveredText = dateLabel
								? `${overallStatus} el ${dateLabel}`
								: overallStatus;

							const orderDate = order.created_at
								? new Date(order.created_at).toLocaleDateString('es-MX')
								: '';
							const shippingName = order.shipping_full_name || 'SIN NOMBRE';

							return (
								<div key={order.id} className='order-card'>
									{/* Encabezado principal de la orden */}
									<div className='order-card__header'>
										<div className='order-card__header-left'>
											<span className='order-card__status'>
												Estado: <strong>{overallStatus}</strong>
											</span>
											<p className='order-card__delivery'>{deliveredText}</p>
										</div>
									</div>

									{/* Contenido principal */}
									<div className='order-card__content'>
										{/* Col izq: datos globales de la orden */}
										<div className='order-card__content-left'>
											<p>
												<strong>Pedido:</strong> {orderNumber}
											</p>
											<p>
												<strong>Fecha:</strong> {orderDate}
											</p>
											<div className='order-card__payment-form'>
												<div>
													<strong>Método de pago:</strong>
												</div>
												<div className='order-card__payment-form__image'>
													<Image
														src={selectedPayment(order.payment_form).imgSrc}
														alt={Capitalize(
															selectedPayment(order.payment_form).title
														)}
														fill
														style={{ objectFit: 'contain' }}
														sizes='auto'
													/>
												</div>
											</div>
											<p>
												<strong>Total:</strong> $ {CurrencyFormat(order.total)}
											</p>
											<p>
												<strong>Enviado a:</strong> {shippingName.toUpperCase()}
											</p>
										</div>

										{/* Col central: 1) shipments 2) devoluciones 3) items sin envío */}
										<div className='order-card__content-center'>
											{/* 1) SHIPMENTS */}
											{order.shipments && order.shipments.length > 0 ? (
												order.shipments.map((shipment) => {
													// Construye map SKU => item para la imagen/slug
													const itemMap = {};
													order.items.forEach((i) => {
														itemMap[i.sku] = i;
													});

													return (
														<div key={shipment.id} className='shipment-block'>
															<div className='shipment-block__header'>
																<h4>
																	<strong>
																		Envío: {shipment.tracking_number}
																	</strong>{' '}
																	<span style={{ fontSize: '12px' }}>
																		({Capitalize(shipment.carrier)}) - Estado:{' '}
																		{shipment.status}
																	</span>
																</h4>
															</div>
															{shipment.tracking_url && (
																<Link
																	href={shipment.tracking_url}
																	legacyBehavior
																>
																	<a target='_blank'>
																		<button className='btn-track'>
																			Rastrear pedido
																		</button>
																	</a>
																</Link>
															)}

															<div className='shipment-items'>
																{shipment.shipment_items?.length > 0 ? (
																	shipment.shipment_items.map((sItem) => {
																		const matched = itemMap[sItem.sku];
																		const productImg =
																			matched?.product_image ||
																			'/images/not-available.png';
																		const productSlug = matched?.product_slug;
																		const productName =
																			sItem.nombre_producto || 'Producto';
																		const qty = sItem.cantidad_enviada;

																		return (
																			<div
																				key={sItem.id}
																				className='shipment-item-block'
																			>
																				<Link
																					href={`/${productSlug || ''}`}
																					legacyBehavior
																				>
																					<a>
																						<div className='shipment-item__row'>
																							<div className='order-product__image__container'>
																								<div className='order-product__image'>
																									<Image
																										src={productImg}
																										alt={Capitalize(
																											productName
																										)}
																										fill
																										style={{
																											objectFit: 'contain',
																										}}
																										sizes='auto'
																									/>
																								</div>
																							</div>
																							<div className='shipment-item__info'>
																								<p>
																									<strong>{qty} x</strong>{' '}
																									<TruncateMarkup lines={3}>
																										<span>
																											{Capitalize(productName)}
																										</span>
																									</TruncateMarkup>
																								</p>
																								<p className='sku'>
																									{sItem.sku}
																								</p>
																							</div>
																						</div>
																					</a>
																				</Link>
																			</div>
																		);
																	})
																) : (
																	<p>No hay artículos en este envío.</p>
																)}
															</div>
														</div>
													);
												})
											) : (
												// SI NO HAY SHIPMENTS => items en bloque
												<>
													{order.items?.length > 0 ? (
														order.items.map((item) => (
															<Link
																href={`/${item.product_slug || ''}`}
																legacyBehavior
																key={item.id}
															>
																<a>
																	<div className='order-product'>
																		<div className='order-product__image__container'>
																			<div className='order-product__image'>
																				<Image
																					src={
																						item.product_image ||
																						'/images/not-available.png'
																					}
																					alt={Capitalize(item.nombre_producto)}
																					fill
																					style={{ objectFit: 'contain' }}
																					sizes='auto'
																				/>
																			</div>
																		</div>
																		<div className='order-product__info'>
																			<p>
																				<strong>{item.cantidad} x</strong>{' '}
																				<TruncateMarkup lines={3}>
																					<span>
																						{Capitalize(item.nombre_producto)}
																					</span>
																				</TruncateMarkup>
																			</p>
																			<p className='sku'>{item.sku}</p>
																		</div>
																	</div>
																</a>
															</Link>
														))
													) : (
														<p>No hay artículos en esta orden.</p>
													)}
												</>
											)}

											{/* 2) DEVOLUCIONES => Bloque separado */}
											{order.returns && order.returns.length > 0 && (
												<div className='returns-block'>
													<h3>Devoluciones</h3>
													{order.returns.map((ret) => {
														// Mapeamos return_items
														// y si hay return_tracking_url, mostramos "Rastrear devolución"
														return (
															<div key={ret.id} className='return-card'>
																<div className='return-card__header'>
																	<p>
																		<strong>
																			Estado de la devolución:{' '}
																			<span style={{ fontSize: '12px' }}>
																				{ret.status}
																			</span>
																		</strong>
																	</p>
																	{/* Botón rastreo */}
																	{ret.return_tracking_url && (
																		<Link
																			href={ret.return_tracking_url}
																			legacyBehavior
																		>
																			<a target='_blank'>
																				<button className='btn-track'>
																					Rastrear devolución
																				</button>
																			</a>
																		</Link>
																	)}
																</div>

																{/* Items devueltos */}
																<div className='return-items'>
																	{ret.return_items?.length > 0 ? (
																		ret.return_items.map((rItem) => {
																			// Buscar imagen/slug en order.items
																			const matched = order.items.find(
																				(i) => i.sku === rItem.sku
																			);
																			const productImg =
																				matched?.product_image ||
																				'/images/not-available.png';
																			const productSlug = matched?.product_slug;

																			return (
																				<div
																					key={rItem.id}
																					className='return-item-block'
																				>
																					<Link
																						href={`/${productSlug || ''}`}
																						legacyBehavior
																					>
																						<a>
																							<div className='return-item__row'>
																								<div className='order-product__image__container'>
																									<div className='order-product__image'>
																										<Image
																											src={productImg}
																											alt={Capitalize(
																												rItem.nombre_producto
																											)}
																											fill
																											style={{
																												objectFit: 'contain',
																											}}
																											sizes='auto'
																										/>
																									</div>
																								</div>
																								<div className='return-item__info'>
																									<p>
																										<strong>
																											{rItem.cantidad_devuelta}{' '}
																											x
																										</strong>{' '}
																										<TruncateMarkup lines={3}>
																											<span>
																												{Capitalize(
																													rItem.nombre_producto
																												)}
																											</span>
																										</TruncateMarkup>
																									</p>
																									<p className='sku'>
																										{rItem.sku}
																									</p>
																								</div>
																							</div>
																						</a>
																					</Link>
																				</div>
																			);
																		})
																	) : (
																		<p>No hay artículos en esta devolución.</p>
																	)}
																</div>
															</div>
														);
													})}
												</div>
											)}
										</div>

										{/* Col der: Acciones */}
										<div className='order-card__content-right'>
											<h4>Acciones</h4>
											<button className='btn-action'>Facturación</button>
											<button className='btn-action'>Ver detalles</button>
										</div>
									</div>
								</div>
							);
						})}
					</InfiniteScroll>
				</div>
			) : (
				<>
					{/* Versión Desktop */}
					{!loading && orders.length > 0 && (
						<div className='orders-list'>
							{orders.map((order) => {
								const orderNumber = `#${order.id}`;
								const overallStatus = order.overall_status || 'En preparación';
								const dateLabel = formatDate(order.overall_date);
								const deliveredText = dateLabel
									? `${overallStatus} el ${dateLabel}`
									: overallStatus;

								const orderDate = order.created_at
									? new Date(order.created_at).toLocaleDateString('es-MX')
									: '';
								const shippingName = order.shipping_full_name || 'SIN NOMBRE';

								return (
									<div key={order.id} className='order-card'>
										<div className='order-card__header'>
											<div className='order-card__header-left'>
												<span className='order-card__status'>
													Estado: <strong>{overallStatus}</strong>
												</span>
												<p className='order-card__delivery'>{deliveredText}</p>
											</div>
										</div>

										<div className='order-card__content'>
											<div className='order-card__content-left'>
												<p>
													<strong>Pedido:</strong> {orderNumber}
												</p>
												<p>
													<strong>Fecha:</strong> {orderDate}
												</p>
												<div className='order-card__payment-form'>
													<div>
														<strong>Método de pago:</strong>
													</div>
													<div className='order-card__payment-form__image'>
														<Image
															src={selectedPayment(order.payment_form).imgSrc}
															alt={Capitalize(
																selectedPayment(order.payment_form).title
															)}
															fill
															style={{ objectFit: 'contain' }}
															sizes='auto'
														/>
													</div>
												</div>
												<p>
													<strong>Total:</strong> ${' '}
													{CurrencyFormat(order.total)}
												</p>
												<p>
													<strong>Enviado a:</strong>{' '}
													{shippingName.toUpperCase()}
												</p>
											</div>

											<div className='order-card__content-center'>
												{/* Bloque shipments */}
												{order.shipments?.length > 0 ? (
													order.shipments.map((shipment) => {
														// Para las imágenes
														const itemMap = {};
														order.items.forEach((i) => {
															itemMap[i.sku] = i;
														});

														return (
															<div key={shipment.id} className='shipment-block'>
																<div className='shipment-block__header'>
																	<h4>
																		<strong>
																			Envío: {shipment.tracking_number}
																		</strong>{' '}
																		<span style={{ fontSize: '12px' }}>
																			({Capitalize(shipment.carrier)}) - Estado:{' '}
																			{shipment.status}
																		</span>
																	</h4>
																</div>
																{shipment.tracking_url && (
																	<Link
																		href={shipment.tracking_url}
																		legacyBehavior
																	>
																		<a target='_blank'>
																			<button className='btn-track'>
																				Rastrear pedido
																			</button>
																		</a>
																	</Link>
																)}
																<div className='shipment-items'>
																	{shipment.shipment_items?.length > 0 ? (
																		shipment.shipment_items.map((sItem) => {
																			const matched = itemMap[sItem.sku];
																			const productImg =
																				matched?.product_image ||
																				'/images/not-available.png';
																			const productSlug = matched?.product_slug;
																			const productName =
																				sItem.nombre_producto || 'Producto';
																			const qty = sItem.cantidad_enviada;

																			return (
																				<div
																					key={sItem.id}
																					className='shipment-item-block'
																				>
																					<Link
																						href={`/${productSlug || ''}`}
																						legacyBehavior
																					>
																						<a>
																							<div className='shipment-item__row'>
																								<div className='order-product__image__container'>
																									<div className='order-product__image'>
																										<Image
																											src={productImg}
																											alt={Capitalize(
																												productName
																											)}
																											fill
																											style={{
																												objectFit: 'contain',
																											}}
																											sizes='auto'
																										/>
																									</div>
																								</div>
																								<div className='shipment-item__info'>
																									<p>
																										<strong>{qty} x</strong>{' '}
																										<TruncateMarkup lines={3}>
																											<span>
																												{Capitalize(
																													productName
																												)}
																											</span>
																										</TruncateMarkup>
																									</p>
																									<p className='sku'>
																										{sItem.sku}
																									</p>
																								</div>
																							</div>
																						</a>
																					</Link>
																				</div>
																			);
																		})
																	) : (
																		<p>No hay artículos en este envío.</p>
																	)}
																</div>
															</div>
														);
													})
												) : (
													<>
														{order.items?.length > 0 ? (
															order.items.map((item) => (
																<Link
																	href={`/${item.product_slug || ''}`}
																	legacyBehavior
																	key={item.id}
																>
																	<a>
																		<div className='order-product'>
																			<div className='order-product__image__container'>
																				<div className='order-product__image'>
																					<Image
																						src={
																							item.product_image ||
																							'/images/not-available.png'
																						}
																						alt={Capitalize(
																							item.nombre_producto
																						)}
																						fill
																						style={{ objectFit: 'contain' }}
																						sizes='auto'
																					/>
																				</div>
																			</div>
																			<div className='order-product__info'>
																				<p>
																					<strong>{item.cantidad} x</strong>{' '}
																					<TruncateMarkup lines={3}>
																						<span>
																							{Capitalize(item.nombre_producto)}
																						</span>
																					</TruncateMarkup>
																				</p>
																				<p className='sku'>{item.sku}</p>
																			</div>
																		</div>
																	</a>
																</Link>
															))
														) : (
															<p>No hay artículos en esta orden.</p>
														)}
													</>
												)}

												{/* Bloque devoluciones */}
												{order.returns && order.returns.length > 0 && (
													<div className='returns-block'>
														<h3>Devoluciones</h3>
														{order.returns.map((ret) => {
															return (
																<div key={ret.id} className='return-card'>
																	<div className='return-card__header'>
																		<p>
																			<strong>
																				Estado de la devolución:{' '}
																				<span style={{ fontSize: '12px' }}>
																					{ret.status}
																				</span>
																			</strong>
																		</p>
																		{ret.return_tracking_url && (
																			<Link
																				href={ret.return_tracking_url}
																				legacyBehavior
																			>
																				<a target='_blank'>
																					<button className='btn-track'>
																						Rastrear devolución
																					</button>
																				</a>
																			</Link>
																		)}
																	</div>
																	<div className='return-items'>
																		{ret.return_items?.length > 0 ? (
																			ret.return_items.map((rItem) => {
																				const matched = order.items.find(
																					(i) => i.sku === rItem.sku
																				);
																				const productImg =
																					matched?.product_image ||
																					'/images/not-available.png';
																				const productSlug =
																					matched?.product_slug;

																				return (
																					<div
																						key={rItem.id}
																						className='return-item-block'
																					>
																						<Link
																							href={`/${productSlug || ''}`}
																							legacyBehavior
																						>
																							<a>
																								<div className='return-item__row'>
																									<div className='order-product__image__container'>
																										<div className='order-product__image'>
																											<Image
																												src={productImg}
																												alt={Capitalize(
																													rItem.nombre_producto
																												)}
																												fill
																												style={{
																													objectFit: 'contain',
																												}}
																												sizes='auto'
																											/>
																										</div>
																									</div>
																									<div className='return-item__info'>
																										<p>
																											<strong>
																												{
																													rItem.cantidad_devuelta
																												}{' '}
																												x
																											</strong>{' '}
																											<TruncateMarkup lines={3}>
																												<span>
																													{Capitalize(
																														rItem.nombre_producto
																													)}
																												</span>
																											</TruncateMarkup>
																										</p>
																										<p className='sku'>
																											{rItem.sku}
																										</p>
																									</div>
																								</div>
																							</a>
																						</Link>
																					</div>
																				);
																			})
																		) : (
																			<p>
																				No hay artículos en esta devolución.
																			</p>
																		)}
																	</div>
																</div>
															);
														})}
													</div>
												)}
											</div>

											<div className='order-card__content-right'>
												<h4>Acciones</h4>
												<button className='btn-action'>Facturación</button>
												<button className='btn-action'>Ver detalles</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}

					{!loading && orders.length === 0 && (
						<p>No tienes órdenes registradas todavía.</p>
					)}

					{/* Paginación para Desktop */}
					{!loading && (
						<ListProductsPagination
							pages={totalPages}
							pageActive={pageActive}
							refreshPage={refreshPage}
						/>
					)}
				</>
			)}

			{/* ESTILOS */}
			<style jsx>{`
				.shipment-block__header,
				.return-card__header {
					line-height: 2;
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

				.order-card__payment-form {
					display: flex;
					width: 100%;
					align-items: center;
					gap: 10px;
				}

				.order-card__payment-form__image {
					position: relative;
					width: 50px;
					height: 25px;
				}

				.orders__wrapper {
					padding: 20px;
					max-width: 1000px;
					margin: 0 auto;
				}
				.orders-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 20px;
				}
				.orders-header__info {
					font-size: 14px;
					color: #666;
				}
				.orders-filters {
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
					right: 45px; /* ubícalo un poco antes del botón de submit */
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
				.order-card {
					border: 1px solid #eaeaea;
					border-radius: 5px;
					background-color: #fff;
					padding: 20px;
					margin-bottom: 15px;
				}
				.order-card__header {
					display: flex;
					justify-content: space-between;
					margin-bottom: 30px;
				}
				.order-card__status {
					color: var(--primary-color, #e00028);
					font-size: 14px;
				}
				.order-card__delivery {
					font-weight: bold;
					font-size: 16px;
					margin: 5px 0 0 0;
				}
				.btn-track {
					background-color: var(--primary-color);
					color: #fff;
					border: none;
					padding: 8px 12px;
					border-radius: 4px;
					cursor: pointer;
				}
				.order-card__content {
					display: grid;
					grid-template-columns: 1fr 2fr 1fr;
					gap: 20px;
					margin-top: 10px;
				}
				.order-card__content-left p {
					margin: 5px 0;
					line-height: 1.5;
				}
				.order-card__content-right {
					text-align: left;
				}
				.order-card__content-right h4 {
					margin-bottom: 10px;
				}
				.btn-action {
					display: block;
					width: 100%;
					text-align: left;
					margin-bottom: 10px;
					padding: 8px 12px;
					border: 1px solid #ccc;
					background-color: #fff;
					border-radius: 4px;
					cursor: pointer;
					border-color: #e00028;
					color: #e00028;
				}
				.btn-action:hover {
					background-color: #f5f5f5;
				}
				.shipment-block {
					margin-bottom: 20px;
					border-bottom: 1px dashed #eaeaea;
					padding-bottom: 15px;
					line-height: 1.5;
				}
				.shipment-block:last-child {
					border-bottom: none;
				}
				.shipment-items {
					margin-top: 10px;
				}
				.shipment-item__row {
					display: flex;
					gap: 10px;
					margin-bottom: 10px;
				}
				.order-product__image__container {
					width: 80px;
					height: 80px;
					border: 1px solid #ddd;
					border-radius: 4px;
					background-color: #fff;
					flex-shrink: 0;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.order-product__image {
					position: relative;
					width: 70px;
					height: 70px;
				}
				.shipment-item__info {
					flex: 1;
				}
				.shipment-item-block {
				}
				.order-product {
					display: flex;
					gap: 10px;
					margin-bottom: 10px;
				}
				.order-product__info {
					flex: 1;
					line-height: 1.5;
				}
				.order-product__info .sku,
				.sku {
					font-size: 12px;
					color: #666;
					line-height: 1.5;
				}
				.returns-block {
					margin-top: 20px;
					padding-top: 15px;
					border-top: 1px dashed #eaeaea;
				}
				.return-card {
					margin-bottom: 20px;
					border-bottom: 1px dotted #eaeaea;
					padding-bottom: 10px;
					line-height: 1.5;
				}
				.return-items {
					margin-top: 10px;
				}
				.return-item__row {
					display: flex;
					gap: 10px;
					margin-bottom: 10px;
				}
				.return-item__info {
					flex: 1;
				}

				@media (max-width: 768px) {
					.order-card__header {
						flex-direction: column;
						gap: 10px;
					}
					.order-card__content {
						grid-template-columns: 1fr;
					}
					.order-card__content-right {
						margin-top: 10px;
					}
					.orders__wrapper {
						padding: 0px !important;
					}
					.orders-filters,
					.orders-header {
						padding: 10px;
						margin: 0;
						border-bottom: 1px solid #eaeaea;
					}
					.order-card__header {
						margin-bottom: 10px;
					}
				}
			`}</style>
		</div>
	);
}

export default UserOrdersList;
