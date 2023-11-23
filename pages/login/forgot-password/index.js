import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile,
} from 'react-device-detect';
import PostData from '../../../hooks/PosData';
import { Preloader, TailSpin } from 'react-preloader-icon';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';

const index = () => {
	const [tempMobile, setTempMobile] = useState(false);
	const [email, setEmail] = useState('');
	const [statusSend, setStatusSend] = useState(false);
	const [loadingData, setLoadingData] = useState(false);
	const [error, setError] = useState(false);
	const { loading, isAuthenticated, login, logout } = useAuth();

	const HandleSubmit = async (e) => {
		e.preventDefault();
		setLoadingData(true);
		try {
			const [res, resContent] = await PostData(
				'/profile/password_reset/',
				'',
				{
					email: email,
				},
				'POST',
				false
			);

			if (res.status == 200) {
				setStatusSend(true);
			} else {
				setError(true);
			}
		} catch (error) {
			setError(true);
		}
		setLoadingData(false);
	};

	useEffect(() => {
		setTempMobile(isMobile);
	}, [isMobile]);

	if (!loading && isAuthenticated) Router.push('/');

	return (
		<div
			className={
				!tempMobile
					? 'forgot-password forgot-password__static'
					: 'forgot-password'
			}
		>
			<Link href={`/`} legacyBehavior>
				<a>
					<div className='login__back container'>
						<svg
							className='login__back__icon'
							width='14.6'
							height='27'
							viewBox='0 0 16 27'
							xmlns='http://www.w3.org/1700/svg'
						>
							<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
						</svg>
						<label className='text--off'>Regresar para iniciar sesión</label>
					</div>
				</a>
			</Link>
			<div className='card__form container'>
				{loadingData ? (
					<div className='card__form__loader'>
						<Preloader
							use={TailSpin}
							size={30}
							strokeWidth={8}
							strokeColor='#FF002C'
							duration={900}
						/>
					</div>
				) : statusSend ? (
					<div>
						<div className='card__form__title'>
							Enviamos un enlace de restablecimiento de contraseña a {email}
						</div>
						<div className='card__form__label'>
							Revisa tu correo electrónico y has clic en el enlace para
							establecer una nueva contraseña.
						</div>
						<div className='card__form__label'>
							¿No has recibido el correo electrónico?
						</div>
						<div className='card__form__label'>
							Vuelve a revisar tu bandeja de entrada en 10 minutos. También
							podría estar en tu carpeta de correo no deseado.
						</div>
					</div>
				) : (
					<div>
						<div className='card__form__title'>¿Olvidaste tu contraseña?</div>
						<div className='card__form__label'>
							Ingrese tu dirección de correo electrónico asociada con tu cuenta.
						</div>
						<form onSubmit={(e) => HandleSubmit(e)}>
							<input
								className='card__form__input'
								type='email'
								placeholder='Correo electrónico'
								required
								onChange={(e) => setEmail(e.target.value)}
							></input>
							{error && (
								<div className='card__form__error'>
									<span>No existe una cuenta asociada a ese correo.</span>
								</div>
							)}
							<button type='submit' className='card__form__submit'>
								Continuar
							</button>
						</form>
					</div>
				)}
			</div>
			<style jsx>
				{`
					.card__form__error {
						color: red;
						margin-top: 20px;
					}
					.card__form__loader {
						display: flex;
						width: 100%;
						align-items: center;
						justify-content: center;
						min-height: 260px;
					}

					.login__back {
						max-width: 460px;
						cursor: pointer;
						display: flex;
						align-items: center;
					}

					.login__back__icon {
						width: 14px;
						height: 14px;
						margin-right: 5px;
						fill: rgb(114 114 114);
					}
					.login__back:hover label,
					.login__back:hover .login__back__icon {
						cursor: pointer;
						fill: #ff002c;
						color: #ff002c;
					}

					.card__form {
						background-color: #ffffff;
						max-width: 460px;
						padding: 30px;
						width: auto;
						border: 1px solid #eaeaea;
						border-radius: 2px;
						text-align: center;
					}

					.card__form__title {
						font-size: 18px;
						font-weight: 600;
						margin-bottom: 10px;
					}

					.card__form__label {
						margin-bottom: 20px;
					}

					.card__form__input {
						padding: 15px 20px;
						width: 100%;
						border-radius: 2px;
						border: 1px solid #eaeaea;
						border-radius: 2px;
						font-size: 14px;
					}

					.card__form__submit {
						margin-top: 20px;
						width: 100%;
						padding: 15px;
						background-color: #ff002c;
						border-radius: 2px;
						border: 0;
						color: #ffffff;
						font-weight: 600;
						cursor: pointer;
					}

					@media only screen and (max-width: 60em) {
						.forgot-password__static {
							margin-top: 78px;
						}
					}
				`}
			</style>
		</div>
	);
};

export default index;
