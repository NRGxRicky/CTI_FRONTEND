import React, { useState, useEffect } from 'react';
import UserNavLeft from '../../../components/UserNavLeft/UserNavLeft';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';
import PostData from '../../../hooks/PosData';
import Head from 'next/head';
import { useEnv } from '../../../context/EnvContext';

const index = () => {
	const { isAuthenticated, loading, accessToken } = useAuth();
	const [changePassword, setChangePassword] = useState(false);
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');
	const [error, setError] = useState(false);
	const [update, setUpdate] = useState(false);
	const [newPasswordMatch, setNewPasswordMatch] = useState(true);
	const { storeName, metaDescription, titlePostDescription } = useEnv();

	const HandleSubmit = async (e) => {
		e.preventDefault();

		if (
			newPassword &&
			confirmNewPassword !== '' &&
			newPassword !== '' &&
			newPasswordMatch
		) {
			try {
				const [res, resContent] = await PostData(
					'/profile/change_password/',
					accessToken,
					{
						old_password: oldPassword,
						new_password: newPassword,
					},
					'PUT'
				);

				if (res.status == 200) {
					setUpdate(true);
				} else {
					setError(true);
				}
			} catch (error) {
				setError(true);
			}
		}
	};

	useEffect(() => {
		if (
			confirmNewPassword !== newPassword &&
			newPassword !== '' &&
			confirmNewPassword !== ''
		) {
			setNewPasswordMatch(false);
		} else {
			setNewPasswordMatch(true);
		}
	}, [confirmNewPassword, newPassword]);

	if (!loading && !isAuthenticated) Router.push('/');

	return (
		<div className='profile container'>
			<Head>
				<title>{`Seguridad | ${storeName}: ${titlePostDescription}`}</title>
				<meta name='description' content={`${metaDescription}`} />
			</Head>
			<UserNavLeft />
			<div className='main-wrapper'>
				<div className='profile__title'>
					<div>Contraseña</div>
				</div>
				<div
					className={
						!changePassword
							? 'profile__input__disabled profile__section'
							: 'profile__section'
					}
				>
					<div className='profile__section__container'>
						<div className='profile__section__header'>
							<div className='profile__section__title'>
								Cambia la contraseña
							</div>
							<dvi
								className='profile__edit'
								onClick={() => setChangePassword(true)}
								style={
									changePassword ? { display: 'none' } : { display: 'block' }
								}
							>
								Editar
							</dvi>
						</div>
						<form onSubmit={(e) => HandleSubmit(e)}>
							<div
								className='profile__section__body'
								style={
									changePassword ? { display: 'block' } : { display: 'none' }
								}
							>
								{error && (
									<div className='profile__label-alert'>
										Contraseña anterior o nueva contraseña incorrecta.
									</div>
								)}

								<div className='profile__section__item'>
									<label>Contraseña Actual</label>

									<input
										type='password'
										defaultValue={oldPassword}
										onChange={(e) => setOldPassword(e.target.value)}
										disabled={!changePassword}
										required
										autoComplete='off'
									/>
								</div>
								<div className='profile__section__item'>
									<label>Nueva Contraseña</label>

									<input
										type='password'
										defaultValue={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										disabled={!changePassword}
										required
										autoComplete='current-password'
										minLength='8'
									/>
								</div>

								<div className='profile__section__item'>
									<label>Confirmar Nueva Contraseña</label>

									<input
										type='password'
										defaultValue={confirmNewPassword}
										onChange={(e) => setConfirmNewPassword(e.target.value)}
										disabled={!changePassword}
										required
										autoComplete='current-password'
										minLength='8'
									/>
								</div>
								{!newPasswordMatch && (
									<div className='profile__label-alert'>
										Las nuevas contraseñas no coinciden
									</div>
								)}
								<div className='profile__section__footer'>
									{changePassword && (
										<div className='profile__section__footer__actions'>
											<button
												className='profile__section__footer__actions__cancel'
												onClick={() => setChangePassword(false)}
											>
												Cancelar
											</button>
											<button
												className='profile__section__footer__actions__save'
												type='submit'
											>
												Guardar
											</button>
										</div>
									)}
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
			{update && (
				<div className='profile__update__successful'>
					<div className='profile__update__successful__viewport'></div>
					<div className='profile__update__successful__message container'>
						Tu contaseña se han actualizado correctamente.
						<button
							onClick={() => {
								setUpdate(false);
								setChangePassword(false);
							}}
						>
							Regresar
						</button>
					</div>
				</div>
			)}

			<style jsx>{`
				.profile__label-alert {
					color: red;
					margin: 20px;
				}

				.main-wrapper {
					width: calc(100% - 200px);
				}

				.profile {
					display: flex;
					flex-wrap: nowrap;
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
					width: 200px;
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
					width: 200px;
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
					border-bottom: 2px solid var(--primary-color);
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
