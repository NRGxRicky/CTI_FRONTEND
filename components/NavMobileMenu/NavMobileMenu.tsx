import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import TruncateMarkup from 'react-truncate-markup';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
	showOpacity,
	hideOpacity,
	hideAll,
	showSearchBar,
	showLoginMenuState,
	showNavMobileMenu,
	blockBodyScroll,
	unlockBodyScroll,
} from '../../lib/features/showOpacityContainerSlide';
import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile,
} from 'react-device-detect';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useEnv } from '../../context/EnvContext';

const NavMobileMenu = () => {
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);
	const { contactEmail, instagramUrl, facebookUrl, tiktokUrl } = useEnv();

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				`https://api.pccdnapi.com/categories/bestcategories/?parentcategorie=index`
			);
			setData(await data.json());
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const dispacth = useAppDispatch();
	const menuMobileOpen = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.navMobileMenu
	);
	const router = useRouter();

	const toggleMenu = () => {
		if (!menuMobileOpen) {
			dispacth(showNavMobileMenu());
		} else {
			dispacth(hideAll());
		}
	};

	useEffect(() => {
		if (router.pathname.startsWith('/listado') && isMobile) {
			dispacth(blockBodyScroll());
		} else {
			dispacth(unlockBodyScroll());
		}
	}, [router.pathname, isMobile]);

	return (
		<nav className='header__mobile-nav-toggle col-xs-1 col-sm-1 col-md-1 col-lg-1'>
			<button
				className={`burger-button ${menuMobileOpen ? 'active' : ''}`}
				onClick={toggleMenu}
			>
				<div className='burger-line' onClick={toggleMenu}></div>
				<div className='burger-line' onClick={toggleMenu}></div>
				<div className='burger-line' onClick={toggleMenu}></div>
			</button>
			<div
				className='mobile-menu__inner'
				style={{
					left: menuMobileOpen ? 0 : '-100%',
					opacity: menuMobileOpen ? 1 : 0,
				}}
			>
				<div className='mobile-menu__panel'>
					<ul className='mobile-menu__list'>
						<li onClick={toggleMenu} className='mobile-menu__nav-item'>
							<Link
								href={`/listado/all/index?q=&filter_available=true&filter_available_store=false&filter_free_shipping=false&page=1&order=-ventas&filter_discount=true&page_size=${maxPageResults}`}
								legacyBehavior
							>
								<a
									className='mobile-menu__nav-link'
									style={{ color: '#ff002c', fontWeight: '600' }}
								>
									🔥 OFERTAS
								</a>
							</Link>
						</li>
						{data.results
							.filter((i) => i.slug !== 'index')
							.filter((i) => i.portada)
							.map((item, index) => (
								<li
									onClick={toggleMenu}
									className='mobile-menu__nav-item'
									key={index}
								>
									<Link
										href={`/listado/all/${item.slug}?page_size=${maxPageResults}`}
										legacyBehavior
									>
										<a className='mobile-menu__nav-link'>
											<TruncateMarkup lines={1}>
												<span>{Capitalize(item.name)}</span>
											</TruncateMarkup>
										</a>
									</Link>
								</li>
							))}
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
										strokeWidth='2'
										fill='none'
										fillRule='evenodd'
										strokeLinecap='square'
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
								<span>Llámanos 22 28 29 83 51</span>
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
									<g fill='none' fillRule='evenodd'>
										<path
											stroke='#ff002c'
											d='M.916667 10.08333367l3.66666667-2.65833334v4.65849997zm20.1666667 0L17.416667 7.42500033v4.65849997z'
										></path>
										<path
											stroke='#474747'
											strokeWidth='2'
											d='M4.58333367 7.42500033L.916667 10.08333367V21.0833337h20.1666667V10.08333367L17.416667 7.42500033'
										></path>
										<path
											stroke='#474747'
											strokeWidth='2'
											d='M4.58333367 12.1000003V.916667H17.416667v11.1833333m-16.5-2.01666663L21.0833337 21.0833337m0-11.00000003L11.0000003 15.5833337'
										></path>
										<path
											d='M8.25000033 5.50000033h5.49999997M8.25000033 9.166667h5.49999997'
											stroke='#ff002c'
											strokeWidth='2'
											strokeLinecap='square'
										></path>
									</g>
								</svg>
								<a
									href={contactEmail}
									target='_blank'
									rel='noopener'
									aria-describedby='a11y-new-window-message'
								>
									{contactEmail}
								</a>
							</div>
						</li>
					</ul>
					<ul className='mobile-menu__list text--off'>
						<li className='mobile-menu__nav-item'>
							<h5 className='mobile-menu__section-title'>Siguenos</h5>
						</li>
						<li className='mobile-menu__nav-item'>
							<div className='mobile-menu__nav-link'>
								<svg
									focusable='false'
									className='icon icon--facebook'
									viewBox='0 0 30 30'
								>
									<path
										d='M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm3.2142857-17.1429611h-2.1428678v-2.1425646c0-.5852979.8203285-1.07160109 1.0714928-1.07160109h1.071375v-2.1428925h-2.1428678c-2.3564786 0-3.2142536 1.98610393-3.2142536 3.21449359v2.1425646h-1.0714822l.0032143 2.1528011 1.0682679-.0099086v7.499969h3.2142536v-7.499969h2.1428678v-2.1428925z'
										fill='currentColor'
										fillRule='evenodd'
									></path>
								</svg>
								<a
									href={facebookUrl}
									target='_blank'
									rel='noopener'
								>
									Facebook
								</a>
							</div>
						</li>
						<li className='mobile-menu__nav-item'>
							<div className='mobile-menu__nav-link'>
								<svg
									focusable='false'
									className='icon icon--instagram'
									role='presentation'
									viewBox='0 0 30 30'
								>
									<path
										d='M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm.0000159-23.03571429c-2.1823849 0-2.4560363.00925037-3.3131306.0483571-.8553081.03901103-1.4394529.17486384-1.9505835.37352345-.52841925.20532625-.9765517.48009406-1.42331254.926823-.44672894.44676084-.72149675.89489329-.926823 1.42331254-.19865961.5111306-.33451242 1.0952754-.37352345 1.9505835-.03910673.8570943-.0483571 1.1307457-.0483571 3.3131306 0 2.1823531.00925037 2.4560045.0483571 3.3130988.03901103.8553081.17486384 1.4394529.37352345 1.9505835.20532625.5284193.48009406.9765517.926823 1.4233125.44676084.446729.89489329.7214968 1.42331254.9268549.5111306.1986278 1.0952754.3344806 1.9505835.3734916.8570943.0391067 1.1307457.0483571 3.3131306.0483571 2.1823531 0 2.4560045-.0092504 3.3130988-.0483571.8553081-.039011 1.4394529-.1748638 1.9505835-.3734916.5284193-.2053581.9765517-.4801259 1.4233125-.9268549.446729-.4467608.7214968-.8948932.9268549-1.4233125.1986278-.5111306.3344806-1.0952754.3734916-1.9505835.0391067-.8570943.0483571-1.1307457.0483571-3.3130988 0-2.1823849-.0092504-2.4560363-.0483571-3.3131306-.039011-.8553081-.1748638-1.4394529-.3734916-1.9505835-.2053581-.52841925-.4801259-.9765517-.9268549-1.42331254-.4467608-.44672894-.8948932-.72149675-1.4233125-.926823-.5111306-.19865961-1.0952754-.33451242-1.9505835-.37352345-.8570943-.03910673-1.1307457-.0483571-3.3130988-.0483571zm0 1.44787387c2.1456068 0 2.3997686.00819774 3.2471022.04685789.7834742.03572556 1.2089592.1666342 1.4921162.27668167.3750864.14577303.6427729.31990322.9239522.60111439.2812111.28117926.4553413.54886575.6011144.92395217.1100474.283157.2409561.708642.2766816 1.4921162.0386602.8473336.0468579 1.1014954.0468579 3.247134 0 2.1456068-.0081977 2.3997686-.0468579 3.2471022-.0357255.7834742-.1666342 1.2089592-.2766816 1.4921162-.1457731.3750864-.3199033.6427729-.6011144.9239522-.2811793.2812111-.5488658.4553413-.9239522.6011144-.283157.1100474-.708642.2409561-1.4921162.2766816-.847206.0386602-1.1013359.0468579-3.2471022.0468579-2.1457981 0-2.3998961-.0081977-3.247134-.0468579-.7834742-.0357255-1.2089592-.1666342-1.4921162-.2766816-.37508642-.1457731-.64277291-.3199033-.92395217-.6011144-.28117927-.2811793-.45534136-.5488658-.60111439-.9239522-.11004747-.283157-.24095611-.708642-.27668167-1.4921162-.03866015-.8473336-.04685789-1.1014954-.04685789-3.2471022 0-2.1456386.00819774-2.3998004.04685789-3.247134.03572556-.7834742.1666342-1.2089592.27668167-1.4921162.14577303-.37508642.31990322-.64277291.60111439-.92395217.28117926-.28121117.54886575-.45534136.92395217-.60111439.283157-.11004747.708642-.24095611 1.4921162-.27668167.8473336-.03866015 1.1014954-.04685789 3.247134-.04685789zm0 9.26641182c-1.479357 0-2.6785873-1.1992303-2.6785873-2.6785555 0-1.479357 1.1992303-2.6785873 2.6785873-2.6785873 1.4793252 0 2.6785555 1.1992303 2.6785555 2.6785873 0 1.4793252-1.1992303 2.6785555-2.6785555 2.6785555zm0-6.8050167c-2.2790034 0-4.1264612 1.8474578-4.1264612 4.1264612 0 2.2789716 1.8474578 4.1264294 4.1264612 4.1264294 2.2789716 0 4.1264294-1.8474578 4.1264294-4.1264294 0-2.2790034-1.8474578-4.1264612-4.1264294-4.1264612zm5.2537621-.1630297c0-.532566-.431737-.96430298-.964303-.96430298-.532534 0-.964271.43173698-.964271.96430298 0 .5325659.431737.964271.964271.964271.532566 0 .964303-.4317051.964303-.964271z'
										fill='currentColor'
										fillRule='evenodd'
									></path>
								</svg>
								<a
									href={instagramUrl}
									target='_blank'
									rel='noopener'
								>
									Instagram
								</a>
							</div>
						</li>
						<li className='mobile-menu__nav-item'>
							<div className='mobile-menu__nav-link'>
								<svg
									focusable='false'
									className='icon icon--tiktok'
									viewBox='0 0 30 30'
								>
									<path
										fillRule='evenodd'
										clipRule='evenodd'
										d='M30 15c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C0 6.716 6.716 0 15 0c8.284 0 15 6.716 15 15zm-7.902-1.966c.133 0 .267-.007.4-.02h.002v-2.708a4.343 4.343 0 01-4.002-3.877h-2.332l-.024 11.363c0 1.394-1.231 2.493-2.625 2.493a2.524 2.524 0 010-5.048c.077 0 .152.01.227.02l.078.01v-2.436a3.334 3.334 0 00-.306-.016 4.945 4.945 0 104.946 4.945v-6.69a4.345 4.345 0 003.636 1.964z'
										fill='currentColor'
									></path>
								</svg>
								<a
									href={tiktokUrl}
									target='_blank'
									rel='noopener'
								>
									TikTok
								</a>
							</div>
						</li>
					</ul>
				</div>
			</div>
			<style jsx>
				{`
				.icon--bi-phone,
				.icon--bi-email,
				.icon--facebook,
				.icon--instagram,
				.icon--tiktok {
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
					position: relative;
					padding: 0 20px;
					overflow-y: auto;
					width: 100%;
					height: calc(100% - 20px);
				}
				.mobile-menu__inner {
					height: calc(100% - 58px);
					top: 60px;
					width: 90%;
					background-color: #fff;
					position: fixed;
					z-index: 400;
					transition: left 0.5s, opacity 0.5s;
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
					transition: transform 0.3s, opacity 0.3s;
				}

				@media only screen and (min-width: 62em) {
					.header__mobile-nav-toggle {
						display: none;
					}
				}

				.burger-button.active .burger-line:nth-child(1) {
          			transform: rotate(-45deg) translate(-4px, 6px);
        		}
        		.burger-button.active .burger-line:nth-child(2) {
          			opacity: 0;
       			}
        		.burger-button.active .burger-line:nth-child(3) {
          			transform: rotate(45deg) translate(-4px, -6px);
				`}
			</style>
		</nav>
	);
};

export default NavMobileMenu;
