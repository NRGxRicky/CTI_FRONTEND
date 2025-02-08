import React, { useRef, useEffect } from 'react';

const ProfileAllInvoice = ({
	rfcs, // Antes era "domicilios"
	onSelectinvoice, // Antes: onSelectAddress
	onEditinvoice, // Antes: onEditAddress
	onAddNewinvoice, // Antes: onAddNewAddress
	onDeleteinvoice, // Antes: onDeleteAddress
	activeinvoiceId, // Antes: activeAddressId
	onCloseModal,
	isProfileAddinvoiceVisible, // Antes: isProfileAddAddressVisible
	profile = false,
}) => {
	const modalRef = useRef(null);

	// Cerrar modal al hacer click fuera, siempre y cuando el formulario "ProfileAddInvoice" no esté visible
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target) &&
				!isProfileAddinvoiceVisible
			) {
				onCloseModal();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [onCloseModal, isProfileAddinvoiceVisible]);

	// Enfocar modal
	useEffect(() => {
		if (modalRef.current) {
			modalRef.current.focus();
		}
	}, []);

	return (
		<div className={`modal-overlay ${profile && 'profile'}`} >
			{!profile &&

				< div className='modal-close' onClick={() => onCloseModal()}>
					<span className='close'></span>
				</div>
			}

			<div className='modal-container' ref={modalRef} tabIndex='-1'>
				{!profile && <h2>Elige un RFC</h2>}
				<div className='invoice-list'>
					{rfcs.map((invoice) => (
						<div
							key={invoice.id}
							className={`invoice-item ${invoice.id === activeinvoiceId ? 'active' : ''
								}`}
						>
							<div className='invoice-details'>
								{/* Muestra los datos que tengas en tu objeto de facturación */}
								<p>
									<strong>{invoice.razon_social}</strong>
								</p>
								<p>RFC: {invoice.rfc}</p>
								<p>Código Postal: {invoice.codigo_postal}</p>
								<p>Régimen: {invoice.regimen}</p>
								<p>Uso CFDI: {invoice.uso_de_cfdi}</p>
								<p>Forma de Pago: {invoice.forma_de_pago}</p>
							</div>

							<div className='invoice-actions'>
								<button
									className='select-button'
									onClick={() => onSelectinvoice(invoice)}
								>
									Seleccionar
								</button>

								<button
									className='edit-button'
									onClick={() => onEditinvoice(invoice)}
								>
									Editar
								</button>

								<button
									className='delete-button'
									onClick={() => onDeleteinvoice(invoice.id)}
								>
									Eliminar
								</button>
							</div>
						</div>
					))}
				</div>

				<button className='add-new-invoice' onClick={onAddNewinvoice}>
					+ Nuevo RFC
				</button>
			</div>

			{/* Estilos del componente */}
			<style jsx>{`

				.profile {
					position: relative !important;
					background: none !important;
					top: 0px !important;
					height: auto !important;
					width: 100% !important;
					z-index: auto !important;
				}

				.profile .invoice-item {
					min-width: 40%;
				}

				.profile .modal-container {
					box-shadow: none;
					width: 100%;
					padding: 0 !important;
				}

				.profile .invoice-list  {
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
					outline: none;
				}

				h2 {
					text-align: center;
					margin-bottom: 20px;
					font-size: 18px;
				}

				.invoice-list {
					display: flex;
					gap: 15px;
					max-height: calc(50dvh - 61px);
					overflow-y: auto;
					flex-wrap: wrap;
				}

				.invoice-item {
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

				.invoice-item.active {
					border-color: var(--primary-color);
					background-color: var(--background-price-color);
					box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
				}

				.invoice-details p {
					margin: 5px 0;
					font-size: 14px;
				}

				.invoice-actions {
					display: flex;
					flex-direction: column;
					gap: 10px;
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

				.edit-button {
					background: #e0e0e0;
					border: none;
					color: #333;
					padding: 8px 12px;
					border-radius: 5px;
					cursor: pointer;
					font-size: 14px;
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

				.add-new-invoice {
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

				.add-new-invoice:hover {
					background: #f9f9f9;
				}

				@media only screen and (max-width: 62em) {
					.invoice-item {
						flex: 100% !important;
						min-width: 100% !important;
					}

					.invoice-details p {
						font-size: 12px;
					}

					.invoice-list {
						flex-direction: column;
						flex-wrap: nowrap;
					}
				}
			`}</style>
		</div>
	);
};

export default ProfileAllInvoice;
