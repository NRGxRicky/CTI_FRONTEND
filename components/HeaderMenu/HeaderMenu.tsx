import React, { useEffect, useState } from 'react';
import CaretDown from '../../components/Icons/CaretDown';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
	hideAll,
	showNavMobileMenu,
} from '../../lib/features/showOpacityContainerSlide';

const HeaderMenu = () => {
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
				`https://api.pccdnapi.com/categories/bestcategories/?parentcategorie=index`
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

	if (data.results.length === 0) {
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
						<span>Categorías</span>
						<CaretDown isOpen={menuMobileOpen} size={12} />
					</button>
				</li>
				{data.results

					.filter((i) => i.slug !== 'index')
					.filter((i) => i.portada)
					.slice(0, calculateItemsToShow(windowWidth || 1920))
					.map((item, index) => (
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
						<a style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
							🔥 OFERTAS
						</a>
					</Link>
				</li>
			</ul>

			<style jsx>
				{`
					.header-menu {
						width: 100%;
						min-height: 45px;
						display: none;
						padding: 0 10px;
						align-items: center;
					}

					.header-menu__list {
						display: flex;
						list-style: none;
						align-items: center;
						justify-content: space-evenly;
						flex-wrap: wrap;
						width: 100%;
					}

					.header-menu__burger-btn {
						display: flex;
						align-items: center;
						gap: 8px;
						background: #474747;
						color: #ffffff;
						border-radius: 6px;
						border: none;
						padding: 6px 12px;
						cursor: pointer;
						font-weight: 600;
						min-height: 32px;
						height: 32px;
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
						background-color: #ffffff;
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
						cursor: pointer;
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
