import React, { useState, useEffect } from 'react';
import fetchData from '../../../hooks/GetDataAuth';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';
import PostData from '../../../hooks/PosData';
import Link from 'next/link';
import { useAppSelector } from '../../../lib/hooks';
import Head from 'next/head';
import UserNavLeft from '../../../components/UserNavLeft/UserNavLeft';
import { useEnv } from '../../../context/EnvContext';
import Footer from '../../../components/Footer/Footer';

const index = () => {
	const { isAuthenticated, loading, accessToken, isVerified, username } =
		useAuth();
	const [loadingData, setLoadingData] = useState(false);
	const [profile, setProfile] = useState({});

	const [changeBasic, setChangeBasic] = useState(false);
	const [error, setError] = useState(false);
	const [update, setUpdate] = useState(false);
	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);
	const { storeName, metaDescription, titlePostDescription } = useEnv();

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

	useEffect(() => {
		if (accessToken !== '') {
			getDataProfile();
		}
	}, [accessToken]);

	if (!loading && !isAuthenticated) {
		Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
	}

	return (
		<div className='container'>
			<Head>
				<title>{`Mi Perfil | ${storeName}: ${titlePostDescription}`}</title>
				<meta name='description' content={`${metaDescription}`} />
			</Head>
			<div className='profile'>
				<UserNavLeft />
				<div className='main-wrapper'>
					{!isVerified && (
						<Link href={'/profile/verify-email/resend-email'} legacyBehavior>
							<a>
								<div className='alert'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='var(--primary-color)'
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
						<h2>Mis datos</h2>
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
					{/* ===================== NUEVA SECCIÓN: EMAILS REGISTRADOS ===================== */}
					<div className='profile__section'>
						<div className='profile__section__container'>
							<div className='profile__section__header'>
								<div className='profile__section__title'>Email registrado</div>
							</div>
							<div className='profile__section__body'>
								{/* Puedes mostrar varios si el usuario tiene más de un correo, 
                  en el ejemplo sólo se maneja el principal (profile.email). */}
								<div className='profile__section__item'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='#777'
										viewBox='0 0 24 24'
										width='24'
										height='24'
									>
										<path d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 2L12 11 4.4 6h15.2zM4 18V8l7.3 4.6c.4.3.9.3 1.3 0L20 8v10H4z' />
									</svg>
									<strong style={{ margin: '10px'}}>
										Email:
									</strong>
									<span className='profile__email'>{username}</span>
								</div>
							</div>
							<div className='profile__section__help'>
								<small className='text--off'>
									Importante: para modificar el correo electrónico asociado a tu cuenta, por favor contáctanos.
								</small>
							</div>
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
									setChangeBasic(false);
								}}
							>
								Regresar
							</button>
						</div>
					</div>
				)}
			</div>
			{!mobileView &&
				< Footer />
			}

			<style jsx>{`
				.main-wrapper {
					width: 100%;
					margin-left: 20px;
					padding: 0 20px;
					min-height: 50dvh;
				}

				.profile__email {
					color: var(--primary-color);
					font-size: 12px;
				}

				.profile {
					display: flex;
					flex-wrap: nowrap;
					min-height: 50dvh;
				}

				.profile__section__help {
					margin-top: 10px;
				}

				.profile__mobile__actions {
					text-align: right;
					color: var(--primary-color);
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
					background-color: var(--primary-color);
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

				.profile__section__footer__actions__cancel:hover {
					background-color: #f5f5f5;
				}

				.profile__section__footer__actions__save {
					background-color: var(--primary-color);
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
					color: var(--primary-color);
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
					border-radius: 5px;
					background-color: #ffffff;
					color: rgb(114 114 114);
					padding-left: 10px;
					font-size: 14px;
				}

				.profile__section__body input:focus,
				.profile__section__body input:hover {
					border: 1px solid var(--primary-color);
					color: #000000;
				}

				.profile__section__body {
					margin-left: 20px;
					margin-top: 10px;
				}

				.profile__title {
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
						margin-left: 0;
						padding: 0;
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
