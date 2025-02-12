import React from 'react';
import Link from 'next/link';

const AccountSummary = () => {
	return (
    <div className='account-summary'>
			<h2 className='account-summary__title'>Resumen de tu cuenta</h2>

			{/* CONTENEDOR DE SECCIONES (cards) */}
			<div className='account-summary__grid'>
				{/* SECCIÓN: MIS COMPRAS */}
				<Link href='/mis-compras' legacyBehavior>
					<a className='account-summary__card'>
						<div className='account-summary__card-header'>
							<h3>Mis compras</h3>
						</div>
						<ul>
							<li>Revisa tus compras</li>
							<li>Rastrear Compras</li>
							<li>Descarga tus facturas fiscales</li>
							<li>Ver el detalle de tus compras</li>
						</ul>
					</a>
				</Link>

				{/* SECCIÓN: DIRECCIONES DE ENVÍO Y FACTURACIÓN */}
				<Link href='/profile/direcciones-y-facturacion' legacyBehavior>
					<a className='account-summary__card'>
						<div className='account-summary__card-header'>
							<h3>Direcciones y facturación</h3>
						</div>
						<ul>
							<li>Agrega o modifica tus direcciones</li>
							<li>Configura tus datos de facturación</li>
							<li>Selecciona tu dirección principal</li>
						</ul>
					</a>
				</Link>

				{/* SECCIÓN: MIS DATOS */}
				<Link href='/profile/mis-datos' legacyBehavior>
					<a className='account-summary__card'>
						<div className='account-summary__card-header'>
							<h3>Mis datos</h3>
						</div>
						<ul>
							<li>Edita tu información personal</li>
							<li>Consulta o cambia tus preferencias</li>
							<li>Gestiona los datos de tu perfil</li>
						</ul>
					</a>
				</Link>

				{/* SECCIÓN: SEGURIDAD */}
				<Link href='/profile/security' legacyBehavior>
					<a className='account-summary__card'>
						<div className='account-summary__card-header'>
							<h3>Seguridad</h3>
						</div>
						<ul>
							<li>Establece una nueva contraseña</li>
							<li>Administra accesos recientes</li>
							<li>Protege tu cuenta</li>
						</ul>
					</a>
				</Link>
			</div>

			{/* ESTILOS */}
			<style jsx>{`
				.account-summary {
					margin-left: 40px;
					padding: 20px;
					line-height: 1.5;
				}
				.account-summary__title {
					margin-top: 5px;
					height: 50px;
				}
				.account-summary__grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
					gap: 20px;
				}
				.account-summary__card {
					display: block; /* para que el <a> envuelva toda la card */
					background-color: #ffffff;
					border: 1px solid #e2e2e2;
					border-radius: 6px;
					padding: 16px;
					text-decoration: none;
					color: inherit; /* mantén el color del texto */
					transition: box-shadow 0.2s ease;
				}
				.account-summary__card:hover {
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
					background-color: var(--background-price-color);
					border-color: var(--primary-color);
				}
				.account-summary__card-header {
					display: flex;
					align-items: center;
					margin-bottom: 10px;
				}
				.account-summary__icon {
					margin-right: 8px;
					color: var(--primary-color, #007acc);
				}
				.account-summary__card h3 {
					font-size: 1.1rem;
					margin: 0;
					color: var(--primary-color, #007acc);
				}
				ul {
					list-style: disc inside;
					margin: 0;
					padding: 0;
				}
				ul li {
					margin-bottom: 6px;
					color: #555;
					font-size: 0.95rem;
				}

				@media (max-width: 992px) {
					.account-summary {
						margin: 0;
					}
				}
			`}</style>
		</div>
	);
};

export default AccountSummary;
