import React, { useEffect, useState } from 'react';
import SummaryDetails from '../SummaryDetails/SummaryDetails';
import useCart from '../../hooks/useCart';
import CurrencyFormat from '../../hooks/CurrencyFormat';
import FreeShipping from '../Icons/FreeShipping';
import fetchData from '../../hooks/GetDataAuth';
import { useAuth } from '../../hooks/auth';
import ProfileAddInvoice from '../ProfileAddInvoice/ProfileAddInvoice';
import ProfileAllInvoice from '../ProfileAllInvoice/ProfileAllInvoice';
import { Preloader, TailSpin } from 'react-preloader-icon';
import formasDePago from '../../hooks/formasDePago';
import regimenesFiscales from '../../hooks/regimenesFiscales';
import usosCFDI from '../../hooks/usosCFDI';

const CartPaymentMethod = () => {
	const { shipping, taxInvoice, setTaxInvoice } = useCart();
	const [loadingData, setLoadingData] = useState(false);
	const [profile, setProfile] = useState({
		domicilios: [],
		PccomputoUsuarioDatosFacturacion: [],
	});
	const [activeModal, setActiveModal] = useState(null); // 'add', 'all' o null
	const [editingInvoice, setEditingInvoice] = useState(null);
	const { accessToken } = useAuth();
	const [activeInvoiceId, setActiveInvoiceId] = useState(taxInvoice?.id || 0);
	const [isProfileAddInvoiceVisible, setProfileAddInvoiceVisible] =
		useState(false);

	const getUsoCFDIDescription = (usoKey) => {
		// Buscamos el objeto cuyo c_UsoCFDI == usoKey
		const found = usosCFDI.find((uso) => uso.c_UsoCFDI === usoKey);
		return found ? `${found.c_UsoCFDI} - ${found.Descripción}` : usoKey;
	};

	const getRegimenDescription = (regimenKey) => {
		// Buscamos el objeto cuyo Clave == regimenKey
		const found = regimenesFiscales.find((r) => r.Clave === regimenKey);
		return found ? `${found.Clave} - ${found.Descripción}` : regimenKey;
	};

	const getFormaDePagoDescription = (formaKey) => {
		const found = formasDePago.find((f) => f.c_FormaPago === formaKey);
		return found ? `${found.c_FormaPago} - ${found.Descripción}` : formaKey;
	};

	const getDataProfile = async () => {
		setLoadingData(true);
		const resData = await fetchData('/profile/resume/', accessToken);
		if (resData.ok) {
			const dataJson = await resData.json();
			setProfile(dataJson);
			const activeInvoice = dataJson.PccomputoUsuarioDatosFacturacion.find(
				(d) => d.active
			);
			if (activeInvoice) {
				setTaxInvoice(activeInvoice);
				setActiveInvoiceId(activeInvoice.id);
			} else {
				setTaxInvoice(null);
				setActiveInvoiceId(0);
			}
		}
		setLoadingData(false);
	};

	useEffect(() => {
		if (accessToken) getDataProfile();
	}, []);

	const handleSelectInvoice = async (rfc) => {
		try {
			setLoadingData(true);
			const response = await fetch(
				'https://api.pccdnapi.com/profile/facturacion/set-active/',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify({ id: rfc.id }),
				}
			);

			if (response.ok) {
				getDataProfile();
				setActiveModal(null);
			} else {
				console.error('No se pudo actualizar la facturacion activa.');
			}
		} catch (error) {
			console.error('Error al actualizar la facturacion activa:', error);
		} finally {
			setLoadingData(false);
		}
	};

	const handleAddNewInvoice = () => {
		setEditingInvoice(null);
		setActiveModal('add');
		setProfileAddInvoiceVisible(true);
	};

	const handleEditInvoice = (rfc) => {
		setEditingInvoice(rfc);
		if (activeModal == 'all') {
			setActiveModal('all-add');
		} else {
			setActiveModal('add');
		}

		setProfileAddInvoiceVisible(true);
	};

	const closeProfileAddInvoice = () => {
		if (activeModal == 'all-add') {
			setActiveModal('all');
		} else {
			setActiveModal(null);
		}
		setProfileAddInvoiceVisible(false);
	};

	const handleDeleteInvoice = async (rfcId) => {
		try {
			setLoadingData(true);
			const response = await fetch(
				`https://api.pccdnapi.com/profile/facturacion/delete/${rfcId}/`,
				{
					method: 'DELETE',
					headers: { Authorization: `Bearer ${accessToken}` },
				}
			);

			if (response.ok) {
				getDataProfile(); // Actualiza la lista después de eliminar
				alert('RFC eliminado correctamente.');
			} else {
				alert('Error al eliminar el RFC.');
			}
		} catch (error) {
			console.error('Error al eliminar el RFC:', error);
			alert('Error al eliminar el RFC.');
		} finally {
			setLoadingData(false);
		}
	};

	return (
		<div className='cart-payment-method'>
			<div className='cart-payment-method__body'>
				<div className='cart-payment-options'>
					<div className='cart-payment-method__header'>
						<div className='cart-payment-method__title'>Forma de envío</div>
					</div>
					<div className='cart-payment-method__body'>
						<div className='cart-payment-method__item active'>
							<div className='radio-wrapper'>
								<input
									id='shipping-estandar'
									type='radio'
									name='shipping-estandar'
									defaultChecked
								></input>
							</div>
							<div className='cart-payment-method__item__logo'>
								<FreeShipping color={false} modeCard={true} label='' />
							</div>
							<div className='cart-payment-method__item__description'>
								<div className='cart-payment-method__item__title'>
									<span>Envío Estándar Terrestre</span>
								</div>
								<div className='cart-payment-method__item__detail'>
									<span>Terrestre 3 a 5 Días Hábiles</span>
								</div>
							</div>
							<div className='cart-payment-method__item__price'>
								<span>$ {CurrencyFormat(shipping, 2, '.', ',')}</span>
							</div>
						</div>
					</div>
				</div>
				<div className='cart-payment-invoice'>
					<div className='cart-payment-method__header'>
						<div className='cart-payment-method__title'>
							Datos de Facturación
						</div>
					</div>
					<div className='cart-payment-method__body'>
						{!taxInvoice ? (
							<div className='cart-payment-method__no-invoice'>
								<div className='info-box'>
									<span className='info-icon'>!</span>
									<div className='info-content'>
										<strong>
											Aún no has seleccionado ningún RFC para facturar.
										</strong>
										<br />
										Si deseas emitir comprobante fiscal, registra uno nuevo.
									</div>
								</div>

								<div className='cart-payment-method__actions'>
									<button
										className='cart-payment-method__actions__change-addres__button'
										onClick={() => handleAddNewInvoice()}
									>
										+ Agregar Nuevo RFC
									</button>
								</div>
							</div>
						) : (
							<div className='cart-payment-method__item' key={taxInvoice.id}>
								<div className='cart-payment-method__item__description'>
									<div className='cart-payment-method__item__title'>
										<p>{taxInvoice.razon_social}</p>
										<p>{taxInvoice.rfc}</p>
									</div>
									<div className='cart-payment-method__item__detail'>
										<p>{taxInvoice.codigo_postal}</p>
										<p>{getRegimenDescription(taxInvoice.regimen)}</p>
										<p>{getUsoCFDIDescription(taxInvoice.uso_de_cfdi)}</p>
										<p>{getFormaDePagoDescription(taxInvoice.forma_de_pago)}</p>
									</div>
								</div>
								<div
									className='cart-payment-method__action'
									onClick={() => handleEditInvoice(taxInvoice)}
								>
									Editar RFC
								</div>
							</div>
						)}
					</div>
					{profile.PccomputoUsuarioDatosFacturacion.length > 0 && (
						<div className='cart-payment-method__actions'>
							<button
								className='cart-payment-method__actions__change-addres__button'
								onClick={() => setActiveModal('all')}
							>
								Elegir otro RFC
							</button>
						</div>
					)}
				</div>
			</div>

			{(activeModal === 'add' || activeModal === 'all-add') && (
				<ProfileAddInvoice
					rfcData={editingInvoice}
					onCloseModal={closeProfileAddInvoice}
					onSubmit={getDataProfile}
					setLoadingData={setLoadingData}
				/>
			)}
			{activeModal === 'all' && (
				<ProfileAllInvoice
					rfcs={profile.PccomputoUsuarioDatosFacturacion}
					activeinvoiceId={activeInvoiceId}
					onSelectinvoice={handleSelectInvoice}
					onEditinvoice={handleEditInvoice}
					onAddNewinvoice={handleAddNewInvoice}
					onCloseModal={() => setActiveModal(null)}
					onDeleteinvoice={handleDeleteInvoice}
					isProfileAddinvoiceVisible={isProfileAddInvoiceVisible}
				/>
			)}

			<SummaryDetails urlAction={'/carrito/confirmar'} step={'payment'} />
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
				.cart-payment-method__no-invoice {
					margin: 10px 0;
          width: 100%;
				}

				.info-box {
					border: 1px solid #ff9900;
					background-color: #fff5e5;
					color: #333;
					padding: 15px;
					display: flex;
					align-items: flex-start;
					gap: 10px;
					border-radius: 4px;
					margin-bottom: 15px;
					line-height: 1.5;
				}

				.info-icon {
					background-color: #ff9900;
					color: #fff;
					display: inline-block;
					min-width: 24px;
					height: 24px;
					border-radius: 50%;
					font-weight: bold;
					text-align: center;
					line-height: 24px;
				}

				.info-content {
					flex: 1;
					font-size: 14px;
				}

				.cart__loading {
					position: fixed;
					background: #0f0f0f;
					width: 100%;
					height: calc(100% - 61px);
					top: 61px;
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

				.cart-payment-method__body {
					margin-bottom: 15px;
					flex: 100%;
					width: 100%;
				}
					.cart-payment-method__actions__change-addres__button {
					flex: 100%;
					background: #ffb116;
					color: #fff;
					border-radius: 4px;
					padding: 10px;
					font-size: 16px;
					cursor: pointer;
					text-align: center;
					min-width: 100%;
					border: none;
				}

				.cart-payment-method__actions {
					width: 100%;
				}

				.cart-payment-method__action {
					color: #ffa01b;
					cursor: pointer;
				}

				.cart-payment-method__actions__change-addres__button:hover {
					background-color: #ffa01b;
				}

				.cart-payment-method__item__description {
					line-height: 1.5;
					flex: 50%;
				}

				.cart-payment-method__item__detail {
					font-size: 12px;
				}

				.cart-payment-method__item__title {
					font-weight: 600;
				}

				.cart-payment-method__item {
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

				.cart-payment-method__item.active {
					border: 1px solid var(--primary-color) !important;
					color: var(--primary-color);
					fill: var(--primary-color);
				}

				.cart-payment-method {
					display: flex;
					gap: 20px;
					flex-wrap: wrap;
					padding: 0 20px;
					justify-content: space-evenly;
				}

				.cart-payment-method__title {
					font-size: 16px;
					font-weight: 600;
					margin-bottom: 20px;
				}

				.cart-payment-method__body {
					display: flex;
					gap: 20px;
					flex: 1;
				}

				.cart-payment-invoice {
					flex: 2;
				}

				@media only screen and (max-width: 62em) {
					.cart-payment-method__body,
					.cart-payment-invoice,
					.cart-payment-options {
						flex: 100%;
						flex-wrap: wrap;
					}
				}
			`}</style>
		</div>
	);
};

export default CartPaymentMethod;
