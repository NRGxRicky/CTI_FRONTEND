import React, { useEffect } from 'react';
import {
	blockBodyScroll,
	unlockBodyScroll,
} from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';

const ProductGalleryZoom = ({ visible, setVisible, current }) => {
	const dispacth = useAppDispatch();

	useEffect(() => {
		if (visible) {
			dispacth(blockBodyScroll());
		} else {
			dispacth(unlockBodyScroll());
		}
	}, [visible]);

	return (
		<div
			className='product_zoom_galery'
			style={{ display: visible ? 'flex' : 'none' }}
		>
			<div className='close_zoom' onClick={() => setVisible(false)}>
				<button className='close --close_zoom'></button>
			</div>
			<div className='gallery__current'>

			</div>
			<style jsx>
				{`
					.product_zoom_galery {
						width: 100%;
						background-color: #ffffff;
						position: fixed;
						z-index: 1;
						inset: 1px;
						flex-direction: column;
						padding: 1rem;
					}

					.--close_zoom {
						height: 20px;
						width: 20px;
					}

					.close_zoom {
						display: flex;
						align-items: center;
						justify-content: center;
						height: 50px;
						width: 50px;
						align-self: flex-end;
						border: 1px solid #ced4da;
						border-radius: 4px;
						cursor: pointer;
					}

					.close_zoom:hover {
						background-color: #ced4da;
					}
				`}
			</style>
		</div>
	);
};

export default ProductGalleryZoom;
