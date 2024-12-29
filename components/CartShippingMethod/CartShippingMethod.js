import React, { useEffect, useState } from 'react';
import SummaryDetails from '../SummaryDetails/SummaryDetails';
import useCart from '../../hooks/useCart';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import fetchData from '../../hooks/GetDataAuth';
import { useAuth } from '../../hooks/auth';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { showProfileAddAddress } from '../../lib/features/showOpacityContainerSlide';
import ProfileAddAddress from '../ProfileAddAddress/ProfileAddAddress';
import ProfileAllAddress from '../ProfileAllAddress/ProfileAllAddress';

const CartShippingMethod = () => {
	const { shipping, address, setAddress } = useCart();
	const [loadingData, setLoadingData] = useState(false);
	const [profile, setProfile] = useState({
		domicilios: [],
		PccomputoUsuarioDatosFacturacion: [],
	});
	const { isAuthenticated, loading, accessToken, isVerified } = useAuth();
	const [showAllAddresses, setShowAllAddresses] = useState(false);
	const [activeAddressId, setActiveAddressId] = useState(address?.id || null);

	const [editingAddress, setEditingAddress] = useState(null);

	const handleSelectAddress = async (domicilio) => {
		try {
			const response = await fetch(
				'https://api.pccdnapi.com/profile/domicilio/set-active/',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify({ id: domicilio.id }),
				}
			);

			if (response.ok) {
				setAddress(domicilio);
				setActiveAddressId(domicilio.id);
				setShowAllAddresses(false);
			} else {
				console.error('No se pudo actualizar el domicilio activo.');
			}
		} catch (error) {
			console.error('Error al actualizar el domicilio activo:', error);
		}
	};

	const handleCloseModal = () => setShowAllAddresses(false);

	const handleEditAddress = (domicilio) => {
		setEditingAddress(domicilio); // Establece el domicilio que estás editando
		dispatch(showProfileAddAddress());
	};

	const handleAddNewAddress = () => {
		setEditingAddress(null); // Asegúrate de que esté vacío para un nuevo domicilio
		dispatch(showProfileAddAddress());
	};

	const dispatch = useAppDispatch();
	const stateProfileAddAddress = useAppSelector(
		(state) => state.showOpacityContainerReducer.ProfileAddAddress
	);

	const getDataProfile = async () => {
		setLoadingData(true);

		const resData = await fetchData('/profile/resume/', accessToken);
		if (resData.ok) {
			const dataJson = await resData.json();
			setProfile(dataJson);
			const activeAddress = dataJson.domicilios.filter((d) => d.active)[0];
			setAddress(activeAddress);
		}
	};

	useEffect(() => {
		if (accessToken) {
			getDataProfile();
		}
		address && setActiveAddressId(address.id)
	}, [address]);

	return (
		<div className='cart-shipping-method'>
			<div className='car-shipping-method__body'>
				<div className='cart-shipping-options'>
					<div className='cart-shipping-method__header'>
						<div className='cart-shipping-method__title'>Forma de envío</div>
					</div>
					<div className='cart-shipping-method__body'>
						<div className='cart-shipping-method__item active'>
							<div className='radio-wrapper'>
								<input
									id='shipping-estandar'
									type='radio'
									name='shipping-estandar'
									defaultChecked
								></input>
							</div>
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
						{!address ? (
							<div className='cart-shipping-method__actions'>
								<button
									className='cart-shipping-method__actions__change-addres__button'
									onClick={() => {
										dispatch(showProfileAddAddress());
									}}
								>
									+ Agregar Domicilio
								</button>
								{stateProfileAddAddress && <ProfileAddAddress />}
							</div>
						) : (
							<div className='cart-shipping-method__item' key={address.id}>
								<div className='cart-shipping-method__item__description'>
									<div className='cart-shipping-method__item__title'>
										<span>
											{address.nombres} {address.apellidos}
										</span>
									</div>
									<div className='cart-shipping-method__item__detail'>
										<p>
											{address.calle} {address.numero} {address.numero_interior}
											, {address.colonia}
										</p>
										<p>
											{address.ciudad}, {address.estado},{' '}
											{address.codigo_postal}
										</p>
										<p>{address.telefono}</p>
									</div>
								</div>
								<div
									className='cart-shipping-method__action'
									onClick={() => {
										dispatch(
											showProfileAddAddress(),
											setEditingAddress(address)
										);
									}}
								>
									Editar
								</div>
								{stateProfileAddAddress && (
									<ProfileAddAddress domicilio={editingAddress} />
								)}
							</div>
						)}
					</div>
					{profile.domicilios.length > 0 && (
						<div className='cart-shipping-method__actions'>
							<button
								className='cart-shipping-method__actions__change-addres__button'
								onClick={() => setShowAllAddresses(true)}
							>
								Elegir otro domicilio
							</button>
						</div>
					)}
					{showAllAddresses && (
						<ProfileAllAddress
							domicilios={profile.domicilios}
							activeAddressId={activeAddressId}
							onSelectAddress={handleSelectAddress}
							onEditAddress={handleEditAddress}
							onAddNewAddress={handleAddNewAddress}
							onCloseModal={handleCloseModal}
						/>
					)}
				</div>
			</div>
			<SummaryDetails urlAction={'/carrito/pago'} step={'shipping'} />
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
					border: 1px solid #eaeaea;
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
					border: 1px solid var(--primary-color) !important;
					color: var(--primary-color);
					fill: var(--primary-color);
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
