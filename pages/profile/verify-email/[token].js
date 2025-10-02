import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CheckCircleGreen from '../../../components/Icons/CheckCircleGreen';
import Head from 'next/head';
import { useEnv } from '../../../context/EnvContext';
import { useApi } from '../../../hooks/useApi';

const VerifyEmail = () => {
	const { buildUrl } = useApi();
	const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
	const router = useRouter();
	const { token } = router.query;
	const { storeName, metaDescription, titlePostDescription } = useEnv();

	useEffect(() => {
		if (token) {
			verifyToken();
		}
	}, [token]);

	const verifyToken = async () => {
		try {
			const response = await fetch(
				buildUrl(`/profile/verify-email/${token}/`),
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				}
			);

			if (response.ok) {
				setStatus('success');
			} else {
				setStatus('error');
			}
		} catch (err) {
			setStatus('error');
		}
	};

	if (status === 'loading') {
		return (
			<div className='container'>
				<div className='verify-card'></div>
			</div>
		);
	}

	return (
		<div className='container'>
			<Head>
				<title>
					{`¡Cuenta Verificada! | ${storeName}: ${titlePostDescription}`}
				</title>
				<meta name='description' content={`${metaDescription}`} />
			</Head>
			{status === 'success' ? (
				<div className='verify-card'>
					<h2>¡Cuenta Verificada!</h2>
					<div className='icon-circle'>
						<CheckCircleGreen />
					</div>
					<p className='success-label'>
						Tu cuenta ha sido verificada correctamente. Ahora puedes usar tu
						cuenta.
					</p>
					<Link href='/' legacyBehavior>
						<a className='verify-button'>Ir al inicio</a>
					</Link>
				</div>
			) : (
				<div className='verify-card'>
					<h2>Error al Verificar</h2>
					<p className='error-label'>
						El enlace de verificación no es válido o ya ha expirado.
					</p>
					<Link href='/register' legacyBehavior>
						<a className='verify-button'>Enviar nuevo enlace</a>
					</Link>
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

				.verify-card {
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

				.success-label {
					text-align: center;
					line-height: 2;
					color: #333;
				}

				.error-label {
					text-align: center;
					line-height: 4;
					color: var(--primary-color);
				}

				.verify-button {
					display: block;
					width: 100%;
					padding: 12px;
					margin-top: 20px;
					background: var(--primary-color);
					color: white;
					border: none;
					border-radius: 6px;
					font-size: 16px;
					text-align: center;
					text-decoration: none;
				}

				.verify-button:hover {
					background: #e6001e;
				}

				.icon-circle {
					width: 50px;
					height: 50px;
					display: flex;
					justify-content: center;
					align-items: center;
					margin: 0 auto 20px;
				}
			`}</style>
		</div>
	);
};

export default VerifyEmail;
