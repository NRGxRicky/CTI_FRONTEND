import React, { useEffect, useState } from 'react';
import ProfileAddAddress from '../ProfileAddAddress/ProfileAddAddress';
import ProfileAllAddress from '../ProfileAllAddress/ProfileAllAddress';
import ProfileAllInvoice from '../ProfileAllInvoice/ProfileAllInvoice';
import ProfileAddInvoice from '../ProfileAddInvoice/ProfileAddInvoice';
import fetchData from '../../hooks/GetDataAuth';
import { useAuth } from '../../hooks/auth';
import { useAppDispatch } from '../../lib/hooks';

const ProfileAddressesSection = () => {
	// Estado de carga y perfil (asegúrate de que el perfil incluya ambas propiedades)
	const [loadingData, setLoadingData] = useState(false);
	const [profile, setProfile] = useState({
		domicilios: [],
		PccomputoUsuarioDatosFacturacion: [],
	});

	// Estados para el manejo de direcciones
	const [activeAddressModal, setActiveAddressModal] = useState(null); // 'add', 'all', 'all-add' o null
	const [editingAddress, setEditingAddress] = useState(null);

	// Estados para el manejo de facturación (RFC)
	const [activeInvoiceModal, setActiveInvoiceModal] = useState(null); // 'add', 'all', 'all-add' o null
	const [editingInvoice, setEditingInvoice] = useState(null);

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
		if (accessToken) {
			getDataProfile();
		}
	}, [accessToken]);

	// ===================== DIRECCIONES =====================

	// Seleccionar dirección (la marca como activa)
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

	// Abrir modal para agregar nueva dirección
	const handleAddNewAddress = () => {
		setEditingAddress(null);
		setActiveAddressModal('add');
	};

	// Abrir modal para editar dirección
	const handleEditAddress = (domicilio) => {
		setEditingAddress(domicilio);
		if (activeAddressModal === 'all') {
			setActiveAddressModal('all-add');
		} else {
			setActiveAddressModal('add');
		}
	};

	// Cerrar modal de dirección
	const closeProfileAddAddress = () => {
		if (activeAddressModal === 'all-add') {
			setActiveAddressModal('all');
		} else {
			setActiveAddressModal(null);
		}
	};

	// Eliminar dirección
	const handleDeleteAddress = async (domicilioId) => {
		try {
			setLoadingData(true);
			const response = await fetch(
				`https://api.pccdnapi.com/profile/domicilio/delete/${domicilioId}/`,
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

	// Seleccionar un RFC como activo
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

	// Abrir modal para agregar nuevo RFC
	const handleAddNewInvoice = () => {
		setEditingInvoice(null);
		setActiveInvoiceModal('add');
	};

	// Abrir modal para editar un RFC existente
	const handleEditInvoice = (rfc) => {
		setEditingInvoice(rfc);
		if (activeInvoiceModal === 'all') {
			setActiveInvoiceModal('all-add');
		} else {
			setActiveInvoiceModal('add');
		}
	};

	// Cerrar modal de facturación
	const closeProfileAddInvoice = () => {
		if (activeInvoiceModal === 'all-add') {
			setActiveInvoiceModal('all');
		} else {
			setActiveInvoiceModal(null);
		}
	};

	// Eliminar un RFC
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

	// Calcular el RFC activo (si existe)
	const activeInvoice = profile.PccomputoUsuarioDatosFacturacion.find(
		(d) => d.active
	);

	return (
		<div>
			{/* Sección de domicilios */}
			<div className='profile-data__item'>
				<h2>Mis direcciones de envió</h2>

				{profile.domicilios.length === 0 && (
					<div>
						<span>
							Actualmente no tienes domicilios, agrega uno para comenzar a
							comprar.
						</span>
					</div>
				)}

				{/* Modal para agregar/editar dirección */}
				{(activeAddressModal === 'add' || activeAddressModal === 'all-add') && (
					<ProfileAddAddress
						domicilio={editingAddress}
						onCloseModal={closeProfileAddAddress}
						onSubmit={getDataProfile} // Recarga domicilios tras crear/editar
						setLoadingData={setLoadingData}
					/>
				)}

				{/* Listado de direcciones */}
				<ProfileAllAddress
					domicilios={profile.domicilios}
					activeAddressId={profile.domicilios.find((d) => d.active)?.id || 0}
					onSelectAddress={handleSelectAddress}
					onEditAddress={handleEditAddress}
					onAddNewAddress={handleAddNewAddress}
					onCloseModal={() => setActiveAddressModal(null)}
					onDeleteAddress={handleDeleteAddress}
					isProfileAddAddressVisible={
						activeAddressModal === 'add' || activeAddressModal === 'all-add'
					}
					profile={true}
				/>
			</div>

			{/* Separador visual entre secciones */}
			<div className='section-divider'></div>

			{/* Sección de facturación */}
			<div className='profile-data__item'>
				<h2>Datos de Facturación</h2>

				{profile.PccomputoUsuarioDatosFacturacion.length === 0 && (
					<div>
						<span>
							Actualmente no tienes información para facturación, agrega uno
							para recibir comprobantes fiscales o serán generados con un RFC
							genérico.
						</span>
					</div>
				)}

				{/* Modal para agregar/editar facturación */}
				{(activeInvoiceModal === 'add' || activeInvoiceModal === 'all-add') && (
					<ProfileAddInvoice
						rfcData={editingInvoice}
						onCloseModal={closeProfileAddInvoice}
						onSubmit={getDataProfile}
						setLoadingData={setLoadingData}
					/>
				)}

				<ProfileAllInvoice
					rfcs={profile.PccomputoUsuarioDatosFacturacion}
					activeinvoiceId={activeInvoice ? activeInvoice.id : 0}
					onSelectinvoice={handleSelectInvoice}
					onEditinvoice={handleEditInvoice}
					onAddNewinvoice={handleAddNewInvoice}
					onCloseModal={() => setActiveInvoiceModal(null)}
					onDeleteinvoice={handleDeleteInvoice}
					isProfileAddinvoiceVisible={
						activeInvoiceModal === 'add' || activeInvoiceModal === 'all-add'
					}
					profile={true}
				/>
			</div>

			{loadingData && <p>Cargando...</p>}
			<style jsx>{`
				h2 {
					margin-bottom: 20px;
				}

				.profile-data__item {
					margin-bottom: 40px;
				}

				.section-divider {
					height: 1px;
					background-color: #eaeaea;
					margin: 40px 0;
				}
			`}</style>
		</div>
	);
};

export default ProfileAddressesSection;
