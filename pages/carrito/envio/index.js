import React, { useEffect } from 'react';
import BenefitCarousel from '../../../components/BenefitCarousel/BenefitCarousel';
import Head from 'next/head';
import FooterMini from '../../../components/FooterMini/FooterMini';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';
import useCart from '../../../hooks/useCart';
import CartShippingMethod from '../../../components/CartShippingMethod/CartShippingMethod';
import StatusBarCart from '../../../components/StatusBarCart/StatusBarCart';
import { useEnv } from '../../../context/EnvContext';
import ProfileAddAddress from '../../../components/ProfileAddAddress/ProfileAddAddress'
import { useAppDispatch, useAppSelector } from '../../../lib/hooks';

const index = () => {
	const { isAuthenticated, loading, accessToken } = useAuth();
	const { cart, loading: loadingCart } = useCart();
	const { storeName, metaDescription, titlePostDescription } = useEnv();
	const stateProfileAddAddress = useAppSelector(
		(state) => state.showOpacityContainerReducer.ProfileAddAddress
	);
	
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
					{`Método de envió | ${storeName}: ${titlePostDescription}`}
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
				activeStep='shipping'
			/>
			{stateProfileAddAddress && <ProfileAddAddress />}
			<CartShippingMethod />
			<BenefitCarousel />
			<FooterMini />
		</div>
	);
};

export default index;
