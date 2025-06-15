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
import { Preloader, TailSpin } from 'react-preloader-icon';

const CartShippingMethod = () => {
	const { shipping, address, setAddress } = useCart();
	const [loadingData, setLoadingData] = useState(false);
	const [profile, setProfile] = useState({
		domicilios: [],
		PccomputoUsuarioDatosFacturacion: [],
	});
	const [activeModal, setActiveModal] = useState(null); // 'add', 'all' o null
	const [editingAddress, setEditingAddress] = useState(null);
	const { isAuthenticated, loading, accessToken, isVerified } = useAuth();
	const [activeAddressId, setActiveAddressId] = useState(address?.id || 0);
	const [isProfileAddAddressVisible, setProfileAddAddressVisible] =
		useState(false);
	const dispatch = useAppDispatch();

	const getDataProfile = async () => {
		setLoadingData(true);
		const resData = await fetchData('/profile/resume/', accessToken);
		if (resData.ok) {
			const dataJson = await resData.json();
			setProfile(dataJson);
			const activeAddress = dataJson.domicilios.find((d) => d.active);
			if (activeAddress) {
				setAddress(activeAddress);
				setActiveAddressId(activeAddress.id);
			} else {
				setAddress(null);
				setActiveAddressId(0);
			}
		}
		setLoadingData(false);
	};

	useEffect(() => {
		if (accessToken) getDataProfile();
	}, []);

	const handleSelectAddress = async (domicilio) => {
		try {
			setLoadingData(true);
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
				getDataProfile();
				setActiveModal(null);
			} else {
				console.error('No se pudo actualizar el domicilio activo.');
			}
		} catch (error) {
			console.error('Error al actualizar el domicilio activo:', error);
		} finally {
			setLoadingData(false);
		}
	};

	const handleAddNewAddress = () => {
		setEditingAddress(null);
		setActiveModal('add');
		setProfileAddAddressVisible(true);
	};

	const handleEditAddress = (domicilio) => {
		setEditingAddress(domicilio);
		if (activeModal == 'all') {
			setActiveModal('all-add');
		} else {
			setActiveModal('add');
		}

		setProfileAddAddressVisible(true);
	};

	const closeProfileAddAddress = () => {
		if (activeModal == 'all-add') {
			setActiveModal('all');
		} else {
			setActiveModal(null);
		}
		setProfileAddAddressVisible(false);
	};

	const handleDeleteAddress = async (domicilioId) => {
		try {
			setLoadingData(true);
			const response = await fetch(
				`https://api.pccdnapi.com/profile/domicilio/delete/${domicilioId}/`,
				{
					method: 'DELETE',
					headers: { Authorization: `Bearer ${accessToken}` },
				}
			);

			if (response.ok) {
				getDataProfile(); // Actualiza la lista después de eliminar
				alert('Domicilio eliminado correctamente.');
			} else {
				alert('Error al eliminar el domicilio.');
			}
		} catch (error) {
			console.error('Error al eliminar el domicilio:', error);
			alert('Error al eliminar el domicilio.');
		} finally {
			setLoadingData(false);
		}
	};

	return (
		<div className='cart-shipping-method'>
			<div className='car-shipping-method__body'>
				<div className='cart-shipping-options'>
					<div className='cart-shipping-method__header'>
						<div className='cart-shipping-method__title'>Forma de Envío</div>
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
									onClick={() => handleAddNewAddress()}
								>
									+ Agregar Domicilio
								</button>
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
									onClick={() => handleEditAddress(address)}
								>
									Editar Dirección
								</div>
							</div>
						)}
					</div>
					{profile.domicilios.length > 0 && (
						<div className='cart-shipping-method__actions'>
							<button
								className='cart-shipping-method__actions__change-addres__button'
								onClick={() => setActiveModal('all')}
							>
								Elegir otro Domicilio
							</button>
						</div>
					)}
				</div>
			</div>

			{(activeModal === 'add' || activeModal === 'all-add') && (
				<ProfileAddAddress
					domicilio={editingAddress}
					onCloseModal={closeProfileAddAddress}
					onSubmit={getDataProfile}
					setLoadingData={setLoadingData}
				/>
			)}
			{activeModal === 'all' && (
				<ProfileAllAddress
					domicilios={profile.domicilios}
					activeAddressId={activeAddressId}
					onSelectAddress={handleSelectAddress}
					onEditAddress={handleEditAddress}
					onAddNewAddress={handleAddNewAddress}
					onCloseModal={() => setActiveModal(null)}
					onDeleteAddress={handleDeleteAddress}
					isProfileAddAddressVisible={isProfileAddAddressVisible}
				/>
			)}

			<SummaryDetails urlAction={'/carrito/pago'} step={'shipping'} />
			{loadingData && (
				<div className='cart__loading'>
					<div className='cart__loading__container'>
						<Preloader
							use={TailSpin}
							size={30}
							strokeWidth={8}
							strokeColor='var(--primary-color)'
							duration={900}
						/>
					</div>
				</div>
			)}
			<style jsx>{`
				.cart__loading {
					position: fixed;
					background: #0f0f0f;
					width: 100%;
					height: calc(100% - 59px);
					top: 59px;
					left: 0px;
					opacity: 0.8;
					display: flex;
					justify-content: center;
					align-items: center;
					z-index: 1000;
				}

				.cart__loading__container {
					position: relative;
					height: 25%;
					width: 25%;
					background-color: #fff;
					opacity: 1;
					border-radius: 2px;
					display: flex;
					justify-content: center;
					align-items: center;
				}

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
					fill: var(--primary-color);
					background-color: var(--background-price-color);
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
