import React, { useState, useEffect, useRef } from 'react';

const LazySection = ({ children, placeholder }) => {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		if (!('IntersectionObserver' in window)) {
			setIsVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{
				rootMargin: '300px 0px', // Load 300px before scrolling into view to avoid blank space
			}
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<div ref={ref} style={{ width: '100%' }}>
			{isVisible ? children : placeholder}
		</div>
	);
};

export default LazySection;
