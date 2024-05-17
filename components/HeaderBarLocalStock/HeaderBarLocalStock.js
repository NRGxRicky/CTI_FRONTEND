import React, { useState, useEffect, useRef } from 'react';
import ToggleButton from '../ToggleButton/ToggleButon';
import {
	showHeaderLocationStock,
	setLocationStockOnly,
	setHeaderLocationStockHeight,
} from '../../lib/features/locationSlide';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { initializeLocalStorage } from '../../hooks/locationUtils';
import { useRouter } from 'next/router';

const HeaderBarLocalStock = () => {
	const [today, setToday] = useState(new Date());
	const dispatch = useAppDispatch();
	const locationStockOnly = useAppSelector(
		(state) => state.locationSlide.locationStockOnly
	);
	const headerLocationStock = useAppSelector(
		(state) => state.locationSlide.headerLocationStock
	);
	const headerBarlocalcontainer = useRef();
	const router = useRouter();

	const handleToggleLocationStockOnly = () => {
		dispatch(setLocationStockOnly(!locationStockOnly));
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const isLocalShipping = initializeLocalStorage();
			if (isLocalShipping) {
				dispatch(showHeaderLocationStock());
			}
		}
		setToday(new Date());
	}, [dispatch]);

	useEffect(() => {
		headerBarlocalcontainer &&
			dispatch(
				setHeaderLocationStockHeight(
					headerBarlocalcontainer.current?.offsetHeight
				)
			);
	}, [dispatch, headerLocationStock, router]);

	if (!router.pathname.startsWith('/listado')) {
		return null;
	}

	return (
		headerLocationStock && (
			<div
				className={
					locationStockOnly
						? 'header_bar__local_stock header_bar__local_stock--active'
						: 'header_bar__local_stock'
				}
				ref={headerBarlocalcontainer}
			>
				<span>
					Entrega{' '}
					{today.toLocaleDateString('es-ES', {
						weekday: 'long',
					}) === 'sábado' ||
					today.toLocaleDateString('es-ES', {
						weekday: 'long',
					}) === 'domingo'
						? 'el Lunes '
						: today.getHours() < 16
						? 'Hoy '
						: 'Mañana '}
				</span>

				<span className='header_bar__local_button'>
					<span>
						<ToggleButton
							tcontent={locationStockOnly && '( Mostrando solo inventario local )'}
							style={'checkbox green'}
							tchecked={locationStockOnly}
							tonChange={handleToggleLocationStockOnly}
						/>
					</span>
				</span>

				<style jsx>{`
					.header_bar__local_button {
						display: flex;
						align-items: center;
						gap: 5px;
					}

					.header_bar__local_stock {
						background-color: #474747;
						width: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
						gap: 5px;
						z-index: 300;
						position: relative;
						flex-wrap: wrap;
						padding: 5px;
						font-size: 12px;
						top: 3px;
						color: #ffffff;
            transition: 0.5s background-color ease-in-out;
					}

					.header_bar__local_stock--active {
						font-weight: 600;
						background-color: #ff002c;
					}
				`}</style>
			</div>
		)
	);
};

export default HeaderBarLocalStock;
