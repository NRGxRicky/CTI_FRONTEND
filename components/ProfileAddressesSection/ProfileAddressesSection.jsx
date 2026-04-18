import React, { useEffect, useState } from 'react';
import ProfileAddAddress from '../ProfileAddAddress/ProfileAddAddress';
import ProfileAllAddress from '../ProfileAllAddress/ProfileAllAddress';
import ProfileAllInvoice from '../ProfileAllInvoice/ProfileAllInvoice';
import ProfileAddInvoice from '../ProfileAddInvoice/ProfileAddInvoice';
import fetchData from '../../hooks/GetDataAuth';
import { useAuth } from '../../hooks/auth';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { Preloader, TailSpin } from 'react-preloader-icon';
import { useApi } from '../../hooks/useApi';

const ProfileAddressesSection = () => {
	const { buildUrl } = useApi();
	// Estado de carga y perfil (asegúrate de que el perfil incluya ambas propiedades)
	const [loadingData, setLoadingData] = useState(true);
	const [profile, setProfile] = useState({
		domicilios: [],
		PccomputoUsuarioDatosFacturacion: [],
	});

	// Estados para el manejo de direcciones
	const [activeAddressModal, setActiveAddressModal] = useState(null);
	const [editingAddress, setEditingAddress] = useState(null);

	// Estados para el manejo de facturación (RFC)
	const [activeInvoiceModal, setActiveInvoiceModal] = useState(null);
	const [editingInvoice, setEditingInvoice] = useState(null);

	// Estados para mostrar u ocultar (minimizar/expandir) cada sección en móvil
	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);
	const [expandAddresses, setExpandAddresses] = useState(!mobileView);
	const [expandInvoices, setExpandInvoices] = useState(!mobileView);

	const { accessToken } = useAuth();
	const dispatch = useAppDispatch();

	// ===== OBTENER LOS DATOS DEL PERFIL (direcciones y facturación) =====
	const getDataProfile = async () => {
		setLoadingData(true);
		const resData = await fetchData('/profile/resume/', accessToken);
		if (resData.ok) {
			const dataJson = await resData.json();
			setProfile(dataJson);
		}
		setLoadingData(false);
	};

	useEffect(() => {
		setExpandAddresses(!mobileView);
		setExpandInvoices(!mobileView);
	}, [mobileView]);

	useEffect(() => {
		if (accessToken) {
			getDataProfile();
		}
	}, [accessToken]);

	// ===================== DIRECCIONES =====================
	const handleSelectAddress = async (domicilio) => {
		try {
			setLoadingData(true);
			const response = await fetch(
				buildUrl('/profile/domicilio/set-active/'),
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
				await getDataProfile();
				setActiveAddressModal(null);
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
		setActiveAddressModal('add');
	};

	const handleEditAddress = (domicilio) => {
		setEditingAddress(domicilio);
		setActiveAddressModal(activeAddressModal === 'all' ? 'all-add' : 'add');
	};

	const closeProfileAddAddress = () => {
		setActiveAddressModal(activeAddressModal === 'all-add' ? 'all' : null);
	};

	const handleDeleteAddress = async (domicilioId) => {
		try {
			setLoadingData(true);
			const response = await fetch(
				buildUrl(`/profile/domicilio/delete/${domicilioId}/`),
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			if (response.ok) {
				await getDataProfile();
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

	// ===================== FACTURACIÓN (RFC) =====================
	const handleSelectInvoice = async (rfc) => {
		try {
			setLoadingData(true);
			const response = await fetch(
				buildUrl('/profile/facturacion/set-active/'),
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
				await getDataProfile();
				setActiveInvoiceModal(null);
			} else {
				console.error('No se pudo actualizar la facturación activa.');
			}
		} catch (error) {
			console.error('Error al actualizar la facturación activa:', error);
		} finally {
			setLoadingData(false);
		}
	};

	const handleAddNewInvoice = () => {
		setEditingInvoice(null);
		setActiveInvoiceModal('add');
	};

	const handleEditInvoice = (rfc) => {
		setEditingInvoice(rfc);
		setActiveInvoiceModal(activeInvoiceModal === 'all' ? 'all-add' : 'add');
	};

	const closeProfileAddInvoice = () => {
		setActiveInvoiceModal(activeInvoiceModal === 'all-add' ? 'all' : null);
	};

	const handleDeleteInvoice = async (rfcId) => {
		try {
			setLoadingData(true);
			const response = await fetch(
				buildUrl(`/profile/facturacion/delete/${rfcId}/`),
				{
					method: 'DELETE',
					headers: { Authorization: `Bearer ${accessToken}` },
				}
			);
			if (response.ok) {
				await getDataProfile();
				alert('Facturación eliminada correctamente.');
			} else {
				alert('Error al eliminar la facturación.');
			}
		} catch (error) {
			console.error('Error al eliminar la facturación:', error);
			alert('Error al eliminar la facturación.');
		} finally {
			setLoadingData(false);
		}
	};

	const safeDomicilios = Array.isArray(profile?.domicilios) ? profile.domicilios : [];
	const safeBilling = Array.isArray(profile?.PccomputoUsuarioDatosFacturacion) ? profile.PccomputoUsuarioDatosFacturacion : [];

	const activeInvoice = safeBilling.find(
		(d) => d.active
	);

	return (
		<div className='profile-addresses-section'>
			{/* Overlay del spinner dentro del componente */}
			{loadingData && (
				<div className='component-loading'>
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

			{/* Sección de domicilios */}
			<div className='profile-data__item'>
				<div className='profile-data__item__container'>
					<div className='section-header'>
						<h3>Mis direcciones de envió</h3>
						{mobileView && !expandAddresses && (
							<div
								className='profile__edit'
								onClick={() => setExpandAddresses(true)}
							>
								Editar
							</div>
						)}
					</div>
					{(expandAddresses || !mobileView) && (
						<div className='section-content'>
							{safeDomicilios.length === 0 && (
								<div className='warning-box'>
									<div className='warning-content'>
										<span className='warning-icon'>!</span>
										<div className='warning-texts'>
											<p>
												Actualmente no tienes direcciones, agrega una para
												comenzar a comprar.
											</p>
										</div>
									</div>
								</div>
							)}
							{(activeAddressModal === 'add' ||
								activeAddressModal === 'all-add') && (
								<ProfileAddAddress
									domicilio={editingAddress}
									onCloseModal={closeProfileAddAddress}
									onSubmit={getDataProfile}
									setLoadingData={setLoadingData}
								/>
							)}
							<ProfileAllAddress
								domicilios={safeDomicilios}
								activeAddressId={
									safeDomicilios.find((d) => d.active)?.id || 0
								}
								onSelectAddress={handleSelectAddress}
								onEditAddress={handleEditAddress}
								onAddNewAddress={handleAddNewAddress}
								onCloseModal={() => setActiveAddressModal(null)}
								onDeleteAddress={handleDeleteAddress}
								isProfileAddAddressVisible={
									activeAddressModal === 'add' ||
									activeAddressModal === 'all-add'
								}
								profile={true}
							/>
						</div>
					)}
				</div>
			</div>

			{/* Sección de facturación */}
			<div className='profile-data__item'>
				<div className='profile-data__item__container'>
					<div className='section-header'>
						<h3>Datos de Facturación</h3>
						{mobileView && !expandInvoices && (
							<div
								className='profile__edit'
								onClick={() => setExpandInvoices(true)}
							>
								Editar
							</div>
						)}
					</div>
					{(expandInvoices || !mobileView) && (
						<div className='section-content'>
							{safeBilling.length === 0 && (
								<div className='warning-box'>
									<div className='warning-content'>
										<span className='warning-icon'>!</span>
										<div className='warning-texts'>
											<p>
												Actualmente no tienes información para facturación,
												agrega una para recibir comprobantes fiscales o serán
												generados con un RFC genérico.
											</p>
										</div>
									</div>
								</div>
							)}
							{(activeInvoiceModal === 'add' ||
								activeInvoiceModal === 'all-add') && (
								<ProfileAddInvoice
									rfcData={editingInvoice}
									onCloseModal={closeProfileAddInvoice}
									onSubmit={getDataProfile}
									setLoadingData={setLoadingData}
								/>
							)}
							<ProfileAllInvoice
								rfcs={safeBilling}
								activeinvoiceId={activeInvoice ? activeInvoice.id : 0}
								onSelectinvoice={handleSelectInvoice}
								onEditinvoice={handleEditInvoice}
								onAddNewinvoice={handleAddNewInvoice}
								onCloseModal={() => setActiveInvoiceModal(null)}
								onDeleteinvoice={handleDeleteInvoice}
								isProfileAddinvoiceVisible={
									activeInvoiceModal === 'add' ||
									activeInvoiceModal === 'all-add'
								}
								profile={true}
							/>
						</div>
					)}
				</div>
			</div>

			<style jsx>{`
				h3 {
					margin: 10px 0;
					line-height: 3;
				}
				.profile-addresses-section {
					position: relative;
				}
				.profile-data__item {
					padding: 20px;
				}
				.profile-data__item__container {
					border-radius: 5px;
					border: 1px solid #eaeaea;
					padding: 10px 20px;
				}
				.section-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
				.section-content {
					margin-top: 15px;
					padding: 10px 0;
				}
				.profile__edit {
					cursor: pointer;
					color: var(--primary-color);
				}
				/* ==== WARNING BOX ==== */
				.warning-box {
					border: 1px solid #ffb84d;
					background-color: #fff8ee;
					padding: 15px;
					border-radius: 6px;
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 20px;
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
				.warning-texts p {
					margin: 0;
					font-weight: 600;
				}
				/* Overlay de carga solo dentro del componente */
				.component-loading {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: #fff;
					z-index: 9999;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.cart__loading__container {
					display: flex;
					justify-content: center;
					align-items: center;
				}
				@media only screen and (max-width: 60em) {
					.profile-data__item {
						padding: 5px 20px;
					}
				}
			`}</style>
		</div>
	);
};

export default ProfileAddressesSection;
