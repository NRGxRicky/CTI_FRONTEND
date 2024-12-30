import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../lib/hooks';
import { hideAll } from '../../lib/features/showOpacityContainerSlide';
import { useAuth } from '../../hooks/auth';

const ProfileAddAddress = ({
	domicilio = null,
	onCloseModal,
	onSubmit,
	setLoadingData,
}) => {
	const { accessToken } = useAuth();
	const dispatch = useAppDispatch();
	const containerRef = useRef(null);
	const [formData, setFormData] = useState({
		id: domicilio?.id || '',
		nombres: domicilio?.nombres || '',
		apellidos: domicilio?.apellidos || '',
		telefono: domicilio?.telefono || '',
		calle: domicilio?.calle || '',
		numero: domicilio?.numero || '',
		numero_interior: domicilio?.numero_interior || '',
		colonia: domicilio?.colonia || '',
		codigo_postal: domicilio?.codigo_postal || '',
		ciudad: domicilio?.ciudad || '',
		estado: domicilio?.estado || '',
		referencias: domicilio?.referencias || '',
	});
	const [errors, setErrors] = useState({});

	const inputRefs = {
		nombres: useRef(null),
		apellidos: useRef(null),
		telefono: useRef(null),
		calle: useRef(null),
		numero: useRef(null),
		colonia: useRef(null),
		codigo_postal: useRef(null),
		ciudad: useRef(null),
		estado: useRef(null),
	};

	const estadosMexico = [
		'Aguascalientes',
		'Baja California',
		'Baja California Sur',
		'Campeche',
		'Chiapas',
		'Chihuahua',
		'Ciudad de México',
		'Coahuila',
		'Colima',
		'Durango',
		'Estado de México',
		'Guanajuato',
		'Guerrero',
		'Hidalgo',
		'Jalisco',
		'Michoacán',
		'Morelos',
		'Nayarit',
		'Nuevo León',
		'Oaxaca',
		'Puebla',
		'Querétaro',
		'Quintana Roo',
		'San Luis Potosí',
		'Sinaloa',
		'Sonora',
		'Tabasco',
		'Tamaulipas',
		'Tlaxcala',
		'Veracruz',
		'Yucatán',
		'Zacatecas',
	];

	const validateFields = () => {
		const newErrors = {};

		// Validaciones
		if (!formData.nombres.trim())
			newErrors.nombres = 'El nombre es obligatorio.';
		if (!formData.apellidos.trim())
			newErrors.apellidos = 'Los apellidos son obligatorios.';
		if (!/^\d{10}$/.test(formData.telefono))
			newErrors.telefono = 'El teléfono debe tener 10 dígitos.';
		if (!formData.calle.trim()) newErrors.calle = 'La calle es obligatoria.';
		if (!formData.numero.trim()) newErrors.numero = 'El número es obligatorio.';
		if (!formData.colonia.trim())
			newErrors.colonia = 'La colonia es obligatoria.';
		if (!/^\d{5}$/.test(formData.codigo_postal))
			newErrors.codigo_postal = 'El código postal debe tener 5 dígitos.';
		if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es obligatoria.';
		if (!formData.estado) newErrors.estado = 'El estado es obligatorio.';

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

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		setErrors((prev) => ({ ...prev, [name]: '' })); // Limpia errores al escribir
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateFields()) return;

		const dataToSend = { ...formData };
		if (!dataToSend.id) delete dataToSend.id;

		try {
			setLoadingData(true);
			const response = await fetch(
				'https://api.pccdnapi.com/profile/domicilio/add-or-update/',
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
				alert(errorData.message || 'Error al guardar el domicilio.');
			}
		} catch (err) {
			alert('Error de conexión, intenta nuevamente.');
		} finally {
			setLoadingData(false);
		}
	};

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
		<div className='profile-add-address'>
			<div className='profile-add-address__container' ref={containerRef}>
				<h2>{formData.id ? 'Editar Domicilio' : 'Agregar Domicilio'}</h2>
				<form onSubmit={handleSubmit} className='profile-add-address__form'>
					<div className='profile-add-address__form-row'>
						<div className='profile-add-address__form-group'>
							<label htmlFor='nombres'>
								Nombre:<span>*</span>
							</label>
							<input
								type='text'
								id='nombres'
								name='nombres'
								value={formData.nombres}
								onChange={handleChange}
								ref={inputRefs.nombres}
								required
							/>
							{errors.nombres && <p className='error'>{errors.nombres}</p>}
						</div>
						<div className='profile-add-address__form-group'>
							<label htmlFor='apellidos'>
								Apellido(s):<span>*</span>
							</label>
							<input
								type='text'
								id='apellidos'
								name='apellidos'
								value={formData.apellidos}
								onChange={handleChange}
								ref={inputRefs.apellidos}
								required
							/>
							{errors.apellidos && <p className='error'>{errors.apellidos}</p>}
						</div>
					</div>
					<div className='profile-add-address__form-row'>
						<div className='profile-add-address__form-group'>
							<label htmlFor='telefono'>
								Teléfono:<span>*</span>
							</label>
							<input
								type='tel'
								id='telefono'
								name='telefono'
								value={formData.telefono}
								onChange={handleChange}
								ref={inputRefs.telefono}
								required
							/>
							{errors.telefono && <p className='error'>{errors.telefono}</p>}
						</div>
						<div className='profile-add-address__form-group'>
							<label htmlFor='calle'>
								Calle:<span>*</span>
							</label>
							<input
								type='text'
								id='calle'
								name='calle'
								value={formData.calle}
								onChange={handleChange}
								ref={inputRefs.calle}
								required
							/>
							{errors.calle && <p className='error'>{errors.calle}</p>}
						</div>
					</div>
					<div className='profile-add-address__form-row'>
						<div className='profile-add-address__form-group'>
							<label htmlFor='numero'>
								Número:<span>*</span>
							</label>
							<input
								type='text'
								id='numero'
								name='numero'
								value={formData.numero}
								onChange={handleChange}
								ref={inputRefs.numero}
								required
							/>
							{errors.numero && <p className='error'>{errors.numero}</p>}
						</div>
						<div className='profile-add-address__form-group'>
							<label htmlFor='numeroInterior'>Número Interior:</label>
							<input
								type='text'
								id='numero_interior'
								name='numero_interior'
								value={formData.numero_interior}
								onChange={handleChange}
								placeholder='Opcional'
								ref={inputRefs.numero_interior}
							/>
						</div>
						<div className='profile-add-address__form-group'>
							<label htmlFor='colonia'>
								Colonia:<span>*</span>
							</label>
							<input
								type='text'
								id='colonia'
								name='colonia'
								value={formData.colonia}
								onChange={handleChange}
								ref={inputRefs.colonia}
								required
							/>
							{errors.colonia && <p className='error'>{errors.colonia}</p>}
						</div>
					</div>
					<div className='profile-add-address__form-row'>
						<div className='profile-add-address__form-group'>
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
								required
							/>
							{errors.codigo_postal && (
								<p className='error'>{errors.codigo_postal}</p>
							)}
						</div>
						<div className='profile-add-address__form-group'>
							<label htmlFor='referencias'>Referencias:</label>
							<input
								type='text'
								id='referencias'
								name='referencias'
								value={formData.referencias}
								onChange={handleChange}
								placeholder='Entre calles, fachada, etc'
								ref={inputRefs.referencias}
							/>
						</div>
					</div>
					<div className='profile-add-address__form-row'>
						<div className='profile-add-address__form-group'>
							<label htmlFor='ciudad'>
								Ciudad:<span>*</span>
							</label>
							<input
								type='text'
								id='ciudad'
								name='ciudad'
								value={formData.ciudad}
								onChange={handleChange}
								ref={inputRefs.ciudad}
								required
							/>
							{errors.ciudad && <p className='error'>{errors.ciudad}</p>}
						</div>
						<div className='profile-add-address__form-group'>
							<label htmlFor='estado'>
								Estado:<span>*</span>
							</label>
							<select
								id='estado'
								name='estado'
								value={formData.estado}
								onChange={handleChange}
								ref={inputRefs.estado}
								required
							>
								<option value=''>Seleccionar</option>
								{estadosMexico.map((estado) => (
									<option key={estado} value={estado}>
										{estado}
									</option>
								))}
							</select>
							{errors.estado && <p className='error'>{errors.estado}</p>}
						</div>
					</div>
					<div className='profile-add-address__buttons'>
						<button
							type='button'
							className='cancel-button'
							onClick={onCloseModal}
						>
							Cancelar
						</button>
						<button type='submit' className='accept-button'>
							{formData.id ? 'Actualizar' : 'Agregar'}
						</button>
					</div>
				</form>
			</div>
			<style jsx>{`
				.error {
					color: red;
					font-size: 12px;
					margin-top: 5px;
				}

				.profile-add-address {
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

				.profile-add-address__container {
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

				.profile-add-address__form-group {
					margin-bottom: 30px;
				}

				.profile-add-address__form-group label {
					display: block;
					margin-bottom: 5px;
					font-weight: bold;
				}

				.profile-add-address__form-group input,
				.profile-add-address__form-group select {
					width: 100%;
					padding: 10px;
					border: 1px solid #eaeaea;
					border-radius: 6px;
				}

				.profile-add-address__form-group input:focus {
					border-color: var(--primary-color);
				}

				.profile-add-address__form-row {
					display: flex;
					gap: 0 15px;
				}

				.profile-add-address__form-row .profile-add-address__form-group {
					flex: 1;
				}

				.profile-add-address__buttons {
					display: flex;
					justify-content: space-between;
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
					.profile-add-address__container {
						padding: 20px 15px;
						height: 90%;
					}

					.profile-add-address__form-row {
						flex-direction: column;
					}
				}
			`}</style>
		</div>
	);
};

export default ProfileAddAddress;
