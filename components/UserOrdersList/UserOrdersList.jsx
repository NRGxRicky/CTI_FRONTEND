import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../hooks/auth';
import { useRouter } from 'next/router';
import { useAppSelector } from '../../lib/hooks';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Preloader, TailSpin } from 'react-preloader-icon';

import CurrencyFormat from '../../hooks/CurrencyFormat';
import ListProductsPagination from '../ListProductsPagination/ListProductsPagination';

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

	const [loading, setLoading] = useState(false);

	const [searchTerm, setSearchTerm] = useState('');
	const [dateRange, setDateRange] = useState('3');

	// Para infinite scroll
	const [hasMore, setHasMore] = useState(true);

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
		// 1) Si no hay accessToken, no hacemos nada
		if (!accessToken) return;

		// 2) Si estamos en modo ESCRITORIO,
		//    cada vez que cambie pageActive, searchTerm o dateRange
		//    recargamos con isConcat=false
		if (!mobileView) {
			fetchOrders(
				{
					page: pageActive,
					search: searchTerm,
					range: dateRange,
				},
				false
			);
		}
		// 3) Si estamos en modo MÓVIL,
		//    solamente recargamos “normal” cuando pageActive===1
		//    (p.ej. cuando el usuario cambió la búsqueda o reseteó)
		else {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accessToken, searchTerm, dateRange, pageActive, mobileView]);

	// -----------------------------------------------------
	// Búsqueda => click “Buscar” o Enter
	// -----------------------------------------------------
	const handleSearch = () => {
		// Reseteamos a página 1
		setPageActive(1);
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

		// Llamada con isConcat
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
	// Formateo de fecha (ejemplo)
	// -----------------------------------------------------
	const getDeliveryDateText = (order) => {
		const deliveredDate = order.updated_at || order.created_at;
		const dateObj = new Date(deliveredDate);
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
		return `Entregado el ${day} de ${monthName}`;
	};

	// -----------------------------------------------------
	// Render
	// -----------------------------------------------------
	return (
		<div className='orders__wrapper'>
			{/* Encabezado con búsqueda y rango */}
			{!mobileView && (
				<div className='orders-header'>
					<h1>Mis Compras</h1>
					<div className='orders-header__info'>
						{!loading && orders.length > 0 && (
							<span className='text--off'>
								Mostrando {(pageActive - 1) * pageSize + 1} -{' '}
								{(pageActive - 1) * pageSize + orders.length} de {count} pedidos
							</span>
						)}
					</div>
				</div>
			)}
			<div className='orders-filters'>
				<div className='search-bar'>
					<input
						type='text'
						placeholder='Buscar en mis pedidos'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					/>
					<button onClick={handleSearch}>
						<svg
							className='search-bar__icon icon__ligth'
							width='25'
							height='20'
							viewBox='5 0 20 20'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M18.319 14.4326C20.7628 11.2941 20.542 6.75347 17.6569 3.86829C14.5327 0.744098 9.46734 0.744098 6.34315 3.86829C3.21895 6.99249 3.21895 12.0578 6.34315 15.182C9.22833 18.0672 13.769 18.2879 16.9075 15.8442C16.921 15.8595 16.9351 15.8745 16.9497 15.8891L21.1924 20.1317C21.5829 20.5223 22.2161 20.5223 22.6066 20.1317C22.9971 19.7412 22.9971 19.1081 22.6066 18.7175L18.364 14.4749C18.3493 14.4603 18.3343 14.4462 18.319 14.4326ZM16.2426 5.28251C18.5858 7.62565 18.5858 11.4246 16.2426 13.7678C13.8995 16.1109 10.1005 16.1109 7.75736 13.7678C5.41421 11.4246 5.41421 7.62565 7.75736 5.28251C10.1005 2.93936 13.8995 2.93936 16.2426 5.28251Z'
								fill='currentColor'
							/>
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

			{loading && !mobileView && (
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
			)}

			{/* MOBILE => SCROLL INFINITO | DESKTOP => PAGINACION */}
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
						}
					>
						{orders.map((order) => {
							const orderNumber = `AB${order.id}`;
							const orderDate = order.created_at
								? new Date(order.created_at).toLocaleDateString('es-MX')
								: '';
							const paymentMethod =
								order.billing_forma_pago_full || 'Pago referenciado';
							const shippingProvider = 'Estafeta Express';
							const shippingName = order.shipping_full_name || 'Sin nombre';
							const statusText = order.status || 'Entregado';
							const deliveredText = getDeliveryDateText(order);

							return (
								<div key={order.id} className='order-card'>
									<div className='order-card__header'>
										<div className='order-card__header-left'>
											<span className='order-card__status'>
												Estatus: <strong>{statusText}</strong>
											</span>
											<p className='order-card__delivery'>{deliveredText}</p>
										</div>
										<div className='order-card__header-right'>
											<p>
												<strong>Enviado por:</strong> {shippingProvider}
											</p>
											<button className='btn-track'>Rastrear pedido</button>
										</div>
									</div>

									<div className='order-card__content'>
										<div className='order-card__content-left'>
											<p>
												<strong>Pedido y fecha:</strong> {orderNumber} &bull;{' '}
												{orderDate}
											</p>
											<p>
												<strong>Método de pago:</strong> {paymentMethod}
											</p>
											<p>
												<strong>Total:</strong> ${order.total}
											</p>
											<p>
												<strong>Enviado a:</strong> {shippingName}
											</p>
											<div className='order-card__content-actions'>
												<button className='btn-factura'>Facturación</button>
											</div>
										</div>

										<div className='order-card__content-center'>
											{order.items?.length > 0 ? (
												order.items.map((item) => (
													<div key={item.id} className='order-product'>
														<div className='order-product__image'>
															<Image
																src={
																	item.product_image ||
																	'/images/not-available.png'
																}
																alt={item.nombre_producto}
																fill
																style={{ objectFit: 'contain' }}
																sizes='auto'
															/>
														</div>
														<div className='order-product__info'>
															<p>
																<strong>{item.cantidad}x</strong>{' '}
																{item.nombre_producto}
															</p>
															<p className='sku'>{item.sku}</p>
														</div>
													</div>
												))
											) : (
												<p>No hay artículos en esta orden.</p>
											)}
										</div>

										<div className='order-card__content-right'>
											<h4>Acciones</h4>
											<button className='btn-action btn-return'>
												Solicitar devolución
											</button>
											<button className='btn-action btn-warranty'>
												Solicitar garantía
											</button>
											<button className='btn-action btn-share'>
												Compartir
											</button>
											<button className='btn-action btn-more'>
												Ver más acciones
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</InfiniteScroll>
				</div>
			) : (
				<>
					{!loading && orders.length > 0 && (
						<div className='orders-list'>
							{orders.map((order) => {
								const orderNumber = `AB${order.id}`;
								const orderDate = order.created_at
									? new Date(order.created_at).toLocaleDateString('es-MX')
									: '';
								const paymentMethod =
									order.billing_forma_pago_full || 'Pago referenciado';
								const shippingProvider = 'Estafeta Express';
								const shippingName = order.shipping_full_name || 'Sin nombre';
								const statusText = order.status || 'Entregado';
								const deliveredText = getDeliveryDateText(order);

								return (
									<div key={order.id} className='order-card'>
										<div className='order-card__header'>
											<div className='order-card__header-left'>
												<span className='order-card__status'>
													Estatus: <strong>{statusText}</strong>
												</span>
												<p className='order-card__delivery'>{deliveredText}</p>
											</div>
											<div className='order-card__header-right'>
												<p>
													<strong>Enviado por:</strong> {shippingProvider}
												</p>
												<button className='btn-track'>Rastrear pedido</button>
											</div>
										</div>

										<div className='order-card__content'>
											<div className='order-card__content-left'>
												<p>
													<strong>Pedido y fecha:</strong> {orderNumber} &bull;{' '}
													{orderDate}
												</p>
												<p>
													<strong>Método de pago:</strong> {paymentMethod}
												</p>
												<p>
													<strong>Total:</strong> ${order.total}
												</p>
												<p>
													<strong>Enviado a:</strong> {shippingName}
												</p>
												<div className='order-card__content-actions'>
													<button className='btn-factura'>Facturación</button>
												</div>
											</div>

											<div className='order-card__content-center'>
												{order.items?.length > 0 ? (
													order.items.map((item) => (
														<div key={item.id} className='order-product'>
															<div className='order-product__image'>
																<Image
																	src={
																		item.product_image ||
																		'/images/not-available.png'
																	}
																	alt={item.nombre_producto}
																	fill
																	style={{ objectFit: 'contain' }}
																	sizes='auto'
																/>
															</div>
															<div className='order-product__info'>
																<p>
																	<strong>{item.cantidad}x</strong>{' '}
																	{item.nombre_producto}
																</p>
																<p className='sku'>{item.sku}</p>
															</div>
														</div>
													))
												) : (
													<p>No hay artículos en esta orden.</p>
												)}
											</div>

											<div className='order-card__content-right'>
												<h4>Acciones</h4>
												<button className='btn-action btn-return'>
													Solicitar devolución
												</button>
												<button className='btn-action btn-warranty'>
													Solicitar garantía
												</button>
												<button className='btn-action btn-share'>
													Compartir
												</button>
												<button className='btn-action btn-more'>
													Ver más acciones
												</button>
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
					<ListProductsPagination
						pages={totalPages}
						pageActive={pageActive}
						refreshPage={refreshPage}
					/>
				</>
			)}

			{/* ESTILOS */}
			<style jsx>{`
				.cart__loading {
					position: absolute;
					width: 100%;
					top: 50dvh;
					left: 0px;
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

				.orders__wrapper {
					padding: 20px;
					max-width: 1000px;
					margin: 0 auto;
				}
				.orders-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 10px;
				}
				.orders-header__info {
					font-size: 14px;
					color: #666;
				}

				/* Barra de búsqueda y selector de rango */
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
				}
				.search-bar input {
					border: none;
					padding: 8px;
					width: 200px;
					outline: none;
				}
				.search-bar button {
					background: #fff;
					border: none;
					cursor: pointer;
					padding: 8px 12px;
					display: flex;
					align-items: center;
					color: #666;
				}
				.search-bar button:hover,
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

				/* Tarjetas de las órdenes */
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
					margin-bottom: 10px;
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
					background-color: #007bff;
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

				/* Columna izquierda: info orden */
				.order-card__content-left p {
					margin: 5px 0;
				}
				.order-card__content-actions {
					margin-top: 10px;
				}
				.btn-factura {
					background-color: #ffffff;
					color: var(--primary-color, #e00028);
					border: 1px solid var(--primary-color, #e00028);
					padding: 8px 12px;
					border-radius: 4px;
					cursor: pointer;
				}
				.btn-factura:hover {
					background-color: #f9f9f9;
				}

				/* Columna central: lista de productos */
				.order-product {
					display: flex;
					gap: 10px;
					margin-bottom: 10px;
				}
				.order-product__image {
					position: relative;
					width: 80px;
					height: 80px;
					border: 1px solid #ddd;
					border-radius: 4px;
					background-color: #fff;
					flex-shrink: 0;
				}
				.order-product__info {
					flex: 1;
				}
				.order-product__info .sku {
					font-size: 12px;
					color: #666;
				}

				/* Columna derecha: acciones */
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
					color: #333;
					border-radius: 4px;
					cursor: pointer;
				}
				.btn-action:hover {
					background-color: #f5f5f5;
				}
				.btn-return {
					border-color: #e00028;
					color: #e00028;
				}
				.btn-warranty {
					border-color: #007bff;
					color: #007bff;
				}
				.btn-share {
					border-color: #28a745;
					color: #28a745;
				}

				/* Responsivo */
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
				}
			`}</style>
		</div>
	);
}

export default UserOrdersList;
