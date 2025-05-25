import React, { useEffect } from 'react';
import BenefitCarousel from '../../../components/BenefitCarousel/BenefitCarousel';
import Head from 'next/head';
import FooterMini from '../../../components/FooterMini/FooterMini';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';
import useCart from '../../../hooks/useCart';
import CartPaymentMethod from '../../../components/CartPaymentMethod/ CartPaymentMethod';
import StatusBarCart from '../../../components/StatusBarCart/StatusBarCart';
import { useEnv } from '../../../context/EnvContext';

const index = () => {
	const { isAuthenticated, loading, accessToken } = useAuth();
	const { cart, loading: loadingCart } = useCart();
	const { storeName, metaDescription, titlePostDescription } = useEnv();

	if (!loading && !isAuthenticated) {
		Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
	}

	useEffect(() => {
		if (!loadingCart && cart && cart.length < 1) {
			Router.push('/carrito');
		
		}
	}, [loadingCart, cart]);

	return (
		<div className='container'>
			<Head>
				<title>
					{`Forma de Pago | ${storeName}: ${titlePostDescription}`}
				</title>
				<meta name='description' content={`${metaDescription}`} />
			</Head>
			<StatusBarCart
				steps={[
					{ key: 'cart', label: 'Carrito', link: '/carrito' },
					{ key: 'shipping', label: 'Envío', link: '/carrito/envio' },
					{ key: 'payment', label: 'Pago' },
					{ key: 'confirm', label: 'Confirmación' },
				]}
				activeStep='payment'
			/>

			<CartPaymentMethod />
			<BenefitCarousel />
			<FooterMini />
		</div>
	);
};

export default index;
