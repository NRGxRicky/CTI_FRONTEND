'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Capitalize from '../../hooks/CapitalizeTitle';
import { Preloader, TailSpin } from 'react-preloader-icon';

const ImageLoader = ({ current, setShowZoomGaller, item }) => {
	const [isImageLoaded, setImageLoaded] = useState(false);
	return (
		<div className='product__gallery__current'>
			<Preloader
				use={TailSpin}
				size={30}
				strokeWidth={8}
				strokeColor='#FF002C'
				duration={900}
				style={{ display: isImageLoaded ? 'none' : undefined }}
			/>

			<div
				className='product__gallery__current__image'
				style={{
					display: isImageLoaded ? undefined : 'none',
				}}
				onClick={() => setShowZoomGallery(true)}
			>
				<Image
					src={current.url.m ? current.url.m : '/images/not-available.png'}
					fill
					style={{ objectFit: 'contain' }}

					draggable='false'
					sizes='auto'
					onLoad={() => setImageLoaded(true)}
					className='zoom__container'
					priority={true}
				/>
			</div>
		</div>
	);
};

export default ImageLoader;