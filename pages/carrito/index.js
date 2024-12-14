import React from 'react';
import CartSummary from '../../components/CartSummary/CartSummary';
import BenefitCarousel from '../../components/BenefitCarousel/BenefitCarousel';
import Head from 'next/head';

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