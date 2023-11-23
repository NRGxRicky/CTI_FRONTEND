import React from 'react';

const BreadcrumbArrow = () => {
  return (
		<svg
			className='breadcrumbarrow__svg'
			width='14px'
			height='14px'
			viewBox='0 0 1000 1000'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d=' M 500 275C 507 275 513 278 518 282C 518 282 818 582 818 582C 824 589 827 598 825 607C 822 615 815 622 807 625C 798 627 789 624 782 618C 782 618 500 336 500 336C 500 336 218 618 218 618C 212 624 202 627 194 625C 185 622 178 615 176 607C 173 598 176 589 182 582C 182 582 482 282 482 282C 487 278 493 275 500 275C 500 275 500 275 500 275'
				transform='rotate(90,500,500)'
			></path>
			<style jsx>
				{`
					.breadcrumbarrow__svg {
						vertical-align: middle;
					}
				`}
			</style>
		</svg>
	);
};

export default BreadcrumbArrow;