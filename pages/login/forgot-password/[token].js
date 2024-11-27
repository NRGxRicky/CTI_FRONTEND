import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';

export const getServerSideProps = async (context) => {
	return {
		props: {
			tokenRecovery: context.query.token,
		},
	};
};

const Token = ({ tokenRecovery }) => {
	const { loading, isAuthenticated } = useAuth();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [passwordStrength, setPasswordStrength] = useState('');
	const [strengthLevel, setStrengthLevel] = useState(0);
	const [error, setError] = useState('');
	const [loadingSubmit, setLoadingSubmit] = useState(false);
	const [success, setSuccess] = useState(false); // Nuevo estado para manejar la respuesta exitosa
	const [message, setMessage] = useState('');
	const [showPassword, setShowPassword] = useState(false); // Estado para controlar la visibilidad de la contraseña
	const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado para confirmar la visibilidad de la contraseña

	useEffect(() => {
		const evaluatePasswordStrength = (password) => {
			let strength = '';
			let strengthLevel = 0;

			const lengthCheck = password.length >= 8;
			const hasNumbers = /[0-9]/.test(password);
			const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

			if (lengthCheck && hasNumbers && hasSpecialChars) {
				strength = 'Fuerte';
				strengthLevel = 100;
			} else if (lengthCheck && (hasNumbers || hasSpecialChars)) {
				strength = 'Moderada';
				strengthLevel = 60;
			} else if (lengthCheck) {
				strength = 'Débil';
				strengthLevel = 30;
			} else {
				strength = 'Muy débil';
				strengthLevel = 10;
			}

			setPasswordStrength(strength);
			setStrengthLevel(strengthLevel);
		};

		if (password) evaluatePasswordStrength(password);
	}, [password]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoadingSubmit(true);

		if (password !== confirmPassword) {
			setError('Las contraseñas no coinciden.');
			setLoadingSubmit(false);
			return;
		}

		// Preparar los datos para el POST
		const data = {
			password: password,
			token: tokenRecovery,
		};

		// Realizar el POST a la URL de django_rest_passwordreset
		try {
			const response = await fetch(
				`https://api.pccdnapi.com/profile/password_reset/confirm/`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
				}
			);

			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(
					responseData.message || 'Error al restablecer la contraseña.'
				);
			}

			// Si la respuesta es exitosa, ocultamos el formulario y mostramos el mensaje
			setSuccess(true);
			setMessage('¡Contraseña actualizada correctamente!');
		} catch (error) {
			setError(error.message);
		} finally {
			setLoadingSubmit(false);
		}
	};

	if (!loading && isAuthenticated) Router.push('/');

	return (
		<div className='container'>
			<div className='forgot-password'>
				<div className='forgot-password__container'>
					<div className='forgot-password__title'>
						<h2>
							{success ? 'Contraseña actualizada' : 'Restablezca su contraseña'}
						</h2>
					</div>

					{/* Renderizar el texto solo si no ha tenido éxito */}
					{!success && (
						<div className='forgot-password__label'>
							Hemos recibido su petición para restablecer el acceso a su cuenta.
							Le recomendamos crear una nueva contraseña segura.
						</div>
					)}

					{/* Mostrar el formulario solo si el estado 'success' es false */}
					{!success ? (
						<form onSubmit={handleSubmit} className='forgot-password__form'>
							<div>
								<label htmlFor='password'>Nueva Contraseña</label>
								<div className='password-input-container'>
									<input
										type={showPassword ? 'text' : 'password'}
										id='password'
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
									<button
										type='button'
										className='eye-icon'
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? '🙈' : '👁️'}
									</button>
								</div>
							</div>
							<div>
								<label htmlFor='confirmPassword'>Confirmar Contraseña</label>
								<div className='password-input-container'>
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										id='confirmPassword'
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
									/>
									<button
										type='button'
										className='eye-icon'
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? '🙈' : '👁️'}
									</button>
								</div>
							</div>

							<div className='password-strength'>
								<p>Fortaleza de la contraseña: {passwordStrength}</p>
								<div className='strength-bar-background'>
									<div
										className='strength-bar'
										style={{
											width: `${strengthLevel}%`,
											backgroundColor:
												strengthLevel === 100
													? '#00b300'
													: strengthLevel >= 60
													? '#ff9900'
													: '#ff002c',
										}}
									></div>
								</div>
							</div>

							{error && <p className='error-message'>{error}</p>}

							<button
								type='submit'
								disabled={loadingSubmit}
								className='button-submit'
							>
								{loadingSubmit ? 'Cargando...' : 'Restablecer Contraseña'}
							</button>
						</form>
					) : (
						<div className='success-message'>
							<div className='icon-circle'>
								<span className='check-icon'>✔</span>
							</div>
							<p>{message}</p>
							<button
								onClick={() => Router.push('/')}
								className='back-home-button'
							>
								Ir al Inicio
							</button>
						</div>
					)}
				</div>
			</div>

			<style jsx>
				{`
					.container {
						width: 100%;
						display: flex;
						justify-content: center;
						align-items: center;
						min-height: 100vh;
						background-color: #f7f7f7;
					}

					.forgot-password__title {
						padding: 10px;
						border-bottom: 1px solid #eaeaea;
						text-align: center;
						font-size: 20px;
						color: #333;
					}

					.forgot-password__label {
						padding: 10px;
						font-size: 14px;
						color: #666;
						text-align: center;
					}

					.forgot-password {
						width: 100%;
						max-width: 400px;
						background-color: #fff;
						border-radius: 8px;
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
						padding: 20px;
					}

					.forgot-password__form {
						padding: 10px;
					}

					.forgot-password__form div {
						margin-bottom: 15px;
					}

					.error-message {
						color: #ff002c;
						margin-top: 10px;
						margin-bottom: 10px;
					}

					.forgot-password__form label {
						display: block;
						margin-bottom: 5px;
						font-weight: bold;
						color: #333;
					}

					.forgot-password__form input {
						width: 100%;
						padding: 12px;
						border-radius: 6px;
						border: 1px solid #ccc;
						box-sizing: border-box;
						font-size: 14px;
						color: #333;
					}

					.forgot-password__form input:focus {
						outline: none;
						border-color: #ff002c;
					}

					.password-input-container {
						position: relative;
						display: flex;
						align-items: center;
					}

					.eye-icon {
						position: absolute;
						right: 10px;
						background: none;
						border: none;
						cursor: pointer;
						font-size: 18px;
					}

					.password-strength {
						margin-top: 10px;
					}

					.strength-bar-background {
						width: 100%;
						background-color: #eaeaea;
						border-radius: 5px;
						margin-top: 10px;
					}

					.strength-bar {
						height: 6px;
						border-radius: 5px;
					}

					.success-message {
						text-align: center;
						margin-top: 20px;
						line-height: 4;
					}

					.icon-circle {
						width: 50px;
						height: 50px;
						background-color: #00b300;
						border-radius: 50%;
						display: flex;
						justify-content: center;
						align-items: center;
						margin: 0 auto;
					}

					.check-icon {
						font-size: 30px;
						color: white;
					}

					.back-home-button {
						width: 100%;
						padding: 12px;
						background-color: #ff002c;
						color: white;
						border: none;
						border-radius: 6px;
						cursor: pointer;
						font-size: 16px;
					}

					.back-home-button:hover {
						background-color: #e6001e;
					}

					.button-submit {
						width: 100%;
						padding: 12px;
						background-color: #ff002c;
						color: white;
						border: none;
						border-radius: 6px;
						cursor: pointer;
						font-size: 16px;
					}

					.button-submit:disabled {
						background-color: #eaeaea;
						cursor: not-allowed;
					}

					.button-submit:hover:not(:disabled) {
						background-color: #e6001e;
					}
				`}
			</style>
		</div>
	);
};

export default Token;
