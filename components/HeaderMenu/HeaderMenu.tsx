import React from 'react';
import Link from 'next/link';

const HeaderMenu = () => {
	return (
		<div className='header-menu'>
			<ul className='header-menu__list text--off'>
				<li>
					<Link
						href={`http://localhost:3000/listado/all/index-computadoras`}
						legacyBehavior
					>
						<a>Computadoras</a>
					</Link>
				</li>
				<li>
					<Link
						href={`http://localhost:3000/listado/all/index-impresion`}
						legacyBehavior
					>
						<a>Impresoras</a>
					</Link>
				</li>
				<li>
					<Link
						href={`http://localhost:3000/listado/all/index-computo-monitores`}
						legacyBehavior
					>
						<a>Monitores</a>
					</Link>
				</li>
				<li>
					<a>Memorias</a>
				</li>
				<li>
					<a>Almacenamiento</a>
				</li>
				<li>
					<a>Lo más vendido</a>
				</li>
				<li>
					<a>Novedades</a>
				</li>
				<li>
					<a>OFERTAS</a>
				</li>
			</ul>

			<style jsx>
				{`
					.header-menu {
						width: 100%;
						height: 54px;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.header-menu__list {
						display: flex;
						gap: 50px;
						list-style: none;
					}

					.header-menu__list a {
						cursor: pointer;
					}
				`}
			</style>
		</div>
	);
};

export default HeaderMenu;
