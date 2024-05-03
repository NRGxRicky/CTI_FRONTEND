import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
	blockBodyScroll,
	unlockBodyScroll,
	showOpacity,
	hideOpacity
} from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import Capitalize from '../../hooks/CapitalizeTitle';

const ProductGalleryZoom = ({
	visible,
	setVisible,
	current,
	stateDictImages,
	setCurrent,
}) => {
	const dispacth = useAppDispatch();

	useEffect(() => {
		if (visible) {
			dispacth(blockBodyScroll());
			dispacth(showOpacity());
		} else {
			dispacth(unlockBodyScroll());
			dispacth(hideOpacity());
		}
	}, [visible]);

	return (
		<div
			className='product__gallery_zoom'
			style={{ display: visible ? 'flex' : 'none' }}
			onClick={() => setVisible(false)}
		>
			<div className='product__gallery_zoom__container'>
				<div className='close_zoom' onClick={() => setVisible(false)}>
					<button className='close --close_zoom'></button>
				</div>
				<div className='gallery__current'>
					<Image
						src={current.url.l}
						fill
						style={{ objectFit: 'contain' }}
						alt={Capitalize(current.url.title)}
						draggable='false'
						sizes='auto'
						priority={true}
					/>
				</div>
				<div className='product__gallery_zoom__thumbnails'>
					{stateDictImages.map((item, index) => (
						<div
							className={
								current.index == index
									? 'product__gallery_zoom__thumbnails__item active'
									: 'product__gallery_zoom__thumbnails__item'
							}
							key={index}
							onMouseOver={() => {
								setCurrent({ url: item, index: index });
							}}
							onClick={() => {
								setCurrent({ url: item, index: index });
							}}
						>
							<div className='product__gallery_zoom__thumbnails__item__image'>
								<Image
									src={item.s ? item.s : '/images/not-available.png'}
									fill
									style={{ objectFit: 'contain' }}
									alt={Capitalize(item.title)}
									draggable='false'
									sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
								/>
							</div>
						</div>
					))}
				</div>
			</div>
			<style jsx>
				{`
					.product__gallery_zoom {
						width: 100%;
						position: fixed;
						z-index: 100;
						inset: 1px;
						padding: 4rem;
						top: 0;
						left: 0;
						height: 100%;
					}

					.product__gallery_zoom__container {
						width: 100%;
						background-color: #ffffff;
						flex-direction: column;
						padding: 1rem;
						justify-content: space-between;
						height: 100%;
						display: flex;
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

					.gallery__current {
						width: 100%;
						height: 60vh;
						position: relative;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.product__gallery_zoom__thumbnails {
						display: flex;
						width: 100%;
						max-height: 20vh;
						height: 5vh;
						position: relative;
						flex-direction: row;
						flex-wrap: nowrap;
						align-items: flex-end;
						justify-content: center;
						gap: 10px;
					}

					.product__gallery_zoom__thumbnails__item {
						width: 80px;
						height: 80px;
						position: relative;
						border: 1px solid #ced4da;
						border-radius: 4px;
						cursor: pointer;
						padding: 5px;
					}

					.active {
						border: 2px solid #ff002c;
					}

					.product__gallery_zoom__thumbnails__item__image {
						position: relative;
						width: 100%;
						height: 100%;
					}
				`}
			</style>
		</div>
	);
};

export default ProductGalleryZoom;
