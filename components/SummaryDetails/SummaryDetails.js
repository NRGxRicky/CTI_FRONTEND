import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { showPaymentsChange } from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch } from '../../lib/hooks';
import { useAuth } from '../../hooks/auth';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import useCart from '../../hooks/useCart';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useEnv } from '../../context/EnvContext';
import KueskiPayWidget from '../KueskiPayWidget/KueskiPayWidget';
import { getPaymentOptionsByType } from '../constants/paymentOptions';
import { useSandbox } from '../../hooks/useSandbox';
import { useApi } from '../../hooks/useApi';

const SummaryDetails = ({ urlAction, step }) => {
	const { buildUrl } = useApi();
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
		hasQuoteItems,
		loading
	} = useCart();

	const dispatch = useAppDispatch();
	const { cartMsi, accessToken, username } = useAuth();
	const router = useRouter();
	const { storeId, paypalClientId } = useEnv();
	const [kueskiCallbackUrl, setKueskiCallbackUrl] = useState(null);
	const [aplazoCheckoutUrl, setAplazoCheckoutUrl] = useState(null);
	const [paypalLoaded, setPaypalLoaded] = useState(() => typeof window !== 'undefined' && !!window.paypal);
	const [mercadopagoLoaded, setMercadopagoLoaded] = useState(() => typeof window !== 'undefined' && !!window.MercadoPago);
	const [globalpaymentsLoaded, setGlobalpaymentsLoaded] = useState(false);
	const [globalSessionLoading, setGlobalSessionLoading] = useState(false);

	// Sandbox mode hook
	const {
		isSandboxMode,
		sandboxConfig,
		simulatePayment,
		simulatePaymentFailure,
		getSandboxPaymentMethods,
		shouldSkipPaymentGateway,
		log,
		getSandboxBadge
	} = useSandbox();

	// Debug: Verificar modo sandbox en useEffect
	useEffect(() => {
		console.log('🏖️ DEBUG Sandbox Mode:', {
			isSandboxMode,
			cartMsi,
			paymentOptions: getPaymentOptionsByType(cartMsi, isSandboxMode)
		});
	}, [isSandboxMode, cartMsi]);

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
							// Si hay precio de cotización, usarlo
							let unitPrice = item.unit_price && item.quote_id
								? parseFloat(item.unit_price)
								: cartMsi
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
							const response = await fetch(buildUrl('/orders/create/'), {
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
		paypalLoaded,
	]);

	//-------------------------------------------------------------------
	// SANDBOX: Función para procesar pago de sandbox
	//-------------------------------------------------------------------
	const handleSandboxPayment = async () => {
		log('Iniciando proceso de pago sandbox', { paymentMethod, cart, total });

		try {
			// Simular el proceso de pago
			let paymentResult;

			if (paymentMethod === 'sandbox_failure') {
				paymentResult = await simulatePaymentFailure('card_declined');
			} else {
				paymentResult = await simulatePayment({
					payment_method: paymentMethod,
					amount: total,
					cart: cart,
					address: address,
					taxInvoice: taxInvoice
				});
			}

			log('Resultado del pago sandbox', paymentResult);

			if (paymentResult.success) {
				// Crear orden directamente sin pasarela de pago usando endpoint específico de sandbox
				const orderData = {
					sandboxPayment: paymentResult,
					requireInvoice: !!taxInvoice,
					payment_method: paymentMethod,
					sandbox: true,
					sandbox_key: process.env.NEXT_PUBLIC_SANDBOX_KEY,
					total_amount: total
				};

				console.log('🏖️ SANDBOX: Enviando datos al backend:', {
					url: buildUrl('/sandbox/orders/create/'),
					orderData,
					accessToken: accessToken ? 'Present' : 'Missing',
					paymentMethod,
					total
				});

				const response = await fetch(buildUrl('/sandbox/orders/create/'), {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify(orderData),
				});

				if (response.ok) {
					const json = await response.json();
					log('Orden creada exitosamente', json);
					router.push(`/compras/confirmacion/?orderId=${json.orderId}`);
					setTimeout(() => {
						clearCart();
					}, 3000);
				} else {
					const errData = await response.json();
					console.error('Sandbox Error Details:', {
						status: response.status,
						statusText: response.statusText,
						error: errData.error,
						traceback: errData.traceback,
						fullResponse: errData
					});
					alert('Error al crear la orden: ' + (errData.error || errData.detail || response.statusText));
				}
			} else {
				alert(`Error de pago sandbox: ${paymentResult.errorMessage}`);
			}
		} catch (error) {
			console.error('Error en pago sandbox:', error);
			alert('Error al procesar el pago sandbox');
		}
	};

	const handleGlobalpaymentsCheckout = async () => {
		log('Iniciando pago con Global Payments', { cart, total });
		setGlobalSessionLoading(true);

		try {
			const res = await fetch(buildUrl('/payments/global/session/'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				}
			});

			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.detail || 'Error al comunicarse con el servidor');
			}

			const data = await res.json();
			// data: { sessionId, successIndicator, orderId, merchantId, amount }
			log('Sesión de pago obtenida', data);

			// Guardamos los datos en localStorage para su verificación en la página de callback
			localStorage.setItem('gp_success_indicator', data.successIndicator);
			localStorage.setItem('gp_order_id', data.orderId);
			localStorage.setItem('gp_require_invoice', JSON.stringify(!!taxInvoice));
			localStorage.setItem('gp_address', JSON.stringify(address));

			if (typeof window !== 'undefined' && window.Checkout) {
				window.Checkout.configure({
					session: {
						id: data.sessionId
					}
				});
				window.Checkout.showLightbox();
			} else {
				alert('La pasarela de pagos no se pudo inicializar. Por favor, recarga la página.');
			}
		} catch (error) {
			console.error('[Global Payments] Error de inicialización:', error);
			alert('No se pudo inicializar la pasarela de pago: ' + error.message);
		} finally {
			setGlobalSessionLoading(false);
		}
	};

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
	}, [paymentMethod, step, mercadopagoLoaded]);

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
				let unitPrice = item.unit_price && item.quote_id
					? parseFloat(item.unit_price)
					: cartMsi
						? item.product.precio_final_descuento > 0
							? item.product.precio_final_descuento
							: item.product.precio_final
						: item.product.precio_contado;

				unitPrice = parseFloat(unitPrice) || 0;

				return {
					id: `${item.product.sku || index}`,
					title: Capitalize(item.product.titulo?.substring(0, 255)) || 'Producto',
					currency_id: 'MXN',
					picture_url: buildUrl(`/${item.product.imagen1s}`) || '',
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
			const res = await fetch(buildUrl('/payments/mp/create_preference/'), {
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
				let unitPrice = item.unit_price && item.quote_id
					? parseFloat(item.unit_price)
					: cartMsi
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

			// F) Armar el payload para el endpoint de KueskiPay
			const payload = {
				description: `Compra de ${cart.length} artículo(s)`,
				amount: amount,
				items: items,
				shipping: shippingData,
				store_id: storeId,
				requireInvoice: !!taxInvoice,
			};

			// G) Llamar a tu endpoint en el backend que crea el pago con KueskiPay
			const res = await fetch(buildUrl('/payments/kp/create_payment/'), {
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

	// APLAZO

	useEffect(() => {
		if (paymentMethod === 'aplazo' && step === 'confirm') {
			initAplazoCheckout();
		}
	}, [paymentMethod, step]);

	const initAplazoCheckout = async () => {
		try {
			// Prepara el payload tal cual tu lógica de carrito, dirección, etc.
			const body = {
				description: `Compra de ${cart.length} producto(s)`,
				requireInvoice: !!taxInvoice,
				store_id: storeId, // El mismo que usas en Kueski, MP, etc.
				// Lo que necesites para "products", "shipping_address", etc.
			};

			const res = await fetch(buildUrl('/payments/aplazo/create_payment/'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(body),
			});

			const data = await res.json();
			if (data.status === 'success' && data.aplazo_response && data.aplazo_response.url) {
				// Guárdalo en un estado local
				setAplazoCheckoutUrl(data.aplazo_response.url);
			} else {
				alert('Error al generar pago con Aplazo');
				console.error('aplazo error: ', data);
			}
		} catch (error) {
			console.error(error);
			alert('Error al inicializar el pago con Aplazo');
		}
	};

	return (
		<div className='summary-details'>
			{/* Scripts de pago cargados de forma dinámica y diferida */}
			{paymentMethod === 'paypal' && (
				<Script
					id='paypal-sdk'
					src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=MXN&locale=es_MX`}
					strategy='afterInteractive'
					onLoad={() => setPaypalLoaded(true)}
				/>
			)}
			{paymentMethod === 'mercadopago' && (
				<Script
					id='mercadopago-sdk'
					src="https://sdk.mercadopago.com/js/v2"
					strategy='afterInteractive'
					onLoad={() => setMercadopagoLoaded(true)}
				/>
			)}
			{((!paymentMethod) || paymentMethod === 'aplazo') && (
				<Script
					id='aplazo-sdk'
					src="https://cdn.aplazo.mx/aplazo-widgets.min.js"
					strategy='afterInteractive'
				/>
			)}
			{paymentMethod === 'globalpayments' && (
				<Script
					id='globalpayments-sdk'
					src={`${process.env.NEXT_PUBLIC_GLOBAL_PAYMENTS_GATEWAY_URL || 'https://evopaymentsmexico.gateway.mastercard.com'}/checkout/version/61/checkout.js`}
					strategy='afterInteractive'
					onLoad={() => setGlobalpaymentsLoaded(true)}
				/>
			)}
			<div className='summary-details__content'>
				{/* Toggle modo carrito */}
				<div className='cart__change-payment'>
					<span
						className={`cart__change-payment__action ${hasQuoteItems ? 'disabled' : ''}`}
						onClick={() => !hasQuoteItems && dispatch(showPaymentsChange())}
					>
						Cambiar modo de carrito:
					</span>
					<span
						className={`payments__label-status ${hasQuoteItems ? 'disabled' : ''}`}
						onClick={() => !hasQuoteItems && dispatch(showPaymentsChange())}
					>
						{cartMsi ? 'MSI/Pagos' : 'Contado'}
						{hasQuoteItems && ' (fijo por cotización)'}
					</span>
				</div>

				<div className='summary-details__title'>
					<span>Resumen del Carrito</span>
					{hasQuoteItems && (
						<span className='quote-badge'>Cotización Activa</span>
					)}
				</div>

				{/* Productos, envío y total */}
				<div className='summary-row'>
					<span>
						{loading ? '...' : cart.reduce((acc, item) => acc + item.quantity, 0)} Producto(s):
					</span>
					<span>{loading ? '...' : `$ ${CurrencyFormat(subtotal, 2, '.', ',')}`}</span>

				</div>
				<div className='summary-row'>
					<span>Envío:</span>
					<span>{loading ? '...' : `$ ${CurrencyFormat(shipping, 2, '.', ',')}`}</span>
				</div>
				<div className='summary-row total'>
					<div className='summary-row__total'>
						<span>Total:</span>
						<span className='summary-row iva text--off'>(Incluye IVA)</span>
					</div>
					<span>{loading ? '...' : `$ ${CurrencyFormat(total, 2, '.', ',')}`}</span>
				</div>

				{/* KUESKIPAY WIDGET */}
				{((!paymentMethod) || paymentMethod === 'kueskipay') && (
					<div className='kueskipay__widget-cart'>
						<KueskiPayWidget product_price={total} product_title={'cart'} widget_type={'cart'} />
					</div>
				)}

				{/* APLAZO WIDGET */}
				{((!paymentMethod) || paymentMethod === 'aplazo') && (
					<div className='aplazo-widget'>
						<aplazo-placement product-price={
							total * 100
						}
						></aplazo-placement>
					</div>
				)}

				{/* Sección de opciones de pago */}
				{cartMsi ? (
					<div className='payments'>
						<div className='payments__option__header'>
							<span>Pagar a Pagos con:</span>
						</div>
						<div className='payments__option__body'>
							{getPaymentOptionsByType(true, isSandboxMode)
								.map((option) => (
									<div
										key={option.id}
										className={`payments__option__item ${paymentMethod === option.id ? 'active' : ''
											}`}
										onClick={() => setPaymentMethod(option.id)}
									>
										<div className='payments__option__item__image'>
											<Image
												src={option.imgSrc}
												fill
												style={{ objectFit: 'contain', padding: 5 }}
												alt={option.id}
												draggable='false'
												sizes='50px'
											/>
										</div>
										<div className='payments__option__item__label'>
											<span>{option.subtitle}</span>
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
							{getPaymentOptionsByType(false, isSandboxMode)

								.map((option) => (
									<div
										key={option.id}
										className={`payments__option__item ${paymentMethod === option.id ? 'active' : ''
											}`}
										onClick={() => setPaymentMethod(option.id)}
									>
										<div className='payments__option__item__image'>
											<Image
												src={option.imgSrc}
												fill
												style={{ objectFit: 'contain', padding: 5 }}
												alt={option.id}
												draggable='false'
												sizes='50px'
											/>
										</div>
										<div className='payments__option__item__label'>
											<span>{option.subtitle}</span>
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

				{/* Sandbox Mode Badge */}
				{isSandboxMode && getSandboxBadge().show && (
					<div className='sandbox-badge'>
						🏖️ {getSandboxBadge().text}
					</div>
				)}

				{/* Botón de Sandbox para saltar pasarela de pago */}
				{isSandboxMode && step === 'confirm' && shouldSkipPaymentGateway(paymentMethod) ? (
					<button
						className='proceed-checkout sandbox-button'
						onClick={handleSandboxPayment}
						disabled={!address || !paymentMethod}
					>
						🏖️ Comprar (Sandbox Mode)
					</button>
				) : (
					/* Botón "Continuar" o "Comprar" normal */
					urlAction && (
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
					)
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
					<div className='aplazo__container'>
						{aplazoCheckoutUrl ? (
							<button
								className='proceed-checkout aplazo__button'
								onClick={() => (window.location.href = aplazoCheckoutUrl)}
							>
								Continuar con Aplazo
							</button>
						) : (
							<button
								className='proceed-checkout aplazo__button'
								disabled
							>
								Generando link de pago con Aplazo...
							</button>
						)}
					</div>
				)}

				{/* Global Payments container */}
				{step === 'confirm' && paymentMethod === 'globalpayments' && (
					<div className='globalpayments__container' style={{ marginTop: '15px' }}>
						<button
							className='proceed-checkout'
							onClick={handleGlobalpaymentsCheckout}
							disabled={globalSessionLoading}
						>
							{globalSessionLoading ? 'Cargando pasarela...' : 'Pagar con Tarjeta'}
						</button>
					</div>
				)}
			</div>

			{/* ESTILOS */}
			<style jsx>
				{`

				.aplazo__button:disabled {
					background-color: #eaeaea !important;
					font-weight: 300;
					border-radius: 50px !important;
				}

				.aplazo__button {
					background-color: #00e6f5 !important;
					color: #000000 !important;
					font-weight: 600;
					border-radius: 50px !important;
				}

				.kueskipay__widget-cart {

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
						cursor: pointer;
          }
          
          .payments__label-status.disabled {
            background-color: #666;
            cursor: not-allowed;
          }

          .cart__change-payment__action.disabled {
            color: #666;
            text-decoration: none;
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
						align-items: center;

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
						display: flex;
						justify-content: space-between;
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
            margin: 20px 0;
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

          .cart__change-payment__action.disabled,
          .payments__label-status.disabled {
            cursor: not-allowed !important;
            opacity: 0.7;
          }

          .cart__change-payment__action.disabled {
            text-decoration: none;
          }

          @media only screen and (max-width: 62em) {
            .summary-details {
              flex: 100%;
            }
          }

          .quote-indicator {
            color: var(--primary-color);
            font-size: 0.8rem;
            margin-left: 5px;
            font-weight: 500;
          }

          .quote-badge {
            background-color: var(--primary-color);
            color: white;
            font-size: 12px;
            padding: 3px 8px;
            border-radius: 4px;
            margin-left: 10px;
            font-weight: 500;
          }

          /* Sandbox Mode Styles */
          .sandbox-badge {
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
            animation: pulse 2s infinite;
          }

          .proceed-checkout.sandbox-button {
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            border: 2px solid #ff6b35;
            position: relative;
            overflow: hidden;
          }

          .proceed-checkout.sandbox-button:hover {
            background: linear-gradient(45deg, #e55a2b, #e0841a);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
          }

          .proceed-checkout.sandbox-button:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }

          .proceed-checkout.sandbox-button:hover:before {
            left: 100%;
          }

          @keyframes pulse {
            0% {
              box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
            }
            50% {
              box-shadow: 0 2px 12px rgba(255, 107, 53, 0.6);
            }
            100% {
              box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
            }
          }
        `}
			</style>
		</div>
	);
};

export default SummaryDetails;
