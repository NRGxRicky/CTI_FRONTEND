import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const ProductRedirect = () => {
	const router = useRouter();
	const { handle } = router.query;

	useEffect(() => {
    if (handle) {
      
      const cleanHandle = handle.split('?')[0];
      
			const fetchProductSlug = async () => {
				try {
					const response = await fetch(
						'https://api.pccdnapi.com/shopify/get-product-by-slug/',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ cleanHandle }),
						}
					);

					if (response.ok) {
						const data = await response.json();
						if (data.slug) {
							router.replace(`/${data.slug}`);
						} else {
							router.replace(`/`);
						}
					} else {
						router.replace(`/`);
					}
				} catch (error) {
					router.replace(`/`);
				}
			};

			fetchProductSlug();
		}
	}, [handle, router]);

	return <div></div>;
};

export default ProductRedirect;
