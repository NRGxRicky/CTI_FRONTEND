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
		],
		loader: 'custom',
		loaderFile: './components/ImageLoader/ImageLoader.js',
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
};
