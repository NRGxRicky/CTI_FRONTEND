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
	const [billingActivated, setBillingActivated] = useState(false);

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

	/* === Cargar el perfil (incluyendo las facturaciones disponibles) === */
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
        setBillingActivated(true)
			} else {
				// Si no hay invoice activo, dejamos taxInvoice en null
				setTaxInvoice(null);
        setActiveInvoiceId(0);
        setBillingActivated(false);
			}
		}
		setLoadingData(false);
	};

	useEffect(() => {
		if (accessToken) {
			getDataProfile();
		}
	}, [accessToken]);

	/* === Manejo de Checkbox (Toggle de facturación) === */
	const handleToggleFactura = (e) => {
		const isChecked = e.target.checked;
		if (isChecked) {
			// Activar facturación: si existe un invoice activo, lo usamos; si no, el usuario agregará uno
			const activeInvoice = profile.PccomputoUsuarioDatosFacturacion.find(
				(d) => d.active
			);
			if (activeInvoice) {
				setTaxInvoice(activeInvoice);
				setActiveInvoiceId(activeInvoice.id);
			} else {
				setTaxInvoice(null);
				setActiveInvoiceId(0);
			}
		} else {
			// Desactivar facturación: usar RFC genérico
			setTaxInvoice(null);
			setActiveInvoiceId(0);
		}

		setBillingActivated(isChecked);
	};

	/* === Seleccionar un RFC como activo === */
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

	/* === Agregar nuevo RFC === */
	const handleAddNewInvoice = () => {
		setEditingInvoice(null);
		setActiveModal('add');
		setProfileAddInvoiceVisible(true);
	};

	/* === Editar RFC existente === */
	const handleEditInvoice = (rfc) => {
		setEditingInvoice(rfc);
		if (activeModal === 'all') {
			setActiveModal('all-add');
		} else {
			setActiveModal('add');
		}
		setProfileAddInvoiceVisible(true);
	};

	/* === Cerrar el modal de edición/creación de RFC === */
	const closeProfileAddInvoice = () => {
		if (activeModal === 'all-add') {
			setActiveModal('all');
		} else {
			setActiveModal(null);
		}
		setProfileAddInvoiceVisible(false);
	};

	/* === Eliminar RFC === */
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
				alert('Facturación eliminada correctamente.');
			} else {
				alert('Error al eliminar la Facturación.');
			}
		} catch (error) {
			console.error('Error al eliminar la Facturación:', error);
			alert('Error al eliminar la Facturación.');
		} finally {
			setLoadingData(false);
		}
	};

	return (
		<div className='cart-payment-method'>
			<div className='cart-payment-method__body'>
				{/* EJEMPLO DE FORMA DE ENVÍO */}
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
								/>
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

				{/* DATOS DE FACTURACIÓN */}
				<div className='cart-payment-invoice'>
					<div className='cart-payment-method__header'>
						<div className='cart-payment-method__title'>
							Datos de Facturación
						</div>
					</div>

					{/* TOGGLE Facturación */}
					<div className='factura-toggle'>
						<label className='switch'>
							<input
								type='checkbox'
								checked={billingActivated} // Activo si hay un invoice seleccionado
								onChange={handleToggleFactura}
							/>
							<span className='slider' />
						</label>
						<span className='toggle-label'>
							Proporcionar datos de facturación *
						</span>
					</div>

					{/* Condición: Si no hay taxInvoice, mostramos el recuadro de advertencia y el botón */}
					{!taxInvoice ? (
						billingActivated ? (
							<div className='warning-box'>
								<div className='warning-content'>
									<span className='warning-icon'>!</span>
									<div className='warning-texts'>
										<strong>
											Aún no has seleccionado ningún RFC para facturar.
										</strong>
										<p>
											Si deseas emitir comprobante fiscal, registra uno nuevo.
										</p>
									</div>
								</div>

								<button
									className='new-rfc-button'
									onClick={handleAddNewInvoice}
								>
									+ Agregar Nuevo RFC
								</button>
							</div>
						) : (
							<div className='warning-box'>
								<div className='warning-content'>
									<span className='warning-icon'>!</span>
									<div className='warning-texts'>
										<strong>La factura será generada con RFC genérico.</strong>
										<p>
											Si deseas emitir comprobante fiscal, registra uno nuevo*.
										</p>
									</div>
								</div>
							</div>
						)
					) : (
						/* Si SÍ hay un RFC seleccionado, mostramos sus datos */
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

					{/* Si hay RFC y hay más en la lista, ofrecemos la opción de cambiar */}
					{profile.PccomputoUsuarioDatosFacturacion.length > 0 &&
						taxInvoice && (
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

			{/* Modal Add/Edit Invoice */}
			{(activeModal === 'add' || activeModal === 'all-add') && (
				<ProfileAddInvoice
					rfcData={editingInvoice}
					onCloseModal={closeProfileAddInvoice}
					onSubmit={getDataProfile}
					setLoadingData={setLoadingData}
				/>
			)}

			{/* Modal: Lista de todos los RFC disponibles */}
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

			{/* Resumen / Confirmación */}
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

			{/* ESTILOS */}
			<style jsx>{`
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
				}

				.cart-payment-method__actions__change-addres__button {
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
          margin-bottom: 15px;
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

				/* ==== TOGGLE SWITCH ==== */
				.factura-toggle {
					display: flex;
					align-items: center;
					gap: 10px;
					margin-bottom: 10px;
				}
				.switch {
					position: relative;
					display: inline-block;
					width: 46px;
					height: 24px;
				}
				.switch input {
					opacity: 0;
					width: 0;
					height: 0;
				}
				.slider {
					position: absolute;
					cursor: pointer;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-color: #ccc;
					transition: 0.4s;
					border-radius: 24px;
				}
				.slider:before {
					position: absolute;
					content: '';
					height: 16px;
					width: 16px;
					left: 4px;
					bottom: 4px;
					background-color: white;
					transition: 0.4s;
					border-radius: 50%;
				}
				input:checked + .slider {
					background-color: var(--primary-color);
				}
				input:checked + .slider:before {
					transform: translateX(22px);
				}

				.toggle-label {
					font-size: 14px;
				}

				/* ==== WARNING BOX ==== */
				.warning-box {
					border: 1px solid #ffb84d; /* Borde naranja claro */
					background-color: #fff8ee; /* Fondo crema/naranja muy claro */
					padding: 15px;
					border-radius: 6px;
					margin-bottom: 15px;
				}
				.warning-content {
					display: flex;
					align-items: center;
					gap: 10px;
					color: #333;
					margin-bottom: 10px;
				}
				.warning-icon {
					background-color: #ffa01b;
					color: #fff;
					padding: 4px 8px;
					border-radius: 50%;
					font-weight: bold;
					min-width: 24px;
					text-align: center;
					line-height: 24px;
				}
				.warning-texts strong {
					display: block;
					margin-bottom: 4px;
				}

				.new-rfc-button {
					background-color: #ffb116;
					color: #fff;
					border: none;
					border-radius: 5px;
					padding: 12px 20px;
					cursor: pointer;
					font-size: 14px;
				}
				.new-rfc-button:hover {
					background-color: #ffa01b;
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
