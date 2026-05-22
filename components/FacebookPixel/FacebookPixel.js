import React, { useState, useEffect } from 'react';
import Script from 'next/script'

const FacebookPixel = () => {
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

    // Fallback timer
    const timer = setTimeout(() => {
      setLoadScript(true);
      cleanup();
    }, 9000);

    return () => {
      cleanup();
      clearTimeout(timer);
    };
  }, []);

  if (!loadScript) return null;

  return (
    <div>
      <Script
        id="facebook-pixel"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n, arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL}');
            fbq('track', 'PageView');
            
            // Hacer fbq disponible globalmente para el tracking
            window.fbq_id = '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL}';
          `
        }}
      />

      {/* NoScript para navegadores que tengan desactivado JS */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL}&ev=PageView&noscript=1`}
        />
      </noscript>
    </div>
  );
};

export default FacebookPixel;