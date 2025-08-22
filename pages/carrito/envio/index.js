import React, { useEffect, useContext } from 'react';
import BenefitCarousel from '../../../components/BenefitCarousel/BenefitCarousel';
import Head from 'next/head';
import FooterMini from '../../../components/FooterMini/FooterMini';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';
import useCart from '../../../hooks/useCart';
import CartShippingMethod from '../../../components/CartShippingMethod/CartShippingMethod';
import StatusBarCart from '../../../components/StatusBarCart/StatusBarCart';
import { useEnv } from '../../../context/EnvContext';
import CartContext from '../../../context/CartContext';
import { trackBeginCheckout } from '../../../utils/analytics';
import { trackMetaInitiateCheckout } from '../../../utils/metaAnalytics';


const index = () => {
	const { isAuthenticated, loading, accessToken, cartMsi } = useAuth();
	const { cart, loading: loadingCart } = useCart();
	const { storeName, metaDescription, titlePostDescription } = useEnv();
	const { total } = useContext(CartContext);


	if (!loading && !isAuthenticated) {
		Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
	}

	useEffect(() => {
		if (!loadingCart && cart && cart.length < 1) {
			Router.push('/carrito');
		}
	}, [loadingCart, cart]);

	// Trackear eventos cuando se accede a la página de envío
	useEffect(() => {
		if (cart && cart.length > 0 && !loadingCart) {
			// Google Analytics
			trackBeginCheckout(cart, total, cartMsi);

			// Meta Pixel
			trackMetaInitiateCheckout(cart, total, cartMsi);
		}
	}, [cart, total, cartMsi, loadingCart]);

	return (
		<div className='container'>
			<Head>
				<title>
					{`Método de Envió | ${storeName}: ${titlePostDescription}`}
				</title>
				<meta name='description' content={`${metaDescription}`} />

				{/* URL canónica */}
				<link rel='canonical' href={`${process.env.NEXT_PUBLIC_PAGE_URL}/carrito/envio`} />
			</Head>
			<StatusBarCart
				steps={[
					{ key: 'cart', label: 'Carrito', link: '/carrito' },
					{ key: 'shipping', label: 'Envío' },
					{ key: 'payment', label: 'Pago' },
					{ key: 'confirm', label: 'Confirmación' },
				]}
				activeStep='shipping'
			/>

			<CartShippingMethod />
			<BenefitCarousel />
			<FooterMini />
		</div>
	);
};

export default index;
