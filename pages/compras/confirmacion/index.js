import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CurrencyFormat from '../../../hooks/CurrencyFormat';
import Image from 'next/image';
import { useAuth } from '../../../hooks/auth';
import FooterMini from '../../../components/FooterMini/FooterMini';
import BenefitCarousel from '../../../components/BenefitCarousel/BenefitCarousel';
import { useEnv } from '../../../context/EnvContext';
import TruncateMarkup from 'react-truncate-markup';
import { Preloader, TailSpin } from 'react-preloader-icon';
import Capitalize from '../../../hooks/CapitalizeTitle';
import Router from 'next/router';
import Head from 'next/head';
export const metadata = {
	title: 'Resumen de la compra',
};

const Index = () => {
	const router = useRouter();
	const { orderId } = router.query;
	const { accessToken, username, loading, isAuthenticated } = useAuth();

	const [order, setOrder] = useState(null);
	const [loadingData, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const {
		storeName
	} = useEnv();

	useEffect(() => {
		if (!accessToken) return;
		if (!orderId) return;


		
		const fetchOrder = async () => {
			try {
				const response = await fetch(
					`https://api.pccdnapi.com/orders/${orderId}/`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					setOrder(data);
				} else {
					const errData = await response.json();
					setError(errData.detail || 'Error al obtener la orden.');
				}
			} catch (err) {
				console.error(err);
				setError('Error de conexión al obtener la orden.');
			} finally {
				setLoading(false);
			}
		};

		fetchOrder();
	}, [orderId, accessToken]);

	// === Nuevo handlePrintOrder con body.classList:
	const handlePrintOrder = () => {
		document.body.classList.add('print-mode');
		window.print();
		window.onafterprint = () => {
			document.body.classList.remove('print-mode');
		};
	};

	// Ruta para ver pedido (ajusta a tu preferencia)
	const handleViewOrder = () => {
		router.push(`/mis-compras/${orderId}`);
	};

	if (!loading && !isAuthenticated) {
		Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
	}

	if (loadingData) {
		return (
			<div className='loading'>
				<div className='loading__loader'>
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
						.loading {
							width: 100%;
							height: 50dvh;
						}

						.loading__loader {
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 10px;
							height: 100%;
						}
					`}
				</style>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container'>
				<h2>Error</h2>
				<p>{error}</p>
				<button onClick={() => router.push('/')}>Volver a la tienda</button>
			</div>
		);
	}

	if (!order) {
		return (
			<div>
				<h2>No se encontró la orden</h2>
				<button onClick={() => router.push('/')}>Volver a la tienda</button>
			</div>
		);
	}

	return (
		<div className='container'>
			<Head>
				<title>
					Gracias por tu compra, Resumen de tu compra #{orderId} | {storeName}
				</title>
				<meta
					name='description'
					content={`Gracias por tu compra, aquí puedes ver los detalles de la orden #${orderId}.`}
				/>
			</Head>
			{/* Nuestra sección principal con la clase .confirmation-page */}
			<div className='confirmation-page'>
				<h1>¡Gracias por tu compra!</h1>
				<hr className='separator' />

				<p>
					Tu pedido ha sido confirmado exitosamente. Se ha enviado la
					información del pedido al correo: <strong>{username}</strong>.
				</p>
				<br />
				<p>
					Tu pedido puede tomar hasta 48 horas hábiles para ser procesado. Una
					vez que se haya enviado, recibirás un correo de confirmación con los
					detalles del envío y el número de seguimiento de la paquetería.
				</p>
				<br />
				<p>
					Próximamente recibirás la factura con el monto total de tu pedido,
					incluidos los gastos de envío. Esta se generará de manera automática.
				</p>
				<hr className='separator' />

				<div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
					<a onClick={handlePrintOrder} className='print-button'>
						Imprimir Pedido
					</a>
				</div>

				<h2>Detalles de la Orden #{order.id}</h2>
				<div className='order-details'>
					<h3 style={{ marginBottom: 10 }}>Productos:</h3>
					<table className='order-table'>
						<thead>
							<tr>
								<th></th>
								<th>Producto</th>
								<th>Cantidad</th>
								<th>Precio Unitario</th>
								<th className='subtotal-column'>Subtotal</th>
							</tr>
						</thead>
						<tbody>
							{order.items.map((item) => (
								<tr key={item.id}>
									<td>
										<div className='product__image'>
											<Image
												src={
													item.product_image
														? item.product_image
														: '/images/not-available.png'
												}
												fill
												style={{ objectFit: 'contain' }}
												alt={Capitalize(item.nombre_producto)}
												draggable='false'
												sizes='auto'
												loading='lazy'
											/>
										</div>
									</td>
									<td>
										<TruncateMarkup lines={2}>
											<span>{Capitalize(item.nombre_producto)}</span>
										</TruncateMarkup>
									</td>
									<td>{item.cantidad}</td>
									<td>$ {CurrencyFormat(item.precio_unitario, 2, '.', ',')}</td>
									<td>$ {CurrencyFormat(item.subtotal, 2, '.', ',')}</td>
								</tr>
							))}
						</tbody>
					</table>

					<div className='totals-section'>
						<p>
							<strong>Envío:</strong> ${' '}
							{CurrencyFormat(order.shipping_cost, 2, '.', ',')}
						</p>
						<p>
							<strong>Total:</strong> ${' '}
							{CurrencyFormat(order.total, 2, '.', ',')}
						</p>
					</div>

					<hr className='separator' />

					<h3>Datos de Envío:</h3>
					{order.shipping_address_line_1 ? (
						<div>
							<p>{order.shipping_full_name}</p>
							<p>Teléfono: {order.shipping_phone}</p>
							<p>
								Dirección: {order.shipping_address_line_1}
								{order.shipping_address_line_2
									? ` Int. ${order.shipping_address_line_2}`
									: ''}
								, {order.shipping_colonia}, {order.shipping_city},{' '}
								{order.shipping_state}, C.P. {order.shipping_zip_code}
							</p>
						</div>
					) : (
						<p>No se registró dirección de envío.</p>
					)}

					<hr className='separator' />

					<h3>Datos de Facturación:</h3>
					{order.billing_razon_social ? (
						<div>
							<p>Razón social: {order.billing_razon_sociall}</p>
							<p>RFC: {order.billing_rfc}</p>
							<p>Uso de CFDI: {order.billing_uso_cfdi_full}</p>
							<p>Régimen: {order.billing_regimen_full}</p>
							<p>Forma de Pago: {order.billing_forma_pago_full}</p>
							<p>C.P.: {order.billing_codigo_postal}</p>
						</div>
					) : (
						<p>No se ingresaron datos de facturación (RFC genérico).</p>
					)}
				</div>

				<div className='order__actions-buttons'>
					<div>
						<button
							onClick={() => router.push('/')}
							className='continue-shopping'
						>
							Continuar comprando
						</button>
					</div>
					<div>
						<button onClick={handleViewOrder} className='go-order-button'>
							Ver Pedido
						</button>
					</div>
				</div>
			</div>

			{/* Aún quieres BenefitCarousel y FooterMini visibles en la vista normal, 
          pero posiblemente los ocultes en la impresión */}
			<BenefitCarousel />
			<FooterMini />

			{/* ESTILOS LOCALES */}
			<style jsx>{`
				.order-table .subtotal-column {
					width: 100px; 
				}
				.product__image {
					position: relative;
					width: 60px;
					height: 60px;
				}
				.order__actions-buttons {
					width: 100%;
					display: flex;
					flex-direction: row;
					gap: 10px;
					justify-content: center;
					align-items: center;
					margin-top: 20px;
				}
				.confirmation-page {
					max-width: 800px;
					margin: 0 auto;
					padding: 20px;
					color: #333;
					line-height: 1.5;
					border: 1px solid #eaeaea;
					border-radius: 5px;
				}
				h1 {
					text-align: center;
					margin-bottom: 20px;
				}
				h2 {
					margin-top: 30px;
					margin-bottom: 10px;
				}
				.order-table {
					width: 100%;
					border-collapse: collapse;
					margin-bottom: 20px;
				}
				.order-table th,
				.order-table td {
					border: 1px solid #eaeaea;
					padding: 10px;
					text-align: center;
				}
				.order-table th {
					background-color: #f2f2f2;
				}
				.totals-section {
					text-align: right;
					margin-top: 10px;
					font-size: 16px;
				}
				.separator {
					border: none;
					border-top: 1px solid #eaeaea;
					margin: 20px 0;
				}
				.continue-shopping,
				.go-order-button {
					display: block;
					padding: 10px 20px;
					background-color: var(--primary-color);
					color: #fff;
					border: none;
					border-radius: 5px;
					cursor: pointer;
					font-size: 16px;
				}
				.go-order-button {
					background-color: #fff;
					border: 1px solid var(--primary-color);
					color: var(--primary-color);
				}
				.continue-shopping:hover {
					background-color: #e00028;
				}
				.print-button {
					color: var(--primary-color);
					text-decoration: underline;
					cursor: pointer;
				}
				@media only screen and (max-width: 600px) {
					.order-table th,
					.order-table td {
						padding: 5px;
					}
					.confirmation-page {
						padding: 10px;
					}
					.order-table {
						font-size: 12px;
					}
					.totals-section {
						font-size: 14px;
					}
				}
			`}</style>

			{/* ESTILOS GLOBALES PARA PRINT (Enfoque A) */}
			<style jsx global>{`
				@media print {
					html,
					body,
					#__next {
						height: auto !important;
						overflow: visible !important;
					}

					/* Si deseas ocultar BenefitCarousel y FooterMini, especifícalos: */
					.benefit-carousel,
					.footer-mini {
						display: none !important;
					}

					/* 
            Solo mostrar .confirmation-page
            => Si hay otros contenedores padres con overflow o position
               que generan problemas, intenta poner display:block en 
               .container, o ajusta tu layout.
          */
					body.print-mode .container > *:not(.confirmation-page) {
						display: none !important;
					}

					body.print-mode .header-bar > *:not(.confirmation-page) {
						display: none !important;
					}

					.carousel-container,
					.whatsapp-icon {
						display: none !important;
					}

					/* 
            Asegura que .confirmation-page se vea y ocupe varias páginas
          */
					body.print-mode .confirmation-page {
						display: block !important;
						position: static !important;
						width: 100% !important;
						margin: 0 !important;
						padding: 0 !important;
						overflow: visible !important;
					}

					/* Evita partir filas de la tabla */
					body.print-mode .confirmation-page table,
					body.print-mode .confirmation-page tr,
					body.print-mode .confirmation-page td,
					body.print-mode .confirmation-page th {
						page-break-inside: avoid;
					}

					@page {
						margin: 20mm; /* Ajusta si quieres más/menos margen */
					}
				}
			`}</style>
		</div>
	);
};

export default Index;
