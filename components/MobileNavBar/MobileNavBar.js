import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import TextTruncate from 'react-text-truncate';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
	hideAll,
	showNavMobileSort,
	showNavMobileFilters,
} from '../../lib/features/showOpacityContainerSlide';

const MobileNavBar = ({ sortList, setSecondLoading, q, mobileScroll }) => {
	const router = useRouter();
	const [prevScroll, setPrevScroll] = useState(250);
	const [visibleNav, setVisibleNav] = useState(true);
	const dispacth = useAppDispatch();
	const mobileNavSort = useAppSelector(
		(state) => state.showOpacityContainerReducer.navMobileSort
	);

	const dictSortLabel = {
		'-ventas': 'Más vendidos',
		'-visitas': 'Más relevantes',
		precio: 'Menor precio',
		'-precio': 'Mayor precio',
		'-stock_total': 'Disponibilidad',
		'-created': ' Más recientes',
	};

	const handleSort = async (order) => {
		setSecondLoading(true);
		dispacth(hideAll())
		await router.replace({
			pathname: router.pathname,
			query: { ...router.query, order: order, page: 1 },
		});
	};

	const handleScroll = () => {
		if (mobileScroll < prevScroll) {
			const difference = prevScroll - mobileScroll;
			if (difference > 250) {
				setPrevScroll(mobileScroll);
				setVisibleNav(true);
			}
		} else {
			setVisibleNav(false);
			setPrevScroll(mobileScroll);
		}
	};

	useEffect(() => {
		handleScroll();
	}, [mobileScroll]);

	useEffect(() => {
		!visibleNav && prevScroll > 250 && setVisibleNav(true);
		setPrevScroll(250);
	}, [q]);

	return (
		<div>
			<div
				className='nav__container'
				style={{ top: visibleNav ? '59px' : '-59px' }}
			>
				<div className='nav'>
					<div className='nav__sort' onClick={() => dispacth(showNavMobileSort())}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							x='0px'
							y='0px'
							viewBox='0 0 1000 1000'
							xmlSpace='preserve'
						>
							<g>
								<path d='M874.8,687.4h-179V208.8H593v568.6l0,0V990L874.8,687.4z M292.3,312.6v478.6h102.8V10l-270,302.6H292.3z'></path>
							</g>
						</svg>
						<TextTruncate
							line={1}
							element='span'
							truncateText=' …'
							text={`Ordenar: ${dictSortLabel[sortList]}`}
						/>
					</div>
					<div className='nav__filters' onClick={() => dispacth(showNavMobileFilters())}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							x='0px'
							y='0px'
							viewBox='0 0 1000 1000'
							xmlSpace='preserve'
						>
							<g>
								<g transform='translate(0.000000,511.000000) scale(0.100000,-0.100000)'>
									<path d='M3182.6,4977.9c-430.2-105.8-814.4-427.9-991.5-830.5l-46-101.2H1123.7H100v-494.6V3057h1019.1h1021.4l87.4-177.1c128.8-262.3,391.1-519.9,655.6-646.4c246.2-115,395.7-151.8,644.1-151.8s398,36.8,644.1,151.8c264.6,126.5,526.8,384.2,655.6,646.4l87.4,177.1h2493.7H9900v494.6v494.6H7406.3H4914.9l-71.3,144.9c-195.5,391.1-565.9,690.1-977.7,786.8C3691,5019.3,3352.9,5019.3,3182.6,4977.9z M3769.2,3970.3c262.3-144.9,322.1-515.3,119.6-745.4c-292.2-333.6-844.3-126.5-844.3,315.2C3044.6,3928.9,3428.8,4156.6,3769.2,3970.3z'></path>
									<path d='M6161.7,1552.5c-434.8-101.2-814.4-402.6-1007.6-800.6l-73.6-156.4H2591.4H100V112.4v-483.1h2491.4h2489.1l75.9-156.4c147.2-306,404.9-556.7,715.5-699.4c699.3-322.1,1541.3-27.6,1891,657.9l101.2,197.8h1019.1H9900v483.1v483.1H8883.2H7864.1l-101.2,197.8c-170.2,335.9-462.4,586.6-835.1,715.4C6720.7,1580.1,6373.4,1600.8,6161.7,1552.5z M6700.1,542.6c55.2-27.6,131.1-96.6,172.5-151.8c64.4-89.7,71.3-112.7,71.3-276.1c0-156.4-6.9-188.6-62.1-269.2c-34.5-48.3-101.2-115-149.5-147.2c-71.3-48.3-110.4-57.5-262.2-57.5c-163.3,0-186.4,6.9-276.1,71.3c-151.8,110.4-209.4,237-200.1,427.9c6.9,126.5,20.7,172.5,75.9,250.7C6210,588.6,6488.4,655.3,6700.1,542.6z'></path>
									<path d='M2812.3-1866c-285.3-46-595.8-204.7-805.2-414.1c-126.5-126.5-280.6-356.6-319.8-473.9l-27.6-78.2H879.9H100v-494.6v-494.6h777.6h775.3l80.5-167.9c101.2-211.6,404.9-524.5,609.6-630.3c409.5-213.9,899.5-225.4,1311.3-32.2c301.4,140.3,584.3,425.6,706.2,708.5l52.9,121.9h2744.5H9900v494.6v494.6H7164.7H4427.2l-98.9,190.9c-179.4,342.8-501.5,611.9-871.9,724.6C3274.6-1861.4,2989.4-1838.4,2812.3-1866z M3300-2910.4c126.5-85.1,204.7-213.9,220.8-368.1c11.5-108.1,4.6-147.2-50.6-255.4c-147.2-301.3-503.8-370.4-756.9-144.9c-260,225.4-204.7,630.3,103.5,786.8C2975.6-2811.5,3159.6-2818.4,3300-2910.4z'></path>
								</g>
							</g>
						</svg>
						<span>Filtros</span>
					</div>
				</div>
			</div>
			<div
				className='nav__sort__details'
				style={{
					opacity: !mobileNavSort ? '0' : '1',
					display: !mobileNavSort ? 'none' : 'block',
				}}
				onClick={() => dispacth(hideAll())}
			>
				<div
					className='nav__sort__details__container'
					style={{ display: !mobileNavSort ? 'none' : 'block' }}
				>
					<div className='nav__sort__header'>Ordenar por</div>
					<div className='nav__sort__options'>
						{Object.entries(dictSortLabel).map(([id, value]) => {
							if (id === sortList) {
								return (
									<div
										className='nav__sort__options--active text--ligth'
										onClick={() => handleSort(id)}
										key={id}
									>
										{value}
									</div>
								);
							} else {
								return (
									<div onClick={() => handleSort(id)} key={id}>
										{value}
									</div>
								);
							}
						})}
					</div>
				</div>
			</div>
			<style jsx>
				{`
					.nav__container {
						max-width: 100%;
						margin: 0;
						position: fixed;
						z-index: 25;
						transition: top 0.3s ease;
						width: 100%;
						height: 60px;
					}

					.nav {
						margin: 0;
						background-color: #fff;
						height: 54px;
						display: flex;
						flex-wrap: wrap;
						border: 0.5px solid #eaeaea;
						align-items: center;
						justify-content: center;
						text-align: center;
						line-height: 54px;
						font-weight: 600;
						box-shadow: 0 2px 4px 0 rgb(0 0 0 / 10%);
					}

					.nav__filters {
						flex: 0 0 50%;
						width: 100%;
						height: 100%;
						border: 0.5px solid #eaeaea;
						align-self: center;
					}

					.nav__sort {
						flex: 0 0 50%;
						width: 100%;
						height: 100%;
						border: 0.5px solid #eaeaea;
						align-self: center;
					}

					.nav svg {
						height: 14px;
						width: 14px;
						margin-bottom: -2px;
						margin-right: 5px;
					}

					.nav__sort__details {
						position: fixed;
						left: 0;
						top: 0;
						right: 0;
						bottom: 0;
						opacity: 0;
						z-index: 2050;
						transition: opacity 0.3s ease;
						opacity: 0;
						display: none;
					}

					.nav__sort__details__container {
						position: fixed;
						z-index: 2051;
						width: 90%;
						left: 50%;
						top: 50%;
						min-height: 10%;
						max-height: 90%;
						background-color: #ffffff;
						border-radius: 2px;
						display: none;
						transform: translateX(-50%) translateY(-50%);
						overflow: auto;
					}

					.nav__sort__header {
						font-size: 18px;
						font-weight: 600;
						padding: 20px;
					}

					.nav__sort__options div {
						font-size: 16px;
						padding: 20px;
						border-top: 1px solid #eaeaea;
					}

					.nav__sort__options--active {
						font-weight: 600;
					}
				`}
			</style>
		</div>
	);
};

export default MobileNavBar;
