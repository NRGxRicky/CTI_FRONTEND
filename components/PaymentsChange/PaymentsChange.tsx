import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { hideAll } from '../../lib/features/showOpacityContainerSlide';
import { useAuth } from '../../hooks/auth';
import Image from 'next/image';

const PaymentsChange = () => {
	const statePaymentsChange = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.PaymentsChange
	);
	const dispatch = useAppDispatch();
	const { cartMsi, updateDataUser } = useAuth();
	const [payment, setPayment] = useState(false);

	const handleChangePayment = (paymentStatus: boolean) => {
		updateDataUser(paymentStatus);
	};

	useEffect(() => {
		setPayment(cartMsi);
	}, [cartMsi]);

	if (!statePaymentsChange) return null;

	return (
		<div
			className='payments-change'
			onClick={() => {
				dispatch(hideAll());
			}}
		>
			<div className='payments-change__container'>
				<div className='payments-change__header'>
					<span>
						Estás a punto de cambiar la forma de pago predeterminada de tu
						carrito:
					</span>
					<span className='payments-change__label-status text--off'>
						{payment ? 'MSI/Pagos' : 'Contado'}
					</span>
					<div className='payments-change__label-help text--off'>
						Haz clic en la opción que prefieras.
					</div>
				</div>
				<div className='payments-change__body'>
					<div
						className={`payments-change__option ${
							payment ? 'payment-disable' : 'payment-enable'
						}`}
						onClick={() => {
							handleChangePayment(false);
						}}
					>
						<div className='payments-change__option__header'>
							<span>Pagar en una sola exhibición con:</span>
						</div>
						<div className='payments-change__option__body'>
							<div className='payments-change__option__item'>
								<div className='payments-change__option__item__image'>
									<Image
										src='/images/paypal-logo-footer.png'
										fill
										style={{ objectFit: 'contain', padding: 5 }}
										alt='Paypal'
										draggable='false'
										sizes='auto'
									/>
								</div>
								<div className='payments-change__option__item__label'>
									<span>Disfruta de un pago único con PayPal.</span>
								</div>
							</div>
						</div>
					</div>
					<div
						className={`payments-change__option ${
							!payment ? 'payment-disable' : 'payment-enable'
						}`}
						onClick={() => {
							handleChangePayment(true);
						}}
					>
						<div className='payments-change__option__header'>
							<span>Pagar a MSI/Pagos con:</span>
						</div>
						<div className='payments-change__option__body'>
							<div className='payments-change__option__item'>
								<div className='payments-change__option__item__image'>
									<Image
										src='/images/logo-mercado-pago.png'
										fill
										style={{ objectFit: 'contain', padding: 5 }}
										alt='Mercado Pago'
										draggable='false'
										sizes='auto'
									/>
								</div>
								<div className='payments-change__option__item__label'>
									<span>
										Hasta 3 MSI con tarjetas participantes o hasta 12 pagos con
										Mercado Crédito.
									</span>
								</div>
							</div>
							<div className='payments-change__option__item'>
								<div className='payments-change__option__item__image'>
									<Image
										src='/images/Logotipo_Kueski_pay.png'
										fill
										style={{ objectFit: 'contain', padding: 5 }}
										alt='Kueski Pay'
										draggable='false'
										sizes='auto'
									/>
								</div>
								<div className='payments-change__option__item__label'>
									<span>
										Paga en hasta 12 quincenas con Kueski Pay, sin comisiones
										ocultas.
									</span>
								</div>
							</div>
							<div className='payments-change__option__item'>
								<div className='payments-change__option__item__image'>
									<Image
										src='/images/logo-aplazo.png'
										fill
										style={{ objectFit: 'contain', padding: 5 }}
										alt='Aplazo'
										draggable='false'
										sizes='auto'
									/>
								</div>
								<div className='payments-change__option__item__label'>
									<span>
										Divide tus pagos en quincenas con Aplazo, sin letras
										pequeñas.
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<style jsx>
				{`
					.payments-change {
						position: fixed;
						top: 61px;
						width: 100dvw;
						height: calc(100dvh - 61px);
						z-index: 1000;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.payments-change__container {
						background-color: #fff;
						min-width: 100px;
						min-height: 100px;
						max-width: 50dvw;
            max-height: calc(100dvh - 61px);
						border-radius: 5px;
						padding: 0 20px 30px 20px;
					}

					.payments-change__header {
						font-weight: 600;
						font-size: 18px;
						border-bottom: 1px solid #eaeaea;
						margin-top: 20px;
					}

					.payments-change__header span {
						line-height: 2;
					}

					.payments-change__label-help {
						font-size: 12px;
						font-weight: 300;
						line-height: 3;
					}

					.payments-change__body {
						margin-top: 20px;
						display: flex;
						justify-content: space-between;
						gap: 20px;
					}
					.payments-change__option {
						border: 1px solid #eaeaea;
						border-radius: 5px;
            width: 100%;
					}

					.payments-change__option__header {
						font-weight: 600;
						font-size: 16px;
						border-bottom: 1px solid #eaeaea;

					}

					.payments-change__option__header span {
						line-height: 3;
						margin-left: 20px;
					}

					.payments-change__option__body {
						position: relative;
						width: 100%;
						padding: 20px;
					}

					.payments-change__option__item {
						display: flex;
						align-items: center;
						gap: 10px;
						margin-top: 10px;
					}

					.payments-change__option__item__image {
						position: relative;
						max-width: 200px;
						max-height: 200px;
						min-height: 50px;
						min-width: 50px;
						border: 1px solid #eaeaea;
						border-radius: 5px;
					}

					.payments-change__option__item__label {
						font-weight: 600;
						line-height: 1.5;
					}

					.payment-disable {
						cursor: pointer;
					}

					.payment-enable {
						border-color: #ff002c !important;
					}

					.payment-enable .payments-change__option__header {
						background-color: #ff002c;
						color: #fff;
					}

					.payment-enable .payments-change__option__item__image {
						background-color: #fff;
					}

					.payments-change__label-status {
						font-size: 14px;
						font-weight: 300;
						margin-left: 10px;
						border-radius: 5px;
						background-color: #ff002c;
						color: #fff;
						padding: 5px 10px;
					}

          @media only screen and (max-width: 62em) { 
          .payments-change__container {
            max-width: 
            100dvw !important;
            overflow-y: auto;
          }
          .payments-change__body {
            flex-wrap: wrap;
          }
          .payments-change__header {
            font-size: 14px;
          }

          .payments-change__option__item__label {
						font-size: 12px;
            
					}

          .payments-change__option__header {
              font-size: 14px;
          }
				`}
			</style>
		</div>
	);
};

export default PaymentsChange;
