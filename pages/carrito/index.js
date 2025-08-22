import React, { useEffect, useContext } from 'react';
import CartSummary from '../../components/CartSummary/CartSummary';
import BenefitCarousel from '../../components/BenefitCarousel/BenefitCarousel';
import Head from 'next/head';
import FooterMini from '../../components/FooterMini/FooterMini';
import StatusBarCart from '../../components/StatusBarCart/StatusBarCart';
import { useEnv } from '../../context/EnvContext';
import Router from 'next/router';
import { useAuth } from '../../hooks/auth';
import CartContext from '../../context/CartContext';
import { trackViewCart } from '../../utils/analytics';
import { trackMetaAddToWishlist } from '../../utils/metaAnalytics';

const index = () => {
	const { storeName, metaDescription, titlePostDescription } = useEnv();
	const { isAuthenticated, loading, cartMsi } = useAuth();
	const { cart, total } = useContext(CartContext);

	if (!loading && !isAuthenticated) {
		Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
	}

	// Trackear eventos cuando se carga la página del carrito
	useEffect(() => {
		if (cart && cart.length > 0) {
			// Google Analytics
			trackViewCart(cart, total, cartMsi);

			// Meta Pixel (usamos AddToWishlist como equivalente a view_cart)
			trackMetaAddToWishlist(cart, total, cartMsi);
		}
	}, [cart, total, cartMsi]);

	return (
		<div className='container'>
			<Head>
				<title>
					{`Carrito | ${storeName}: ${titlePostDescription}`}
				</title>
				<meta name='description' content={`${metaDescription}`} />

				{/* URL canónica */}
				<link rel='canonical' href={`${process.env.NEXT_PUBLIC_PAGE_URL}/carrito`} />
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