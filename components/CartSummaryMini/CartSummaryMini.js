/*  components/CartSummaryMini.jsx  */
import React, {
	useRef,
	useState,
	useLayoutEffect,
} from 'react';
import useCart from '../../hooks/useCart';
import Capitalize from '../../hooks/CapitalizeTitle';
import Image from 'next/image';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import TruncateMarkup from 'react-truncate-markup';
import Link from 'next/link';
import { useAppDispatch } from '../../lib/hooks';
import {
	hideAll,
	showPaymentsChange,
} from '../../lib/features/showOpacityContainerSlide';
import { Preloader, TailSpin } from 'react-preloader-icon';
import { useAuth } from '../../hooks/auth';
import Router from 'next/router';

const CartSummaryMini = () => {
	const {
		cart,
		removeFromCart,
		clearCart,
		subtotal,
		shipping,
		total,
		loading,
	} = useCart();

	const dispatch = useAppDispatch();
	const cartItemsRef = useRef(null);

	const [showScrollUp, setShowScrollUp] = useState(false);
	const [showScrollDown, setShowScrollDown] = useState(false);
	const [arrowUp, setArrowUp] = useState(0);
	const [arrowDown, setArrowDown] = useState(0);

	const [isGenerating, setIsGenerating] = useState(false);   // ← spinner cotización

	const { cartMsi, accessToken, isAuthenticated } = useAuth();

	/* ───────────────────────────  PDF  ─────────────────────────── */
	const handleCreateQuotation = async () => {
		try {
			if (!isAuthenticated) {
				Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
				dispatch(hideAll());
				return;
			}

			setIsGenerating(true);     // inicia spinner

			const response = await fetch(
				'https://api.pccdnapi.com/cart/quotation-pdf',
				{
					method: 'GET',
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);

			if (!response.ok) throw new Error('Error al generar PDF de cotización');

			// Nombre de archivo desde Content‑Disposition
			let filename = 'Cotizacion.pdf';
			const dispo = response.headers.get('Content-Disposition');
			if (dispo && dispo.includes('filename=')) {
				const match = dispo.match(/filename[^;=\n]*=(['"]?)([^'";\n]+)\1/);
				if (match && match[2]) filename = decodeURIComponent(match[2]);
			}

			// Descargar blob
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error('Error al crear la cotización PDF:', err);
		} finally {
			setIsGenerating(false);    // termina spinner
		}
	};

	/* ───────────────────────── Scroll helpers ───────────────────────── */
	const checkScroll = () => {
		if (cartItemsRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = cartItemsRef.current;
			setArrowUp(scrollTop);
			setArrowDown(0 - scrollTop);
			setShowScrollUp(scrollTop > 0);
			setShowScrollDown(scrollTop + clientHeight < scrollHeight);
		}
	};

	useLayoutEffect(() => {
		checkScroll();
		cartItemsRef.current?.addEventListener('scroll', checkScroll);
		return () =>
			cartItemsRef.current?.removeEventListener('scroll', checkScroll);
	}, [cart]);

	const scroll = (direction) => {
		if (cartItemsRef.current) {
			cartItemsRef.current.scrollBy({
				top: direction * 100,
				behavior: 'smooth',
			});
		}
	};

	useLayoutEffect(() => {
		const t = setTimeout(checkScroll, 0);
		return () => clearTimeout(t);
	}, [cart]);

	/* ───────────────────────── Render ───────────────────────── */
	return (
		<div className="cart-summary">
			{cart.length === 0 ? (
				<div className="empty-cart">
					{/*  SVG vacío  */}
					<svg
						version="1.0"
						xmlns="http://www.w3.org/2000/svg"
						width="100px"
						height="100px"
						viewBox="0 0 200 200"
						preserveAspectRatio="xMidYMid meet"
					>
						<g fill="#666">
							{/* paths recortados por brevedad */}
							<path d="M82.5 190.6 ..." />
							<path d="M136.5 190.7 ..." />
							<path d="M77.9 155 ..." />
						</g>
					</svg>
					<p>Tu carrito está vacío.</p>
				</div>
			) : (
				<>
					{/*  Cambio de modo MSI / contado  */}
					<div className="cart__change-payment">
						<span
							className="cart__change-payment__action"
							onClick={() => dispatch(showPaymentsChange())}
						>
							Cambiar modo de carrito:
						</span>
						<span
							className="payments-change__label-status"
							onClick={() => dispatch(showPaymentsChange())}
						>
							{cartMsi ? 'MSI/Pagos' : 'Contado'}
						</span>
					</div>

					{/*  Encabezado carrito  */}
					<div className="cart-header">
						<span className="cart__counter-label text--off">
							Tienes {cart.reduce((t, i) => t + i.quantity, 0)} artículo(s) en tu carrito:
						</span>
						<button onClick={clearCart} className="clear-cart-button">
							Borrar todos
						</button>
					</div>

					{/*  Lista de ítems  */}
					<div className="cart-items" ref={cartItemsRef}>
						{showScrollUp && (
							<div
								className="scroll-arrow up"
								onClick={() => scroll(-1)}
								style={{ top: arrowUp }}
							>
								↑
							</div>
						)}

						{cart.map((item) => (
							<div key={item.id} className="cart-item">
								<div className="item-details">
									<Link legacyBehavior href={`/${item.product.slug}`}>
										<a>
											<div
												className="item-image"
												onClick={() => dispatch(hideAll())}
											>
												<Image
													src={
														item.product.imagen1s
															? item.product.imagen1xs.includes('https://api.pccdnapi.com')
																? item.product.imagen1xs
																: `https://api.pccdnapi.com${item.product.imagen1xs}`
															: '/images/not-available.png'
													}
													fill
													style={{ objectFit: 'contain' }}
													alt={Capitalize(item.product.titulo)}
													draggable="false"
													sizes="auto"
													priority
												/>
											</div>
										</a>
									</Link>

									<div>
										<Link legacyBehavior href={`/${item.product.slug}`}>
											<a>
												<div
													className="item-name"
													onClick={() => dispatch(hideAll())}
												>
													<TruncateMarkup lines={1}>
														<span>{Capitalize(item.product.titulo)}</span>
													</TruncateMarkup>
												</div>
											</a>
										</Link>

										<div className="item-sku">
											<TruncateMarkup lines={1}>
												<span>{item.product.sku}</span>
											</TruncateMarkup>
										</div>
										<div className="item-stock">
											Disponible: {item.product.stock_total} Pzs.
										</div>
									</div>
								</div>

								<div className="item-actions">
									<div className="item-quantity">{item.quantity} Pza.</div>

									<div className="item-price">
										{item.product.precio_final_descuento > 0 && (
											<span className="price--compare text--off">
												$ {CurrencyFormat(item.product.precio_final * item.quantity)}
											</span>
										)}
										$ {CurrencyFormat(
											!cartMsi
												? item.product.precio_contado * item.quantity
												: item.product.precio_final_descuento > 0
													? item.product.precio_final_descuento * item.quantity
													: item.product.precio_final * item.quantity,
											2,
											'.',
											',',
										)}
									</div>

									<a
										onClick={() => removeFromCart(item.id)}
										className="remove-item-button"
									>
										<span className="close" />
									</a>
								</div>
							</div>
						))}

						{showScrollDown && (
							<div
								className="scroll-arrow down"
								onClick={() => scroll(1)}
								style={{ bottom: arrowDown }}
							>
								↓
							</div>
						)}
					</div>

					{/*  Totales  */}
					<div className="cart-summary-details">
						<div className="summary-row text--off">
							<span>Subtotal</span>
							<span>$ {CurrencyFormat(subtotal, 2, '.', ',')}</span>
						</div>
						<div className="summary-row text--off">
							<span>Envío</span>
							<span>$ {CurrencyFormat(shipping, 2, '.', ',')}</span>
						</div>
						<div className="summary-row total">
							<span>
								Total <span className="iva text--off">(Incluye IVA)</span>
							</span>
							<span>$ {CurrencyFormat(total, 2, '.', ',')}</span>
						</div>
					</div>

					{/*  Acciones  */}
					<div className="cart-actions">
						<button
							className={`quote-button ${isGenerating ? 'disabled' : ''}`}
							onClick={handleCreateQuotation}
							disabled={isGenerating}
						>
							{isGenerating ? (
								<>
									<Preloader
										use={TailSpin}
										size={18}
										strokeWidth={8}
											strokeColor="#666"
										duration={900}
									/>
									&nbsp;Generando…
								</>
							) : (
								'Crear Cotización'
							)}
						</button>

						<Link href="/carrito" legacyBehavior>
							<button
								className="view-cart-button"
								onClick={() => dispatch(hideAll())}
							>
								Comprar Carrito
							</button>
						</Link>
					</div>
				</>
			)}

			{/*  Spinner global mientras sincronizas carrito  */}
			{loading && (
				<div className="cart__loading">
					<div className="cart__loading__container">
						<Preloader
							use={TailSpin}
							size={30}
							strokeWidth={8}
							strokeColor="var(--primary-color)"
							duration={900}
						/>
					</div>
				</div>
			)}

			{/* ─────────────────────────  ESTILOS  ───────────────────────── */}
			<style jsx>{`
        .price--compare {
          font-size: 12px !important;
        }

        .payments-change__label-status {
          font-size: 12px;
          font-weight: 300;
          margin-left: 5px;
          border-radius: 5px;
          background-color: var(--primary-color);
          color: #fff;
          padding: 2px 5px;
          cursor: pointer;
        }

        .cart__change-payment__action {
          text-decoration: underline;
          cursor: pointer !important;
        }

        .cart__change-payment {
          font-size: 12px;
          margin-bottom: 10px;
          color: var(--primary-color);
        }

        /* Loading overlay (sin cambios) */
        .cart__loading {
          position: absolute;
          background: #0f0f0f;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 0.8;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .cart__loading__container {
          position: relative;
          height: 200px;
          width: 50%;
          background-color: #fff;
          opacity: 1;
          border-radius: 2px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Scroll arrows */
        .scroll-arrow {
          position: absolute;
          width: 100%;
          text-align: center;
          font-size: 20px;
          cursor: pointer;
          background-color: rgba(255, 255, 255, 0.8);
          color: var(--primary-color);
          z-index: 2;
          padding: 5px 0;
        }

        .cart__counter-label {
          font-size: 12px;
        }

        /* Contenedor principal */
        .cart-summary {
          width: 40%;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
          max-height: 75dvh;
        }
        .cart-summary:before {
          content: '';
          position: absolute;
          top: -6px;
          right: 5%;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #fff;
          transform: translate(-50%);
        }

        /* Empty cart */
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

        /* Header */
        .cart-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .clear-cart-button {
          background: none;
          border: none;
          color: var(--primary-color);
          font-weight: bold;
          cursor: pointer;
        }

        /* Items list */
        .cart-items {
          flex-grow: 1;
          margin-bottom: 15px;
          position: relative;
          overflow-y: auto;
          max-width: 100%;
        }
        .cart-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 10px;
          width: 100%;
          gap: 10px;
        }
        .item-details {
          display: flex;
          gap: 10px;
          max-width: calc(100% - 180px);
        }
        .item-details > div {
          flex: 1;
          min-width: 0;
        }
        .item-name,
        .item-sku {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
          padding-right: 15px;
        }
        .item-sku,
        .item-stock {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-actions {
          display: flex;
          align-items: center;
          justify-content: right;
          gap: 10px;
          min-width: 170px;
        }
        .item-quantity {
          font-weight: bold;
          min-width: 40px;
        }
        .item-price {
          font-weight: bold;
          min-width: 75px;
          text-align: right;
          display: flex;
          flex-direction: column;
        }
        .remove-item-button {
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close {
          height: 12px;
          width: 12px;
          color: var(--primary-color);
          display: block !important;
        }

        /* Totales */
        .cart-summary-details {
          border-top: 1px solid #eaeaea;
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
          border-top: 1px solid #eaeaea;
          font-weight: bold;
          font-size: 16px;
          line-height: 2;
        }

        /* Acciones */
        .cart-actions {
          display: flex;
          gap: 10px;
        }
        .quote-button,
        .view-cart-button {
          flex: 1;
          background: var(--primary-color);
          color: #fff;
          border: none;
          border-radius: 5px;
          height: 40px;
          font-weight: bold;
          cursor: pointer;
        }
        .quote-button {
          background: #ffb116;
        }
        .quote-button:hover {
          background: #ffa01b;
        }
        .view-cart-button:hover {
          background: #e00028;
        }

        /* Botón “Crear cotización” deshabilitado */
        .quote-button.disabled {
          background: #eaeaea;
          cursor: not-allowed;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .quote-button.disabled:hover {
          background: #eaeaea;
        }

        .iva {
          font-size: 14px;
        }

        /* Responsive */
        @media only screen and (max-width: 62em) {
          .cart-summary {
            width: 100%;
            height: calc(100dvh - 61px);
            max-height: unset;
          }
          .cart-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
		</div>
	);
};

export default CartSummaryMini;
