import React from 'react';
import CartSummary from '../../components/CartSummary/CartSummary';
import BenefitCarousel from '../../components/BenefitCarousel/BenefitCarousel';
import Head from 'next/head';
import FooterMini from '../../components/FooterMini/FooterMini';
import StatusBarCart from '../../components/StatusBarCart/StatusBarCart';
import { useEnv } from '../../context/EnvContext';

const index = () => {
	const { storeName, metaDescription, titlePostDescription } = useEnv();

  return (
		<div className='container'>
			<Head>
				<title>
					{`Carrito | ${storeName}: ${titlePostDescription}`}
				</title>
				<meta name='description' content={`${metaDescription}`} />
			</Head>
			<StatusBarCart
				steps={[
					{ key: 'cart', label: 'Carrito', link: '/carrito' },
					{ key: 'shipping', label: 'Envío' },
					{ key: 'payment', label: 'Pago' },
					{ key: 'confirm', label: 'Confirmación' },
				]}
				activeStep='cart'
			/>
			<CartSummary />
			<BenefitCarousel />
			<FooterMini />
		</div>
	);
};

export default index;