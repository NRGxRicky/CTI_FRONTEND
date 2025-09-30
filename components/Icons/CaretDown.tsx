import React from 'react';

interface CaretDownProps {
	isOpen?: boolean;
	size?: number;
	className?: string;
	color?: string;
	hideOnMobile?: boolean;
	hideOnDesktop?: boolean;
}

const CaretDown: React.FC<CaretDownProps> = ({
	isOpen = false,
	size = 12,
	className = '',
	color = 'currentColor',
	hideOnMobile = false,
	hideOnDesktop = false,
}) => {
	return (
		<span
			className={`caret-down ${isOpen ? '--open' : ''} ${
				hideOnMobile ? '--hide-mobile' : ''
			} ${hideOnDesktop ? '--hide-desktop' : ''} ${className}`}
			aria-hidden='true'
		>
			<svg
				width={size}
				height={size}
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<path
					d='M7 10l5 5 5-5'
					stroke={color}
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
			<style jsx>{`
				.caret-down {
					display: inline-flex;
					align-items: center;
					margin-left: 6px;
					transform: rotate(0deg);
					transition: transform 0.2s ease;
				}

				.caret-down.--open {
					transform: rotate(180deg);
				}

				@media only screen and (max-width: 62em) {
					.caret-down.--hide-mobile {
						display: none;
					}
				}

				@media only screen and (min-width: 62em) {
					.caret-down.--hide-desktop {
						display: none;
					}
				}
			`}</style>
		</span>
	);
};

export default CaretDown;
