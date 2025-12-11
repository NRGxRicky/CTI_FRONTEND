module.exports = {
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
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
						key: 'Content-Security-Policy',
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://sdk.mercadopago.com https://www.paypal.com https://www.paypalobjects.com https://*.googleapis.com https://*.gstatic.com https://*.facebook.net https://*.facebook.com",
							"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com",
							"img-src 'self' data: https: blob: http:",
							"font-src 'self' data: https://fonts.gstatic.com https://*.gstatic.com",
							"connect-src 'self' https://api.pccdnapi.com https://www.google-analytics.com https://api.mercadopago.com https://www.paypal.com https://graph.facebook.com https://*.google-analytics.com https://*.analytics.google.com https://*.facebook.com https://*.facebook.net https://*.mercadopago.com https://*.paypal.com",
							"frame-src 'self' https://www.google.com https://maps.google.com https://www.paypal.com https://sdk.mercadopago.com https://*.google.com https://*.facebook.com",
							"object-src 'none'",
							"base-uri 'self'",
							"form-action 'self'",
						].join('; '),
					},
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
		],
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
};
