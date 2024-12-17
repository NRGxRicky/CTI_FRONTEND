import React, { useEffect, useState } from 'react';
import SummaryDetails from '../SummaryDetails/SummaryDetails';
import useCart from '../../hooks/useCart';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import fetchData from '../../hooks/GetDataAuth';
import { useAuth } from '../../hooks/auth';

const CartShippingMethod = () => {
	const { shipping } = useCart();
	const [loadingData, setLoadingData] = useState(false);
	const [profile, setProfile] = useState({
		domicilios: [],
		PccomputoUsuarioDatosFacturacion: [],
	});
	const { isAuthenticated, loading, accessToken, isVerified } = useAuth();

	const getDataProfile = async () => {
		setLoadingData(true);

		const resData = await fetchData('/profile/resume/', accessToken);

		const dataJson = await resData.json();
		setProfile(dataJson);
	};

	useEffect(() => {
		getDataProfile();
	}, []);

	return (
		<div className='cart-shipping-method'>
			<div className='car-shipping-method__body'>
				<div className='cart-shipping-options'>
					<div className='cart-shipping-method__header'>
						<div className='cart-shipping-method__title'>Forma de envío</div>
					</div>
					<div className='cart-shipping-method__body'>
						<div className='cart-shipping-method__item active'>
							<div className='cart-shipping-method__item__logo'>
								<FreeShipping color={false} modeCard={true} label='' />
							</div>
							<div className='cart-shipping-method__item__description'>
								<div className='cart-shipping-method__item__title'>
									<span>Envío Estándar Terrestre</span>
								</div>
								<div className='cart-shipping-method__item__detail'>
									<span>Terrestre 3 a 5 Días Hábiles</span>
								</div>
							</div>
							<div className='cart-shipping-method__item__price'>
								<span>$ {CurrencyFormat(shipping, 2, '.', ',')}</span>
							</div>
						</div>
					</div>
				</div>
				<div className='cart-shipping-address'>
					<div className='cart-shipping-method__header'>
						<div className='cart-shipping-method__title'>
							Dirección de envió
						</div>
					</div>
					<div className='cart-shipping-method__body'>
						{profile.domicilios.map((item) => (
							<div className='cart-shipping-method__item' key={item.id}>
								<div className='cart-shipping-method__item__description'>
									<div className='cart-shipping-method__item__title'>
										<span>
											{item.nombres} {item.apellidos}
										</span>
									</div>
									<div className='cart-shipping-method__item__detail'>
										<p>
											{item.calle} {item.numero} {item.numero_interior},{' '}
											{item.colonia}
										</p>
										<p>
											{item.ciudad}, {item.estado}, {item.codigo_postal}
										</p>
										<p>{item.telefono}</p>
									</div>
								</div>
								<div className='cart-shipping-method__action'>Editar</div>
							</div>
						))}
					</div>
					<div className='cart-shipping-method__actions'>
						<button className='cart-shipping-method__actions__change-addres__button'>
							Elegir otro domicilio
						</button>
					</div>
				</div>
			</div>
			<SummaryDetails urlAction={'/carrito/pago'} />
			<style jsx>{`
				.cart-shipping-method__body {
					margin-bottom: 15px;
				}

				.cart-shipping-method__actions__change-addres__button {
					flex: 1;
					background: #ffb116;
					color: #fff;
					border-radius: 4px;
					padding: 10px;
					font-size: 16px;
					cursor: pointer;
					text-align: center;
					width: 100%;
					border: none;
				}

				.cart-shipping-method__action {
					color: #ffa01b;
					cursor: pointer;
				}

				.cart-shipping-method__actions__change-addres__button:hover {
					background-color: #ffa01b;
				}

				.cart-shipping-method__item__description {
					line-height: 1.5;
					flex: 50%;
				}

				.cart-shipping-method__item__detail {
					font-size: 12px;
				}

				.cart-shipping-method__item__title {
					font-weight: 600;
				}

				.cart-shipping-method__item {
					border: 1px solid #f0f0f0;
					padding: 20px;
					border-radius: 5px;
					display: flex;
					align-items: center;
					gap: 15px;
					justify-content: space-evenly;
					flex-wrap: wrap;
					cursor: pointer;
				}

				.cart-shipping-method__item.active {
					border: 1px solid #ff002c !important;
					color: #ff002c;
					fill: #ff002c;
				}

				.cart-shipping-method {
					display: flex;
					gap: 20px;
					flex-wrap: wrap;
					padding: 0 20px;
					justify-content: space-evenly;
				}

				.cart-shipping-method__title {
					font-size: 16px;
					font-weight: 600;
					margin-bottom: 20px;
				}

				.car-shipping-method__body {
					display: flex;
					gap: 20px;
					flex: 1;
				}

				.cart-shipping-address {
					flex: 2;
				}

				@media only screen and (max-width: 62em) {
					.car-shipping-method__body,
					.cart-shipping-address,
					.cart-shipping-options {
						flex: 100%;
						flex-wrap: wrap;
					}
				}
			`}</style>
		</div>
	);
};

export default CartShippingMethod;
