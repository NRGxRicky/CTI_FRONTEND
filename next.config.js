// Detectar si estamos en staging
const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

module.exports = {
	output: 'standalone',
	async headers() {
		// Headers básicos de seguridad (siempre activos)
		const baseHeaders = [
			{
				key: 'X-Frame-Options',
				value: 'DENY',
			},
			{
				key: 'X-Content-Type-Options',
				value: 'nosniff',
			},
			{
				key: 'Referrer-Policy',
				value: 'strict-origin-when-cross-origin',
			},
			{
				key: 'X-XSS-Protection',
				value: '1; mode=block',
			},
			{
				key: 'Permissions-Policy',
				value: 'camera=(), microphone=(), geolocation=()',
			},
			{
				key: 'Access-Control-Allow-Origin',
				value: '*',
			},
		];

		// CSP solo en staging (para testing)
		const cspHeader = isStaging ? {
			key: 'Content-Security-Policy',
			value: [
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.kueskipay.com https://cdn.gelazo.mx https://maps.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://sdk.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com https://www.paypal.com https://www.paypalobjects.com https://*.googleapis.com https://*.gstatic.com https://*.facebook.net https://*.facebook.com https://*.doubleclick.net https://*.googletagmanager.com",
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com",
				"img-src 'self' data: https: blob: http: https://*.mercadolibre.com https://*.mlstatic.com",
				"font-src 'self' data: https://fonts.gstatic.com https://*.gstatic.com",
				"connect-src 'self' https://api.pccdnapi.com https://api.kueskipay.com https://www.google-analytics.com https://api.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com https://www.paypal.com https://graph.facebook.com https://*.google-analytics.com https://*.analytics.google.com https://*.facebook.com https://*.facebook.net https://*.mercadopago.com https://*.paypal.com https://*.doubleclick.net https://*.googletagmanager.com",
				"frame-src 'self' https://www.google.com https://maps.google.com https://www.paypal.com https://sdk.mercadopago.com https://*.mercadolibre.com https://*.google.com https://*.facebook.com",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			].join('; '),
		} : null;

		return [
			{
				source: '/:path*',
				headers: [
					...baseHeaders,
					// Solo agregar CSP si estamos en staging
					...(cspHeader ? [cspHeader] : []),
				],
			},
		];
	},
	async redirects() {
		return [
			// check if Next.js project routes match before we attempt proxying
			{
				source: '/listado',
				destination: '/listado/all/index',
				permanent: true,
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'api.pccdnapi.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'www.pccomputo.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'pccomputo.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'pcstore.mx',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'www.pcstore.mx',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'www.pchmayoreo.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'images.icecat.biz',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'logo.clearbit.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'upload.wikimedia.org',
				pathname: '**',
			},
			// Dominios para desarrollo local
			{
				protocol: 'http',
				hostname: 'localhost',
				pathname: '**',
			},
			{
				protocol: 'http',
				hostname: 'api.pccomputo.local',
				pathname: '**',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'web-i4t8q7g61bigs480tvfi9pxy.191.101.1.67.sslip.io',
				pathname: '**',
			},
		],
		// Configurar qualities para Next.js 16
		qualities: [75, 100],
		formats: ['image/webp'],
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
};
