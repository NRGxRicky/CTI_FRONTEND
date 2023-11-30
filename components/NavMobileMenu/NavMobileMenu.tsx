import React, { useState } from 'react';
import Link from 'next/link';

const NavMobileMenu = () => {
	const [menuMobileOpen, setMenuMobileOpen] = useState(false);

	const toggleMenu = () => {
		setMenuMobileOpen(!menuMobileOpen);
		menuMobileOpen
			? document.body.classList.remove('open-modal')
			: document.body.classList.add('open-modal');
	};

	return (
		<nav className='header__mobile-nav-toggle col-xs-1 col-sm-1 col-md-1 col-lg-1'>
			<button className='burger-button' onClick={toggleMenu}>
				<div className='burger-line' onClick={toggleMenu}></div>
				<div className='burger-line' onClick={toggleMenu}></div>
				<div className='burger-line' onClick={toggleMenu}></div>
			</button>
			{menuMobileOpen && (
				<div className='mobile-menu__inner'>
					<div className='mobile-menu__panel'>
						<ul className='mobile-menu__list'>
							<li onClick={toggleMenu} className='mobile-menu__nav-item'>
								<Link href={`/listado/all/index-computadoras`} legacyBehavior>
									<a className='mobile-menu__nav-link'>Computadoras</a>
								</Link>
							</li>
							<li onClick={toggleMenu} className='mobile-menu__nav-item'>
								<Link href={`/listado/all/index-impresion`} legacyBehavior>
									<a className='mobile-menu__nav-link'>Impresoras</a>
								</Link>
							</li>
							<li onClick={toggleMenu} className='mobile-menu__nav-item'>
								<Link
									href={`/listado/all/index-computo-monitores`}
									legacyBehavior
								>
									<a className='mobile-menu__nav-link'>Monitores</a>
								</Link>
							</li>
							<li onClick={toggleMenu} className='mobile-menu__nav-item'>
								<Link href={`/listado/all/index-memorias`} legacyBehavior>
									<a className='mobile-menu__nav-link'>Memorias</a>
								</Link>
							</li>
							<li onClick={toggleMenu} className='mobile-menu__nav-item'>
								<Link href={`/listado/all/index-almacenamiento`} legacyBehavior>
									<a className='mobile-menu__nav-link'>Almacenamiento</a>
								</Link>
							</li>
							<li onClick={toggleMenu} className='mobile-menu__nav-item'>
								<Link
									href={`/listado/all/index?q=&page_size=40&filter_available=true&filter_available_store=false&filter_free_shipping=false&page=1&order=-ventas`}
									legacyBehavior
								>
									<a className='mobile-menu__nav-link'>Lo más vendido</a>
								</Link>
							</li>
							<li onClick={toggleMenu} className='mobile-menu__nav-item'>
								<Link
									href={`/listado/all/index?q=&page_size=40&filter_available=true&filter_available_store=false&filter_free_shipping=false&page=1&order=-created`}
									legacyBehavior
								>
									<a className='mobile-menu__nav-link'>Novedades</a>
								</Link>
							</li>
							<li onClick={toggleMenu} className='mobile-menu__nav-item'>
								<a className='mobile-menu__nav-link'>OFERTAS</a>
							</li>
						</ul>
						<ul className='mobile-menu__list text--off'>
							<li className='mobile-menu__nav-item'>
								<h5 className='mobile-menu__section-title'>Necesitas ayuda?</h5>
							</li>
							<li className='mobile-menu__nav-item'>
								<div className='mobile-menu__nav-link'>
									<svg
										focusable='false'
										className='icon icon--bi-phone '
										viewBox='0 0 24 24'
										role='presentation'
									>
										<g
											stroke-width='2'
											fill='none'
											fill-rule='evenodd'
											stroke-linecap='square'
										>
											<path
												d='M17 15l-3 3-8-8 3-3-5-5-3 3c0 9.941 8.059 18 18 18l3-3-5-5z'
												stroke='#474747'
											></path>
											<path
												d='M14 1c4.971 0 9 4.029 9 9m-9-5c2.761 0 5 2.239 5 5'
												stroke='#ff002c'
											></path>
										</g>
									</svg>
									<span>Llámanos 2229616956</span>
								</div>
							</li>
							<li className='mobile-menu__nav-item'>
								<div className='mobile-menu__nav-link'>
									<svg
										focusable='false'
										className='icon icon--bi-email'
										viewBox='0 0 22 22'
										role='presentation'
									>
										<g fill='none' fill-rule='evenodd'>
											<path
												stroke='#ff002c'
												d='M.916667 10.08333367l3.66666667-2.65833334v4.65849997zm20.1666667 0L17.416667 7.42500033v4.65849997z'
											></path>
											<path
												stroke='#474747'
												stroke-width='2'
												d='M4.58333367 7.42500033L.916667 10.08333367V21.0833337h20.1666667V10.08333367L17.416667 7.42500033'
											></path>
											<path
												stroke='#474747'
												stroke-width='2'
												d='M4.58333367 12.1000003V.916667H17.416667v11.1833333m-16.5-2.01666663L21.0833337 21.0833337m0-11.00000003L11.0000003 15.5833337'
											></path>
											<path
												d='M8.25000033 5.50000033h5.49999997M8.25000033 9.166667h5.49999997'
												stroke='#ff002c'
												stroke-width='2'
												stroke-linecap='square'
											></path>
										</g>
									</svg>
									<a
										href='mailto:contacto@pcstore.mx'
										target='_blank'
										rel='noopener'
										aria-describedby='a11y-new-window-message'
									>
										contacto@pcstore.mx
									</a>
								</div>
							</li>
						</ul>
					</div>
				</div>
			)}
			<style jsx>{`
				.icon--bi-phone,
				.icon--bi-email {
					margin-right: 16px;
					width: 24px;
					height: 24px;
				}
				.mobile-menu__inner .icon {
					display: inline-block;
					height: 1em;
					width: 1em;
					fill: currentColor;
					vertical-align: middle;
					background: none;
					pointer-events: none;
					overflow: visible;
				}

				.mobile-menu__section-title {
					text-transform: uppercase;
					color: #474747;
					padding: 15px 0;
				}

				.mobile-menu__nav-link {
					padding: 15px 0;
				}

				.mobile-menu__nav-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					width: 100%;
				}

				.mobile-menu__list {
					padding: 25px 20px;
					list-style: none;
					display: flex;
					flex-direction: column;
					width: 100%;
					font-size: 18px;
					border-bottom: 1px solid #d8d8d8;
				}

				.mobile-menu__panel {
					padding: 30px 20px;
				}
				.mobile-menu__inner {
					right: 0;
					top: 0;
					margin-top: 58px;
					width: 100%;
					height: 100vh;
					z-index: 0;
					background-color: #fff;
					position: absolute;
				}

				.burger-button {
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					width: 30px;
					height: 16px;
					background: none;
					border: none;
					cursor: pointer;
					align-items: center;
				}

				.burger-line {
					width: 20px;
					height: 2px;
					background-color: #474747;
				}

				@media only screen and (min-width: 62em) {
					.header__mobile-nav-toggle {
						display: none;
					}
				}
			`}</style>
		</nav>
	);
};

export default NavMobileMenu;
