import React, { useState } from 'react';
import { useAuth } from '../../hooks/auth';
import EyeClose from '../../components/Icons/EyeClose';
import EyeOpen from '../../components/Icons/EyeOpen';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Login = () => {
	const { login, isAuthenticated } = useAuth();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { redirect } = router.query;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(false);
		setLoading(true);

		try {
			const resp = await login(username, password);
			if (resp.status === 200) {
				if (redirect) {
					router.push(redirect); // Redirige a la ruta original
				} else {
					router.push('/'); // Ruta predeterminada si no hay "redirect"
				}
			} else {
				setError(true);
			}
		} catch (err) {
			setError(true);
		} finally {
			setLoading(false);
		}
	};

	if (isAuthenticated) {
		if (redirect) {
			router.push(redirect); // Redirige a la ruta original
		} else {
			router.push('/'); // Ruta predeterminada si no hay "redirect"
		}
	}

	return (
		<div className='container'>
			<Head>
				<title>
					Iniciar Sesión | PCStore.mx: Tu tienda en Tecnología, Cómputo,
					Accesorios
				</title>
				<meta
					name='description'
					content={`PCStore.mx Tienda líder en cómputo, accesorios, hardware, tecnología y más. Compra protegida, envíos asegurados y pagos seguros con los mejores precios, productos y marcas.`}
				/>
			</Head>
			<div className='login-card'>
				<h2>Iniciar Sesión</h2>
				<form onSubmit={handleSubmit} className='login-form'>
					<div className='form-group'>
						<label htmlFor='username'>Email</label>
						<input
							type='email'
							id='username'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							autoComplete='username'
						/>
					</div>
					<div className='form-group'>
						<label htmlFor='password'>Contraseña</label>
						<div className='password-input-container'>
							<input
								type={showPassword ? 'text' : 'password'}
								id='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								autoComplete='current-password'
							/>
							<button
								type='button'
								className='eye-icon'
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? <EyeClose /> : <EyeOpen />}
							</button>
						</div>
					</div>
					{error && (
						<p className='error-message'>Correo y/o Contraseña incorrecta.</p>
					)}
					<button type='submit' disabled={loading} className='login-button'>
						{loading ? 'Cargando...' : 'Iniciar Sesión'}
					</button>
				</form>
				<Link href={`/login/forgot-password/`} legacyBehavior>
					<a>
						<div className='login-menu__forgot-password'>
							¿Has olvidado tu contraseña?
						</div>
					</a>
				</Link>
				<div className='login-menu__footer'>
					<div className='login-menu__register'>
						<div className='login-menu__register__title'>
							¿No tienes una cuenta?
						</div>
						<div className='login-menu__register__action-register'>
							<Link
								href={
									redirect
										? `/registration?redirect=${encodeURIComponent(redirect)}`
										: `/registration`
								}
								legacyBehavior
							>
								<a>Registrate</a>
							</Link>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				.login-menu__register__action-register {
					text-align: center;
					font-weight: 600;
					color: #ff002c;
				}

				.login-menu__title,
				.login-menu__register__title {
					font-weight: 600;
				}

				.login-menu__footer {
					border-top: 1px solid #eaeaea;
					padding: 10px;
					line-height: 2;
				}

				.login-menu__forgot-password {
					color: #ff002c;
					text-align: center;
					line-height: 4;
				}

				.container {
					display: flex;
					justify-content: center;
					align-items: center;
					min-height: calc(100dvh - 61px);
					background-color: #f7f7f7;
				}

				.login-card {
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

				.form-group input {
					width: 100%;
					padding: 12px;
					border: 1px solid #ccc;
					border-radius: 6px;
					font-size: 14px;
				}

				.form-group input:focus {
					outline: none;
					border-color: #ff002c;
				}

				.password-input-container {
					position: relative;
				}

				.eye-icon {
					position: absolute;
					right: 10px;
					top: 50%;
					transform: translateY(-50%);
					background: none;
					border: none;
					cursor: pointer;
					color: #ff002c;
				}

				.error-message {
					color: #ff002c;
					margin: 10px 0;
				}

				.login-button {
					width: 100%;
					padding: 12px;
					background: #ff002c;
					color: white;
					border: none;
					border-radius: 6px;
					font-size: 16px;
					cursor: pointer;
				}

				.login-button:disabled {
					background: #eaeaea;
					cursor: not-allowed;
				}

				.login-button:hover:not(:disabled) {
					background: #e6001e;
				}
			`}</style>
		</div>
	);
};

export default Login;
