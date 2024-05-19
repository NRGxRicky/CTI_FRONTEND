import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Capitalize from '../../hooks/CapitalizeTitle';
import { useAppSelector } from '../../lib/hooks';

const HeaderMenu = () => {
	const [data, setData] = useState({ results: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const maxPageResults = useAppSelector(
		(state) => state.mobileSlide.maxPageResults
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

	useEffect(() => {
		fetchData();
	}, []);

	data.results.length === 0 && <div></div>;

	return (
		<div className='header-menu'>
			<ul className='header-menu__list text--off'>
				{data.results
					.slice(0, 8)
					.filter((i) => i.slug !== 'index')
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
						href={`/listado/all/index?q=&filter_available=true&filter_available_store=false&filter_free_shipping=false&page=1&order=-ventas&filter_discount=true`}
						legacyBehavior
					>
						<a>OFERTAS</a>
					</Link>
				</li>
			</ul>

			<style jsx>
				{`
					.header-menu {
						width: 100%;
						height: 45px;
						display: none;
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
