import React from 'react';
import useCart from '../../hooks/useCart';
import Capitalize from '../../hooks/CapitalizeTitle';
import Image from 'next/image';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import TruncateMarkup from 'react-truncate-markup';

const CartSummaryMini = () => {
	const { cart, removeFromCart, clearCart, subtotal, shipping, total } =
		useCart();

	return (
		<div className='cart-summary'>
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
					<p>Tu carrito está vacío.</p>
				</div>
			) : (
				<>
					<div className='cart-header'>
						<button onClick={clearCart} className='clear-cart-button'>
							Borrar todos
						</button>
					</div>
					<div className='cart-items'>
						{cart.map((item) => (
							<div key={item.id} className='cart-item'>
								<div className='item-details'>
									<div className='item-image'>
										<Image
											src={
												item.product.imagen1s
													? `https://api.pccdnapi.com${item.product.imagen1s}`
													: '/images/not-available.png'
											}
											fill
											style={{ objectFit: 'contain' }}
											alt={Capitalize(item.product.titulo)}
											draggable='false'
											sizes='auto'
											priority={true}
										/>
									</div>
									<div>
										<div className='item-name'>
											<TruncateMarkup lines={1}>
												<span>{Capitalize(item.product.titulo)}</span>
											</TruncateMarkup>
										</div>
										<div className='item-sku'>{item.product.sku}</div>
										<div className='item-stock'>
											Disponible: {item.product.stock_total} Pzs.
										</div>
									</div>
								</div>
								<div className='item-actions'>
									<div className='item-quantity'>{item.quantity} Pza.</div>
									<div className='item-price'>
										$ {CurrencyFormat(item.product.precio_final, 2, '.', ',')}
									</div>
									<button
										onClick={() => removeFromCart(item.id)}
										className='remove-item-button'
									>
										✖
									</button>
								</div>
							</div>
						))}
					</div>
					<div className='cart-summary-details'>
						<div className='summary-row'>
							<span>Subtotal</span>
							<span>$ {CurrencyFormat(subtotal, 2, '.', ',')}</span>
						</div>
						<div className='summary-row'>
							<span>Envío</span>
							<span>$ {CurrencyFormat(shipping, 2, '.', ',')}</span>
						</div>
						<div className='summary-row total'>
							<span>Total</span>
							<span>$ {CurrencyFormat(total, 2, '.', ',')}</span>
						</div>
					</div>
					<div className='cart-actions'>
						<button className='quote-button'>Crear cotización</button>
						<button className='view-cart-button'>Ver carrito de compras</button>
					</div>
				</>
			)}
			<style jsx>{`
				.cart-summary {
					width: 40%;
					background: #fff;
					box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
					border-bottom-left-radius: 2px;
					border-bottom-right-radius: 2px;
					padding: 20px;
					display: flex;
					flex-direction: column;
					position: absolute;
					top: 59px;
					right: 0;
					z-index: 1000;
          min-height: 200px;
          justify-content: space-between;
				}

        .cart-summary:before {
						content: '';
						position: absolute;
						top: -6px;
						right: 5%;
						width: 0px;
						height: 0px;
						border-left: 6px solid transparent;
						border-right: 6px solid transparent;
						border-bottom: 6px solid rgb(255, 255, 255);
						clear: both;
						transform: translate(-50%);
        }

				.empty-cart {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 20px;
					justify-content: center;
					text-align: center;
					color: #666;
					font-weight: bold;
					font-size: 16px;
          height: 100%;
					position: relative;
				}
				.cart-header {
					display: flex;
					justify-content: flex-end;
					margin-bottom: 15px;
				}
				.clear-cart-button {
					background: none;
					border: none;
					color: #ff002c;
					font-weight: bold;
					cursor: pointer;
				}
				.cart-items {
					flex-grow: 1;
					max-height: 200px;
					overflow-y: auto;
					margin-bottom: 15px;
				}
				.cart-item {
					display: flex;
					justify-content: space-between;
					margin-bottom: 10px;
					border-bottom: 1px solid #f0f0f0;
					padding-bottom: 10px;
				}
				.item-details {
					display: flex;
					gap: 10px;
				}
				.item-image {
					width: 50px;
					height: 50px;
					object-fit: cover;
					position: relative;
				}
				.item-name {
					font-weight: bold;
					margin-bottom: 5px;
				}
				.item-sku,
				.item-stock {
					font-size: 12px;
					color: #666;
				}
				.item-actions {
					display: flex;
					align-items: center;
					gap: 10px;
				}
				.item-quantity {
					font-weight: bold;
				}
				.item-price {
					font-weight: bold;
					color: #ff002c;
				}
				.remove-item-button {
          background: none;
          border: none;
          color: #ff002c !important;  
          cursor: pointer;
          font-size: 18px;
          line-height: 1; 
          display: inline-block; /  
        }

				.cart-summary-details {
					border-top: 1px solid #f0f0f0;
					padding-top: 10px;
					margin-bottom: 15px;
          line-height: 1.5;
				}
				.summary-row {
					display: flex;
					justify-content: space-between;
					margin-bottom: 5px;
				}
				.summary-row.total {
          border-top: 1px solid #f0f0f0;
					font-weight: bold;
					font-size: 16px;
          line-height: 2;

				}
				.cart-actions {
					display: flex;
					gap: 10px;
				}
				.quote-button,
				.view-cart-button {
					flex: 1;
					background: #ff002c;
					color: #fff;
					border: none;
					border-radius: 5px;
					height: 40px;
					font-weight: bold;
					cursor: pointer;
				}
				.quote-button {
					background: #007bff;
				}
				.quote-button:hover {
					background: #0056b3;
				}
				.view-cart-button:hover {
					background: #e00028;
				}

        @media only screen and (max-width: 62em) { 
          .cart-summary {
            width: 100%;
            height: calc(90dvh - 61px);
        }
			`}</style>
		</div>
	);
};

export default CartSummaryMini;
