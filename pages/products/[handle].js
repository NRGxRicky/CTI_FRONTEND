import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '../../hooks/useApi';

const ProductRedirect = () => {
	const { buildUrl } = useApi();
	const router = useRouter();
	const { handle } = router.query;

	useEffect(() => {
    if (handle) {
      
			const cleanHandle = handle.split('?')[0];
      
			const fetchProductSlug = async () => {
				try {
					const response = await fetch(
						buildUrl('/shopify/get-product-by-slug/'),
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ handle: cleanHandle }),
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
