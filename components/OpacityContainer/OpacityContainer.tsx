'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { hideAll } from '../../lib/features/showOpacityContainerSlide';


const OpacityContainer = () => {
	const opacityContainerValue = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.opacityConatiner
	);
	const dispacth = useAppDispatch();
	return (
		<div>
			<div
				className='opacity'
				style={{
					opacity: opacityContainerValue ? 0.7 : 0,
					visibility: opacityContainerValue ? "visible" : "hidden",
				}}
				onClick={() => {
					dispacth(hideAll());
				}}
			></div>
			<style jsx>
				{`
					.opacity {
						top: 0;
						width: 100%;
						height: 100%;
						background: #0f0f0f;
						position: fixed;
						transition: opacity 1s, display 1s;
						z-index: 50;
					}
				`}
			</style>
		</div>
	);
};

export default OpacityContainer;
