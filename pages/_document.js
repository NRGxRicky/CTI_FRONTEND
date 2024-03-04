import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<link
						href='/ico/favicon.ico'
						rel='shortcut icon'
						type='image/x-icon'
					/>
					<link
						href='/fonts/ProximaNova-Regular.woff2'
						as='font'
						type='font/woff2'
						rel='preload'
						crossOrigin=''
					/>
					<link
						href='/fonts/ProximaNova-Semibold.woff2'
						as='font'
						type='font/woff2'
						rel='preload'
						crossOrigin=''
					/>
					<link
						href='/fonts/ProximaNova-Bold.woff2'
						as='font'
						type='font/woff2'
						rel='preload'
						crossOrigin=''
					/>
					<meta
						name='description'
						content='Descubre la mejor experiencia de compra en tecnología en PCstore.mx. Encuentra cómputo, accesorios, hardware y más de las marcas más reconocidas. Compra protegida con envíos asegurados y pagos seguros. ¡Los mejores precios y productos te esperan!'
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
