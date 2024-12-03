import React, { useState, useEffect } from 'react';
import fetchData from '../../hooks/GetDataAuth';
import { useAuth } from '../../hooks/auth';
import Router from 'next/router';
import PostData from '../../hooks/PosData';
import Link from 'next/link';
import { useAppSelector } from '../../lib/hooks';

import UserNavLeft from '../../components/UserNavLeft/UserNavLeft';

const index = () => {
	const { isAuthenticated, loading, accessToken, isVerified } = useAuth();
	const [loadingData, setLoadingData] = useState(false);
	const [profile, setProfile] = useState({
		domicilios: [],
		PccomputoUsuarioDatosFacturacion: [],
	});

	const [changeBasic, setChangeBasic] = useState(false);
	const [changeFacturacion, setChangeFacturacion] = useState(false);
	const [changeDomicilios, setChangeDomicilios] = useState(false);
	const [error, setError] = useState(false);
	const [update, setUpdate] = useState(false);
		const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

	const HandleSubmit = async (e) => {
		e.preventDefault();
		try {
			const [res, resContent] = await PostData(
				'/profile/resume/update/',
				accessToken,
				profile
			);

			if (res.status == 200) {
				setUpdate(true);
			}
		} catch (error) {
			setError(true);
		}
	};

	const getDataProfile = async () => {
		setLoadingData(true);

		const resData = await fetchData('/profile/resume/', accessToken);

		const dataJson = await resData.json();
		setProfile(dataJson);
	};

	const HandleChangeProfile = (key, value) => {
		setProfile((prevState) => ({ ...prevState, [key]: value }));
		setChangeBasic(true);
	};

	const HandleChangeProfileArray = (dict, index, key, value) => {
		const copyState = profile;
		copyState[dict][index][key] = value;
		setProfile((prevState) => ({ ...prevState, ...copyState }));
		dict === 'domicilios' && setChangeDomicilios(true);
		dict === 'PccomputoUsuarioDatosFacturacion' && setChangeFacturacion(true);
	};

	useEffect(() => {
		if (accessToken !== '') {
			getDataProfile();
		}
	}, [accessToken]);

	if (!loading && !isAuthenticated) Router.push('/');

	return (
		<div>
			<div className='profile container'>
				<UserNavLeft />
				<div className='main-wrapper'>
					{!isVerified && (
						<Link href={'/profile/verify-email/resend-email'} legacyBehavior>
							<a>
								<div className='alert'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='#ff002c'
										viewBox='0 0 24 24'
										width='24'
										height='24'
									>
										<path d='M1 21h22L12 2 1 21zm13-3h-4v-2h4v2zm0-4h-4v-4h4v4z' />
									</svg>
									<span>
										Atención: se requiere verificación de tu Email. Haz clic
										aquí para más detalles.
									</span>
								</div>
							</a>
						</Link>
					)}
					<div className='profile__title'>
						<div>Mis datos</div>
					</div>
					<div
						className={
							!changeBasic
								? 'profile__input__disabled profile__section'
								: 'profile__section'
						}
					>
						<div className='profile__section__container'>
							<div className='profile__section__header'>
								<div className='profile__section__title'>Datos personales</div>
								<div
									className='profile__edit'
									onClick={() => setChangeBasic(true)}
									style={
										changeBasic ? { display: 'none' } : { display: 'block' }
									}
								>
									Editar
								</div>
							</div>
							<form onSubmit={(e) => HandleSubmit(e)}>
								<div
									className='profile__section__body'
									style={
										changeBasic || !mobileView
											? { display: 'block' }
											: { display: 'none' }
									}
								>
									<div className='profile__section__item'>
										<label>Nombre(s)</label>

										<input
											type='text'
											defaultValue={profile.nombres}
											onChange={(e) =>
												HandleChangeProfile('nombres', e.target.value)
											}
											disabled={!changeBasic}
											autoComplete='given-name'
											required
											className='--capitalize'
										/>
									</div>
									<div className='profile__section__item'>
										<label>Apellido(s)</label>
										<input
											type='text'
											defaultValue={profile.apellidos}
											onChange={(e) =>
												HandleChangeProfile('apellidos', e.target.value)
											}
											disabled={!changeBasic}
											required
											autoComplete='family-name'
											className='--capitalize'
										/>
									</div>
								</div>

								<div className='profile__section__footer'>
									{changeBasic && (
										<div className='profile__section__footer__actions'>
											<button
												className='profile__section__footer__actions__cancel'
												onClick={() => setChangeBasic(false)}
											>
												Cancelar
											</button>
											<button className='profile__section__footer__actions__save'>
												Guardar
											</button>
										</div>
									)}
								</div>
							</form>
						</div>
					</div>

					<div
						className={
							!changeDomicilios
								? 'profile__input__disabled profile__section'
								: 'profile__section'
						}
					>
						<div className='profile__section__container'>
							<div className='profile__section__header'>
								<div className='profile__section__title'>
									Dirección de entrega
								</div>
								<div
									className='profile__edit'
									onClick={() => setChangeDomicilios(true)}
									style={
										changeDomicilios
											? { display: 'none' }
											: { display: 'block' }
									}
								>
									Editar
								</div>
							</div>
							<form onSubmit={(e) => HandleSubmit(e)}>
								{profile.domicilios.map((domicilio, index) => (
									<div
										className='profile__section__body'
										key={domicilio.id}
										style={
											changeDomicilios || !mobileView
												? { display: 'block' }
												: { display: 'none' }
										}
									>
										<div className='profile__section__item'>
											<label>Calle</label>
											<input
												type='text'
												defaultValue={domicilio.calle}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'calle',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												autoComplete='shipping street-address'
												required
											/>
										</div>
										<div className='profile__section__item'>
											<label>Numero</label>
											<input
												type='text'
												defaultValue={domicilio.numero}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'numero',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												autoComplete='address-line1'
												required
											/>
										</div>
										<div className='profile__section__item'>
											<label>Numero interior</label>
											<input
												type='text'
												defaultValue={domicilio.numero_interior}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'numero_interior',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												required
											/>
										</div>
										<div className='profile__section__item'>
											<label>Colonia</label>
											<input
												type='text'
												defaultValue={domicilio.colonia}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'colonia',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												required
												autoComplete='address-line2'
											/>
										</div>
										<div className='profile__section__item'>
											<label>Código Postal</label>
											<input
												type='text'
												defaultValue={domicilio.codigo_postal}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'codigo_postal',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												autoComplete='postal-code'
												required
												pattern='[0-9]{5}'
											/>
										</div>
										<div className='profile__section__item'>
											<label>Ciudad</label>
											<input
												type='text'
												defaultValue={domicilio.ciudad}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'ciudad',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												autoComplete='home city'
												required
											/>
										</div>
										<div className='profile__section__item'>
											<label>Estado</label>
											<input
												type='text'
												defaultValue={domicilio.estado}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'estado',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												autoComplete='state'
												required
											/>
										</div>
										<div className='profile__section__item'>
											<label>Teléfono</label>
											<input
												type='tel'
												defaultValue={domicilio.telefono}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'telefono',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												autoComplete='tel'
												required
												pattern='[0-9]{0,10}'
											/>
										</div>
										<div className='profile__section__item'>
											<label>Teléfono Ext.</label>
											<input
												type='tel'
												defaultValue={domicilio.telefono_ext}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'telefono_ext',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												autoComplete='tel-extension'
												pattern='[0-9]{0,10}'
											/>
										</div>
										<div className='profile__section__item'>
											<label>Referencias del domicilio</label>
											<input
												type='text'
												defaultValue={domicilio.referencias}
												onChange={(e) =>
													HandleChangeProfileArray(
														'domicilios',
														index,
														'referencias',
														e.target.value
													)
												}
												disabled={!changeDomicilios}
												placeholder='Entre calles, Color, etc.'
												maxLength={255}
											/>
										</div>
									</div>
								))}
								<div className='profile__section__footer'>
									{changeDomicilios && (
										<div className='profile__section__footer__actions'>
											<button
												className='profile__section__footer__actions__cancel'
												onClick={() => setChangeDomicilios(false)}
											>
												Cancelar
											</button>
											<button className='profile__section__footer__actions__save'>
												Guardar
											</button>
										</div>
									)}
								</div>
							</form>
						</div>
					</div>

					<div
						className={
							!changeFacturacion
								? 'profile__input__disabled profile__section'
								: 'profile__section'
						}
					>
						<div className='profile__section__container'>
							<div className='profile__section__header'>
								<div className='profile__section__title'>
									Datos de Facturación
								</div>
								<div
									className='profile__edit'
									onClick={() => setChangeFacturacion(true)}
									style={
										changeFacturacion
											? { display: 'none' }
											: { display: 'block' }
									}
								>
									Editar
								</div>
							</div>
							<form onSubmit={(e) => HandleSubmit(e)}>
								{profile.PccomputoUsuarioDatosFacturacion.map(
									(facturacion, index) => (
										<div
											className='profile__section__body'
											key={facturacion.id}
											style={
												changeFacturacion || !mobileView
													? { display: 'block' }
													: { display: 'none' }
											}
										>
											<div className='profile__section__item'>
												<label>Uso de CFDI</label>
												<input
													type='text'
													defaultValue={facturacion.uso_de_cfdi}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'uso_de_cfdi',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>RFC</label>
												<input
													type='text'
													defaultValue={facturacion.rfc}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'rfc',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>Razón Social</label>
												<input
													type='text'
													defaultValue={facturacion.razon_social}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'razon_social',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>Régimen Fiscal</label>
												<input
													type='text'
													defaultValue={facturacion.regimen}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'regimen',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>Email</label>
												<input
													type='email'
													defaultValue={facturacion.email}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'email',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>Calle</label>
												<input
													type='text'
													defaultValue={facturacion.calle}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'calle',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													autoComplete='shipping street-address'
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>Numero</label>
												<input
													type='text'
													defaultValue={facturacion.numero}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'numero',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													autoComplete='address-line1'
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>Numero interior</label>
												<input
													type='text'
													defaultValue={facturacion.numero_interior}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'numero_interior',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>Colonia</label>
												<input
													type='text'
													defaultValue={facturacion.colonia}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'colonia',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													required
													autoComplete='address-line2'
												/>
											</div>
											<div className='profile__section__item'>
												<label>Código Postal</label>
												<input
													type='text'
													defaultValue={facturacion.codigo_postal}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'codigo_postal',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													autoComplete='postal-code'
													required
													pattern='[0-9]{5}'
												/>
											</div>
											<div className='profile__section__item'>
												<label>Ciudad</label>
												<input
													type='text'
													defaultValue={facturacion.ciudad}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'ciudad',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													autoComplete='home city'
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>Estado</label>
												<input
													type='text'
													defaultValue={facturacion.estado}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'estado',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													autoComplete='state'
													required
												/>
											</div>
											<div className='profile__section__item'>
												<label>Teléfono</label>
												<input
													type='tel'
													defaultValue={facturacion.telefono}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'telefono',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													autoComplete='tel'
													required
													pattern='[0-9]{0,10}'
												/>
											</div>
											<div className='profile__section__item'>
												<label>Teléfono Ext.</label>
												<input
													type='tel'
													defaultValue={facturacion.telefono_ext}
													onChange={(e) =>
														HandleChangeProfileArray(
															'PccomputoUsuarioDatosFacturacion',
															index,
															'telefono_ext',
															e.target.value
														)
													}
													disabled={!changeFacturacion}
													autoComplete='tel-extension'
													pattern='[0-9]{0,10}'
												/>
											</div>
										</div>
									)
								)}
								<div className='profile__section__footer'>
									{changeFacturacion && (
										<div className='profile__section__footer__actions'>
											<button
												className='profile__section__footer__actions__cancel'
												onClick={() => setChangeFacturacion(false)}
											>
												Cancelar
											</button>
											<button className='profile__section__footer__actions__save'>
												Guardar
											</button>
										</div>
									)}
								</div>
							</form>
						</div>
					</div>
				</div>
				{update && (
					<div className='profile__update__successful'>
						<div className='profile__update__successful__viewport'></div>
						<div className='profile__update__successful__message container'>
							Tus datos se han actualizado correctamente.
							<button
								onClick={() => {
									setUpdate(false);
									setChangeDomicilios(false);
									setChangeFacturacion(false);
									setChangeBasic(false);
								}}
							>
								Regresar
							</button>
						</div>
					</div>
				)}
			</div>

			<style jsx>{`
				.main-wrapper {
					width: calc(100% - 200px);
				}

				.profile {
					display: flex;
					flex-wrap: nowrap;
				}

				.profile__mobile__actions {
					text-align: right;
					color: #ff002c;
					padding: 20px;
				}

				.profile__update__successful__viewport {
					left: 0;
					top: 0;
					position: fixed;
					width: 100%;
					height: 100%;
					z-index: 1;
					background: #0f0f0f;
					opacity: 0.7;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: opacity 0.3s, visibility 0.3s;
				}
				.profile__update__successful__message button {
					padding: 10px;
					background-color: #ff002c;
					color: #ffffff;
					border: 0;
					opacity: 1 !important;
					z-index: 2;
					margin-top: 20px;
					border-radius: 5px;
					cursor: pointer;
				}
				.profile__update__successful__message {
					position: fixed;
					max-width: 400px;
					top: 50%;
					left: 0;
					right: 0;
					z-index: 2;
					background-color: #ffffff;
					opacity: 1 !important;
					padding: 20px;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					border-radius: 5px;
					font-size: 16px;
				}

				.profile__section__footer__actions {
					height: 80px;
					display: flex;
					align-items: center;
				}
				.profile__section__footer__actions button {
					padding: 10px;
					margin-left: 10px;
					border-radius: 5px;
					font-weight: 600;
					cursor: pointer;
				}

				.profile__section__footer__actions__cancel {
					background-color: #ffffff;
					border: 1px solid #eaeaea;
				}

				.profile__section__footer__actions__save {
					background-color: #ff002c;
					border: 0;
					color: #ffffff;
				}

				.profile__section__footer {
					display: flex;
					width: 100%;
					align-items: center;
					justify-content: flex-end;
				}

				.profile__input__disabled input {
					border: 0 !important;
				}

				.profile__section__header {
					width: 100%;
					display: flex;
					align-items: center;
				}

				.profile__section__title {
					flex-basis: calc(100% - 100px);
				}

				.profile__edit {
					flex-basis: 100px;
					text-align: right;
					color: #ff002c;
					cursor: pointer;
				}

				.profile__section__item label {
					font-weight: 600;
					width: 80px;
					height: 25px;
					display: flex;
					align-items: center;
					font-size: 14px;
				}

				.profile__section__item {
					width: 100%;
					display: flex;
					align-items: center;
					flex-wrap: wrap;
				}

				.profile__section__item + .profile__section__item {
					margin-top: 10px;
				}

				.profile__section__container {
					border: 1px solid #eaeaea;
					border-radius: 5px;
					padding: 10px 20px;
					background-color: #ffffff;
				}

				.profile__section {
					padding: 20px;
				}

				.profile__section__body input {
					width: calc(100% - 90px);
					height: 40px;
					margin-left: 10px;
					border: 1px solid #eaeaea;
					border-top: 0;
					border-left: 0;
					border-right: 0;
					background-color: #ffffff;
					color: rgb(114 114 114);
					padding-left: 10px;
					border-radius: 0;
					font-size: 14px;
				}

				.profile__section__body input:focus,
				.profile__section__body input:hover {
					border-bottom: 2px solid #ff002c;
					color: #000000;
				}

				.profile__section__body {
					margin-left: 20px;
					margin-top: 10px;
				}

				.profile__title {
					font-size: 20px;
					font-weight: 600;
					margin-left: 20px;
					display: flex;
					height: 50px;
					align-items: flex-end;
				}

				.profile__section__title {
					font-size: 18px;
					font-weight: 600;
					line-height: 3;
				}

				.container {
					margin-top: 0;
				}

				.profile__section__body input:disabled {
					color: rgb(114 114 114);
					-webkit-text-fill-color: rgb(114 114 114);
					opacity: 1;
				}

				@media only screen and (max-width: 60em) {
					.profile__section__item label {
						flex-basis: 100%;
						width: 100%;
					}

					.profile__section__item input {
						width: 100%;
						flex-basis: 100%;
						margin-left: 0;
					}

					.profile__section {
						padding-top: 5px;
						padding-bottom: 5px;
					}

					.profile__title {
						margin-bottom: 10px;
					}

					.main-wrapper {
						width: 100%;
					}
					.profile {
						flex-direction: column;
					}
				}
			`}</style>
		</div>
	);
};

export default index;
