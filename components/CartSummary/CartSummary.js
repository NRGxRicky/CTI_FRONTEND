import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import useCart from '../../hooks/useCart';
import Capitalize from '../../hooks/CapitalizeTitle';
import StatusBarCart from '../StatusBarCart/StatusBarCart';
import Head from 'next/head';

const CartSummary = () => {
	const { cart, subtotal, shipping, total, clearCart, localcheckBackend } =
		useCart();

	useEffect(() => {
		localcheckBackend();
	}, []);

	return (
		<div className='checkout-summary'>
			<Head>
				<title>
					Carrito | PCStore.mx: Tu tienda en Tecnología, Cómputo, Accesorios
				</title>
				<meta
					name='description'
					content={`PCStore.mx Tienda líder en cómputo, accesorios, hardware, tecnología y más. Compra protegida, envíos asegurados y pagos seguros con los mejores precios, productos y marcas.`}
				/>
			</Head>

			{cart.length === 0 ? (
				<div className='empty-cart'>
					<svg
						version='1.0'
						xmlns='http://www.w3.org/2000/svg'
						width='100px'
						height='100px'
						viewBox='0 0 200 200'
						preserveAspectRatio='xMidYMid meet'
					>
						<g fill='#666'>
							<path d='M82.5 190.6 c-6.1 -2.8 -8 -6 -8.3 -14.4 -0.3 -6.8 -0.1 -8.1 2 -11.2 3.2 -4.8 6.1 -6 14.3 -6 11.7 0 16.5 4.7 16.5 16.2 0 6.1 -2.3 11.3 -6.3 14.2 -3.5 2.5 -13.8 3.3 -18.2 1.2z' />
							<path d='M136.5 190.7 c-1.7 -0.8 -4.4 -2.9 -5.9 -4.8 -2.6 -3.1 -2.8 -3.7 -2.4 -11.7 0.3 -8.2 0.4 -8.4 4 -11.8 3.6 -3.3 4.1 -3.4 11.5 -3.4 5.9 0 8.6 0.5 10.9 1.9 8.5 5.2 8.6 22.3 0.3 28.4 -3.5 2.5 -14.2 3.3 -18.4 1.4z' />
							<path d='M77.9 155 c-13.6 -2.4 -23.9 -13.4 -29.8 -32.1 -1.1 -3.5 -5.4 -24.1 -9.6 -45.8 -4.1 -21.7 -7.8 -39.8 -8.2 -40.1 -0.5 -0.4 -3.7 -1.7 -7.3 -3 -8.8 -3.1 -11 -5.6 -11 -12.6 0 -5.9 1.9 -10.8 4.5 -11.8 5.2 -2 28.5 3.2 32.7 7.2 1 1 2.6 4.2 3.6 7.2 l1.9 5.5 63.6 0.5 c62.5 0.5 63.6 0.5 66.4 2.6 3 2.3 4 4.9 4.2 10.5 0.1 3.8 -18.7 69.7 -21.4 74.8 -0.8 1.6 -2.7 3.9 -4.1 5 -2.6 2.1 -3.6 2.1 -44.8 2.1 l-42.1 0.1 2.8 2.4 c1.5 1.3 4.4 2.9 6.5 3.4 2.2 0.7 17 1.1 37 1.1 31.7 0 33.3 0.1 35.2 2 2.6 2.6 3.4 6 2.8 12.1 -0.4 3.4 -1.2 5.8 -2.7 7.2 -2.1 2.2 -2.6 2.2 -38.9 2.4 -20.2 0 -38.8 -0.2 -41.3 -0.7z m13.5 -61.7 c5.8 -4.9 10.3 -6.3 20.6 -6.3 10.4 0 14.8 1.4 20.8 6.5 4.5 3.8 5.1 2.5 0.7 -1.4 -6.9 -6 -13.2 -8.5 -21.5 -8.6 -6.2 0 -8.4 0.5 -12.8 2.7 -5.5 2.9 -12.2 7.8 -12.2 9.1 0 1.3 1.1 0.8 4.4 -2z m2 -25.6 c0.9 -1.5 0.7 -2.1 -0.8 -3.3 -1.7 -1.2 -2.2 -1.2 -3.7 0.2 -1.4 1.3 -1.6 2.1 -0.8 3.6 1.2 2.3 3.7 2 5.3 -0.5z m42 0 c0.9 -1.5 0.7 -2.1 -0.8 -3.3 -1.7 -1.2 -2.2 -1.2 -3.7 0.2 -1.4 1.3 -1.6 2.1 -0.8 3.6 1.2 2.3 3.7 2 5.3 -0.5z' />
						</g>
						<g fill='#ffffff'>
							<path d='M0 100 l0 -100 100 0 100 0 0 100 0 100 -100 0 -100 0 0 -100z m97.6 86.5 c11.1 -7.3 6.1 -24.5 -7.1 -24.5 -5.2 0 -8.4 1.7 -11.3 6 -1.9 2.8 -2.3 4.4 -1.9 8.3 0.9 10.1 12 15.7 20.3 10.2z m54.1 -0.1 c5.5 -3.5 7.6 -10.9 4.7 -16.9 -2.3 -4.9 -6.7 -7.5 -12.7 -7.5 -4 0 -5.3 0.5 -8.4 3.3 -3.1 2.9 -3.7 4.1 -4.1 8.8 -0.4 4.9 -0.1 5.9 2.4 8.8 5 6 12.2 7.4 18.1 3.5z m3.2 -35.8 c4.1 -3.8 3.2 -13.2 -1.4 -15 -0.9 -0.3 -16.4 -0.6 -34.3 -0.6 -20.8 0 -34.2 -0.4 -36.7 -1.1 -4.3 -1.2 -11.5 -7.6 -11.5 -10.3 0 -1.4 4.1 -1.6 43.4 -1.6 42.4 0 43.4 0 46 -2.1 1.4 -1.1 3.3 -3.4 4.1 -5 0.9 -1.6 6 -18.2 11.5 -37 10.9 -37.1 11 -38.3 5.6 -42.3 -2.7 -2.1 -3.5 -2.1 -66.2 -2.1 l-63.4 0 -2 -6.1 c-1.2 -3.4 -2.9 -6.9 -3.8 -7.7 -2.7 -2.4 -22.6 -8.1 -25.6 -7.3 -2.8 0.7 -5.6 5.1 -5.6 9 0 3.8 3.8 7.1 11 9.6 3.6 1.3 6.8 2.6 7.3 3 0.4 0.3 4.1 18.4 8.2 40.1 4.2 21.7 8.5 42.3 9.6 45.8 5.9 18.7 16.2 29.7 29.8 32.1 2.5 0.5 19.7 0.8 38.2 0.7 31.5 -0.2 33.8 -0.3 35.8 -2.1z' />
							<path d='M84.2 98.8 c-3.6 -3.6 1.4 -10.3 11.6 -15.3 10.5 -5.2 22.1 -5.1 32.4 0.1 6.5 3.3 12.8 9.1 12.8 11.8 0 5.4 -5.5 6.1 -10.8 1.5 -5.5 -4.9 -10.8 -6.9 -18.2 -6.9 -7.3 0 -12.2 1.9 -18.4 6.9 -4.1 3.2 -7.4 3.9 -9.4 1.9z' />
							<path d='M86 72 c-2.6 -2.6 -2.6 -8.1 -0.2 -10.3 4.4 -4 12.2 -0.7 12.2 5.1 0 6 -7.8 9.4 -12 5.2z' />
							<path d='M128 72 c-2.6 -2.6 -2.6 -8.1 -0.2 -10.3 4.4 -4 12.2 -0.7 12.2 5.1 0 6 -7.8 9.4 -12 5.2z' />
						</g>
					</svg>
					<p>
						Tu carrito está vacío. Regresa a la tienda para añadir productos.
					</p>
					<button className='button__go-to-home'>Ir al inicio</button>
				</div>
			) : (
				<>
					<StatusBarCart
						steps={[
							{ key: 'cart', label: 'Carrito', link: '/carrito' },
							{ key: 'shipping', label: 'Envío' },
							{ key: 'payment', label: 'Pago' },
							{ key: 'confirm', label: 'Confirmación' },
						]}
						activeStep='cart'
					/>
					<h1>Resumen del Pedido</h1>
					<div className='cart-items'>
						{cart.map((item) => (
							<div key={item.id} className='cart-item'>
								<div className='item-image'>
									<Image
										src={
											item.product.imagen1s
												? item.product.imagen1xs.includes(
														'https://api.pccdnapi.com'
												  )
													? item.product.imagen1xs
													: `https://api.pccdnapi.com${item.product.imagen1xs}`
												: '/images/not-available.png'
										}
										alt={Capitalize(item.product.titulo)}
										width={50}
										height={50}
										objectFit='contain'
									/>
								</div>
								<div className='item-details'>
									<Link href={`/${item.product.slug}`} legacyBehavior>
										<a>
											<h3>{Capitalize(item.product.titulo)}</h3>
										</a>
									</Link>
									<p>Cantidad: {item.quantity}</p>
									<p>
										Precio unitario: $
										{CurrencyFormat(item.product.precio_final, 2, '.', ',')}
									</p>
								</div>
							</div>
						))}
					</div>

					<div className='summary-details'>
						<div className='summary-row'>
							<span>Subtotal:</span>
							<span>${CurrencyFormat(subtotal, 2, '.', ',')}</span>
						</div>
						<div className='summary-row'>
							<span>Envío:</span>
							<span>${CurrencyFormat(shipping, 2, '.', ',')}</span>
						</div>
						<div className='summary-row total'>
							<span>Total (Incluye IVA):</span>
							<span>${CurrencyFormat(total, 2, '.', ',')}</span>
						</div>
					</div>

					<div className='checkout-actions'>
						<button onClick={clearCart} className='clear-cart'>
							Vaciar Carrito
						</button>
						<button className='proceed-checkout'>Proceder al Pago</button>
					</div>
				</>
			)}

			<style jsx>{`
				.checkout-summary {
					padding: 20px;
					max-width: 100dvw;
					margin: auto;
				}

				h1 {
					font-size: 24px;
					margin-bottom: 20px;
				}

				.empty-cart {
					text-align: center;
					font-size: 16px;
					display: flex;
					align-items: center;
					justify-content: center;
					min-height: 30dvh;
					line-height: 2;
					font-weight: 600;
					width: 100%;
					flex-direction: column;
				}

				.cart-items {
					margin-bottom: 20px;
				}

				.cart-item {
					display: flex;
					gap: 10px;
					margin-bottom: 15px;
					border-bottom: 1px solid #f0f0f0;
					padding-bottom: 10px;
				}

				.item-image img {
					border-radius: 4px;
				}

				.item-details h3 {
					font-size: 16px;
					margin: 0;
				}

				.item-details p {
					margin: 5px 0;
					font-size: 14px;
					color: #666;
				}

				.summary-details {
					margin-top: 20px;
					border-top: 1px solid #f0f0f0;
					padding-top: 10px;
				}

				.summary-row {
					display: flex;
					justify-content: space-between;
					margin-bottom: 10px;
				}

				.summary-row.total {
					font-weight: bold;
					font-size: 18px;
				}

				.checkout-actions {
					display: flex;
					gap: 10px;
					margin-top: 20px;
				}

				.button__go-to-home {
					margin: 20px;
				}

				.clear-cart,
				.proceed-checkout
				 {
					flex: 1;
					background: #ff002c;
					color: #fff;
					border: none;
					border-radius: 4px;
					padding: 10px;
					font-size: 16px;
					cursor: pointer;
					text-align: center;
				}

				.button__go-to-home {
					background: #ff002c;
					color: #fff;
					border: none;
					border-radius: 4px;
					padding: 10px;
					font-size: 16px;
					cursor: pointer;
					text-align: center;
				}

				.clear-cart {
					background: #666;
				}

				.clear-cart:hover {
					background: #444;
				}

				.proceed-checkout:hover {
					background: #e00028;
				}
			`}</style>
		</div>
	);
};

export default CartSummary;
