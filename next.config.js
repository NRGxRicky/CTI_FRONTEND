
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
        domains: ['api.pccdnapi.com'],

    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
      },
}
