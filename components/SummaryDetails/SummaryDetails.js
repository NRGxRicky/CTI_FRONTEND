import React from 'react';
import Image from 'next/image';
import { showPaymentsChange } from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch } from '../../lib/hooks';
import { useAuth } from '../../hooks/auth';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import useCart from '../../hooks/useCart';
import Link from 'next/link';

const SummaryDetails = ({ urlAction, step }) => {
	const { cart, subtotal, shipping, total, address } = useCart();
	const dispatch = useAppDispatch();
	const { cartMsi } = useAuth();

	return (
		<div className='summary-details'>
			<div className='summary-details__content'>
				<div className='cart__change-payment'>
					<span
						className='cart__change-payment__action'
						onClick={() => {
							dispatch(showPaymentsChange());
						}}
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
				<div className='summary-row'>
					<span>
						{cart.reduce((total, item) => total + item.quantity, 0)}{' '}
						Producto(s):
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

				{/* Comienza Payments */}
				{cartMsi ? (
					<div className='payments'>
						<div className='payments__option__header'>
							<span>Pagar a MSI/Pagos con:</span>
						</div>
						<div className='payments__option__body'>
							<div className='payments__option__item'>
								<div className='payments__option__item__image'>
									<Image
										src='/images/logo-mercado-pago.png'
										fill
										style={{ objectFit: 'contain', padding: 5 }}
										alt='Mercado Pago'
										draggable='false'
										sizes='auto'
									/>
								</div>
								<div className='payments__option__item__label'>
									<span>
										Hasta 3 MSI con tarjetas participantes Mercado Pago o hasta
										12 pagos con Mercado Crédito.
									</span>
								</div>
							</div>
							<div className='payments__option__item'>
								<div className='payments__option__item__image'>
									<Image
										src='/images/Logotipo_Kueski_pay.png'
										fill
										style={{ objectFit: 'contain', padding: 5 }}
										alt='Kueski Pay'
										draggable='false'
										sizes='auto'
									/>
								</div>
								<div className='payments__option__item__label'>
									<span>
										Paga en hasta 12 quincenas con Kueski Pay, sin comisiones
										ocultas.
									</span>
								</div>
							</div>
							<div className='payments__option__item'>
								<div className='payments__option__item__image'>
									<Image
										src='/images/logo-aplazo.png'
										fill
										style={{ objectFit: 'contain', padding: 5 }}
										alt='Aplazo'
										draggable='false'
										sizes='auto'
									/>
								</div>
								<div className='payments__option__item__label'>
									<span>
										Divide tus pagos en quincenas con Aplazo, sin letras
										pequeñas.
									</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className='payments'>
						<div className='payments__option__header'>
							<span>Pagar en una sola exhibición con:</span>
						</div>
						<div className='payments__option__body'>
							<div className='payments__option__item'>
								<div className='payments__option__item__image'>
									<Image
										src='/images/paypal-logo-footer.png'
										fill
										style={{ objectFit: 'contain', padding: 5 }}
										alt='Paypal'
										draggable='false'
										sizes='auto'
									/>
								</div>
								<div className='payments__option__item__label'>
									<span>Disfruta de un pago único con PayPal.</span>
								</div>
							</div>
						</div>
					</div>
				)}
				{!address && step == 'shipping' && (
					<div className='checkout__error'>
						<span>Tienes que agregar un domicilio para continuar.</span>
					</div>
				)}
				<Link href={`${urlAction}`} legacyBehavior>
					<a>
						<button
							className='proceed-checkout'
							disabled={!address && step == 'shipping'}
						>
							Continuar
						</button>
					</a>
				</Link>
			</div>
			<style jsx>
				{`
					.checkout__error {
						color: var(--primary-color);
						line-height: 3;
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

					.payments__option__item {
						display: flex;
						align-items: center;
						gap: 10px;
						margin-top: 10px;
						background-color: #fff;
						border-radius: 5px;
						padding: 5px;
						box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
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
