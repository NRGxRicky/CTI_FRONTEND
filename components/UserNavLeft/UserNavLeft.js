import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppSelector } from '../../lib/hooks';

const UserNavLeft = () => {
	const router = useRouter();
	const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

	return (
		<div className='nav-left' style={!mobileView ? { marginTop: ' 58px' } : {}}>
			<div className='nav-left-container'>
				<a
					className={
						router.pathname === '/profile/orders'
							? 'text--off active'
							: 'text--off'
					}
				>
					<span>Mis compras</span>
				</a>
				<Link href={`/profile/`} legacyBehavior>
					<a
						className={
							router.pathname === '/profile' ? 'text--off active' : 'text--off'
						}
					>
						<span>Mis datos</span>
					</a>
				</Link>
				<Link href={`/profile/security/`} legacyBehavior>
					<a
						className={
							router.pathname === '/profile/security'
								? 'text--off active'
								: 'text--off'
						}
					>
						<span>Seguridad</span>
					</a>
				</Link>
			</div>
			<style jsx>
				{`
					.nav-left {
						margin-top: 50px;
						width: 180px;
					}
					.nav-left-container {
						display: flex;
						flex-direction: column;
						margin-left: 20px;
					}

					.nav-left a {
						margin-top: 20px;
					}

					.active {
						font-weight: 600;
					}

					@media only screen and (max-width: 60em) {
						.nav-left {
							margin-top: 0;
							border: 1px solid #eaeaea;
							background-color: #ffffff;
						}

						.nav-left-container {
							flex-direction: row;
							line-height: 3;
							text-align: center;
						}

						.nav-left a {
							margin-top: 0;
						}
						.nav-left {
							width: 100%;
						}

						.nav-left a + a {
							margin-left: 20px;
						}
						.active {
							border-bottom: 2px solid #ff002c;
							color: #ff002c;
							cursor: default;
						}
					}
				`}
			</style>
		</div>
	);
};

export default UserNavLeft;
