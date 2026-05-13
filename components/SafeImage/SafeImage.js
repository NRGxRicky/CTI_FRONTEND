import React, { useState } from 'react';
import Image from 'next/image';

const SafeImage = ({ src, fallbackSrc = '/images/not-available.png', alt, ...props }) => {
	const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

	return (
		<Image
			{...props}
			src={imgSrc}
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
