import React from 'react';

const FreeShipping = ({
	label = 'Envío gratis',
	color = true,
	modeCard = false,
}) => {
	let stylesActive = 'icon__free-shiping__image';
	if (modeCard) {
		stylesActive = stylesActive + ' icon__free-shiping__image--card';
	}
	if (color) {
		stylesActive = stylesActive + ' icon__free-shiping__green';
	}
	return (
		<div className='icon__free-shipping'>
			<div className='icon__free_shipping__image__container'>
				<svg
					className={stylesActive}
					version='1.1'
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 469.333 469.333'
				>
					<g>
						<g>
							<path
								d='M405.333,149.333h-64V64H42.667C19.093,64,0,83.093,0,106.667v234.667h42.667c0,35.307,28.693,64,64,64s64-28.693,64-64
			h128c0,35.307,28.693,64,64,64c35.307,0,64-28.693,64-64h42.667V234.667L405.333,149.333z M106.667,373.333
			c-17.707,0-32-14.293-32-32s14.293-32,32-32s32,14.293,32,32S124.373,373.333,106.667,373.333z M362.667,373.333
			c-17.707,0-32-14.293-32-32s14.293-32,32-32s32,14.293,32,32S380.373,373.333,362.667,373.333z M341.333,234.667v-53.333h53.333
			l41.92,53.333H341.333z'
							/>
						</g>
					</g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
					<g></g>
				</svg>
			</div>
			<div>
				<span className={color && 'text--green'}>{label}</span>
			</div>

			<style jsx>
				{`
					.icon__free-shipping {
						width: 100%;
						display: flex;
						flex-direction: row;
						align-content: center;
						gap: 10px;
					}

					.icon__free-shiping__image {
						height: auto;
						width: 14px;
					}

					.icon__free-shiping__image--card {
						height: auto;
						width: 20px;
					}

					.icon__free_shipping__image__container {
						display: flex;
						align-items: center;
					}

					.icon__free-shiping__green {
						fill: #00b517;
					}
				`}
			</style>
		</div>
	);
};

export default FreeShipping;
