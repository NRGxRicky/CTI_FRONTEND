import React, { useRef, useEffect } from 'react';

const ProfileAllAddress = ({
	domicilios,
	onSelectAddress,
	onEditAddress,
	onAddNewAddress,
	onDeleteAddress, // Nueva función para eliminar
	activeAddressId,
	onCloseModal,
	isProfileAddAddressVisible,
	profile = false,
}) => {
	const modalRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target) &&
				!isProfileAddAddressVisible // Solo cierra si `ProfileAddAddress` no está visible
			) {
				onCloseModal();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [onCloseModal, isProfileAddAddressVisible]);

	useEffect(() => {
		if (modalRef.current) {
			modalRef.current.focus();
		}
	}, []);

	return (

		<div className={`modal-overlay ${profile && 'profile'}`} >
			{!profile &&
				<div
					className='modal-close'
					onClick={() => {
						onCloseModal();
					}}
				>
					<span className='close'></span>
				</div>
			}
			<div className='modal-container' ref={modalRef} tabIndex='-1'>
				{!profile && <h2>Elige una dirección</h2>}
				<div className='address-list'>
					{domicilios.map((domicilio) => (
						<div
							key={domicilio.id}
							className={`address-item ${domicilio.id === activeAddressId ? 'active' : ''
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
									className='select-button'
									onClick={() => onSelectAddress(domicilio)}
								>
									Seleccionar
								</button>

								<button
									className='edit-button'
									onClick={() => onEditAddress(domicilio)}
								>
									Editar
								</button>
								<button
									className='delete-button'
									onClick={() => onDeleteAddress(domicilio.id)}
								>
									Eliminar
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

				.profile {
					position: relative !important;
					background: none !important;
					top: 0px !important;
					height: auto !important;
					width: 100% !important;
					z-index: auto !important;
			
				}

				.profile .address-item {
					min-width: 40%;
				}

				.profile .modal-container {
					box-shadow: none;
					width: 100%;
					padding: 0 !important;
				}

				.profile .address-list {
					overflow: hidden;
					max-height: none;
				}
        
        .modal-close {
          position: absolute;
          display: flex;

          top: 30px;
          right: 30px;
          flex-direction: row-reverse;
          height: 40px;
          align-items: center;
        }
        
        .close {
          height: 24px;
					width: 24px;
          color: #ffffff;
          display: block !important;
        }
				.modal-overlay {
					position: fixed;
					top: 61px;
					left: 0;
					width: 100dvw;
					height: calc(100dvh - 61px);
					background: rgba(0, 0, 0, 0.5);
					display: flex;
          flex-direction: column;
					justify-content: center;
					align-items: center;
					z-index: 500;
				}
				.modal-container {
					background: white;
					padding: 20px;
					border-radius: 5px;
					max-width: 90dvw;
					box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
				}
				h2 {
					text-align: center;
					margin-bottom: 20px;
					font-size: 18px;
				}
				.address-list {
					display: flex;
					gap: 15px;
					max-height: calc(50dvh - 61px);
					overflow-y: auto;
					flex-wrap: wrap;
				}

				.address-item {
					border: 1px solid #ddd;
					padding: 15px;
					border-radius: 5px;
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					transition: border-color 0.3s;
					flex: 40%;
					max-width: 50%;
          gap: 15px;
          min-width: 35dvw;
				}
				.address-item.active {
					border-color: var(--primary-color);
					background-color: var(--background-price-color);
					box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
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

				.address-actions {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}
				.delete-button {
					background: #ffb116;
					border: none;
					color: white;
					padding: 8px 12px;
					border-radius: 5px;
					cursor: pointer;
					font-size: 14px;
				}
				.delete-button:hover {
					background: #ffa01b;
				}

				@media only screen and (max-width: 62em) {
					.address-item {
            flex: 100% !important;
            min-width: 100% !important;
          
				}

        .address-details p{
          font-size: 12px;
        }

        .address-list {
          flex-direction: column;
          flex-wrap: nowrap;
        }

        
			`}</style>
		</div>
	);
};

export default ProfileAllAddress;
