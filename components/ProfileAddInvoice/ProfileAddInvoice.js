import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../lib/hooks';
import { hideAll } from '../../lib/features/showOpacityContainerSlide';
import { useAuth } from '../../hooks/auth';

// Importa tus catálogos o hooks donde tengas los arrays
import formasDePago from '../../hooks/formasDePago';
import regimenesFiscales from '../../hooks/regimenesFiscales';
import usosCFDI from '../../hooks/usosCFDI';

const ProfileAddInvoice = ({
	rfcData = null, // Renombramos para mayor claridad.
	onCloseModal,
	onSubmit,
	setLoadingData,
}) => {
	const { accessToken } = useAuth();
	const dispatch = useAppDispatch();
	const containerRef = useRef(null);

	// Estado local con los datos del formulario
	const [formData, setFormData] = useState({
		id: rfcData?.id || '',
		rfc: rfcData?.rfc || '',
		razon_social: rfcData?.razon_social || '',
		regimen: rfcData?.regimen || '',
		uso_de_cfdi: rfcData?.uso_de_cfdi || '',
		forma_de_pago: rfcData?.forma_de_pago || '',
		codigo_postal: rfcData?.codigo_postal || '',
	});

	// Manejo de errores
	const [errors, setErrors] = useState({});

	// Referencias a los inputs para enfocar el primero con error
	const inputRefs = {
		rfc: useRef(null),
		razon_social: useRef(null),
		regimen: useRef(null),
		uso_de_cfdi: useRef(null),
		forma_de_pago: useRef(null),
		codigo_postal: useRef(null),
	};

	// ===== FILTRAR USOS DE CFDI SEGÚN EL RÉGIMEN SELECCIONADO =====
	const compatibleUsosCFI = usosCFDI.filter((uso) =>
		uso.Regímenes_Fiscales.includes(formData.regimen)
	);

	// ===== VALIDACIONES =====
	const validateFields = () => {
		const newErrors = {};

		// Validar RFC
		if (!formData.rfc.trim()) {
			newErrors.rfc = 'El RFC es obligatorio.';
		} else if (formData.rfc.trim().length > 13) {
			newErrors.rfc = 'El RFC no puede exceder los 13 caracteres.';
		}

		// Validar Razón Social
		if (!formData.razon_social.trim()) {
			newErrors.razon_social = 'La razón social es obligatoria.';
		}

		// Validar Régimen Fiscal
		if (!formData.regimen) {
			newErrors.regimen = 'El régimen fiscal es obligatorio.';
		}

		// Validar Uso de CFDI
		if (!formData.uso_de_cfdi) {
			newErrors.uso_de_cfdi = 'El uso de CFDI es obligatorio.';
		}

		// Validar Forma de Pago
		if (!formData.forma_de_pago) {
			newErrors.forma_de_pago = 'La forma de pago es obligatoria.';
		}

		// Validar Código Postal
		if (!/^\d{5}$/.test(formData.codigo_postal)) {
			newErrors.codigo_postal = 'El código postal debe tener 5 dígitos.';
		}

		// Enfocar el primer campo con error
		if (Object.keys(newErrors).length > 0) {
			const firstErrorField = Object.keys(newErrors)[0];
			if (inputRefs[firstErrorField]?.current) {
				inputRefs[firstErrorField].current.focus();
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// ===== MANEJO DE CAMBIO EN INPUTS =====
	const handleChange = (e) => {
		const { name, value } = e.target;
		// Si el input es RFC, evitamos que supere 13 caracteres
		if (name === 'rfc' && value.length > 13) {
			return; // Esto bloquea teclear más de 13 caracteres
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: '' }));
	};

	// ===== ENVÍO DE FORMULARIO =====
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateFields()) return;

		const dataToSend = { ...formData };
		// Si no tiene id, lo quitamos para que no cause problemas en el backend
		if (!dataToSend.id) delete dataToSend.id;

		try {
			setLoadingData(true);
			const response = await fetch(
				'https://api.pccdnapi.com/profile/facturacion/add-or-update/',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify(dataToSend),
				}
			);

			if (response.ok) {
				onSubmit();
				dispatch(hideAll());
				if (onCloseModal) onCloseModal();
			} else {
				const errorData = await response.json();
				alert(errorData.message || 'Error al guardar el RFC.');
			}
		} catch (err) {
			alert('Error de conexión, intenta nuevamente.');
		} finally {
			setLoadingData(false);
		}
	};

	// ===== CERRAR MODAL AL DAR CLICK FUERA =====
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				if (onCloseModal) onCloseModal();
				dispatch(hideAll());
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [dispatch, onCloseModal]);

	return (
		<div className='profile-add-rfc'>
			<div className='profile-add-rfc__container' ref={containerRef}>
				<h2>{formData.id ? 'Editar RFC' : 'Agregar RFC'}</h2>

				<form onSubmit={handleSubmit} className='profile-add-rfc__form'>
					{/* RFC */}
					<div className='profile-add-rfc__form-group'>
						<label htmlFor='rfc'>
							RFC:<span>*</span>
						</label>
						<input
							type='text'
							id='rfc'
							name='rfc'
							value={formData.rfc}
							onChange={handleChange}
							ref={inputRefs.rfc}
							placeholder='Ej. ABCD123456XXX'
							maxLength={13} // <- Restringe la cantidad de caracteres
						/>
						{errors.rfc && <p className='error'>{errors.rfc}</p>}
					</div>

					{/* Razón Social */}
					<div className='profile-add-rfc__form-group'>
						<label htmlFor='razon_social'>
							Razón Social:<span>*</span>
						</label>
						<input
							type='text'
							id='razon_social'
							name='razon_social'
							value={formData.razon_social}
							onChange={handleChange}
							ref={inputRefs.razon_social}
							placeholder='Ej. Mi Empresa'
						/>
						{errors.razon_social && (
							<p className='error'>{errors.razon_social}</p>
						)}
					</div>

					{/* Régimen Fiscal */}
					<div className='profile-add-rfc__form-group'>
						<label htmlFor='regimen'>
							Régimen Fiscal:<span>*</span>
						</label>
						<select
							id='regimen'
							name='regimen'
							value={formData.regimen}
							onChange={handleChange}
							ref={inputRefs.regimen}
						>
							<option value=''>Seleccionar Régimen Fiscal</option>
							{regimenesFiscales.map((item) => (
								<option key={item.Clave} value={item.Clave}>
									{item.Clave} - {item.Descripción}
								</option>
							))}
						</select>
						{errors.regimen && <p className='error'>{errors.regimen}</p>}
					</div>

					{/* Uso de CFDI (filtrado por régimen) */}
					<div className='profile-add-rfc__form-group'>
						<label htmlFor='uso_de_cfdi'>
							Uso de CFDI:<span>*</span>
						</label>
						<select
							id='uso_de_cfdi'
							name='uso_de_cfdi'
							value={formData.uso_de_cfdi}
							onChange={handleChange}
							ref={inputRefs.uso_de_cfdi}
						>
							<option value=''>Seleccionar Uso de CFDI</option>
							{compatibleUsosCFI.map((uso) => (
								<option key={uso.c_UsoCFDI} value={uso.c_UsoCFDI}>
									{uso.c_UsoCFDI} - {uso.Descripción}
								</option>
							))}
						</select>
						{errors.uso_de_cfdi && (
							<p className='error'>{errors.uso_de_cfdi}</p>
						)}
					</div>

					{/* Forma de Pago */}
					<div className='profile-add-rfc__form-group'>
						<label htmlFor='forma_de_pago'>
							Forma de Pago:<span>*</span>
						</label>
						<select
							id='forma_de_pago'
							name='forma_de_pago'
							value={formData.forma_de_pago}
							onChange={handleChange}
							ref={inputRefs.forma_de_pago}
						>
							<option value=''>Seleccionar Forma de Pago</option>
							{formasDePago.map((fp) => (
								<option key={fp.c_FormaPago} value={fp.c_FormaPago}>
									{fp.c_FormaPago} - {fp.Descripción}
								</option>
							))}
						</select>
						{errors.forma_de_pago && (
							<p className='error'>{errors.forma_de_pago}</p>
						)}
					</div>

					{/* Código Postal */}
					<div className='profile-add-rfc__form-group'>
						<label htmlFor='codigo_postal'>
							Código Postal:<span>*</span>
						</label>
						<input
							type='text'
							id='codigo_postal'
							name='codigo_postal'
							value={formData.codigo_postal}
							onChange={handleChange}
							ref={inputRefs.codigo_postal}
							placeholder='Ej. 12345'
						/>
						{errors.codigo_postal && (
							<p className='error'>{errors.codigo_postal}</p>
						)}
					</div>

					{/* BOTONES */}
					<div className='profile-add-rfc__buttons'>
						<button
							type='button'
							className='cancel-button'
							onClick={() => {
								if (onCloseModal) onCloseModal();
								dispatch(hideAll());
							}}
						>
							Cancelar
						</button>
						<button type='submit' className='accept-button'>
							{formData.id ? 'Actualizar' : 'Agregar'}
						</button>
					</div>
				</form>
			</div>

			{/* ESTILOS */}
			<style jsx>{`
				.error {
					color: red;
					font-size: 12px;
					margin-top: 5px;
				}

				.profile-add-rfc {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 100dvw;
					z-index: 1000;
					position: fixed;
					top: 61px !important;
					left: 0;
					height: calc(100dvh - 61px);
					background: rgba(0, 0, 0, 0.5);
				}

				.profile-add-rfc__container {
					background-color: #fff;
					padding: 20px;
					border-radius: 5px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					width: 100%;
					max-width: 600px;
					overflow: auto;
					position: relative;
					z-index: 2000;
				}

				h2 {
					text-align: center;
					margin-bottom: 20px;
					border-bottom: 1px solid #eaeaea;
					padding-bottom: 20px;
				}

				.profile-add-rfc__form {
					display: flex;
					flex-direction: column;
					gap: 1.5rem;
				}

				.profile-add-rfc__form-group {
					display: flex;
					flex-direction: column;
				}

				.profile-add-rfc__form-group label {
					font-weight: bold;
					margin-bottom: 5px;
				}

				.profile-add-rfc__form-group input,
				.profile-add-rfc__form-group select {
					padding: 10px;
					border: 1px solid #eaeaea;
					border-radius: 6px;
					font-size: 14px;
				}

				.profile-add-rfc__form-group input:focus,
				.profile-add-rfc__form-group select:focus {
					border-color: var(--primary-color);
					outline: none;
				}

				.profile-add-rfc__buttons {
					display: flex;
					justify-content: space-between;
					margin-top: 10px;
				}

				.cancel-button {
					background: #e0e0e0;
					color: #333;
					padding: 10px 20px;
					border: none;
					border-radius: 5px;
					cursor: pointer;
				}

				.accept-button {
					background: var(--primary-color);
					color: white;
					padding: 10px 20px;
					border: none;
					border-radius: 5px;
					cursor: pointer;
				}

				@media (max-width: 600px) {
					.profile-add-rfc__container {
						padding: 15px;
						height: 90%;
					}
				}
			`}</style>
		</div>
	);
};

export default ProfileAddInvoice;
