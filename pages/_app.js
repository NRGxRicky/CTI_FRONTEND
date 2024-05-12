// import App from 'next/app'
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import '../styles.css';
import Head from 'next/head';
import { AuthProvider } from '../hooks/auth';
import GoogleAnalytics from '../components/GoogleAnalytics/GoogleAnalytics';
import NextTopLoader from 'nextjs-toploader';

function MyApp({ Component, pageProps }) {
	useEffect(() => {
		window.history.scrollRestoration = 'manual';
	}, []);

	const router = useRouter();

	useEffect(() => {
		setTimeout(() => {
			document.body.scrollTo({
				top: 0,
				left: 0,
				behavior: 'instant',
			});
		}, 0);

	}, [router]);

	return (
		<>
			<NextTopLoader color='#ff002c' />
			<GoogleAnalytics />
			<Head>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1, maximum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
				/>
			</Head>
			<AuthProvider>
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</AuthProvider>
		</>
	);
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
