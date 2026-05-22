import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useEnv } from '../../context/EnvContext';

const GoogleAnalytics = () => {
    const { googleAnalyticsId } = useEnv();
    const [loadScript, setLoadScript] = useState(false);

    useEffect(() => {
        const handleInteraction = () => {
            setLoadScript(true);
            cleanup();
        };

        const cleanup = () => {
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('click', handleInteraction);
        };

        // Listen for user interactions
        window.addEventListener('scroll', handleInteraction, { passive: true });
        window.addEventListener('mousemove', handleInteraction, { passive: true });
        window.addEventListener('touchstart', handleInteraction, { passive: true });
        window.addEventListener('click', handleInteraction, { passive: true });

        return () => {
            cleanup();
        };
    }, []);

    if (!loadScript) return null;

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