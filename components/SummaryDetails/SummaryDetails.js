import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { showPaymentsChange } from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch } from '../../lib/hooks';
import { useAuth } from '../../hooks/auth';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import useCart from '../../hooks/useCart';

const SummaryDetails = ({ urlAction, step }) => {
	const {
		cart,
		subtotal,
		shipping,
		total,
		address,
		paymentMethod,
		setPaymentMethod,
	} = useCart();
	const dispatch = useAppDispatch();
	const { cartMsi } = useAuth();

	// Referencia donde se montará el botón de PayPal
	const paypalRef = useRef(null);

	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			window.paypal &&
			paypalRef.current &&
			paymentMethod === 'paypal' &&
			step === 'confirm'
		) {

			// Evita re-render si ya fue renderizado:
			if (paypalRef.current.innerHTML.trim() !== '') {
				// Ya hay botones renderizados. No hagas nada más.
				return;
			}

			window.paypal
				.Buttons({
					style: {
						layout: 'vertical',
						color: 'blue',
						shape: 'rect',
						label: 'checkout',
					},

					// Paso 1: crear orden
					createOrder: (data, actions) => {
						// 1) Generar array de ítems y convertir precios a número
						const items = cart.map((item) => {
							let unitPrice = cartMsi
								? (item.product.precio_final_descuento > 0
									? item.product.precio_final_descuento
									: item.product.precio_final)
								: item.product.precio_contado;

							// Convertir a número para usar toFixed():
							unitPrice = parseFloat(unitPrice) || 0;

							return {
								name: item.product.titulo?.substring(0, 127) || 'Producto',
								unit_amount: {
									currency_code: 'MXN',
									value: unitPrice.toFixed(2),
								},
								quantity: item.quantity.toString(),
								description: item.product.sku || 'SKU no disponible',
								category: 'PHYSICAL_GOODS',
							};
						});

						// 2) Crear dirección de envío
						const shippingAddress = {
							address_line_1:
								address.calle +
								' ' +
								address.numero +
								(address.numero_interior ? ` Int. ${address.numero_interior}` : ''),
							admin_area_2: address.ciudad,   // ciudad
							admin_area_1: address.estado,   // estado
							postal_code: address.codigo_postal,
							country_code: 'MX',
						};

						// 3) Calcular totales
						const itemTotal = items.reduce((acc, it) => {
							return acc + parseFloat(it.unit_amount.value) * parseInt(it.quantity, 10);
						}, 0);

						const shippingCost = shipping;
						const totalToPay = (itemTotal + shippingCost).toFixed(2);

						// 4) Definir descripción global para la orden:
						let description;
						if (cart.length === 1) {
							// Usa el nombre del primer (y único) producto (o un fallback)
							description = cart[0].product.titulo?.substring(0, 127)
								|| 'Producto único';
						} else {
							// Tienes varios productos
							description = `Compra de ${cart.length} artículos`;
						}

						// 5) Retornar la creación de la orden
						return actions.order.create({
							purchase_units: [
								{
									description,  // Aquí inyectas la descripción calculada
									amount: {
										currency_code: 'MXN',
										value: totalToPay,
										breakdown: {
											item_total: {
												currency_code: 'MXN',
												value: itemTotal.toFixed(2),
											},
											shipping: {
												currency_code: 'MXN',
												value: shippingCost.toFixed(2),
											},
										},
									},
									items,
									shipping: {
										address: shippingAddress,
									},
								},
							],
							application_context: {
								shipping_preference: 'SET_PROVIDED_ADDRESS',
							},
						});
					},
					// Paso 2: onApprove => PayPal confirma pago
					onApprove: async (data, actions) => {
						const order = await actions.order.capture();
						console.log('Orden de PayPal:', order);
						// Aquí llamas a tu backend para guardar el pedido
						// handleSaveOrder(order);
					},
					onError: (err) => {
						console.error('PayPal error:', err);
						alert('Ocurrió un error con PayPal.');
					},
				})
				.render(paypalRef.current);
		}
	}, [paymentMethod, step, cart, address, shipping, cartMsi]);

	return (
		<div className="summary-details">
			<div className="summary-details__content">
				{/* Toggle modo carrito */}
				<div className="cart__change-payment">
					<span
						className="cart__change-payment__action"
						onClick={() => dispatch(showPaymentsChange())}
					>
						Cambiar modo de carrito:
					</span>
					<span className="payments__label-status">
						{cartMsi ? 'MSI/Pagos' : 'Contado'}
					</span>
				</div>

				<div className="summary-details__title">
					<span>Resumen del Carrito</span>
				</div>

				{/* Productos, envío y total */}
				<div className="summary-row">
					<span>
						{cart.reduce((acc, item) => acc + item.quantity, 0)} Producto(s):
					</span>
					<span>$ {CurrencyFormat(subtotal, 2, '.', ',')}</span>
				</div>
				<div className="summary-row">
					<span>Envío:</span>
					<span>$ {CurrencyFormat(shipping, 2, '.', ',')}</span>
				</div>
				<div className="summary-row total">
					<div className="summary-row__total">
						<span>Total:</span>
						<span className="summary-row iva text--off">(Incluye IVA)</span>
					</div>
					<span>$ {CurrencyFormat(total, 2, '.', ',')}</span>
				</div>

				{/* Sección de opciones de pago */}
				{cartMsi ? (
					<div className="payments">
						<div className="payments__option__header">
							<span>Pagar a MSI/Pagos con:</span>
						</div>
						<div className="payments__option__body">
							{[
								{
									id: 'mercadopago',
									img: '/images/logo-mercado-pago.png',
									label:
										'Hasta 3 MSI con tarjetas participantes Mercado Pago o hasta 12 pagos con Mercado Crédito.',
								},
								{
									id: 'kueskipay',
									img: '/images/Logotipo_Kueski_pay.png',
									label:
										'Paga en hasta 12 quincenas con Kueski Pay, sin comisiones ocultas.',
								},
								{
									id: 'aplazo',
									img: '/images/logo-aplazo.png',
									label:
										'Divide tus pagos en quincenas con Aplazo, sin letras pequeñas.',
								},
							]
								.filter(option => !paymentMethod || paymentMethod === option.id)
								.map(option => (
									<div
										key={option.id}
										className={`payments__option__item ${paymentMethod === option.id ? 'active' : ''
											}`}
										onClick={() => setPaymentMethod(option.id)}
									>
										<div className="payments__option__item__image">
											<Image
												src={option.img}
												fill
												style={{ objectFit: 'contain', padding: 5 }}
												alt={option.id}
												draggable="false"
												sizes="auto"
											/>
										</div>
										<div className="payments__option__item__label">
											<span>{option.label}</span>
										</div>
									</div>
								))}
						</div>
					</div>
				) : (
					<div className="payments">
						<div className="payments__option__header">
							<span>Pagar en una sola exhibición con:</span>
						</div>
						<div className="payments__option__body">
							{[
								{
									id: 'paypal',
									img: '/images/paypal-logo-footer.png',
									label: 'Disfruta de un pago único con PayPal.',
								},
							]
								.filter(option => !paymentMethod || paymentMethod === option.id)
								.map(option => (
									<div
										key={option.id}
										className={`payments__option__item ${paymentMethod === option.id ? 'active' : ''
											}`}
										onClick={() => setPaymentMethod(option.id)}
									>
										<div className="payments__option__item__image">
											<Image
												src={option.img}
												fill
												style={{ objectFit: 'contain', padding: 5 }}
												alt={option.id}
												draggable="false"
												sizes="auto"
											/>
										</div>
										<div className="payments__option__item__label">
											<span>{option.label}</span>
										</div>
									</div>
								))}
						</div>
					</div>
				)}

				{/* Validaciones de address/paymentMethod */}
				{!address && (step === 'shipping') && (
					<div className="checkout__error">
						<span>Debes agregar un domicilio para continuar.</span>
					</div>
				)}
				{!paymentMethod && (step === 'payment' || step === 'confirm') && (
					<div className="checkout__error">
						<span>Debes seleccionar un método de pago para continuar.</span>
					</div>
				)}

				{/* Botón "Continuar" o "Comprar" */}
				{urlAction && (
					<Link href={`${urlAction}`} legacyBehavior>
						<a>
							<button
								className="proceed-checkout"
								disabled={
									(!address && step === 'shipping') ||
									(!paymentMethod && (step === 'payment' || step === 'confirm'))
								}
							>
								{step === 'confirm' ? 'Comprar' : 'Continuar'}
							</button>
						</a>
					</Link>
				)}

				{/* Cuando step === 'confirm' y paymentMethod === 'paypal', renderizamos el contenedor para PayPal */}
				{step === 'confirm' && paymentMethod === 'paypal' && (
					<div ref={paypalRef} style={{ marginTop: '15px' }} />
				)}
			</div>

			{/* ESTILOS */}
			<style jsx>
				{`
					.checkout__error {
						color: var(--primary-color);
						line-height: 1.5;
						margin-bottom: 15px;
						text-align: center;
					}

					.payments__label-status {
						font-size: 12px;
						font-weight: 300;
						margin-left: 5px;
						border-radius: 5px;
						background-color: var(--primary-color);
						color: #fff;
						padding: 2px 5px;
					}

					.summary-row__total {
						display: flex;
						gap: 10px;
						margin-top: 10px;
					}

					.summary-row {
						display: flex;
						justify-content: space-between;
						align-items: baseline;
						margin-bottom: 10px;
						gap: 5px;
					}

					.summary-row.total {
						border-top: 1px solid #eaeaea;
						font-weight: bold;
						font-size: 16px;
					}

					.summary-row.iva {
						font-size: 12px;
						font-weight: 300;
						line-height: 22px;
					}

					.cart__change-payment {
						font-size: 12px;
						margin-bottom: 10px;
						color: var(--primary-color);
						display: flex;
						justify-content: right;
					}

					.cart__change-payment__action {
						text-decoration: underline;
						cursor: pointer !important;
					}

					.summary-details {
						flex: 0.4;
						width: 100%;
					}

					.summary-details__content {
						border: 1px solid #eaeaea;
						padding: 20px;
						border-radius: 5px;
					}

					.summary-details__title {
						font-size: 16px;
						font-weight: 600;
						margin-bottom: 20px;
					}

					.payments__option__header {
						font-weight: 600;
						font-size: 16px;
					}

					.payments__option__body {
						margin-top: 10px;
					}

					.payments__option__item {
						display: flex;
						align-items: center;
						gap: 10px;
						margin-top: 10px;
						background-color: #fff;
						border-radius: 5px;
						padding: 5px;
						box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
						cursor: pointer; /* para que el user sepa que puede clickeable */
					}

					/* Estilo para opción activa */
					.payments__option__item.active {
						border: 1px solid var(--primary-color);
						background-color: var(--background-price-color);
					}

					.payments__option__item__image {
						position: relative;
						max-width: 200px;
						max-height: 200px;
						min-height: 50px;
						min-width: 50px;
						border: 1px solid #eaeaea;
						border-radius: 5px;
						background-color: #fff;
					}

					.payments {
						display: flex;
						flex-direction: column;
						border: 1px solid #eaeaea;
						border-radius: 5px;
						padding: 15px;
						margin-bottom: 20px;
						background-color: #eaeaea;
						font-size: 12px;
					}

					.proceed-checkout {
						flex: 1;
						background: var(--primary-color);
						color: #fff;
						border: none;
						border-radius: 4px;
						padding: 10px;
						font-size: 16px;
						cursor: pointer;
						text-align: center;
						width: 100%;
					}

					.proceed-checkout:hover {
						background: #e00028;
					}
					.proceed-checkout:disabled {
						background: #eaeaea;
					}

					@media only screen and (max-width: 62em) {
						.summary-details {
							flex: 100%;
						}
					}
				`}
			</style>
		</div>
	);
};

export default SummaryDetails;
