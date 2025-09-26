/* eslint-disable react/no-unknown-property */
import * as React from 'react';
import PropTypes from 'prop-types';
import { useCarousel } from '../../hooks/useCarousel';

// legacy helper kept for reference; replaced by makeWrapIndices
// function makeIndices(start, delta, num) {
// 	const indices = [];
// 
// 	while (indices.length < num) {
// 		indices.push(start);
// 		start += delta;
// 	}
// 
// 	return indices;
// }

// Ensure indices wrap around length (modulo) to avoid out-of-range
function makeWrapIndices(length, start, count) {
	const indices = [];
	let current = start;
	for (let i = 0; i < count; i += 1) {
		const wrapped = ((current % length) + length) % length;
		indices.push(wrapped);
		current += 1;
	}
	return indices;
}

export const CarouselContainer = ({
	children,
	slidesPresented = 1,
	interval = 5000,
	mobile = false,
	peekPercent = 0,
	initialIndex = 0,
	edgeOffsetTop = 0,
}) => {
	const slides = React.Children.toArray(children);
	const length = slides.length;
	const numActive = Math.min(length, slidesPresented);
	const [, setActive, handlers, style] = useCarousel(length, interval, {
		slidesPresented: numActive,
		peekPercent,
		initialActive: initialIndex,
	});
	// Use wrap-around indices so clones always point to valid slides
	const beforeIndices = makeWrapIndices(length, length - numActive, numActive);
	const afterIndices = makeWrapIndices(length, 0, numActive);

	let styleClass =
		'carousel__button carousel__button-next carousel__button--color-ligth';

	if (mobile) {
		styleClass = styleClass.concat(' button__show_mobile');
	}

	return (
		length > 0 && (
			<div
				className='carousel__content'
				{...handlers}
				style={{ ['--edge-offset-top']: `${edgeOffsetTop}px` }}
			>
				<div className='carousel__container' style={style}>
					{beforeIndices.map((i) => (
						<CarouselChild key={`before-${i}`}>{slides[i]}</CarouselChild>
					))}
					{slides.map((slide, index) => (
						<CarouselChild key={`main-${index}`}>{slide}</CarouselChild>
					))}
					{afterIndices.map((i) => (
						<CarouselChild key={`after-${i}`}>{slides[i]}</CarouselChild>
					))}
				</div>
				{/* Edge gradients to hint adjacent slides */}
				{peekPercent > 0 && (
					<>
						<div className='carousel__edge-gradient carousel__edge-gradient--left' />
						<div className='carousel__edge-gradient carousel__edge-gradient--right' />
					</>
				)}
				<div onClick={() => setActive('next')} className={styleClass}>
					<button
						role='presentation'
						type='button'
						className='button__nav'
						tabIndex='-1'
					>
						<svg
							className='button_nav__icon'
							width='14.6'
							height='27'
							viewBox='0 0 16 27'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
						</svg>
					</button>
				</div>
				<div
					onClick={() => setActive('prev')}
					className='carousel__button carousel__button-prev carousel__button--color-ligth'
				>
					<button
						role='presentation'
						type='button'
						className='button__nav'
						tabIndex='-1'
					>
						<svg
							className='button_nav__icon'
							width='14.6'
							height='27'
							viewBox='0 0 16 27'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M16 23.207L6.11 13.161 16 3.093 12.955 0 0 13.161l12.955 13.161z'></path>
						</svg>
					</button>
				</div>
				<style jsx>{`
					.carousel__content {
						width: 100%;
						position: relative;
						overflow: hidden;
						max-width: 100%;
						margin: 0 auto;
						-webkit-tap-highlight-color: transparent;
						touch-action: pan-y;
						user-drag: none;
						user-select: none;
						-moz-user-select: none;
						-webkit-user-drag: none;
						-webkit-user-select: none;
						-ms-user-select: none;
					}

					.carousel__container {
						display: flex;
						flex-direction: row;
						flex-wrap: nowrap;
						overflow: hidden;
						position: relative;
					}

					.carousel__edge-gradient {
						pointer-events: none;
						position: absolute;
						top: calc(var(--edge-offset-top, 0px) * -1);
						height: calc(100% + var(--edge-offset-top, 0px));
						width: clamp(25px, 6.667dvw, 200px);
						z-index: 2;
						/* Match page background gradient */
						background: #f7f7f7;
					}
					.carousel__edge-gradient--left {
						left: 0;
						/* Fade horizontally using mask so colors match the vertical bg */
						/* dinamico por tamaño de pantalla */

						-webkit-mask-image: linear-gradient(
							90deg,
							rgba(0, 0, 0, 1) 0%,
							rgba(0, 0, 0, 0.7) 40%,
							rgba(0, 0, 0, 0) 85%
						);
						mask-image: linear-gradient(
							90deg,
							rgba(0, 0, 0, 1) 30%,
							rgba(0, 0, 0, 0.7) 60%,
							rgba(0, 0, 0, 0) 100%
						);
					}

					.carousel__edge-gradient--right {
						right: 0;
						-webkit-mask-image: linear-gradient(
							270deg,
							rgba(0, 0, 0, 1) 0%,
							rgba(0, 0, 0, 0.7) 40%,
							rgba(0, 0, 0, 0) 85%
						);
						mask-image: linear-gradient(
							270deg,
							rgba(0, 0, 0, 1) 30%,
							rgba(0, 0, 0, 0.7) 60%,
							rgba(0, 0, 0, 0) 100%
						);
					}

					.carousel__button {
						border-radius: 0 4px 4px 0;
						justify-content: space-around;
						position: absolute;
						top: calc(50% - 52px);
						width: 47px;
						height: 104px;
						box-shadow: 0 1px 5px 0 rgb(0 0 0 / 11%);
						transition: opacity 0.2s ease-in;
						display: flex;
						align-items: center;
						cursor: pointer;
						text-decoration: none;
						opacity: 0;
						z-index: 3;
					}

					.carousel__button-prev {
						left: 0;
					}

					.carousel__button-next {
						right: 0;
						transform: rotate(180deg);
					}

					.carousel__button--color-ligth {
						background: #ffffff;
						fill: var(--primary-color);
					}

					.carousel__button--color-ligth:hover,
					.carcarousel__button--color-ligth:active {
						background: #ffffff;
					}

					@media only screen and (min-width: 48em) {
						.carousel__content:hover .carousel__button {
							opacity: 1;
						}
					}
				`}</style>
			</div>
		)
	);
};

export const CarouselChild = ({ children }) => (
	<div className='carousel__item' draggable='false'>
		{children}
		<style jsx>
			{`
				.carousel__item {
					width: 100%;
							padding: 0 8px; /* espacio entre slides */
							box-sizing: border-box; /* que el padding no altere el ancho total */
				}

				@media only screen and (max-width: 48em) {
						.carousel__item {
						padding: 0 4px;
					}
				}
			`}
		</style>
	</div>
);

CarouselContainer.propTypes = {
	children: PropTypes.node,
	slidesPresented: PropTypes.number,
	interval: PropTypes.number,
	mobile: PropTypes.bool,
	peekPercent: PropTypes.number,
	initialIndex: PropTypes.number,
	edgeOffsetTop: PropTypes.number,
};

CarouselChild.propTypes = {
	children: PropTypes.node,
};
