'use client';

import { useState, useEffect } from 'react';

interface WindowDimensions {
	width: number;
	height: number;
}

function getWindowDimensions(): WindowDimensions {
	if (typeof window !== 'undefined') {
		const { innerWidth: width, innerHeight: height } = window;
		return {
			width,
			height,
		};
	}

	return {
		width: 0,
		height: 0,
	};
}

export default function useWindowDimensions(): WindowDimensions {
	const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(
		getWindowDimensions()
	);

	function handleResize() {
		setWindowDimensions(getWindowDimensions());
	}

	useEffect(() => {
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, [handleResize]);

	return windowDimensions;
}
