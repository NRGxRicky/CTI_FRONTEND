import React, { useRef, useEffect } from 'react';

const ProfileAllAddress = ({
	domicilios,
	onSelectAddress,
	onEditAddress,
	onAddNewAddress,
	activeAddressId, // ID del domicilio activo
	onCloseModal, // Función para cerrar el modal
}) => {
	const modalRef = useRef(null);

	// Maneja clics fuera del modal
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onCloseModal();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [onCloseModal]);

	// Foco automático en el modal al montarse
	useEffect(() => {
		if (modalRef.current) {
			modalRef.current.focus();
		}
	}, []);

	return (
		<div className='modal-overlay'>
			<div
				className='modal-container'
				ref={modalRef}
				tabIndex='-1' // Permite que el modal reciba foco
			>
				<h2>Elige una dirección</h2>
				<div className='address-list'>
					{domicilios.map((domicilio) => (
						<div
							key={domicilio.id}
							className={`address-item ${
								domicilio.id === activeAddressId ? 'active' : ''
							}`}
						>
							<div className='address-details'>
								<p>
									<strong>
										{domicilio.nombres} {domicilio.apellidos}
									</strong>
								</p>
								<p>{domicilio.telefono}</p>
								<p>
									{domicilio.calle} {domicilio.numero}{' '}
									{domicilio.numero_interior &&
										`Int. ${domicilio.numero_interior}`}
								</p>
								<p>
									{domicilio.colonia}, {domicilio.ciudad}, {domicilio.estado}
								</p>
								<p>{domicilio.codigo_postal}</p>
							</div>
							<div className='address-actions'>
								<button
									className='edit-button'
									onClick={() => onEditAddress(domicilio)}
								>
									Editar
								</button>
								<button
									className='select-button'
									onClick={() => onSelectAddress(domicilio)}
								>
									Seleccionar
								</button>
							</div>
						</div>
					))}
				</div>
				<button className='add-new-address' onClick={onAddNewAddress}>
					+ Nueva Dirección
				</button>
			</div>
			<style jsx>{`
				.modal-overlay {
					position: fixed;
					top: 0;
					left: 0;
					width: 100dvw;
					height: 100dvh;
					background: rgba(0, 0, 0, 0.5);
					display: flex;
					justify-content: center;
					align-items: center;
					z-index: 500;
				}
				.modal-container {
					background: white;
					padding: 20px;
					border-radius: 5px;
					width: 400px;
					max-width: 90%;
					box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
				}
				h2 {
					text-align: center;
					margin-bottom: 20px;
					font-size: 18px;
				}
				.address-list {
					display: flex;
					flex-direction: column;
					gap: 15px;
					max-height: 300px;
					overflow-y: auto;
				}
				.address-item {
					border: 1px solid #ddd;
					padding: 15px;
					border-radius: 5px;
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					transition: border-color 0.3s;
				}
				.address-item.active {
					border-color: var(--primary-color);
					background-color: #eaeaea;
				}
				.address-details p {
					margin: 5px 0;
					font-size: 14px;
				}
				.address-actions {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}
				.edit-button {
					background: #e0e0e0;
					border: none;
					color: #333;
					padding: 8px 12px;
					border-radius: 5px;
					cursor: pointer;
					font-size: 14px;
				}
				.select-button {
					background: var(--primary-color);
					border: none;
					color: white;
					padding: 8px 12px;
					border-radius: 5px;
					cursor: pointer;
					font-size: 14px;
				}
				.add-new-address {
					margin-top: 20px;
					width: 100%;
					background: none;
					border: 1px solid var(--primary-color);
					padding: 10px;
					border-radius: 5px;
					cursor: pointer;
					font-size: 14px;
					color: var(--primary-color);
				}
				.add-new-address:hover {
					background: #f9f9f9;
				}
			`}</style>
		</div>
	);
};

export default ProfileAllAddress;
