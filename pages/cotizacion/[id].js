import React from 'react';
import { useRouter } from 'next/router';
import UserQuoteDetail from '../../components/UserQuoteDetail/UserQuoteDetail';
import { useAuth } from '../../hooks/auth';
import { useAppSelector } from '../../lib/hooks';
import { useEnv } from '../../context/EnvContext';
import Footer from '../../components/Footer/Footer';
import Head from 'next/head';

const QuotePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, loading } = useAuth();
  const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

  const {
    storeName,
    metaDescription,
    titlePostDescription,
  } = useEnv();

  // Redireccionar a login si no está autenticado
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [loading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // No renderizar nada mientras redirige
  }

  return (
    <div className="container">
      <Head>
        <title>{`Detalle de Cotización | ${storeName}: ${titlePostDescription}`}</title>
        <meta name="description" content={`${metaDescription}`} />
      </Head>

      <main className="main-content">
        <UserQuoteDetail quoteId={id} />
      </main>

      {!mobileView && <Footer />}

      <style jsx>{`
        .container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          flex: 1;
          padding: 20px 0;
        }
        
        @media (max-width: 768px) {
          .main-content {
            padding: 10px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default QuotePage; 