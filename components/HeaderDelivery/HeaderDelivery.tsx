'use client';

import React, { useEffect } from 'react';
import useCart from '../../hooks/useCart';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/auth';
import fetchData from '../../hooks/GetDataAuth';
import TruncateMarkup from 'react-truncate-markup';
import Capitalize from '../../hooks/CapitalizeTitle';

type HeaderDeliveryProps = {
	className?: string;
};

const HeaderDelivery: React.FC<HeaderDeliveryProps> = ({ className = '' }) => {
	const { address, setAddress } = useCart();
	const router = useRouter();
	const { accessToken, isAuthenticated } = useAuth();

	// Hydratar address si el usuario está autenticado y aún no está cargado
	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			try {
				const res = await fetchData('/profile/resume/', accessToken);
				if (res && res.ok) {
					const data = await res.json();
					const active = data?.domicilios?.find((d: any) => d.active);
					if (!cancelled) setAddress(active || null);
				}
			} catch (_) {
				// silencioso
			}
		};
		if (accessToken && !address) load();
		return () => {
			cancelled = true;
		};
	}, [accessToken, address, setAddress]);

	// Si no está autenticado, no mostrar el componente
	if (!isAuthenticated) return null;

	const shortName = address?.nombres
		? Capitalize(String(address.nombres).split(' ')[0])
		: null;

	const cityTitle = address?.ciudad ? Capitalize(address.ciudad) : '';

	return (
		<div className={`header-bar__delivery ${className}`}>
			<button
				type='button'
				className='header-bar__delivery-btn'
				aria-label='Cambiar ubicación de entrega'
				onClick={() => router.push('/profile/direcciones-y-facturacion')}
			>
				<svg
					className='header-bar__icon icon__ligth'
					width='20'
					height='20'
					viewBox='0 0 24 24'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M12 2C8.13401 2 5 5.13401 5 9C5 13.657 10.2 20.4 11.35 21.85C11.7236 22.317 12.2764 22.317 12.65 21.85C13.8 20.4 19 13.657 19 9C19 5.13401 15.866 2 12 2ZM12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9C14.5 10.3807 13.3807 11.5 12 11.5Z'
						fill='currentColor'
					/>
				</svg>
				<div className='header-bar__delivery-text'>
					<span className='header-bar__delivery-row'>
						<span className='header-bar__delivery-label'>Enviar a</span>
						{shortName && (
							<TruncateMarkup lines={1}>
								<span className='header-bar__delivery-name'>{shortName}</span>
							</TruncateMarkup>
						)}
					</span>
					<span className='header-bar__delivery-value'>
						{address
							? `${cityTitle ? cityTitle + ', ' : ''}${
									address.codigo_postal || ''
							  }`
							: 'Actualizar ubicación'}
					</span>
				</div>
			</button>
			<style jsx>{`
				.header-bar__delivery {
					display: none;
					align-items: center;
				}
				.header-bar__delivery-btn {
					display: flex;
					gap: 6px;
					align-items: center;
					background: transparent;
					color: #474747;
					border: 1px solid transparent;
					cursor: pointer;
					padding: 4px 6px;
					border-radius: 4px;
					transition: border-color 0.2s ease;
				}
				.header-bar__delivery-btn:hover,
				.header-bar__delivery-btn:focus-visible {
					border-color: rgba(0, 0, 0, 0.15);
				}
				.header-bar__delivery-text {
					display: flex;
					flex-direction: column;
					line-height: 1.1;
					text-align: left;
					max-width: 220px;
				}
				.header-bar__delivery-row {
					display: flex;
					gap: 4px;
					align-items: baseline;
					min-width: 0;
				}
				.header-bar__delivery-label {
					font-size: 11px;
					color: #777777;
				}
				.header-bar__delivery-value {
					font-size: 12px;
					font-weight: bold;
					color: #474747;
				}
				.header-bar__delivery-name {
					font-size: 11px;
					font-weight: bold;
					color: #474747;
					text-transform: uppercase;
				}
				.icon__ligth {
					fill: #474747;
					stroke: #474747;
					color: #474747;
				}
				.header-bar__delivery-btn:hover .header-bar__icon,
				.header-bar__delivery-btn:focus-visible .header-bar__icon,
				.header-bar__delivery-btn:hover .header-bar__delivery-label,
				.header-bar__delivery-btn:hover .header-bar__delivery-value,
				.header-bar__delivery-btn:hover .header-bar__delivery-name {
					color: var(--primary-color) !important;
					fill: var(--primary-color) !important;
					stroke: var(--primary-color) !important;
				}
				@media only screen and (min-width: 62em) {
					.header-bar__delivery {
						display: flex;
					}
				}
			`}</style>
		</div>
	);
};

export default HeaderDelivery;
