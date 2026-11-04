import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const SafeImage = ({ src, fallbackSrc = '/images/not-available.png', alt, ...props }) => {
	const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

	useEffect(() => {
		setImgSrc(src || fallbackSrc);
	}, [src, fallbackSrc]);

	return (
		<Image
			{...props}
			src={imgSrc || fallbackSrc}
			alt={alt || 'Imagen'}
			onError={() => {
				if (imgSrc !== fallbackSrc) {
					setImgSrc(fallbackSrc);
				}
			}}
		/>
	);
};

export default SafeImage;
