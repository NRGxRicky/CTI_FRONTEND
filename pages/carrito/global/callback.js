import React, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/auth';
import useCart from '../../../hooks/useCart';
import { Preloader, TailSpin } from 'react-preloader-icon';
import { useApi } from '../../../hooks/useApi';

export default function GlobalPaymentsCallback() {
	const router = useRouter();
	const { accessToken } = useAuth();
	const { buildUrl } = useApi();
	const { clearCart } = useCart();
	const [processing, setProcessing] = useState(true);
	const [error, setError] = useState(null);

	// Read params sent by Global Payments Checkout Lightbox redirect
	const {
		resultIndicator,
		sessionVersion
	} = router.query;

	useEffect(() => {
		async function verifyAndCreateOrder() {
			try {
				// 1. Retrieve indicators and details from localStorage
				const savedIndicator = localStorage.getItem('gp_success_indicator');
				const orderId = localStorage.getItem('gp_order_id');
				
				let requireInvoice = false;
				try {
					requireInvoice = JSON.parse(localStorage.getItem('gp_require_invoice') || 'false');
				} catch (_) {}

				let address = null;
				try {
					address = JSON.parse(localStorage.getItem('gp_address') || 'null');
				} catch (_) {}

				console.log('[Global Payments Callback] Recibido:', {
					resultIndicator,
					savedIndicator,
					orderId
				});

				if (!resultIndicator) {
					setError('No se recibió el indicador de resultado del banco.');
					setProcessing(false);
					return;
				}

				if (!savedIndicator || !orderId) {
					setError('No se encontraron los datos de la sesión de pago local.');
					setProcessing(false);
					return;
				}

				// 2. Compare indicators
				if (resultIndicator !== savedIndicator) {
					setError('La firma de validación de pago del banco no coincide. Transacción no autorizada.');
					setProcessing(false);
					return;
				}

				// 3. Request order creation at production API
				const bodyToSend = {
					payment_method: 'globalpayments',
					payment_id: orderId,
					result_indicator: resultIndicator,
					success_indicator: savedIndicator,
					requireInvoice,
					address
				};

				const response = await fetch(
					buildUrl('/orders/create/'),
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${accessToken}`,
						},
						body: JSON.stringify(bodyToSend),
					}
				);

				if (response.ok) {
					const json = await response.json();
					console.log('[Global Payments Callback] Orden Creada Exitosamente:', json);
					
					// Clear local storage gp keys
					localStorage.removeItem('gp_success_indicator');
					localStorage.removeItem('gp_order_id');
					localStorage.removeItem('gp_require_invoice');
					localStorage.removeItem('gp_address');

					// Redirect to confirmation screen
					router.push(`/compras/confirmacion/?orderId=${json.orderId}`);
					setTimeout(() => {
						clearCart();
					}, 3000);
				} else {
					const errData = await response.json();
					setError(
						'Error al crear la orden: ' +
						(errData.detail || response.statusText)
					);
				}
			} catch (err) {
				console.error('[Global Payments Callback] Error:', err);
				setError('Error de conexión al guardar la orden.');
			} finally {
				setProcessing(false);
			}
		}

		if (!router.isReady) return; // Wait for URL parameters

		if (accessToken) {
			verifyAndCreateOrder();
		} else {
			// If not logged in, wait a bit or show error
			// Sometimes token is loading, so we don't immediately fail
			const timeout = setTimeout(() => {
				if (!accessToken) {
					setError('Error de sesión: Debes estar autenticado para procesar el pago.');
					setProcessing(false);
				}
			}, 3000);
			return () => clearTimeout(timeout);
		}
	}, [router.isReady, accessToken]);

	if (processing) {
		return (
			<div className='component-loading'>
				<div className='cart__loading__container'>
					<Preloader
						use={TailSpin}
						size={40}
						strokeWidth={8}
						strokeColor='var(--primary-color)'
						duration={900}
					/>
					<p className='loading-text'>Procesando tu pago, por favor no cierres ni recargues la página...</p>
				</div>
				<style jsx>
					{`
						.component-loading {
							position: fixed;
							top: 0;
							left: 0;
							width: 100vw;
							height: 100vh;
							background: #ffffff;
							z-index: 9999;
							display: flex;
							justify-content: center;
							align-items: center;
						}
						.cart__loading__container {
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;
							gap: 20px;
						}
						.loading-text {
							font-family: 'Outfit', 'Inter', sans-serif;
							color: #333333;
							font-size: 16px;
							font-weight: 500;
							text-align: center;
						}
					`}
				</style>
			</div>
		);
	}

	if (error) {
		return (
			<div className='error-container'>
				<div className='error-card'>
					<div className='error-icon'>❌</div>
					<h2>Error en el Pago</h2>
					<p className='error-message'>{error}</p>
					<button className='retry-button' onClick={() => router.push('/carrito/')}>Volver al Carrito</button>
				</div>
				<style jsx>
					{`
						.error-container {
							display: flex;
							justify-content: center;
							align-items: center;
							min-height: 100vh;
							background: #f8fafc;
							padding: 20px;
						}
						.error-card {
							background: #ffffff;
							border-radius: 12px;
							padding: 40px;
							max-width: 500px;
							width: 100%;
							text-align: center;
							box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
						}
						.error-icon {
							font-size: 48px;
							margin-bottom: 20px;
						}
						h2 {
							font-family: 'Outfit', 'Inter', sans-serif;
							color: #0f172a;
							margin-bottom: 12px;
							font-size: 24px;
							font-weight: 600;
						}
						.error-message {
							font-family: 'Inter', sans-serif;
							color: #475569;
							font-size: 15px;
							line-height: 1.6;
							margin-bottom: 30px;
						}
						.retry-button {
							background: var(--primary-color, #2349f1);
							color: #ffffff;
							border: none;
							border-radius: 8px;
							padding: 12px 24px;
							font-size: 16px;
							font-weight: 600;
							cursor: pointer;
							transition: background 0.2s ease-in-out;
							width: 100%;
						}
						.retry-button:hover {
							opacity: 0.9;
						}
					`}
				</style>
			</div>
		);
	}

	return null;
}
