// import App from 'next/app'
import Layout from '../components/Layout/Layout';
import '../styles.css';
import Head from 'next/head';
import { AuthProvider } from '../hooks/auth';
import GoogleAnalytics from '../components/GoogleAnalytics/GoogleAnalytics';

function MyApp({ Component, pageProps }) {
	return (
		<>
			<GoogleAnalytics />
			<Head>
				<meta
					name='viewport'
					content='width=device-width, maximum-scale=1, minimum-scale=1, initial-scale=1, user-scalable=no, shrink-to-fit=no'
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
