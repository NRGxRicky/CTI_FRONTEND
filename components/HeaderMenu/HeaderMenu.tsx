import React from 'react';
import Link from 'next/link';

const HeaderMenu = () => {
	return (
		<div className='header-menu'>
			<ul className='header-menu__list text--off'>
				<li>
					<Link
						href={`/listado/all/index-computadoras`}
						legacyBehavior
					>
						<a>Computadoras</a>
					</Link>
				</li>
				<li>
					<Link
						href={`/listado/all/index-impresion`}
						legacyBehavior
					>
						<a>Impresoras</a>
					</Link>
				</li>
				<li>
					<Link
						href={`/listado/all/index-computo-monitores`}
						legacyBehavior
					>
						<a>Monitores</a>
					</Link>
				</li>
				<li>
					<Link
						href={`/listado/all/index-memorias`}
						legacyBehavior
					>
						<a>Memorias</a>
					</Link>
				</li>
				<li>
					<Link
						href={`/listado/all/index-almacenamiento`}
						legacyBehavior
					>
						<a>Almacenamiento</a>
					</Link>
				</li>
				<li>
					<Link
						href={`/listado/all/index?q=&page_size=40&filter_available=true&filter_available_store=false&filter_free_shipping=false&page=1&order=-ventas`}
						legacyBehavior
					>
						<a>Lo más vendido</a>
					</Link>
				</li>
				<li>
					<Link
						href={`/listado/all/index?q=&page_size=40&filter_available=true&filter_available_store=false&filter_free_shipping=false&page=1&order=-created`}
						legacyBehavior
					>
						<a>Novedades</a>
					</Link>
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
