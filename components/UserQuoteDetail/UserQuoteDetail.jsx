import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Preloader, TailSpin } from 'react-preloader-icon';
import { useAuth } from '../../hooks/auth';
import { useQuoteDetails } from '../../hooks/useQuoteDetails';
import useCart from '../../hooks/useCart';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import { useRouter } from 'next/router';

export default function UserQuoteDetail({ quoteId }) {
	const { quote, loading, error } = useQuoteDetails(quoteId);
	const { accessToken, updateDataUser } = useAuth();
	const { clearCart, addToCart } = useCart();
	const router = useRouter();

	// Estado para controlar si se está procesando la compra
	const [isConvertingQuote, setIsConvertingQuote] = useState(false);
	// Estado para controlar si se está eliminando la cotización
	const [isDeletingQuote, setIsDeletingQuote] = useState(false);

	// Función para formatear fechas
	const formatDate = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('es-MX');
	};

	// Función para manejar la eliminación de cotización
	const handleDeleteQuote = async () => {
		if (!accessToken || !quote) return;

		if (
			window.confirm('¿Estás seguro de que deseas eliminar esta cotización?')
		) {
			try {
				setIsDeletingQuote(true);

				const resp = await fetch(
					`https://api.pccdnapi.com/quotes/delete/${quote.id}/`,
					{
						method: 'DELETE',
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);

				if (resp.ok) {
					// Redirigir a la página de cotizaciones
					router.push('/mis-cotizaciones');
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
			} finally {
				setIsDeletingQuote(false);
			}
		}
	};

	// Función para manejar la compra de la cotización
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

			// Mostrar indicador de carga
			setIsConvertingQuote(true);

			// 1. Limpiar carrito actual
			await clearCart();

			// 2. Esperar un momento para asegurar que el carrito se haya limpiado
			await new Promise((resolve) => setTimeout(resolve, 500));

			// 3. Configurar el método de pago (MSI/contado) según la cotización
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
		}
	};

	// Mostrar estado de carga
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

	// Mostrar mensaje de error
	if (error) {
		return (
			<div className='orders__wrapper'>
				<div className='error-message'>
					Error al cargar la cotización: {error}
				</div>
			</div>
		);
	}

	// Mostrar mensaje si no hay cotización
	if (!quote) {
		return (
			<div className='orders__wrapper'>
				<div className='error-message'>
					No se encontró la cotización solicitada.
				</div>
			</div>
		);
	}

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
	const validUntil = quote.valid_until ? new Date(quote.valid_until) : null;
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
	const quoteDate = formatDate(quote.created);
	const validUntilDate = formatDate(quote.valid_until);

	// Mensaje de validez personalizado
	let validityMessage = '';
	if (isExpired) {
		validityMessage = 'Esta cotización ha expirado';
	} else if (isTooOld) {
		validityMessage = 'Esta cotización ha superado los 10 días de vigencia';
	} else {
		validityMessage = `Válida hasta: ${validUntilDate}`;
	}

	return (
		<div className='orders__wrapper'>
			{/* Encabezado / título */}
			<div className='orders-header'>
				<h2>Detalle de cotización</h2>
				<nav className='breadcrumb'>
					<Link href='/mis-cotizaciones' legacyBehavior>
						<a>Mis cotizaciones</a>
					</Link>
					<span> / </span>
					<span>Detalle de cotización</span>
				</nav>
			</div>

			{/* Contenido principal - Usar una estructura similar a order-card */}
			<div className='order-card'>
				{/* Encabezado de la cotización */}
				<div className='order-card__header'>
					<div className='order-card__header-left'>
						<span className='order-card__status'>
							Estado: <strong className={statusClass}>{statusLabel}</strong>
						</span>
						<p className='order-card__delivery'>{validityMessage}</p>
					</div>
					<div className='order-card__header-right'>
						<span className='order-card__id'>Cotización #{quote.id}</span>
					</div>
				</div>

				{/* Contenido principal */}
				<div className='order-card__content'>
					{/* Col izq: datos globales */}
					<div className='order-card__content-left'>
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

					{/* Col central: productos */}
					<div className='order-card__content-center'>
						<h4>Productos</h4>
						<div className='products-list'>
							{quote.items && quote.items.length > 0 ? (
								<div className='table-responsive'>
									{quote.items.map((item) => (
										<div key={item.id} className='order-product'>
											<div className='order-product__image__container'>
												<div className='order-product__image__container__inner'>
													<div className='order-product__image'>
														{item.product_image_url && (
															<Image
																src={item.product_image_url}
																alt={item.product_titulo || 'Producto'}
																fill
																style={{ objectFit: 'contain' }}
																sizes='auto'
															/>
														)}
													</div>
												</div>
											</div>
											<div className='order-product__info'>
												<p>
													<strong>{item.quantity} x</strong>{' '}
													{item.product_slug ? (
														<Link href={`/${item.product_slug}`} legacyBehavior>
															<a>{item.product_titulo}</a>
														</Link>
													) : (
														item.product_titulo
													)}
												</p>
												<p className='sku'>SKU: {item.product_sku}</p>
												<p className='price'>
													Precio: ${CurrencyFormat(item.price_unit)} | Subtotal:
													${CurrencyFormat(item.subtotal)}
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
					<div className='order-card__content-right'>
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

						{/* Botón de descargar PDF */}
						{quote.pdf && (
							<div className='quote-actions'>
								<a
									href={quote.pdf}
									className='btn-action btn-download'
									target='_blank'
									rel='noopener noreferrer'
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
							</div>
						)}

						{/* Botón de compra */}
						{!isEffectivelyExpired && quote.status !== 'CONVERTED' && (
							<div className='quote-actions'>
								<button
									className={`btn-action ${isConvertingQuote ? 'loading' : ''}`}
									onClick={() => handleBuyQuote(quote)}
									disabled={isConvertingQuote}
								>
									{isConvertingQuote ? (
										<span className='loading-text'>
											<span className='loading-dots'></span>
										</span>
									) : (
										'Comprar cotización'
									)}
								</button>
							</div>
						)}

						{/* Botón para eliminar cotización */}
						{quote.status !== 'CONVERTED' && (
							<div className='quote-actions'>
								<button
									className={`btn-action btn-delete ${
										isDeletingQuote ? 'loading' : ''
									}`}
									onClick={handleDeleteQuote}
									disabled={isDeletingQuote}
								>
									{isDeletingQuote ? (
										<span className='loading-text'>
											<span className='loading-dots'></span>
										</span>
									) : (
										<>
											<span className='delete-icon'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 24 24'
													width='18'
													height='18'
													fill='currentColor'
												>
													<path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
												</svg>
											</span>
											Eliminar cotización
										</>
									)}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			<style jsx>{`
				.orders__wrapper {
					max-width: 1200px;
					margin: 0 auto;
					padding: 20px;
				}

				.orders-header {
					margin-bottom: 20px;
					padding-bottom: 15px;
					border-bottom: 1px solid #eaeaea;
				}

				.orders-header h2 {
					font-size: 24px;
					margin-bottom: 8px;
				}

				.breadcrumb {
					font-size: 14px;
					color: #666;
				}

				.breadcrumb a {
					color: var(--primary-color);
					text-decoration: none;
				}

				.order-card {
					background: white;
					border-radius: 8px;
					border: 1px solid #eaeaea;
					margin-bottom: 20px;
					overflow: hidden;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
				}

				.order-card__header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 15px 20px;
					background-color: #f7f7f7;
					border-bottom: 1px solid #eaeaea;
				}

				.order-card__header-left,
				.order-card__header-right {
					display: flex;
					flex-direction: column;
				}

				.order-card__status {
					font-size: 15px;
					margin-bottom: 4px;
				}

				.order-card__status strong {
					font-weight: 600;
				}

				.order-card__status strong.expired {
					color: #dc3545;
				}

				.order-card__status strong.converted {
					color: #28a745;
				}

				.order-card__status strong.active {
					color: #007bff;
				}

				.order-card__delivery {
					font-size: 13px;
					color: #666;
					margin: 0;
				}

				.order-card__id {
					font-weight: 600;
					color: #333;
				}

				.order-card__content {
					display: grid;
					grid-template-columns: 1fr 1.5fr 1fr;
					gap: 20px;
					padding: 20px;
				}

				.order-card__content-left,
				.order-card__content-center,
				.order-card__content-right {
					display: flex;
					flex-direction: column;
				}

				.order-card__content-left p,
				.order-card__content-center p {
					margin: 0 0 10px;
				}

				.client-data,
				.invoice-data {
					margin-top: 15px;
				}

				.client-data h4,
				.invoice-data h4,
				.order-card__content-center h4,
				.order-card__content-right h4 {
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

				.btn-action {
					display: block;
					width: 100%;
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
					margin-bottom: 10px;
				}

				.btn-action:disabled {
					opacity: 0.7;
					cursor: not-allowed;
				}

				.btn-action.loading {
					cursor: wait;
					opacity: 0.8;
				}

				.btn-download {
					display: flex;
					align-items: center;
					justify-content: center;
					border: 1px solid var(--primary-color);
					background-color: unset;
					color: var(--primary-color);
				}

				.download-icon {
					display: inline-flex;
					margin-right: 8px;
				}

				.loading-container {
					display: flex;
					justify-content: center;
					align-items: center;
					min-height: calc(100vh - 150px);
					width: 100%;
					position: relative;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
				}

				.error-message {
					padding: 20px;
					background-color: #f8d7da;
					color: #721c24;
					border-radius: 8px;
					text-align: center;
					margin: 20px auto;
					max-width: 600px;
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
					.order-card__header {
						flex-direction: column;
						gap: 10px;
					}
					.order-card__content {
						grid-template-columns: 1fr;
					}
					.order-card__content-center,
					.order-card__content-right {
						margin-top: 10px;
					}
					.orders__wrapper {
						padding: 10px;
						margin: 0;
					}
					.orders-header {
						padding: 10px;
						margin: 0;
						border-bottom: 1px solid #eaeaea;
					}
					.loading-container {
						min-height: calc(100vh - 100px);
					}
				}

				.btn-delete {
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #ffb116;
					color: white;
				}

				.delete-icon {
					display: inline-flex;
					margin-right: 8px;
				}
			`}</style>
		</div>
	);
}
