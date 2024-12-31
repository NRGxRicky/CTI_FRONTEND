import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from '../../hooks/auth';
import useCart from '../../hooks/useCart';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import TruncateMarkup from 'react-truncate-markup';
import Capitalize from '../../hooks/CapitalizeTitle';
import SummaryDetails from '../SummaryDetails/SummaryDetails';
import formasDePago from '../../hooks/formasDePago';
import regimenesFiscales from '../../hooks/regimenesFiscales';
import usosCFDI from '../../hooks/usosCFDI';

const CartConfirmMethod = () => {
	const {
		cart,
		address,
		taxInvoice,
		paymentMethod,
		cartMsi,
		// subtotal, shipping, total... (si los necesitas directamente aquí)
	} = useCart();

	const { isAuthenticated } = useAuth();

	/* === Helpers para mostrar las descripciones (usos, regímenes, formas de pago) === */
	const getUsoCFDIDescription = (usoKey) => {
		const found = usosCFDI.find((uso) => uso.c_UsoCFDI === usoKey);
		return found ? `${found.c_UsoCFDI} - ${found.Descripción}` : usoKey;
	};

	const getRegimenDescription = (regimenKey) => {
		const found = regimenesFiscales.find((r) => r.Clave === regimenKey);
		return found ? `${found.Clave} - ${found.Descripción}` : regimenKey;
	};

	const getFormaDePagoDescription = (formaKey) => {
		const found = formasDePago.find((f) => f.c_FormaPago === formaKey);
		return found ? `${found.c_FormaPago} - ${found.Descripción}` : formaKey;
	};

	// Ejemplo de métodos de pago, si quieres mostrar su logo o título:
	const paymentOptions = [
		{
			id: 'paypal',
			title: 'PayPal',
			subtitle: 'Disfruta de un pago único con PayPal.',
			imgSrc: '/images/paypal-logo-footer.png',
		},
		{
			id: 'mercadopago',
			title: 'Mercado Pago',
			subtitle:
				'Hasta 3 MSI con tarjetas participantes Mercado Pago o hasta 12 pagos con Mercado Crédito.',
			imgSrc: '/images/logo-mercado-pago.png',
		},
		{
			id: 'kueskipay',
			title: 'Kueski Pay',
			subtitle:
				'Paga en hasta 12 quincenas con Kueski Pay, sin comisiones ocultas.',
			imgSrc: '/images/Logotipo_Kueski_pay.png',
		},
		{
			id: 'aplazo',
			title: 'Aplazo',
			subtitle:
				'Divide tus pagos en quincenas con Aplazo, sin letras pequeñas.',
			imgSrc: '/images/logo-aplazo.png',
		},
		{
			id: 'deposit',
			title: 'Depósito o transferencia Interbancaria',
			subtitle: '',
			imgSrc: '/images/logos/deposit-3banks.png',
		},
	];

	// Hallar el método de pago seleccionado
	const selectedPayment = paymentOptions.find(
		(opt) => opt.id === paymentMethod
	);

	return (
		<div className='cart-confirm-method'>
			{/* Columna Izquierda: Entrega, Pago y Facturación separados */}
			<div className='column-left'>
				{/* Sección Entrega */}
				<div className='confirm-section'>
					<div className='confirm-section__header'>
						<span className='confirm-section__title'>Entrega</span>
						<Link href={'/carrito/envio'} legacyBehavior>
							<a>
								<span className='confirm-section__change'>Cambiar</span>
							</a>
						</Link>
					</div>
					<div className='confirm-section__body'>
						{address ? (
							<div className='address-summary'>
								<strong>
									{address.nombres} {address.apellidos}
								</strong>
								<p>{address.telefono}</p>
								<p>
									{address.calle} {address.numero}{' '}
									{address.numero_interior && `Int. ${address.numero_interior}`}
								</p>
								<p>
									{address.colonia}, {address.ciudad}, {address.estado}
								</p>
								<p>{address.codigo_postal}</p>
							</div>
						) : (
							<p>No se ha seleccionado un domicilio.</p>
						)}
					</div>
				</div>

				{/* Sección Pago */}
				<div className='confirm-section'>
					<div className='confirm-section__header'>
						<span className='confirm-section__title'>Pago</span>
						<Link href={'/carrito/pago'} legacyBehavior>
							<a>
								<span className='confirm-section__change'>Cambiar</span>
							</a>
						</Link>
					</div>
					<div className='confirm-section__body confirm-section__body--payment-flex'>
						{selectedPayment ? (
							<>
								{selectedPayment.imgSrc && (
									<div className='payment-summary__img'>
										<Image
											src={selectedPayment.imgSrc}
											alt={selectedPayment.title}
											width={80}
											height={40}
											style={{ objectFit: 'contain' }}
										/>
									</div>
								)}
								{selectedPayment.subtitle && <p>{selectedPayment.subtitle}</p>}
							</>
						) : (
							<div className='warning-box'>
								<div className='warning-content'>
									<span className='warning-icon'>!</span>
									<div className='warning-texts'>
										<p>No se ha seleccionado una forma de pago.</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Sección Facturación */}
				<div className='confirm-section'>
					<div className='confirm-section__header'>
						<span className='confirm-section__title'>Facturación</span>
						<Link href={'/carrito/pago'} legacyBehavior>
							<a>
								<span className='confirm-section__change'>Cambiar</span>
							</a>
						</Link>
					</div>
					<div className='confirm-section__body'>
						{taxInvoice ? (
							<div className='invoice-summary'>
								<p>
									<strong>{taxInvoice.razon_social}</strong>
								</p>
								<p>{taxInvoice.rfc}</p>
								<p>{taxInvoice.codigo_postal}</p>
								{/* Usamos aquí las funciones para ver las descripciones */}
								<p>{getRegimenDescription(taxInvoice.regimen)}</p>
								<p>{getUsoCFDIDescription(taxInvoice.uso_de_cfdi)}</p>
								<p>{getFormaDePagoDescription(taxInvoice.forma_de_pago)}</p>
							</div>
						) : (
							<div className='warning-box'>
								<div className='warning-content'>
									<span className='warning-icon'>!</span>
									<div className='warning-texts'>
										<p>La factura se emitirá con un RFC genérico.</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Columna 2: Productos */}
			<div className='column-center'>
				<div className='products-section'>
					<div className='products-section__header'>
						<span>Productos</span>
						<Link href={'/carrito'} legacyBehavior>
							<a>
								<span className='confirm-section__change'>Cambiar</span>
							</a>
						</Link>
					</div>
					<div className='products-list'>
						{cart.map((item) => (
							<div key={item.id} className='product-line'>
								<div className='product-line__image'>
									<Image
										src={
											item.product.imagen1xs
												? item.product.imagen1xs.includes(
														'https://api.pccdnapi.com'
												  )
													? item.product.imagen1xs
													: `https://api.pccdnapi.com${item.product.imagen1xs}`
												: '/images/not-available.png'
										}
										alt={item.product.titulo}
										width={60}
										height={60}
										style={{ objectFit: 'contain' }}
									/>
								</div>
								<div className='product-line__info'>
									<Link href={`/${item.product.slug}`} legacyBehavior>
										<a>
											<TruncateMarkup lines={1}>
												<h4>{Capitalize(item.product.titulo)}</h4>
											</TruncateMarkup>
										</a>
									</Link>
									<p>SKU: {item.product.sku}</p>
									<p>
										{item.quantity} x ${' '}
										{CurrencyFormat(
											cartMsi
												? item.product.precio_final_descuento > 0
													? item.product.precio_final_descuento
													: item.product.precio_final
												: item.product.precio_contado,
											2,
											'.',
											','
										)}
									</p>
								</div>
								<div className='product-line__price'>
									<span>
										${' '}
										{CurrencyFormat(
											cartMsi
												? item.product.precio_final_descuento > 0
													? item.product.precio_final_descuento * item.quantity
													: item.product.precio_final * item.quantity
												: item.product.precio_contado * item.quantity,
											2,
											'.',
											','
										)}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Columna 3: Resumen del Carrito */}
			<div className='column-right'>
				<SummaryDetails urlAction={'/carrito/comprar'} step={'confirm'} />
			</div>

			{/* ESTILOS */}
			<style jsx>{`
        
        /* ==== WARNING BOX ==== */
				.warning-box {
					border: 1px solid #ffb84d; /* Borde naranja claro */
					background-color: #fff8ee; /* Fondo crema/naranja muy claro */
					padding: 15px;
					border-radius: 6px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
				}
				.warning-content {
					display: flex;
					align-items: center;
					gap: 10px;
					color: #333;
          
				}
				.warning-icon {
					background-color: #ffa01b;
					color: #fff;
					border-radius: 50%;
					font-weight: bold;
					min-width: 24px;
					text-align: center;
					line-height: 24px;
				}
				.warning-texts {
					display: block;
				}

        .warning-texts {
          height: 14px;
          font-weight: 600;
        }
        
        .confirm-section__body--payment-flex {
          display: flex;
          align-items: center;
          gap: 15px;
          font-weight: 600;
        }


				.cart-confirm-method {
					display: flex;
					gap: 20px;
					flex-wrap: wrap;
					padding: 0 20px;
					justify-content: space-evenly;
				}
				/* Columnas */
				.column-left {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 20px;
					min-width: 280px;
				}
				.column-center {
					flex: 1;
					min-width: 280px;
				}
				.column-right {
					flex: 1;
					min-width: 280px;
				}

				/* Secciones de la columna izquierda */
				.confirm-section {
					border: 1px solid #eaeaea;
					padding: 20px;
					border-radius: 5px;
				}
				.confirm-section__header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 10px;
				}
				.confirm-section__title {
					font-size: 16px;
					font-weight: 600;
				}
				.confirm-section__change {
					color: var(--primary-color);
					cursor: pointer;
					text-decoration: underline;
          font-size: 14px;
          font-weight: 300;
				}
				.confirm-section__body {
					line-height: 1.5;
				}

				/* Sección de Productos (columna central) */
				.products-section {
					border: 1px solid #eaeaea;
					border-radius: 5px;
					padding: 20px;
				}
				.products-section__header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					font-size: 16px;
					font-weight: 600;
					margin-bottom: 10px;
				}
				.products-section__change {
					color: var(--primary-color);
					cursor: pointer;
					text-decoration: underline;
				}
				.products-list {
					display: flex;
					flex-direction: column;
					gap: 15px;
				}

				.product-line {
					display: flex;
					gap: 10px;
					align-items: center;
					border: 1px solid #eaeaea;
					padding: 10px;
					border-radius: 5px;
					background-color: #fff;
				}
				.product-line__image {
					flex-shrink: 0;
				}
				.product-line__info h4 {
					font-size: 14px;
					margin: 0;
				}
				.product-line__info p {
					margin: 3px 0;
					font-size: 12px;
					color: #666;
				}
				.product-line__price {
					margin-left: auto;
					font-weight: 600;
				}

				/* Para el ResumenDetails en la columna derecha,
           ya heredas estilos del componente SummaryDetails. */

				@media (max-width: 960px) {
					.cart-confirm-method {
						flex-direction: column;
					}
					.column-left,
					.column-center,
					.column-right {
						flex: 100%;
						min-width: unset;
					}

          .column-left,
					.column-center {
						font-size: 12px !important;
					}

          .confirm-section__change {
            font-size: 12px !important;
				}
			`}</style>
		</div>
	);
};

export default CartConfirmMethod;
