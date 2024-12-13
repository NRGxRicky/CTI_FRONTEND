import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import useCart from '../../hooks/useCart';
import Capitalize from '../../hooks/CapitalizeTitle';


const CartSummary = () => {
	const { cart, subtotal, shipping, total, clearCart, localcheckBackend } =
		useCart();

	useEffect(() => {
		localcheckBackend()
	}, [])
	
	return (
		<div className='checkout-summary'>
			<h1>Resumen del Pedido</h1>
			{cart.length === 0 ? (
				<div className='empty-cart'>
					<p>
						Tu carrito está vacío. Regresa a la tienda para añadir productos.
					</p>
				</div>
			) : (
				<>
					<div className='cart-items'>
						{cart.map((item) => (
							<div key={item.id} className='cart-item'>
								<div className='item-image'>
									<Image
										src={item.product.imagen1xs || '/images/not-available.png'}
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
					background: #fff;
					box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
					border-radius: 8px;
					max-width: 600px;
					margin: auto;
				}

				h1 {
					font-size: 24px;
					margin-bottom: 20px;
				}

				.empty-cart {
					text-align: center;
					font-size: 16px;
					color: #666;
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

				.clear-cart,
				.proceed-checkout {
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
