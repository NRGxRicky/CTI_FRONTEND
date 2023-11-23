import React from 'react';

const NewProduct = ({ date }) => {
	const myDate = new Date(date);
	let now = new Date();
	now.setDate(now.getDate() - 30);

	if (now < myDate) {
		return (
			<span className='label__new-product'>
				NUEVO
				<style jsx>
					{`
						.label__new-product {
							font-size: 0.8rem;
							position: absolute;
							z-index: 1;
							left: 0;
							bottom: 0;
							background-color: #ff002c;
							color: #fff;
							font-weight: 600;
							padding: 3px;
							border-radius: 2px;
						}
					`}
				</style>
			</span>
		);
	} else {
		return <span></span>;
	}
};

export default NewProduct;
