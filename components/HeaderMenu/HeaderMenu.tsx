import React, { useEffect, useState } from 'react';
import CaretDown from '../../components/Icons/CaretDown';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { useApi } from '../../hooks/useApi';
import {
	hideAll,
	showNavMobileMenu,
} from '../../lib/features/showOpacityContainerSlide';

const HeaderMenu = () => {
	const { buildUrl } = useApi();
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [windowWidth, setWindowWidth] = useState(0);

	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);
	const dispatch = useAppDispatch();
	const menuMobileOpen = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.navMobileMenu
	);

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetch(
				buildUrl(`/categories/bestcategories/?parentcategorie=index`),
				{
					headers: {
						'X-Store-ID': 'cti',
					},
				}
			);
			setData(await data.json());
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	// funcion para calcular el numero de items que se van a mostrar dinamico por porcentaje

	const calculateItemsToShow = (width: number) => {
		const percentage = width / 1920;
		return Math.floor(percentage * 14);
	};

	// useEffect para calcular el numero de items que se van a mostrar en tiempo real (SSR-safe)
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const handleResize = () => setWindowWidth(window.innerWidth);
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		fetchData();
	}, []);

	if ((data?.results || []).length === 0) {
		return <div></div>;
	}

	return (
		<div className='header-menu'>
			<ul className='header-menu__list text--off'>
				<li className='header-menu__burger'>
					<button
						type='button'
						className='header-menu__burger-btn'
						aria-label='Abrir menú'
						onClick={() =>
							menuMobileOpen
								? dispatch(hideAll())
								: dispatch(showNavMobileMenu())
						}
					>
						<span
							className={`burger-button ${menuMobileOpen ? 'active' : ''}`}
							aria-hidden='true'
						>
							<span className='burger-line'></span>
							<span className='burger-line'></span>
							<span className='burger-line'></span>
						</span>
						<span>Todo</span>
						<CaretDown isOpen={menuMobileOpen} size={12} />
					</button>
				</li>
				{(() => {
					const seen = new Set();
					return (data?.results || [])
						.filter((i) => i.slug !== 'index')
						.filter((i) => i.portada)
						.filter((i) => {
							if (seen.has(i.name.toLowerCase())) {
								return false;
							}
							seen.add(i.name.toLowerCase());
							return true;
						})
						.slice(0, calculateItemsToShow(windowWidth || 1920));
				})().map((item, index) => (
					<li key={index}>
						<Link
							href={`/listado/all/${item.slug}?page_size=${maxPageResults}`}
							legacyBehavior
						>
							<a>{Capitalize(item.name)}</a>
						</Link>
					</li>
				))}
				<li>
					<Link
						href={`/listado/all/index?q=&filter_available=true&filter_available_store=false&filter_free_shipping=false&page=1&order=-ventas&filter_discount=true&page_size=${maxPageResults}`}
						legacyBehavior
					>
						<a className='offers-link'>
							🔥 OFERTAS
						</a>
					</Link>
				</li>
			</ul>

			<style jsx>
				{`
					.header-menu {
						width: 100%;
						min-height: 38px;
						display: none;
						padding: 0 20px;
						align-items: center;
						background-color: #f5f6f8;
						border-bottom: 1px solid #eaeaea;
					}

					.header-menu__list {
						display: flex;
						list-style: none;
						align-items: center;
						justify-content: flex-start;
						gap: 15px;
						width: 100%;
						padding: 0;
						margin: 0;
					}

					.header-menu__list li {
						display: flex;
						align-items: center;
					}

					.header-menu__burger-btn {
						display: flex;
						align-items: center;
						gap: 6px;
						background: #e9ecef;
						color: #333333;
						border-radius: 4px;
						border: 1px solid transparent;
						padding: 4px 8px;
						cursor: pointer;
						font-weight: bold;
						min-height: 28px;
						height: 28px;
						transition: background-color 0.2s, border-color 0.2s;
					}

					.header-menu__burger-btn:hover {
						background: #dee2e6;
						border-color: rgba(0, 0, 0, 0.1);
					}

					.header-menu__burger-btn > * {
						flex-shrink: 0;
					}

					.burger-button {
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						width: 16px;
						height: 12px;
						min-height: 12px;
						flex-shrink: 0;
					}

					.burger-line {
						width: 16px;
						height: 2px;
						background-color: #333333;
						transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
						border-radius: 1px;
					}

					.burger-button.active .burger-line:nth-child(1) {
						transform: rotate(-45deg) translate(-3px, 5px);
					}

					.burger-button.active .burger-line:nth-child(2) {
						opacity: 0;
						transform: scale(0);
					}

					.burger-button.active .burger-line:nth-child(3) {
						transform: rotate(45deg) translate(-3px, -5px);
					}

					.header-menu__list a {
						color: #474747;
						text-decoration: none;
						font-size: 13px;
						font-weight: 500;
						border: 1px solid transparent;
						border-radius: 4px;
						padding: 4px 8px;
						transition: border-color 0.2s, color 0.2s;
						cursor: pointer;
						white-space: nowrap;
					}

					.header-menu__list a:hover {
						border-color: rgba(0, 0, 0, 0.15);
						color: var(--primary-color);
					}

					.header-menu__list a.offers-link {
						color: var(--primary-color) !important;
						font-weight: bold;
					}

					@media only screen and (min-width: 62em) {
						.header-menu {
							display: flex;
						}
					}
				`}
			</style>
		</div>
	);
};

export default HeaderMenu;
