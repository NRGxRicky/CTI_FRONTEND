import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
	render() {
		return (
			<Html lang='es'>
				<Head>



					<link
						href={process.env.NEXT_PUBLIC_FAVICON_URL}
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
				</Head>
				<body
					style={{
						'--primary-color': process.env.NEXT_PUBLIC_PRIMARY_COLOR,
						'--background-price-color':
							process.env.NEXT_PUBLIC_BACKGROUND_PRICE,
					}}
				>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
