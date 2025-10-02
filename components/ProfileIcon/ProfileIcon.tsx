import React, { useRef, useEffect, useState } from 'react';
import TruncateManual from '../../hooks/TruncateManual';
import LoginMenu from '../LoginMenu/LoginMenu';
import CaretDown from '../Icons/CaretDown';
import { useAuth } from '../../hooks/auth';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
	hideAll,
	showLoginMenuState,
} from '../../lib/features/showOpacityContainerSlide';

const ProfileIcon: React.FC = () => {
	const { nombres, loading } = useAuth();
	const dispatch = useAppDispatch();

	const suppressHoverUntil = useRef<number>(0);
	const hoverLock = useRef<boolean>(false);
	const closeHoverTimer = useRef<number | null>(null);
	const [isMobile, setIsMobile] = useState(false);

	const showLoginMenu = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.loginMenu
	);

	// Detectar si es móvil
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 1024);
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Limpiar el temporizador cuando se cierre el login menu desde cualquier lugar
	useEffect(() => {
		if (!showLoginMenu && closeHoverTimer.current) {
			clearTimeout(closeHoverTimer.current);
			closeHoverTimer.current = null;
		}
	}, [showLoginMenu]);

	return (
		<div
			className='header-bar__section-icon'
			{...(!isMobile && {
				onMouseEnter: () => {
					if (closeHoverTimer.current) {
						clearTimeout(closeHoverTimer.current);
						closeHoverTimer.current = null;
					}
				},
				onMouseLeave: () => {
					if (closeHoverTimer.current) {
						clearTimeout(closeHoverTimer.current);
					}
					closeHoverTimer.current = window.setTimeout(() => {
						hoverLock.current = false;
						dispatch(hideAll());
						closeHoverTimer.current = null;
					}, 120);
				},
			})}
		>
			<div
				className='header-bar__profile-icon'
				{...(!isMobile && {
					onMouseEnter: () => {
						if (Date.now() < suppressHoverUntil.current) return;
						if (hoverLock.current) return;
						if (closeHoverTimer.current) {
							clearTimeout(closeHoverTimer.current);
							closeHoverTimer.current = null;
						}
						dispatch(showLoginMenuState());
					},
				})}
				onClick={() => {
					if (closeHoverTimer.current) {
						clearTimeout(closeHoverTimer.current);
						closeHoverTimer.current = null;
					}
					if (!isMobile) {
						suppressHoverUntil.current = Date.now() + 400;
					}
					if (showLoginMenu) {
						if (!isMobile) {
							hoverLock.current = true;
						}
						dispatch(hideAll());
					} else {
						dispatch(showLoginMenuState());
					}
				}}
			>
				<svg
					className='header-bar__icon icon__ligth'
					fill='none'
					width='25'
					height='25'
					stroke='#ffffff'
					viewBox='0 0 25 25'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
					/>
				</svg>
				{!loading && nombres !== 'Iniciar sesión / Registrarse' ? (
					<span className='--capitalize'>{TruncateManual(nombres, 10)}</span>
				) : (
					<span>{nombres}</span>
				)}
				<CaretDown isOpen={showLoginMenu} hideOnMobile />
			</div>
			{showLoginMenu && <LoginMenu />}

			<style jsx>{`
				.header-bar__section-icon {
					position: relative;
					align-items: center;
					color: #474747;
					display: flex;
					align-items: center;
					min-height: 42px;
				}

				.header-bar__profile-icon {
					display: flex;
					align-items: center;
					max-height: 25px;
				}

				.header-bar__icon {
					cursor: pointer;
				}

				.icon__ligth {
					fill: #474747;
					stroke: #474747;
				}

				.header-bar__section-icon span {
					margin-left: 5px;
				}

				.header-bar__section-icon:hover .header-bar__icon,
				.header-bar__section-icon:hover span {
					fill: var(--primary-color);
					stroke: var(--primary-color);
					color: var(--primary-color);
					cursor: pointer;
				}

				.--capitalize {
					text-transform: capitalize;
				}

				@media only screen and (max-width: 62em) {
					.header-bar__section-icon span {
						display: none;
					}
				}
			`}</style>
		</div>
	);
};

export default ProfileIcon;
