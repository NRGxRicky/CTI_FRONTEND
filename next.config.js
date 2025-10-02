module.exports = {
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
