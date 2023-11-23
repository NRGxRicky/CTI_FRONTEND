import React from 'react';
import Script from 'next/script';

const GoogleAnalytics = () => {
  return (
		<div>
			<Script
				strategy='lazyOnload'
				src={`https://www.googletagmanager.com/gtag/js?id=G-Q8Q9XX84ZT`}
			/>

			<Script strategy='lazyOnload'>
				{`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-Q8Q9XX84ZT', {
                    page_path: window.location.pathname,
                    });
                `}
			</Script>
		</div>
	);
};

export default GoogleAnalytics;