import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../hooks/auth';
import { useRouter } from 'next/router';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import ListProductsPagination from '../ListProductsPagination/ListProductsPagination';
import { Preloader, TailSpin } from 'react-preloader-icon';

function UserOrdersList() {
	const { accessToken } = useAuth();
	const router = useRouter();

	// *** ESTADOS PARA LA LISTA DE ÓRDENES, PÁGINA Y PAGINACIÓN ***
	const [orders, setOrders] = useState([]);
	const [count, setCount] = useState(0);
	const [pageActive, setPageActive] = useState(1);
	const pageSize = 5; // Ajusta el valor a tu conveniencia
	const pages = Math.ceil(count / pageSize);

	// *** ESTADOS PARA LOADING, BÚSQUEDA Y RANGO DE TIEMPO ***
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [dateRange, setDateRange] = useState('3');
	// “3” representaría “Últimos 3 meses”, podrías poner “6” o “12” para otros rangos.

	// Función para traer las órdenes (incluye los parámetros de page, search, dateRange)
	const fetchOrders = async ({ page = 1, search = '', range = '3' } = {}) => {
		setLoading(true);
		try {
			// Arma la URL con query params
			const url = new URL('https://api.pccdnapi.com/orders/list/');
			url.searchParams.append('page', page);
			url.searchParams.append('search', search);
			url.searchParams.append('date_range', range);

			const resp = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (resp.ok) {
				const data = await resp.json();
				setOrders(data.results || []);
				setCount(data.count || 0);
			} else {
				console.error('Error al obtener las órdenes:', resp.statusText);
			}
		} catch (err) {
			console.error('Error de conexión:', err);
		} finally {
			setLoading(false);
		}
	};

	// Cada vez que cambie “accessToken” o “pageActive” o “searchTerm” o “dateRange”, recargamos
	useEffect(() => {
		if (accessToken) {
			fetchOrders({
				page: pageActive,
				search: searchTerm,
				range: dateRange,
			});
		}
	}, [accessToken, pageActive, searchTerm, dateRange]);

	// Función que refresca la página en la paginación
	const refreshPage = (page) => {
		setPageActive(page);
	};

	// Se dispara al presionar el botón “buscar”
	const handleSearch = () => {
		// Cuando hagas nueva búsqueda, regresas a la página 1
		setPageActive(1);
		// El searchTerm ya está en el estado “searchTerm”,
		// y el useEffect disparará fetchOrders con searchTerm actualizado
	};

	// Manejo de cambio del rango de meses
	const handleDateRangeChange = (e) => {
		setDateRange(e.target.value);
		setPageActive(1);
	};

	// Ejemplo de formateo de fecha de entrega
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

	return (
		<div className='orders__wrapper'>
			{/* Encabezado con la barra de búsqueda y filtro de rango */}
			<div className='orders-header'>
				<h1>Mis pedidos</h1>
				<div className='orders-header__info'>
					{/* Por ejemplo: "Mostrando 1 - 5 de 31 pedidos" */}
					{!loading && orders.length > 0 && (
						<span className='text--off'>
							Mostrando {(pageActive - 1) * pageSize + 1} -{' '}
							{(pageActive - 1) * pageSize + orders.length} de {count} pedidos
						</span>
					)}
				</div>
			</div>

			<div className='orders-filters'>
				{/* BARRA DE BÚSQUEDA */}
				<div className='search-bar'>
					<input
						type='text'
						placeholder='Buscar en mis pedidos'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onKeyDown={(e) => {
							// Permite buscar presionando Enter
							if (e.key === 'Enter') handleSearch();
						}}
					/>
					<button onClick={handleSearch}>
						<svg width='16' height='16' fill='currentColor' viewBox='0 0 16 16'>
							<path d='M11 6a5 5 0 1 1-1.001-9.999A5 5 0 0 1 11 6zm-7 0A7 7 0 1 0 11 0 7 7 0 0 0 4 6z' />
							<path d='M10.271 10.271a5.5 5.5 0 1 1 1.414-1.414l3.536 3.535-1.414 1.415-3.536-3.536z' />
						</svg>
					</button>
				</div>

				{/* SELECT DE RANGO DE TIEMPO */}
				<div className='date-range'>
					<select value={dateRange} onChange={handleDateRangeChange}>
						<option value='1'>Último mes</option>
						<option value='3'>Últimos 3 meses</option>
						<option value='6'>Últimos 6 meses</option>
						<option value='12'>Últimos 12 meses</option>
					</select>
				</div>
			</div>

			{loading && (
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

			{!loading && orders.length > 0 && (
				<div className='orders-list'>
					{orders.map((order) => {
						const orderNumber = `AB${order.id}`;
						const orderDate = order.created_at
							? new Date(order.created_at).toLocaleDateString('es-MX')
							: '';
						const paymentMethod =
							order.billing_forma_pago_full || 'Pago referenciado';
						const shippingName = order.shipping_full_name || 'Sin nombre';
						const shippingProvider = 'Estafeta Express';
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
										{order.items && order.items.length > 0 ? (
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
										<button className='btn-action btn-share'>Compartir</button>
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

			{/* Paginación */}
			<ListProductsPagination
				pages={pages}
				pageActive={pageActive}
				refreshPage={refreshPage}
			/>

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
				}
				.search-bar {
					display: flex;
					border: 1px solid #ccc;
					border-radius: 5px;
					overflow: hidden;
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
				.search-bar button:hover {
					background: #f5f5f5;
				}

				.date-range select {
					padding: 8px;
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

				/* Columna izquierda: información de la orden */
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

				/* Paginación */
				.pagination {
					margin-top: 20px;
					display: flex;
					gap: 10px;
				}
				.pagination button {
					padding: 10px 15px;
					background: var(--primary-color, #e00028);
					border: none;
					color: #fff;
					border-radius: 4px;
					cursor: pointer;
				}
				.pagination button:hover {
					background-color: #c7001b;
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
				}
			`}</style>
		</div>
	);
}

export default UserOrdersList;
