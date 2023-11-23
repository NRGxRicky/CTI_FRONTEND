import * as React from 'react';
import { useCarousel } from '../../hooks/useCarousel';

function makeIndices(start, delta, num) {
	const indices = [];

	while (indices.length < num) {
		indices.push(start);
		start += delta;
	}

	return indices;
}

export const CarouselContainer = ({
	children,
	slidesPresented = 1,
	interval = 5000,
	mobile = false,
}) => {
	const slides = React.Children.toArray(children);
	const length = slides.length;
	const numActive = Math.min(length, slidesPresented);
	const [active, setActive, handlers, style] = useCarousel(length, interval, {
		slidesPresented: numActive,
	});
	const beforeIndices = makeIndices(
		slides.length + 1 - numActive,
		+1,
		numActive
	);
	const afterIndices = makeIndices(0, +1, numActive);

	let styleClass =
		'carousel__button carousel__button-next carousel__button--color-ligth';

	if (mobile) {
		styleClass = styleClass.concat(' button__show_mobile');
	}

	return (
		length > 0 && (
			<div className='carousel__content' {...handlers}>
				<div className='carousel__container' style={style}>
					{beforeIndices.map((i) => (
						<CarouselChild key={i}>{slides[i]}</CarouselChild>
					))}
					{slides.map((slide, index) => (
						<CarouselChild key={index}>{slide}</CarouselChild>
					))}
					{afterIndices.map((i) => (
						<CarouselChild key={i}>{slides[i]}</CarouselChild>
					))}
				</div>
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
						max-width: 83rem;
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
						fill: #ff002c;
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
				}
			`}
		</style>
	</div>
);
