import React from 'react';
import Link from 'next/link';
import BreadcrumbArrow from '../BreadcrumbArrow/BreadcrumbArrow';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useAppSelector } from '../../lib/hooks';

const Navbar = ({
	marca = null,
	categoria = null,
	q = null,
	totalItems = 0,
	breadcrumblist = [],
	label = false
}) => {

	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
	);

	return (
		<div className='navbar'>
			<div className='text--off'>
				<Link href='/' legacyBehavior>
					<a>Inicio</a>
				</Link>
			</div>

			{breadcrumblist
				.filter((item) => item.name !== 'Index')
				.map((bc, index) => (
					<div key={index} className='text--off'>
						<BreadcrumbArrow />
						<Link
							href={`/listado/all/${bc.slug}?page_size=${maxPageResults}`}
							legacyBehavior
						>
							<a>{Capitalize(bc.name)}</a>
						</Link>
					</div>
				))}
			{marca && marca.nombre && (
				<div className='text--off'>
					<BreadcrumbArrow />
					<Link
						href={`/listado/${marca.slug}/index?page_size=${maxPageResults}`}
						legacyBehavior
					>
						<a>{Capitalize(marca.nombre)}</a>
					</Link>
				</div>
			)}
			{!label && (
				<div>
					<BreadcrumbArrow />
					{q && <span>{`"${q}"`}</span>}
					<span className='bold'>
						{' '}
						{totalItems} {totalItems > 1 ? 'resultados' : 'resultado'}
					</span>
				</div>
			)}
			<style jsx>
				{`
					.navbar {
						display: inline-flex;
						width: 100%;
						flex-wrap: wrap;
						align-content: center;
					}
				`}
			</style>
		</div>
	);
};

export default Navbar;
