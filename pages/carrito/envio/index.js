import React, { useEffect, useLayoutEffect } from 'react';
import BenefitCarousel from '../../../components/BenefitCarousel/BenefitCarousel';
import Head from 'next/head';
import FooterMini from '../../../components/FooterMini/FooterMini';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';
import useCart from '../../../hooks/useCart';

const index = () => {
	const { isAuthenticated, loading, accessToken } = useAuth();
	const { cart, loading: loadingCart } = useCart();

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
					Método de envió | PCStore.mx: Tu tienda en Tecnología, Cómputo,
					Accesorios
				</title>
				<meta
					name='description'
					content={`PCStore.mx Tienda líder en cómputo, accesorios, hardware, tecnología y más. Compra protegida, envíos asegurados y pagos seguros con los mejores precios, productos y marcas.`}
				/>
			</Head>

			<BenefitCarousel />
			<FooterMini />
		</div>
	);
};

export default index;
