import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { showPaymentsChange } from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch } from '../../lib/hooks';
import { useAuth } from '../../hooks/auth';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import useCart from '../../hooks/useCart';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useEnv } from '../../context/EnvContext';
import KueskiPayWidget from '../KueskiPayWidget/KueskiPayWidget';

const SummaryDetails = ({ urlAction, step }) => {
	const {
		cart,
		subtotal,
		shipping,
		total,
		address,
		paymentMethod,
		setPaymentMethod,
		taxInvoice,
		clearCart,
	} = useCart();

	const dispatch = useAppDispatch();
	const { cartMsi, accessToken, username } = useAuth();
	const router = useRouter();
	const { storeId } = useEnv();
	const [kueskiCallbackUrl, setKueskiCallbackUrl] = useState(null);

	// Referencias para PayPal y Mercado Pago
	const paypalRef = useRef(null);
	const mercadoPagoRef = useRef(null);

	// Referencia para guardar el controller de la Brick (para destruirla después)
	const brickControllerRef = useRef(null);

	//-------------------------------------------------------------------
	// USE EFFECT: Renderizado de botón PayPal
	//-------------------------------------------------------------------
	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			window.paypal &&
			paypalRef.current &&
			paymentMethod === 'paypal' &&
			step === 'confirm'
		) {
			// Evita re-render si ya fue renderizado
			if (paypalRef.current.innerHTML.trim() !== '') {
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
					// Paso 1: Crear la orden en PayPal
					createOrder: (data, actions) => {
						// Generar array de ítems
						const items = cart.map((item) => {
							let unitPrice = cartMsi
								? item.product.precio_final_descuento > 0
									? item.product.precio_final_descuento
									: item.product.precio_final
								: item.product.precio_contado;

							unitPrice = parseFloat(unitPrice) || 0;

							return {
								name: Capitalize(item.product.titulo?.substring(0, 127)) || 'Producto',
								unit_amount: {
									currency_code: 'MXN',
									value: unitPrice.toFixed(2),
								},
								quantity: item.quantity.toString(),
								description: item.product.sku || 'SKU no disponible',
								category: 'PHYSICAL_GOODS',
							};
						});

						// Dirección de envío
						const shippingAddress = {
							address_line_1:
								address.calle +
								' ' +
								address.numero +
								(address.numero_interior ? ` Int. ${address.numero_interior}` : ''),
							admin_area_2: address.ciudad, // ciudad
							admin_area_1: address.estado, // estado
							postal_code: address.codigo_postal,
							country_code: 'MX',
						};

						// Calcular totales
						const itemTotal = items.reduce((acc, it) => {
							return acc + parseFloat(it.unit_amount.value) * parseInt(it.quantity, 10);
						}, 0);

						const shippingCost = shipping;
						const totalToPay = (itemTotal + shippingCost).toFixed(2);

						// Descripción global
						let description;
						if (cart.length === 1) {
							description =
								Capitalize(cart[0].product.titulo?.substring(0, 127)) || 'Producto único';
						} else {
							description = `Compra de ${cart.length} artículos`;
						}

						// Retornar la creación de la orden
						return actions.order.create({
							purchase_units: [
								{
									description,
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
										name: {
											full_name: address.nombres + ' ' + address.apellidos,
										},
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

						const bodyToSend = {
							paypalData: order,
							requireInvoice: !!taxInvoice,
							payment_method: 'paypal'
						};

						try {
							const response = await fetch('https://api.pccdnapi.com/orders/create/', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${accessToken}`,
								},
								body: JSON.stringify(bodyToSend),
							});
							if (response.ok) {
								const json = await response.json();
								// Redirigir a la página de confirmación
								router.push(`/compras/confirmacion/?orderId=${json.orderId}`);
								setTimeout(() => {
									clearCart();
								}, 3000);
							} else {
								// Manejar error
								const errData = await response.json();
								alert(
									'Error al crear la orden: ' + (errData.detail || response.statusText)
								);
							}
						} catch (err) {
							console.error(err);
							alert('Error de conexión al guardar la orden.');
						}
					},
					onError: (err) => {
						console.error('PayPal error:', err);
						alert('Ocurrió un error con PayPal.');
					},
				})
				.render(paypalRef.current);
		}
	}, [
		paymentMethod,
		step,
		cart,
		address,
		shipping,
		cartMsi,
		accessToken,
		router,
		taxInvoice,
		clearCart,
	]);

	//-------------------------------------------------------------------
	// USE EFFECT: Renderizado de Mercado Pago (Brick "wallet")
	//-------------------------------------------------------------------
	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			window.MercadoPago &&
			mercadoPagoRef.current &&
			paymentMethod === 'mercadopago' &&
			step === 'confirm'
		) {
			initMercadoPagoCheckout();
		}
	}, [paymentMethod, step]);

	// Función que crea la preferencia en tu server Django y luego inyecta MP Checkout
	const initMercadoPagoCheckout = async () => {
		try {
			// Verifica que la SDK esté disponible
			if (!window.MercadoPago) {
				console.error('MercadoPago SDK no está cargada en el head');
				return;
			}

			// A) Construye los items
			const items = cart.map((item, index) => {
				let unitPrice = cartMsi
					? item.product.precio_final_descuento > 0
						? item.product.precio_final_descuento
						: item.product.precio_final
					: item.product.precio_contado;

				unitPrice = parseFloat(unitPrice) || 0;

				return {
					id: `${item.product.sku || index}`,
					title: Capitalize(item.product.titulo?.substring(0, 255)) || 'Producto',
					currency_id: 'MXN',
					picture_url: `https://api.pccdnapi.com/${item.product.imagen1s}` || '',
					quantity: item.quantity,
					unit_price: unitPrice,
				};
			});

			// B) Construir un objeto "payer"
			const payerObject = {
				name: address?.nombres || '',
				surname: address?.apellidos || '',
				email: username || 'user@example.com',
				phone: {
					area_code: '+52',
					number: address?.telefono || '',
				},
				address: {
					street_name: address?.calle || '',
					street_number: address?.numero || 0,
					zip_code: address?.codigo_postal || '',
				},
			};

			// C) Construir un objeto "shipments" para tu backend
			const shipmentsData = {
				cost: parseFloat(shipping) || 0,
				free_shipping: false,
				receiver_address: {
					zip_code: address?.codigo_postal || '',
					street_name: address?.calle || '',
					city_name: address?.ciudad || '',
					state_name: address?.estado || '',
					street_number: address?.numero || 0,
					country_name: 'Mexico',
				},
			};

			// D) Llama a tu endpoint en Django
			const res = await fetch('https://api.pccdnapi.com/payments/mp/create_preference/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					items,
					payer: payerObject,
					shipments: shipmentsData,
					shippingCost: parseFloat(shipping) || 0,
					requireInvoice: !!taxInvoice,
					// Envías el objeto shipments
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				console.error('Error al crear preferencia MP:', data);
				return alert('Error al crear preferencia con Mercado Pago');
			}

			const { preferenceId } = data; // Ajusta si tu backend devuelve otro campo

			// E) Instanciamos MercadoPago
			const mp = new window.MercadoPago(
				process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, // tu Public Key
				{
					locale: 'es-MX',
				}
			);

			// F) Creamos el Brick "wallet"
			const brickController = await mp.bricks().create('wallet', 'wallet_container', {
				initialization: {
					preferenceId,
				},
				customization: {
					texts: {
						valueProp: 'smart_option',
					},
				},
			});

			// Guardamos la referencia para destruirlo después
			brickControllerRef.current = brickController;
		} catch (error) {
			console.error(error);
			alert('Error al inicializar Checkout de Mercado Pago');
		}
	};

	// Se ejecuta cuando el usuario selecciona KueskiPay y está en el paso de confirmación
	useEffect(() => {
		if (paymentMethod === 'kueskipay' && step === 'confirm') {
			initKueskiPayCheckout();
		}
	}, [paymentMethod, step]);

	const initKueskiPayCheckout = async () => {
		try {
			// A) Construir la lista de ítems
			const items = cart.map((item, index) => {
				let unitPrice = cartMsi
					? (item.product.precio_final_descuento > 0
						? item.product.precio_final_descuento
						: item.product.precio_final)
					: item.product.precio_contado;
				unitPrice = parseFloat(unitPrice) || 0;
				return {
					name: item.product.titulo?.substring(0, 255) || 'Producto',
					description: item.product.descripcion || 'Sin descripción',
					quantity: item.quantity,
					price: unitPrice,
					currency: 'MXN',
					sku: item.product.sku || `${index}`,
				};
			});

			// B) Calcular montos: subtotal, shipping y total.
			const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
			const shippingCost = parseFloat(shipping) || 0;
			const total = parseFloat((subtotal + shippingCost).toFixed(2));

			// C) Construir el objeto "amount"
			const amount = {
				total: total,
				currency: "MXN",
				details: {
					subtotal: subtotal,
					shipping: shippingCost
				},
			};

			// D) Construir el objeto "shipping"
			const shippingData = {
				name: {
					name: address.nombres,
					last: address.apellidos
				},
				address: {
					address: `${address.calle} ${address.numero}`,
					interior: address.numero_interior || "",
					neighborhood: address.colonia || "",
					city: address.ciudad,
					state: address.estado,
					zipcode: address.codigo_postal,
					country: "MX"
				},
				phone_number: address.telefono,
				email: address.email || "noreply@domain.com"
			};

			// E) Definir las URLs de callback (ajusta según tu entorno)
			const callbacks = {
				on_success: "https://pccdnapi.com/success",
				on_reject: "https://pccdnapi.com/carrito",
				on_canceled: "https://pccdnapi.com/carrito",
				on_failed: "https://pccdnapi.com/carrito"
			};

			// F) Armar el payload para el endpoint de KueskiPay
			const payload = {
				description: `Compra de ${cart.length} artículo(s)`,
				amount: amount,
				items: items,
				shipping: shippingData,
				callbacks: callbacks,
				store_id: storeId,
				requireInvoice: !!taxInvoice,
			};

			// G) Llamar a tu endpoint en el backend que crea el pago con KueskiPay
			const res = await fetch('https://api.pccdnapi.com/payments/kp/create_payment/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(payload)
			});

			const data = await res.json();
			if (!res.ok) {
				console.error("Error creando el pago KueskiPay:", data);
				return alert("Error al crear el pago con KueskiPay");
			}
			console.log(data);

			// H) Guardar el callback_url en el estado para renderizar el botón
			if (data.status === "success" && data.merchant_response.data && data.merchant_response.data.callback_url) {
				setKueskiCallbackUrl(data.merchant_response.data.callback_url);
			} else {
				alert("No se recibió URL de pago de KueskiPay");
			}

		} catch (error) {
			console.error(error);
			alert("Error al inicializar el pago con KueskiPay");
		}
	};

	return (
		<div className='summary-details'>
			<div className='summary-details__content'>
				{/* Toggle modo carrito */}
				<div className='cart__change-payment'>
					<span
						className='cart__change-payment__action'
						onClick={() => dispatch(showPaymentsChange())}
					>
						Cambiar modo de carrito:
					</span>
					<span className='payments__label-status'>
						{cartMsi ? 'MSI/Pagos' : 'Contado'}
					</span>
				</div>

				<div className='summary-details__title'>
					<span>Resumen del Carrito</span>
				</div>

				{/* Productos, envío y total */}
				<div className='summary-row'>
					<span>
						{cart.reduce((acc, item) => acc + item.quantity, 0)} Producto(s):
					</span>
					<span>$ {CurrencyFormat(subtotal, 2, '.', ',')}</span>
				</div>
				<div className='summary-row'>
					<span>Envío:</span>
					<span>$ {CurrencyFormat(shipping, 2, '.', ',')}</span>
				</div>
				<div className='summary-row total'>
					<div className='summary-row__total'>
						<span>Total:</span>
						<span className='summary-row iva text--off'>(Incluye IVA)</span>
					</div>
					<span>$ {CurrencyFormat(total, 2, '.', ',')}</span>
				</div>

				{/* KUESKIPAY WIDGET */}
				{((!paymentMethod) || paymentMethod === 'kueskipay') && (
					<div className='kueskipay__widget-cart'>
						<KueskiPayWidget product_price={total} product_title={'cart'} widget_type={'cart'} />
					</div>
				)}

				{/* Sección de opciones de pago */}
				{cartMsi ? (
					<div className='payments'>
						<div className='payments__option__header'>
							<span>Pagar a Pagos con:</span>
						</div>
						<div className='payments__option__body'>
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
								.filter((option) => !paymentMethod || paymentMethod === option.id)
								.map((option) => (
									<div
										key={option.id}
										className={`payments__option__item ${paymentMethod === option.id ? 'active' : ''
											}`}
										onClick={() => setPaymentMethod(option.id)}
									>
										<div className='payments__option__item__image'>
											<Image
												src={option.img}
												fill
												style={{ objectFit: 'contain', padding: 5 }}
												alt={option.id}
												draggable='false'
												sizes='auto'
											/>
										</div>
										<div className='payments__option__item__label'>
											<span>{option.label}</span>
										</div>
									</div>
								))}
						</div>
					</div>
				) : (
					<div className='payments'>
						<div className='payments__option__header'>
							<span>Pagar en una sola exhibición con:</span>
						</div>
						<div className='payments__option__body'>
							{[
								{
									id: 'paypal',
									img: '/images/paypal-logo-footer.png',
									label: 'Disfruta de un pago único con PayPal.',
								},
							]
								.filter((option) => !paymentMethod || paymentMethod === option.id)
								.map((option) => (
									<div
										key={option.id}
										className={`payments__option__item ${paymentMethod === option.id ? 'active' : ''
											}`}
										onClick={() => setPaymentMethod(option.id)}
									>
										<div className='payments__option__item__image'>
											<Image
												src={option.img}
												fill
												style={{ objectFit: 'contain', padding: 5 }}
												alt={option.id}
												draggable='false'
												sizes='auto'
											/>
										</div>
										<div className='payments__option__item__label'>
											<span>{option.label}</span>
										</div>
									</div>
								))}
						</div>
					</div>
				)}

				{/* Validaciones de address/paymentMethod */}
				{!address && step === 'shipping' && (
					<div className='checkout__error'>
						<span>Debes agregar un domicilio para continuar.</span>
					</div>
				)}
				{!paymentMethod && (step === 'payment' || step === 'confirm') && (
					<div className='checkout__error'>
						<span>Debes seleccionar un método de pago para continuar.</span>
					</div>
				)}

				{/* Botón "Continuar" o "Comprar" */}
				{urlAction && (
					<Link href={`${urlAction}`} legacyBehavior>
						<a>
							<button
								className='proceed-checkout'
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

				{/* PayPal container */}
				{step === 'confirm' && paymentMethod === 'paypal' && (
					<div ref={paypalRef} style={{ marginTop: '15px' }} />
				)}

				{/* Mercado Pago container */}
				{step === 'confirm' && paymentMethod === 'mercadopago' && (
					<div
						ref={mercadoPagoRef}
						id='wallet_container'
						style={{ marginTop: '15px' }}
					/>
				)}


				{/* KueskiPay container */}
				{step === 'confirm' && paymentMethod === 'kueskipay' && (
					<div className='kueskipay__container'>
						{kueskiCallbackUrl && (
							<button
								className='proceed-checkout kueskypay__button'
								onClick={() => (window.location.href = kueskiCallbackUrl)}
							>
								Continuar a Kueski Pay
							</button>
						)}
					</div>
				)}

				{/* Aplazo container */}
				{step === 'confirm' && paymentMethod === 'aplazo' && (
					<div className='aplazo__containter checkout__error'>
						Este método de pago aún no está disponible.
					</div>
				)}
			</div>

			{/* ESTILOS */}
			<style jsx>
				{`

				.kueskipay__widget-cart {
					margin-bottom: 20px;
				}

					.kueskypay__button {
						background-color: #0075ff !important;

					}

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
            cursor: pointer;
          }

          /* Estilo para la opción activa */
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
