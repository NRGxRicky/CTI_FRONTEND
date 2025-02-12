import React, { useState } from 'react';
import { Preloader, TailSpin } from 'react-preloader-icon';
import TruncateManual from '../../hooks/TruncateManual';
import Link from 'next/link';
import { useAuth } from '../../hooks/auth';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
	showOpacity,
	hideOpacity,
	hideAll,
	showSearchBar,
	showLoginMenuState,
} from '../../lib/features/showOpacityContainerSlide';
import EyeClose from '../../components/Icons/EyeClose';
import EyeOpen from '../../components/Icons/EyeOpen';

const LoginMenu: React.FC = () => {
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const { loading, isAuthenticated, login, logout, isVerified, nombres } =
		useAuth();
	const [error, setError] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState(false);
	const dispacth = useAppDispatch();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const resp = await login(username, password);
			if (resp.status === 200) {
				setError(false);
				dispacth(hideAll());
			} else {
				setError(true);
			}
		} catch (error) {
			setError(true);
		}
	};

	const handleLogout = () => {
		logout();
	};

	return (
		<div className='login-menu__ll'>
			<div className='login-menu__ll2'>
				<div className='login-menu'>
					{loading ? (
						<div className='login-menu__loader'>
							<Preloader
								use={TailSpin}
								size={30}
								strokeWidth={8}
								strokeColor='var(--primary-color)'
								duration={900}
							/>
						</div>
					) : (
						<div>
							<div className='login-menu__header'>
								<div className='login-menu__title --capitalize'>
									Hola{' '}
									{isAuthenticated &&
										nombres !== null &&
										TruncateManual(nombres, 10)}
								</div>
							</div>
							{error && (
								<div className='login-menu__error'>
									<span>Correo y/o Contraseña incorrecta.</span>
								</div>
							)}
							{!isAuthenticated ? (
								<div>
									<div className='login-menu__body'>
										<form onSubmit={(e) => handleSubmit(e)}>
											<div className='login-menu__body__item login-menu__body__item__input'>
												<div>
													<input
														type='email'
														placeholder='Email'
														onChange={(e) => setUsername(e.target.value)}
														autoComplete='username'
														required
													/>
												</div>
											</div>
											<div className='login-menu__body__item login-menu__body__item__input'>
												<input
													placeholder='Contraseña'
													onChange={(e) => setPassword(e.target.value)}
													autoComplete='current-password'
													required
													type={showPassword ? 'text' : 'password'}
												/>
												<button
													type='button'
													className='eye-icon'
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? <EyeClose /> : <EyeOpen />}
												</button>
											</div>
											<div className='login-menu__body__item login-menu__body__item__button'>
												<input type='submit' value='Iniciar Sesión' />
											</div>
										</form>
										<Link href={`/login/forgot-password/`} legacyBehavior>
											<a onClick={() => dispacth(hideAll())}>
												<div className='login-menu__forgot-password'>
													¿Has olvidado tu contraseña?
												</div>
											</a>
										</Link>
									</div>
									<div className='login-menu__footer'>
										<div className='login-menu__register'>
											<div className='login-menu__register__title'>
												¿No tienes una cuenta?
											</div>
											<div className='login-menu__register__action-register'>
												<Link href={'/registration'} legacyBehavior>
													<a onClick={() => dispacth(hideAll())}>Registrate</a>
												</Link>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div>
									{!isVerified && (
										<Link
											href={'/profile/verify-email/resend-email'}
											legacyBehavior
										>
											<a onClick={() => dispacth(hideAll())}>
												<div className='alert'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														fill='var(--primary-color)'
														viewBox='0 0 24 24'
														width='50'
														height='50'
													>
														<path d='M1 21h22L12 2 1 21zm13-3h-4v-2h4v2zm0-4h-4v-4h4v4z' />
													</svg>
													<span>
														Atención: se requiere verificación de tu Email. Haz
														clic aquí para más detalles.
													</span>
												</div>
											</a>
										</Link>
									)}
									<div className='login-menu__body login-menu__body__logged-in'>
										<Link href={`/profile/`} legacyBehavior>
											<a>
												<div
													className='login-menu__body__item'
													onClick={() => dispacth(hideAll())}
												>
													<span>Mi cuenta</span>
												</div>
											</a>
										</Link>

										<Link href={`/mis-compras/`} legacyBehavior>
											<a>
												<div
													className='login-menu__body__item'
													onClick={() => dispacth(hideAll())}
												>
													<span>Mis compras</span>
												</div>
											</a>
										</Link>
										<Link
											href={`/profile/direcciones-y-facturacion/`}
											legacyBehavior
										>
											<a>
												<div
													className='login-menu__body__item'
													onClick={() => dispacth(hideAll())}
												>
													<span>Direcciones de envió y Facturación</span>
												</div>
											</a>
										</Link>

										<Link href={`/profile/mis-datos/`} legacyBehavior>
											<a>
												<div
													className='login-menu__body__item'
													onClick={() => dispacth(hideAll())}
												>
													<span>Mis datos</span>
												</div>
											</a>
										</Link>
										<Link href={`/profile/security/`} legacyBehavior>
											<a>
												<div
													className='login-menu__body__item'
													onClick={() => dispacth(hideAll())}
												>
													<span>Seguridad</span>
												</div>
											</a>
										</Link>
									</div>
									<div className='login-menu__footer'>
										<div
											className='login-menu__logout'
											onClick={(e) => {
												handleLogout();
												dispacth(hideAll());
											}}
										>
											<div className='login-menu__logout__title'>Salir</div>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
			<style jsx>
				{`
					.eye-icon {
						position: absolute;
						right: 10px;
						top: calc(50% + 2px);
						transform: translateY(-50%);
						background: none;
						border: none;
						cursor: pointer;
						color: var(--primary-color);
					}

					.login-menu__body {
						margin-top: 10px;
					}
					.login-menu__error {
						line-height: 3;
						color: var(--primary-color);
						margin-top: 10px;
					}

					.login-menu__logout {
						cursor: pointer;
					}
					.login-menu__body__logged-in {
						margin-left: 20px;
						line-height: 1.5;
					}

					.login-menu__body__logged-in .login-menu__body__item {
						margin: 30px 0;
					}

					.login-menu__loader {
						display: flex;
						align-items: center;
						justify-content: center;
						min-height: 300px;
						width: 100%;
					}

					.login-menu__forgot-password {
						color: var(--primary-color);
						text-align: center;
						line-height: 2;
					}

					.login-menu__ll {
						width: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
					}
					.login-menu__ll2 {
						max-width: 85rem;
						position: relative;
						width: 100%;
						background-color: var(--primary-color);
					}

					.login-menu__body__item {
						margin: 10px 0;
					}

					.login-menu__body__item__button input {
						width: 100%;
						background-color: var(--primary-color);
						border: 0;
						height: 40px;
						border-radius: 5px;
						color: #ffffff;
						font-weight: 600;
						cursor: pointer;
					}

					.login-menu__body__item__input {
						position: relative;
					}

					.login-menu__body__item__input input {
						width: 100%;
						height: 30px;
						border: 1px solid #eaeaea;
						border-radius: 5px;
						color: rgb(114 114 114);
						padding: 10px;
					}

					.login-menu__body__item input:focus,
					.login-menu__body__item input:hover {
						border: 1px solid var(--primary-color);
					}

					.login-menu__body__item label {
						height: 20px;
						font-weight: 600;
					}

					.login-menu__register__action-register {
						text-align: center;
						font-weight: 600;
						color: var(--primary-color);
					}

					.login-menu__footer {
						border-top: 1px solid #eaeaea;
						margin-top: 10px;
						padding: 20px;
						line-height: 1.5;
					}

					.login-menu__title,
					.login-menu__register__title {
						font-weight: 600;
						text-align: center;
					}

					.login-menu__title {
						margin-bottom: 20px;
						margin-top: 10px;
						text-align: center;
					}

					.login-menu__header {
						width: 100%;
						border-bottom: 1px solid #eaeaea;
					}

					.login-menu {
						width: 250px;
						position: absolute;
						background-color: #ffffff;
						left: calc(100% - 290px);
						padding: 10px 15px;
						z-index: 1000;
						box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
						border-bottom-left-radius: 2px;
						border-bottom-right-radius: 2px;
					}

					.login-menu:before {
						content: '';
						position: absolute;
						top: -6px;
						left: 50%;
						width: 0px;
						height: 0px;
						border-left: 6px solid transparent;
						border-right: 6px solid transparent;
						border-bottom: 6px solid rgb(255, 255, 255);
						clear: both;
						transform: translate(-50%);
					}

					@media only screen and (max-width: 62em) {
						.login-menu {
							top: 61px;
							position: fixed;
						}
					}
				`}
			</style>
		</div>
	);
};

export default LoginMenu;
