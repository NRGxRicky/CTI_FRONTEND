/* global process */
import React from 'react';
import Script from 'next/script';
import { useEnv } from '../../context/EnvContext';

const GoogleAnalytics = () => {

    const { googleAnalyticsId } = useEnv();
    return (
        <div>
            <Script
                strategy='lazyOnload'
                src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            />

            <Script strategy='lazyOnload'>
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${googleAnalyticsId}', {
                        page_path: window.location.pathname,
                        send_page_view: false,  // Mejor para SPAs como Next.js
                        enhanced_ecommerce: true${process.env.NEXT_PUBLIC_DEBUG === 'true' ? `,
                        debug_mode: true,
                        cookie_domain: 'none'` : ''}
                    });
                    
                    // Hacer gtag disponible globalmente para el tracking
                    window.gtag_id = '${googleAnalyticsId}';
                `}
            </Script>
        </div>
    );
};

export default GoogleAnalytics;