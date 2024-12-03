import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../hooks/auth';
import Router from 'next/router';

const ResendVerificationEmail = () => {
	const {
		loading: authLoading,
		isAuthenticated,
		isVerified,
		username,
	} = useAuth();
	const [status, setStatus] = useState(null); // 'success', 'error', or null
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setStatus(null);
		setLoading(true);

		try {
			const response = await fetch(
				'https://api.pccdnapi.com/profile/resend-verification/',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username }),
				}
			);

			if (response.ok) {
				setStatus('success');
			} else {
				setStatus('error');
			}
		} catch (err) {
			setStatus('error');
		} finally {
			setLoading(false);
		}
	};

	authLoading && <div></div>;

	if (!authLoading && !isAuthenticated) Router.push('/');

	if (!authLoading && isVerified) {
		Router.push('/');
	}
	
	return (
		<div className='container'>
			<div className='resend-card'>
				<h2>Reenviar correo de verificación</h2>
				{status === 'success' ? (
					<div className='success-message'>
						<p>
							Se ha enviado un nuevo correo de verificación a{' '}
							<strong>{username}</strong>.
						</p>
						<Link href='/login'>
							<a className='resend-button'>Iniciar Sesión</a>
						</Link>
					</div>
				) : (
					<form onSubmit={handleSubmit} className='resend-form'>
						<div className='form-group'>
							<p>
								Se enviará un nuevo correo de verificación a{' '}
								<strong>{username}</strong>. Por favor, revisa también tu
								carpeta de correo no deseado.
							</p>
							<p>
								Ten en cuenta que el correo puede tardar hasta 10 minutos en
								llegar.
							</p>
						</div>
						{status === 'error' && (
							<p className='error-message'>
								No se pudo reenviar el correo. Por favor, verifica el correo
								electrónico que tienes registrado.
							</p>
						)}
						<button type='submit' className='resend-button' disabled={loading}>
							{loading ? 'Enviando...' : 'Reenviar'}
						</button>
					</form>
				)}
			</div>

			<style jsx>{`
				.form-group p {
					margin-top: 15px;
					line-height: 1.5;
				}

				.container {
					display: flex;
					justify-content: center;
					align-items: center;
					min-height: calc(100vh - 61px);
					background-color: #f7f7f7;
				}

				.resend-card {
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
					color: #333;
				}

				.form-group input:focus {
					border-color: #ff002c;
				}

				.resend-button {
					width: 100%;
					padding: 12px;
					background: #ff002c;
					color: white;
					border: none;
					border-radius: 6px;
					font-size: 16px;
					cursor: pointer;
				}

				.resend-button:disabled {
					background: #eaeaea;
					cursor: not-allowed;
				}

				.resend-button:hover:not(:disabled) {
					background: #e6001e;
				}

				.success-message {
					color: #333;
				}

				.success-message p {
					margin-bottom: 20px;
				}

				.error-message {
					color: #ff002c;
					margin-bottom: 10px;
				}
			`}</style>
		</div>
	);
};

export default ResendVerificationEmail;
