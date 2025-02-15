// /pages/mercadopago/success.js

import React, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/auth';
import useCart from '../../../hooks/useCart';
import { Preloader, TailSpin } from 'react-preloader-icon';

export default function MercadoPagoSuccess() {
	const router = useRouter();
	const { accessToken } = useAuth();
  const { clearCart, taxInvoice, } = useCart();

	const [processing, setProcessing] = useState(true);
	const [error, setError] = useState(null);

	// Lee los parámetros que MP envía por la URL
	const {
		payment_id,
		preference_id,
		status,
		merchant_order_id,
		collection_id,
	} = router.query;

	useEffect(() => {
		async function createOrder() {
			try {
				const bodyToSend = {
					mpPaymentData: {
						payment_id,
						preference_id,
						status,
						merchant_order_id,
            collection_id,
						// ...
					},
          requireInvoice: !!taxInvoice,
          payment_method: 'mercadopago'
				};

				const response = await fetch(
					'https://api.pccdnapi.com/orders/create/',
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
					// Redirigir a la página de confirmación, con orderId
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
				console.error(err);
				setError('Error de conexión al guardar la orden.');
			} finally {
				setProcessing(false);
			}
		}

		if (!router.isReady) return; // Esperar a que query esté lista

		if (accessToken) {
			createOrder();
		}
	}, [router.isReady, accessToken]);

	if (processing) {
		return (
			<div className='component-loading'>
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
						.component-loading {
							position: absolute;
							top: 0;
							left: 0;
							width: 100%;
							height: 100%;
							background: #fff;
							z-index: 9999;
							display: flex;
							justify-content: center;
							align-items: center;
						}
						.cart__loading__container {
							display: flex;
							justify-content: center;
							align-items: center;
						}
					`}
				</style>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container'>
				<h2>Ocurrió un error</h2>
				<p>{error}</p>

				<button onClick={() => router.push('/')}>Volver a inicio</button>
				<style jsx>
					{`
						p {
							line-height: 3;
						}

						button {
							flex: 1;
							background: var(--primary-color);
							color: #fff;
							border: none;
							border-radius: 4px;
							padding: 10px;
							font-size: 16px;
							cursor: pointer;
							text-align: center;
              margin-top: 40px;
						}
					`}
				</style>
			</div>
		);
	}

	return null; // mientras rediriges, no muestras nada
}
