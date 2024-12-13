import React from 'react';
import CartSummary from '../../components/CartSummary/CartSummary';
import BenefitCarousel from '../../components/BenefitCarousel/BenefitCarousel';


const index = () => {
  return (
		<div className='container'>
			<CartSummary />
			<BenefitCarousel />
			<aside className='footer__aside'>
				© 2024 PCStore.mx - PCSTORE ONLINE SAS DE CV - Hecho en Puebla, Puebla
				con ❤️
			</aside>
			<style jsx>
				{`
					.footer__aside {
						display: flex;
						justify-content: center;
						line-height: 2;
						text-align: center;
						padding: 10px;
						margin-bottom: 20px;
					}
				`}
			</style>
		</div>
	);
};

export default index;