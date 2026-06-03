import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TruncateMarkup from 'react-truncate-markup';
import { Preloader, TailSpin } from 'react-preloader-icon';
// Hooks
import { useAuth } from '../../hooks/auth';
import { UseOrderDetails } from '../../hooks/UseOrderDetails';
// Utils
import Capitalize from '../../hooks/CapitalizeTitle';
import CurrencyFormat from '../../hooks/CurrencyFormat';
// Config
import { getPaymentOption } from '../constants/paymentOptions';

// Función para identificar el método de pago seleccionado
const selectedPayment = (paymentMethod) => getPaymentOption(paymentMethod);

export default function UserOrderDetail({ orderId }) {
	const { order, loading, error } = UseOrderDetails(orderId);
	const { accessToken } = useAuth();

	// Helper para formatear la fecha (mes en texto)
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

	// Manejo de estado / error / ausencia de orden
	if (loading) {
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
	if (error) return <p>Ocurrió un error: {error}</p>;
	if (!order) return <p>No se encontró la orden.</p>;

	// -------------------------------------------------
	// Datos principales
	// -------------------------------------------------
	const orderNumber = `#${order.id}`;
	let overallStatus = order.overall_status || 'En preparación';
	const dateLabel = formatDate(order.overall_date);
	let deliveredText = dateLabel
		? `${overallStatus} el ${dateLabel}`
		: overallStatus;

	order.status == 'PENDING' && (overallStatus = 'Pendiente de pago');
	order.status == 'PENDING' &&
		(deliveredText = 'El pago aún no ha sido aprobado o está siendo procesado');

	order.status == 'CANCELED' && (overallStatus = 'Cancelado');
	order.status == 'CANCELED' && (deliveredText = 'La compra fue cancelada');

	const orderDate = order.created_at
		? new Date(order.created_at).toLocaleDateString('es-MX')
		: '';

	// Datos de envío / dirección
	const shippingFullName = order.shipping_full_name || 'SIN NOMBRE';
	const shippingAddress1 = order.shipping_address_line_1 || '';
	const shippingAddress2 = order.shipping_address_line_2 || '';
	const shippingColonia = order.shipping_colonia || '';
	const shippingCity = order.shipping_city || '';
	const shippingState = order.shipping_state || '';
	const shippingZip = order.shipping_zip_code || '';
	const shippingPhone = order.shipping_phone || '';

	// Datos del método de pago
	const paymentMethodData = selectedPayment(order.payment_form);

	// -------------------------------------------------
	// Handler para scroll suave hacia la sección Factura
	// -------------------------------------------------
	const scrollToFactura = (e) => {
		e.preventDefault();
		const facturaDiv = document.getElementById('factura');
		if (facturaDiv) {
			facturaDiv.scrollIntoView({ behavior: 'smooth' });
		}
	};

	return (
		<div className='order-detail__container'>
			{/* ====== Encabezado / título ====== */}
			<div className='order-detail__header'>
				<h2>Detalle de la compra</h2>
				<nav className='breadcrumb'>
					<Link href='/mis-compras' legacyBehavior>
						<a>Mis compras</a>
					</Link>
					<span> / </span>
					<span>Detalle de la compra</span>
				</nav>
			</div>

			{/* ====== Layout en 2 columnas: principal y sidebar ====== */}
			<div className='order-detail__layout'>
				{/* Columna principal */}
				<div className='od-col od-col--main'>
					{/* Card: Información de la venta */}
					<div className='card'>
						<div className='card__body'>
							<h3 className='card__title'>Compra {orderNumber}</h3>
							<p>
								<strong>Fecha de compra:</strong> {orderDate} <br />
								<strong>Estado:</strong> {overallStatus} <br />
								{deliveredText}
							</p>
						</div>
					</div>

					{/* Card: Estado de envío (timeline) */}
					<div className='card'>
						<div className='card__body'>
							<h3 className='card__title'>Estado de envío</h3>
							{order.shipments && order.shipments.length > 0 ? (
								<div className='timeline'>
									{order.shipments.map((ship) => (
										<div key={ship.id} className='timeline__step'>
											<div className='timeline__bullet' />
											<div className='timeline__info'>
												<p>
													<strong>{ship.status}</strong> <br />
													{ship.tracking_number && ship.carrier && (
														<span>
															Guía: {ship.tracking_number} (
															{Capitalize(ship.carrier)})
														</span>
													)}
												</p>
												{ship.tracking_url && (
													<Link href={ship.tracking_url} legacyBehavior>
														<a target='_blank' className='btn-track'>
															Rastrear Envío
														</a>
													</Link>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<p>No hay envíos registrados aún.</p>
							)}
						</div>
					</div>

					{/* Card: Productos => agrupados por cada shipment */}
					<div className='card'>
						<div className='card__body'>
							<h3 className='card__title'>Productos</h3>
							{order.shipments && order.shipments.length > 0
								? order.shipments.map((ship) => (
										<div key={ship.id} className='shipment-products'>
											<h4>Envío: {ship.tracking_number}</h4>
											{ship.shipment_items.map((sItem) => {
												// Buscar el producto original en order.items
												const matchedItem = order.items.find(
													(i) => i.sku === sItem.sku
												);
												if (!matchedItem) return null;

												// Calcular subtotal => matchedItem.precio_unitario * sItem.cantidad_enviada
												// asumiendo que "precio_unitario" vive en matchedItem
												const pricePerUnit = parseFloat(
													matchedItem.precio_unitario || '0'
												);
												const totalPrice =
													pricePerUnit *
													parseFloat(sItem.cantidad_enviada || '1');

												return (
													<Link
														href={`/${matchedItem.product_slug}`}
														legacyBehavior
														key={matchedItem.id}
													>
														<a>
															<div className='product-row'>
																<div className='product-row__img'>
																	<Image
																		src={
																			matchedItem.product_image ||
																			'/images/not-available.png'
																		}
																		alt={Capitalize(
																			matchedItem.nombre_producto
																		)}
																		fill
																		style={{ objectFit: 'contain' }}
																		sizes='80px'
																	/>
																</div>
																<div className='product-row__info'>
																	<p>
																		<strong>{sItem.cantidad_enviada} x</strong>{' '}
																		<TruncateMarkup lines={2}>
																			<span>
																				{Capitalize(
																					matchedItem.nombre_producto
																				)}
																			</span>
																		</TruncateMarkup>
																	</p>
																	<p className='dim-text'>
																		SKU: {matchedItem.sku}
																	</p>
																	<p className='dim-text'>
																		Precio unitario:{' '}
																		{matchedItem.precio_unitario}
																	</p>
																</div>
																<div className='product-row__price'>
																	${CurrencyFormat(totalPrice)}
																</div>
															</div>
														</a>
													</Link>
												);
											})}
										</div>
								  ))
								: order.items?.map((item) => (
										<Link
											href={`/${item.product_slug}`}
											legacyBehavior
											key={item.id}
										>
											<a>
												<div className='product-row'>
													<div className='product-row__img'>
														<Image
															src={
																item.product_image ||
																'/images/not-available.png'
															}
															alt={Capitalize(item.nombre_producto)}
															fill
															style={{ objectFit: 'contain' }}
															sizes='80px'
														/>
													</div>
													<div className='product-row__info'>
														<p>
															<strong>{item.cantidad} x</strong>{' '}
															<TruncateMarkup lines={2}>
																<span>{Capitalize(item.nombre_producto)}</span>
															</TruncateMarkup>
														</p>
														<p className='dim-text'>SKU: {item.sku}</p>
														<p className='dim-text'>
															Precio unitario: {item.precio_unitario}
														</p>
													</div>

													<div className='product-row__price'>
														$ {CurrencyFormat(item.subtotal)}
													</div>
												</div>
											</a>
										</Link>
								  ))}
						</div>
					</div>

					{/* Card: Datos de envío */}
					<div className='card'>
						<div className='card__body'>
							<h3 className='card__title'>Datos del Envío</h3>
							<p>
								<strong>Envío a domicilio</strong> <br />
								{shippingFullName}
								<br />
								{shippingAddress1} {shippingAddress2}
								{shippingColonia && (
									<>
										<br />
										Col. {shippingColonia}
									</>
								)}
								<br />
								{shippingCity}, {shippingState}, C.P. {shippingZip}
								<br />
								Tel. {shippingPhone}
							</p>
						</div>
					</div>

					{/* Card: Datos de Facturación (Razón Social, RFC, etc.) */}
					<div className='card'>
						<div className='card__body'>
							<h3 className='card__title'>Datos para la factura</h3>
							{order.billing_razon_social ? (
								<p>
									<strong>Razón Social:</strong> {order.billing_razon_social}{' '}
									<br />
									<strong>RFC:</strong> {order.billing_rfc} <br />
									<strong>Código Postal:</strong> {order.billing_codigo_postal}{' '}
									<br />
									<strong>Uso de CFDI:</strong> {order.billing_uso_cfdi_full}{' '}
									<br />
									<strong>Régimen:</strong> {order.billing_regimen_full} <br />
									<strong>Forma de pago:</strong>{' '}
									{order.billing_forma_pago_full}
								</p>
							) : (
								<p>No se ingresaron datos de facturación (RFC genérico).</p>
							)}
						</div>
					</div>

					{/* Card: Factura => con id="factura" para poder hacer scroll suave */}
					<div className='card' id='factura'>
						<div className='card__body'>
							<h3 className='card__title'>Factura</h3>
							{order.factura_pdf || order.factura_xml ? (
								<>
									<p>
										<strong>Folio:</strong>{' '}
										{order.factura_folio || `#${order.id}`}
									</p>
									<p>
										<strong>Fecha de facturación:</strong>{' '}
										{order.facturacion_date
											? new Date(order.facturacion_date).toLocaleString('es-MX')
											: 'N/D'}
									</p>
									<p>
										<strong>Estado factura:</strong>{' '}
										{Capitalize(order.factura_state) || 'Pendiente'}
									</p>
									<p>
										<strong>Monto:</strong> ${CurrencyFormat(order.total)}
									</p>
									<p>
										<strong>Descarga:</strong>
									</p>
									<div
										style={{ display: 'flex', gap: '10px', marginTop: '6px' }}
									>
										{/* BOTONES TIPO btn-track */}
										{order.factura_pdf && (
											<a
												href={order.factura_pdf}
												download
												target='_blank'
												rel='noreferrer'
												className='btn-track'
											>
												Descargar PDF
											</a>
										)}
										{order.factura_xml && (
											<a
												href={order.factura_xml}
												download
												target='_blank'
												rel='noreferrer'
												className='btn-track'
											>
												Descargar XML
											</a>
										)}
									</div>
								</>
							) : (
								<p>Aún no se ha generado la factura.</p>
							)}
						</div>
					</div>

					{/* Card: Devoluciones, si existen */}
					{order.returns && order.returns.length > 0 && (
						<div className='card'>
							<div className='card__body'>
								<h3 className='card__title'>Devoluciones</h3>
								{order.returns.map((ret) => (
									<div key={ret.id} className='return-block'>
										<p>
											<strong>Estatus:</strong> {ret.status} <br />
											<strong>Reembolsado:</strong> ${ret.refund_amount}
										</p>
										{ret.return_tracking_url && (
											<Link href={ret.return_tracking_url} legacyBehavior>
												<a target='_blank' className='btn-track'>
													Rastrear devolución
												</a>
											</Link>
										)}
										{ret.return_items?.map((rItem) => (
											<div key={rItem.id} className='return-item'>
												<strong>{rItem.cantidad_devuelta}x</strong>{' '}
												{Capitalize(rItem.nombre_producto)} (SKU: {rItem.sku})
											</div>
										))}
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Columna lateral (sidebar): Resumen de pago, método de pago, etc. */}
				<div className='od-col od-col--side'>
					<div className='card side-summary'>
						<div className='card__body'>
							<div className='side-summary__price-row'>
								<span>Precio del producto(s)</span>
								<span>
									${' '}
									{CurrencyFormat(
										parseFloat(order.total) - parseFloat(order.shipping_cost)
									)}
								</span>
							</div>
							<div className='side-summary__price-row'>
								<span>Envíos</span>
								<span>$ {CurrencyFormat(order.shipping_cost)}</span>
							</div>
							<hr />
							<div className='side-summary__price-row side-summary__total'>
								<span>Total</span>
								<span>$ {CurrencyFormat(order.total)}</span>
							</div>

							{paymentMethodData && (
								<div className='payment-badge'>
									{/* Ojo: se cambió la forma de usar <Image fill> => se define tamaño contenedor */}
									<div className='payment-badge__image'>
										<Image
											src={paymentMethodData.imgSrc}
											alt={paymentMethodData.title}
											fill
											style={{ objectFit: 'contain' }}
											sizes='70px'
										/>
									</div>
								</div>
							)}
							<p className='dim-text small-note'>
								El total incluye impuestos e IVA, puedes revisar esta
								información en el detalle de Factura.
							</p>
							{/* Botón => scroll suave a Factura */}
							<button className='action-button--link' onClick={scrollToFactura}>
								Ir al detalle de Facturación
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* ====== ESTILOS ====== */}
			<style jsx>{`
				.order-detail__container {
					max-width: 100%;
					margin-left: 40px;
					padding: 20px;
				}

				.order-detail__header {
					margin-bottom: 20px;
				}
				.breadcrumb {
					font-size: 14px;
					margin-top: 5px;
				}
				.breadcrumb a {
					color: var(--primary-color);
					text-decoration: none;
				}
				.breadcrumb span {
					color: #555;
				}

				.order-detail__layout {
					display: flex;
					gap: 20px;
				}
				.od-col--main {
					flex: 1;
					min-width: 0;
				}
				.od-col--side {
					width: 300px;
					flex-shrink: 0;
				}

				.card {
					background: #fff;
					border: 1px solid #eaeaea;
					border-radius: 6px;
					margin-bottom: 20px;
					overflow: hidden;
				}
				.card__body {
					padding: 16px 20px;
				}
				.card__title {
					font-size: 16px;
					margin-bottom: 10px;
				}

				.card:hover .card__title {
					color: unset !important;
				}

				.dim-text {
					color: #666;
					font-size: 12px;
					margin-top: 2px;
				}

				/* Timeline de envíos */
				.timeline {
					position: relative;
					margin-left: 20px;
					padding-left: 20px;
					border-left: 2px solid #ddd;
				}
				.timeline__step {
					margin-bottom: 15px;
					position: relative;
				}
				.timeline__bullet {
					position: absolute;
					left: -10px;
					top: 5px;
					width: 10px;
					height: 10px;
					background: var(--primary-color);
					border-radius: 50%;
				}
				.timeline__info {
					margin-left: 10px;
					font-size: 14px;
					line-height: 1.5;
				}

				/* Agrupación de productos por shipment */
				.shipment-products {
					margin-bottom: 20px;
				}
				.shipment-products h4 {
					font-size: 15px;
					margin-bottom: 10px;
				}

				/* Productos */
				.product-row {
					display: flex;
					align-items: center;
					margin-bottom: 15px;
					gap: 10px;
				}
				.product-row__img {
					position: relative;
					width: 80px;
					height: 80px;
					flex-shrink: 0;
				}
				.product-row__info {
					flex: 1;
				}
				.product-row__price {
					font-weight: bold;
					min-width: 70px;
					text-align: right;
				}

				/* Devoluciones */
				.return-block {
					padding: 10px;
					background: #f9f9f9;
					border-radius: 4px;
					margin-bottom: 10px;
				}
				.return-item {
					font-size: 14px;
					margin-left: 15px;
				}

				/* Botones track /descargas */
				.btn-track {
					display: inline-block;
					margin-top: 5px;
					padding: 5px 10px;
					background: var(--primary-color);
					color: #fff;
					border-radius: 4px;
					font-size: 13px;
					text-decoration: none;
				}
				.btn-track:hover {
					background: #c7001f;
				}

				/* Sidebar resumen */
				.side-summary__price-row {
					display: flex;
					justify-content: space-between;
					margin: 6px 0;
				}
				.side-summary__price-row.side-summary__total {
					font-weight: bold;
				}
				.payment-badge {
					display: flex;
					align-items: center;
					justify-content: center;
					margin: 16px 0;
					width: 70px;
					height: 25px;
					position: relative;
				}
				.payment-badge__image {
					position: relative;
					width: 70px;
					height: 25px;
				}
				.dim-text.small-note {
					font-size: 12px;
				}
				.action-button--link {
					margin-top: 8px;
					background: transparent;
					border: none;
					color: var(--primary-color);
					cursor: pointer;
					font-size: 14px;
					text-decoration: underline;
				}
				.action-button--link:hover {
					opacity: 0.8;
				}

				/* Responsivo */
				@media (max-width: 992px) {
					.order-detail__layout {
						flex-direction: column;
					}
					.od-col--side {
						width: 100%;
					}

					.order-detail__container {
						margin: 0;
				`}</style>
		</div>
	);
}
