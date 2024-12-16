import React from 'react';
import CartSummary from '../../components/CartSummary/CartSummary';
import BenefitCarousel from '../../components/BenefitCarousel/BenefitCarousel';
import Head from 'next/head';
import FooterMini from '../../components/FooterMini/FooterMini';

const index = () => {
  return (
		<div className='container'>
			<Head>
				<title>
					Carrito | PCStore.mx: Tu tienda en Tecnología, Cómputo, Accesorios
				</title>
				<meta
					name='description'
					content={`PCStore.mx Tienda líder en cómputo, accesorios, hardware, tecnología y más. Compra protegida, envíos asegurados y pagos seguros con los mejores precios, productos y marcas.`}
				/>
			</Head>
			<CartSummary />
			<BenefitCarousel />
			<FooterMini />
		</div>
	);
};

export default index;