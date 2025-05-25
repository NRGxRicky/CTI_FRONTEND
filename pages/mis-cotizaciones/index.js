import React from 'react';
import UserQuotesList from '../../components/UserQuotesList/UserQuotesList';
import UserNavLeft from '../../components/UserNavLeft/UserNavLeft';
import Footer from '../../components/Footer/Footer';
import Router from 'next/router';
import { useAuth } from '../../hooks/auth';
import { useAppSelector } from '../../lib/hooks';
import { useEnv } from '../../context/EnvContext';
import Head from 'next/head';

const index = () => {
  const { isAuthenticated, loading } = useAuth();
  const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

  const {
    storeName,
    metaDescription,
    titlePostDescription,
  } = useEnv();

  if (!loading && !isAuthenticated) {
    Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
  }

  return (
    <div className='container'>
      <Head>
        <title>
          {`Mis Cotizaciones | ${storeName}: ${titlePostDescription}`}
        </title>
        <meta name='description' content={`${metaDescription}`} />
      </Head>
      <div className='profile '>
        <UserNavLeft />
        <div className='main-wrapper'>
          <UserQuotesList />
        </div>
      </div>
      {!mobileView &&
        <Footer />
      }
      <style jsx>{`
				.main-wrapper {
					width: 100%;
				}
				.profile {
					display: flex;
					flex-wrap: nowrap;
          min-height: 50dvh;
				}

				.container {
					margin-top: 0;
				}

				@media only screen and (max-width: 60em) {

					.main-wrapper {
						width: 100%;
					}

					.profile {
						flex-direction: column;
					}
				}
			`}</style>
    </div>
  );
};

export default index; 