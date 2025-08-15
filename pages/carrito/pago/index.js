import React, { useEffect, useContext } from 'react';
import BenefitCarousel from '../../../components/BenefitCarousel/BenefitCarousel';
import Head from 'next/head';
import FooterMini from '../../../components/FooterMini/FooterMini';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';
import useCart from '../../../hooks/useCart';
import CartPaymentMethod from '../../../components/CartPaymentMethod/CartPaymentMethod';
import StatusBarCart from '../../../components/StatusBarCart/StatusBarCart';
import { useEnv } from '../../../context/EnvContext';
import CartContext from '../../../context/CartContext';
import { trackAddPaymentInfo } from '../../../utils/analytics';

const index = () => {
	const { isAuthenticated, loading, accessToken, cartMsi } = useAuth();
	const { cart, loading: loadingCart } = useCart();
	const { storeName, metaDescription, titlePostDescription } = useEnv();
	const { total, paymentMethod } = useContext(CartContext);

	if (!loading && !isAuthenticated) {
		Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
	}

	useEffect(() => {
		if (!loadingCart && cart && cart.length < 1) {
			Router.push('/carrito');

		}
	}, [loadingCart, cart]);

	// Trackear evento add_payment_info cuando se accede a la página de pago
	useEffect(() => {
		if (cart && cart.length > 0 && !loadingCart && paymentMethod) {
			trackAddPaymentInfo(cart, total, paymentMethod, cartMsi);
		}
	}, [cart, total, paymentMethod, cartMsi, loadingCart]);

	return (
		<div className='container'>
			<Head>
				<title>
					{`Forma de Pago | ${storeName}: ${titlePostDescription}`}
				</title>
				<meta name='description' content={`${metaDescription}`} />

				{/* URL canónica */}
				<link rel='canonical' href={`${process.env.NEXT_PUBLIC_PAGE_URL}/carrito/pago`} />
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
