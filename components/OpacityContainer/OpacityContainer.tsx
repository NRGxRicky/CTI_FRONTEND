'use client';

import React, {useEffect} from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { hideAll, unlockBodyScroll } from '../../lib/features/showOpacityContainerSlide';

const OpacityContainer = () => {
	const opacityContainerValue = useAppSelector(
		(state: any) => state.showOpacityContainerReducer.opacityConatiner
	);
		const bodyScroll = useAppSelector(
			(state: any) => state.showOpacityContainerReducer.bodyScroll
		);

	useEffect(() => {
			console.log(bodyScroll);
			bodyScroll
				? document.body.classList.add('open-modal')
				: document.body.classList.remove('open-modal');
			console.log('event');
		}, [opacityContainerValue]);
	
	const dispatch = useAppDispatch();
	return (
		<div>
			<div
				className='opacity'
				style={{
					opacity: opacityContainerValue ? 0.7 : 0,
					zIndex: opacityContainerValue ? 50 : -1,
				}}
				onClick={() => {
					dispatch(hideAll());
					dispatch(unlockBodyScroll());
					console.log(bodyScroll)
				}}
			></div>
			<style jsx>
				{`
					.opacity {
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						background: #0f0f0f;
						position: fixed;
						transition: opacity 1s, z-index 1s;
					}
				`}
			</style>
		</div>
	);
};

export default OpacityContainer;
