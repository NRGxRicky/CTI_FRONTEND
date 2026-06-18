import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/auth';
import Link from 'next/link';
import EyeClose from '../../components/Icons/EyeClose';
import EyeOpen from '../../components/Icons/EyeOpen';
import CheckCircleGreen from '../../components/Icons/CheckCircleGreen';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEnv } from '../../context/EnvContext';
import { trackSignUp } from '../../utils/analytics';
import { trackMetaCompleteRegistration } from '../../utils/metaAnalytics';
import { useApi } from '../../hooks/useApi';

const Register = () => {
	const { buildUrl } = useApi();
	const [formData, setFormData] = useState({
		name: '', // Campo para el nombre
		email: '',
		password: '',
		confirmPassword: '',
		offers: true,
	});

	const { loading: authLoading, isAuthenticated, login } = useAuth();
	const [passwordStrength, setPasswordStrength] = useState('');
	const [strengthLevel, setStrengthLevel] = useState(0);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [success, setSuccess] = useState(false);
	const router = useRouter();
	const { redirect } = router.query;
	const { storeName, metaDescription, titlePostDescription, storeId } =
		useEnv();

	// Validar que el redirect sea una URL interna
	const isValidRedirect = (url) => {
		if (!url) return false;
		try {
			return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');
		} catch {
			return false;
		}
	};

	useEffect(() => {
		const evaluatePasswordStrength = (password) => {
			let strength = '';
			let level = 0;

			if (password.length < 1) {
				return;
			}

			const lengthCheck = password.length >= 8;
			const hasNumbers = /[0-9]/.test(password);
			const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

			if (lengthCheck && hasNumbers && hasSpecialChars) {
				strength = 'Fuerte';
				level = 100;
			} else if (lengthCheck && (hasNumbers || hasSpecialChars)) {
				strength = 'Moderada';
				level = 60;
			} else if (lengthCheck) {
				strength = 'Débil';
				level = 30;
			} else {
				strength = 'Muy débil';
				level = 10;
			}

			setPasswordStrength(strength);
			setStrengthLevel(level);
		};

		evaluatePasswordStrength(formData.password);
	}, [formData.password]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		if (formData.password !== formData.confirmPassword) {
			setError('Las contraseñas no coinciden.');
			setLoading(false);
			return;
		}

		let registerSuccess = false;

		try {
			const response = await fetch(
				buildUrl('/profile/register/'),
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						nombres: formData.name, // Enviar el nombre
						email: formData.email,
						password: formData.password,
						confirm_password: formData.confirmPassword,
						offers: formData.offers,
						store: storeId,
					}),
				}
			);

			if (response.ok) {
				// Trackear eventos de registro exitoso
				// Google Analytics
				trackSignUp('email');

				// Meta Pixel
				trackMetaCompleteRegistration('email');

				registerSuccess = true;
				setSuccess(true);

				// Iniciar sesión de forma automática
				await beforeLogin();
			} else {
				const data = await response.json();
				setError(data.detail || 'Ocurrió un error durante el registro.');
			}
		} catch (err) {
			setError('Error de conexión, intenta más tarde.');
		} finally {
			if (!registerSuccess) {
				setLoading(false);
			}
		}
	};

	const beforeLogin = async () => {
		setError(null);
		setLoading(true);
		try {
			const resp = await login(formData.email, formData.password);
			if (resp.status === 200) {
				if (redirect && isValidRedirect(redirect)) {
					router.push(redirect); // Redirige a la ruta original
				} else {
					router.push('/'); // Ruta predeterminada si no hay "redirect"
				}
			} else {
				setError('No se pudo iniciar sesión de forma automática. Por favor intenta iniciar sesión manualmente.');
			}
		} catch (err) {
			setError('Ocurrió un error al intentar iniciar sesión. Por favor intenta de nuevo.');
		} finally {
			setLoading(false);
		}
	};

	if (authLoading) {
		return <div></div>;
	}

	if (isAuthenticated) {
		if (redirect && isValidRedirect(redirect)) {
			router.push(redirect); // Redirige a la ruta original
		} else {
			router.push('/'); // Ruta predeterminada si no hay "redirect"
		}
	}

	return (
		<div className='container'>
			<Head>
				<title>{`Crear Cuenta | ${storeName}: ${titlePostDescription}`}</title>
				<meta name='description' content={`${metaDescription}`} />

				{/* URL canónica */}
				<link rel='canonical' href={`${process.env.NEXT_PUBLIC_PAGE_URL}/registration`} />
			</Head>
			{success ? (
				<div className='register-card'>
					<h2>¡Cuenta creada con éxito!</h2>
					<div className='icon-circle'>
						<CheckCircleGreen />
					</div>
					{loading ? (
						<p className='success-label'>
							Iniciando sesión de forma automática, por favor espera...
						</p>
					) : error ? (
						<>
							<p className='error-message'>{error}</p>
							<button onClick={() => beforeLogin()} className='register-button' style={{ marginTop: '20px' }}>
								Reintentar Inicio de Sesión
							</button>
							<div className='register-menu__footer'>
								<Link
									href={
										redirect
											? `/login?redirect=${encodeURIComponent(redirect)}`
											: `/login`
									}
									legacyBehavior
								>
									<a className='login-link'>Ir al Inicio de Sesión manual</a>
								</Link>
							</div>
						</>
					) : (
						<p className='success-label'>
							Iniciando sesión, serás redirigido en un momento...
						</p>
					)}
				</div>
			) : (
				<div className='register-card'>
					<h2>Crear Cuenta</h2>
					<form onSubmit={handleSubmit} className='register-form'>
						<div className='form-group'>
							<label htmlFor='name'>Nombre</label>
							<input
								type='text'
								id='name'
								name='name'
								value={formData.name}
								onChange={handleChange}
								required
								autoComplete='name'
								className='--capitalize'
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='email'>Correo Electrónico</label>
							<input
								type='email'
								id='email'
								name='email'
								value={formData.email}
								onChange={handleChange}
								required
								autoComplete='email'
							/>
						</div>
						<div className='form-group'>
							<label htmlFor='password'>Contraseña</label>
							<div className='password-input-container'>
								<input
									type={showPassword ? 'text' : 'password'}
									id='password'
									name='password'
									value={formData.password}
									onChange={handleChange}
									required
									autoComplete='new-password'
								/>
								<button
									type='button'
									className='eye-icon'
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <EyeClose /> : <EyeOpen />}
								</button>
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
														: 'var(--primary-color)',
										}}
									></div>
								</div>
							</div>
						</div>
						<div className='form-group'>
							<label htmlFor='confirmPassword'>Confirmar Contraseña</label>
							<div className='password-input-container'>
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									id='confirmPassword'
									name='confirmPassword'
									value={formData.confirmPassword}
									onChange={handleChange}
									required
									autoComplete='new-password'
								/>
								<button
									type='button'
									className='eye-icon'
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? <EyeClose /> : <EyeOpen />}
								</button>
							</div>
						</div>
						<div className='form-group checkbox-group'>
							<label>
								<input
									type='checkbox'
									name='offers'
									checked={formData.offers}
									onChange={handleChange}
								/>
								Deseo recibir ofertas y descuentos.
							</label>
						</div>
						<div className='form-group'>
							<p className='terms'>
								Al crear una cuenta, aceptas el{' '}
								<Link href='/aviso-de-privacidad' legacyBehavior>
									<a target='_blank'>Aviso de Privacidad</a>
								</Link>{' '}
								y los{' '}
								<Link href='/terminos-de-servicio' legacyBehavior>
									<a target='_blank'>Términos de Uso</a>
								</Link>
								.
							</p>
						</div>
						{error && <p className='error-message'>{error}</p>}
						<button
							type='submit'
							disabled={loading || strengthLevel < 30}
							className='register-button'
						>
							{loading ? 'Registrando...' : 'Crear Cuenta'}
						</button>
					</form>
					<div className='register-menu__footer'>
						<span>¿Ya tienes una cuenta? </span>
						<Link
							href={
								redirect
									? `/login?redirect=${encodeURIComponent(redirect)}`
									: `/login`
							}
							legacyBehavior
						>
							<a className='login-link'>Inicia Sesión</a>
						</Link>
					</div>
				</div>
			)}

			<style jsx>{`
				.container {
					display: flex;
					justify-content: center;
					align-items: center;
					min-height: calc(100dvh - 59px);
					background-color: #f7f7f7;
				}

				.error-message {
					color: var(--primary-color);
					margin: 10px 0;
					line-height: 2;
				}

				.register-card {
					width: 100%;
					max-width: 400px;
					background: #fff;
					padding: 20px;
					border-radius: 8px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					text-align: center;
				}

				h2 {
					margin-bottom: 20px;
					color: #333;
					line-height: 3;
					border-bottom: 1px solid #eaeaea;
				}

				.form-group {
					margin-bottom: 15px;
					text-align: left;
				}

				.form-group label {
					display: block;
					margin-bottom: 5px;
					font-weight: bold;
					color: #333;
				}

				.password-input-container {
					position: relative;
					display: flex;
					align-items: center;
				}

				.form-group input[type='text'],
				.form-group input[type='email'],
				.form-group input[type='password'] {
					display: block;
					width: 100%;
					padding: 12px;
					border: 1px solid #eaeaea;
					border-radius: 6px;
					font-size: 14px;
					color: #333;
					background-color: #fff;
					box-sizing: border-box;
					outline: none;
					transition: border-color 0.3s ease;
				}

				.form-group input[type='text']:focus,
				.form-group input[type='email']:focus,
				.form-group input[type='password']:focus {
					border-color: var(--primary-color);
				}

				.password-input-container input {
					display: block;
					width: 100%;
					padding: 12px;
					border: 1px solid #eaeaea;
					border-radius: 6px;
					font-size: 14px;
					color: #333;
					background-color: #fff;
					box-sizing: border-box;
					outline: none;
					transition: border-color 0.3s ease;
				}

				.password-input-container input:focus {
					border-color: var(--primary-color);
				}

				.eye-icon {
					position: absolute;
					right: 10px;
					margin-top: 3px;
					background: none;
					border: none;
					cursor: pointer;
					color: var(--primary-color);
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

				.checkbox-group label {
					cursor: pointer;
					user-select: none;
				}

				.checkbox-group input[type='checkbox'] {
					display: inline-block;
					width: 20px;
					height: 20px;
					margin-right: 10px;
					border: 2px solid #eaeaea;
					border-radius: 4px;
					background-color: #fff;
					position: relative;
					cursor: pointer;
				}

				.checkbox-group input[type='checkbox']:checked {
					background-color: var(--primary-color);
					border-color: var(--primary-color);
				}

				.checkbox-group input[type='checkbox']:checked::after {
					content: '✓';
					color: #fff;
					font-size: 16px;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}

				.terms {
					font-size: 12px;
					color: #666;
					margin-top: 10px;
				}

				.terms a {
					color: var(--primary-color);
					text-decoration: none;
					font-weight: bold;
				}

				.terms a:hover {
					text-decoration: underline;
				}

				.register-button {
					width: 100%;
					padding: 12px;
					background: var(--primary-color);
					color: white;
					border: none;
					border-radius: 6px;
					font-size: 16px;
					cursor: pointer;
				}

				.register-button:disabled {
					background: #eaeaea;
					cursor: not-allowed;
				}

				.register-button:hover:not(:disabled) {
					background: #e6001e;
				}

				.register-menu__footer {
					margin-top: 20px;
				}

				.login-link {
					color: var(--primary-color);
					font-weight: 600;
					text-decoration: none;
				}

				.icon-circle {
					width: 50px;
					height: 50px;
					display: flex;
					justify-content: center;
					align-items: center;
					margin: 0 auto;
				}

				.success-label {
					text-align: center;
					line-height: 4;
				}

				.card__form__label {
					margin-bottom: 20px;
				}
			`}</style>
		</div>
	);
};

export default Register;
