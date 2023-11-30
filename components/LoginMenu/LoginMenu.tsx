import React, { useState } from 'react';
import { Preloader, TailSpin } from 'react-preloader-icon';
import TruncateManual from '../../hooks/TruncateManual';
import Link from 'next/link';
import { useAuth } from '../../hooks/auth';

interface LoginMenuProps {
	setShowLoginMenu: React.Dispatch<React.SetStateAction<boolean>>;
	setName: React.Dispatch<React.SetStateAction<string>>;
	name: string;
}

const LoginMenu: React.FC<LoginMenuProps> = ({
	setShowLoginMenu,
	setName,
	name,
}) => {
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const { loading, isAuthenticated, login, logout } = useAuth();
	const [error, setError] = useState<boolean>(false);
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const resp = await login(username, password);

			if (resp.status === 200) {
				setName(localStorage.getItem('name') || '');
				setError(false);
				setShowLoginMenu(false);
			} else {
				setError(true);
			}
		} catch (error) {
			setError(true);
		}
	};

	const handleLogout = () => {
		logout();
		setName('Iniciar sesión / Registrarse');
	};

	return (
		<div className='login-menu__ll'>
			<div className='login-menu__ll2'>
				<div
					className='login-menu__viewport'
					onClick={() => setShowLoginMenu(false)}
				></div>

				<div className='login-menu'>
					{loading ? (
						<div className='login-menu__loader'>
							<Preloader
								use={TailSpin}
								size={30}
								strokeWidth={8}
								strokeColor='#FF002C'
								duration={900}
							/>
						</div>
					) : (
						<div>
							<div className='login-menu__header'>
								<div className='login-menu__title'>
									Bienvenido{' '}
									{isAuthenticated && name !== null && TruncateManual(name, 10)}
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
												<div>
													<input
														type='password'
														placeholder='Contraseña'
														onChange={(e) => setPassword(e.target.value)}
														autoComplete='current-password'
														required
													/>
												</div>
											</div>
											<div className='login-menu__body__item login-menu__body__item__button'>
												<input type='submit' value='Iniciar Sesión' />
											</div>
										</form>
										<Link href={`/login/forgot-password/`} legacyBehavior>
											<a onClick={() => setShowLoginMenu(false)}>
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
												Registrate
											</div>
										</div>
									</div>
								</div>
							) : (
								<div>
									<div className='login-menu__body login-menu__body__logged-in'>
										<div className='login-menu__body__item'>
											<span>Mis compras</span>
										</div>
										<Link href={`/profile/`} legacyBehavior>
											<a>
												<div
													className='login-menu__body__item'
													onClick={() => setShowLoginMenu(false)}
												>
													<span>Mis datos</span>
												</div>
											</a>
										</Link>
									</div>
									<div className='login-menu__footer'>
										<div
											className='login-menu__logout'
											onClick={(e) => {
												handleLogout();
												setShowLoginMenu(false);
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
					.login-menu__body {
						margin-top: 20px;
					}
					.login-menu__error {
						line-height: 3;
						color: #ff002c;
					}

					.login-menu__logout {
						cursor: pointer;
					}
					.login-menu__body__logged-in {
						margin-left: 20px;
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
						color: #ff002c;
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
						background-color: #ff002c;
					}
					.login-menu__viewport {
						left: 0;
						top: 0;
						position: fixed;
						width: 100%;
						height: 100%;
						z-index: 200;
						background: #0f0f0f;
						opacity: 0.7;
						transition: opacity 0.3s, visibility 0.3s;
					}

					.login-menu__body__item {
						margin: 10px 0;
					}

					.login-menu__body__item__button input {
						width: 100%;
						background-color: #ff002c;
						border: 0;
						height: 40px;
						border-radius: 2px;
						color: #ffffff;
						font-weight: 600;
						cursor: pointer;
					}

					.login-menu__body__item__input input {
						width: 100%;
						height: 30px;
						border: 1px solid #eaeaea;
						border-radius: 2px;
						color: rgb(114 114 114);
						padding: 10px;
						color: ;
					}

					.login-menu__body__item input:focus,
					.login-menu__body__item input:hover {
						border: 1px solid #ff002c;
					}

					.login-menu__body__item label {
						height: 20px;
						font-weight: 600;
					}

					.login-menu__register__action-register {
						text-align: center;
						font-weight: 600;
						color: #ff002c;
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
							top: 58px;
							position: fixed;
						}
					}
				`}
			</style>
		</div>
	);
};

export default LoginMenu;
