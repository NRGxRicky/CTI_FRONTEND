import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { hideAll } from '../../lib/features/showOpacityContainerSlide';

const ProfileAddAddress = () => {
	const dispatch = useAppDispatch();
	const containerRef = useRef(null);
	const [formData, setFormData] = useState({
		nombre: '',
		apellidos: '',
		telefono: '',
		calle: '',
		numero: '',
		numeroInterior: '',
		colonia: '',
		codigoPostal: '',
		ciudad: '',
		estado: '',
		referencias: '',
	});

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

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
	};

	// Manejar clics fuera del contenedor
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				dispatch(hideAll());
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [dispatch]);

	return (
		<div className='profile-add-address'>
			<div className='profile-add-address__container' ref={containerRef}>
				<h2>Agregar Domicilio</h2>
				<form onSubmit={handleSubmit} className='profile-add-address__form'>
					<div className='profile-add-address__form-row'>
						<div className='profile-add-address__form-group'>
							<label htmlFor='nombre'>
								Nombre:<span>*</span>
							</label>
							<input
								type='text'
								id='nombre'
								name='nombre'
								value={formData.nombre}
								onChange={handleChange}
								required
							/>
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
								required
							/>
						</div>
					</div>
					<div className='profile-add-address__form-row'>
						<div className='profile-add-address__form-group'>
							<label htmlFor='telefono'>
								Teléfono 10 dígitos:<span>*</span>
							</label>
							<input
								type='tel'
								id='telefono'
								name='telefono'
								value={formData.telefono}
								onChange={handleChange}
								required
							/>
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
								required
							/>
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
								required
							/>
						</div>
						<div className='profile-add-address__form-group'>
							<label htmlFor='numeroInterior'>Número Interior:</label>
							<input
								type='text'
								id='numeroInterior'
								name='numeroInterior'
								value={formData.numeroInterior}
								onChange={handleChange}
								placeholder='Opcional'
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
								required
							/>
						</div>
					</div>
					<div className='profile-add-address__form-row'>
						<div className='profile-add-address__form-group'>
							<label htmlFor='codigoPostal'>
								Código Postal:<span>*</span>
							</label>
							<input
								type='text'
								id='codigoPostal'
								name='codigoPostal'
								value={formData.codigoPostal}
								onChange={handleChange}
								required
							/>
						</div>
						<div className='profile-add-address__form-group'>
							<label htmlFor='indicaciones'>Referencias:</label>
							<input
								type='text'
								id='referencias'
								name='referencias'
								value={formData.referencias}
								onChange={handleChange}
								placeholder='Entre calles, fachada, etc'
							/>
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
								required
							>
								<option value=''>Seleccionar</option>
								{estadosMexico.map((estado) => (
									<option key={estado} value={estado}>
										{estado}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className='profile-add-address__buttons'>
						<button
							type='button'
							className='cancel-button'
							onClick={() => {
								dispatch(hideAll());
							}}
						>
							Cancelar
						</button>
						<button type='submit' className='accept-button'>
							Aceptar
						</button>
					</div>
				</form>
			</div>
			<style jsx>{`
				.profile-add-address {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 100dvw;
					height: calc(100dvh - 61px);
					z-index: 1000;
					position: fixed;
					top: 0;
					left: 0;
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
						padding: 15px;
						height: 90%;
					}

					.profile-add-address__form-row {
						flex-direction: column;
					}

					.profile-add-address {
						top: 61px !important;
					}
				}
			`}</style>
		</div>
	);
};

export default ProfileAddAddress;
