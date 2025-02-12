import React from 'react';
import UserNavLeft from '../../../components/UserNavLeft/UserNavLeft';
import Footer from '../../../components/Footer/Footer';
import Router from 'next/router';
import { useAuth } from '../../../hooks/auth';
import { useAppSelector } from '../../../lib/hooks';
import { useEnv } from '../../../context/EnvContext';
import Head from 'next/head';
import ProfileAddressesSection from '../../../components/ProfileAddressesSection/ProfileAddressesSection';

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
          {`Direcciones de envió y Facturación | ${storeName}: ${titlePostDescription}`}
        </title>
        <meta name='description' content={`${metaDescription}`} />
      </Head>
      <div className='profile '>
        <UserNavLeft />
        <div className='main-wrapper'>
          <div className='profile__title'>
            <h2>Direcciones de envió y Facturación</h2>
          </div>
          <ProfileAddressesSection />
        </div>
      </div>
      {!mobileView &&
        < Footer />
      }
      <style jsx>{`
				.main-wrapper {
					width: calc(100% - 200px);
          padding: 0 20px;
          margin-left: 20px;
				}
				.profile {
					display: flex;
					flex-wrap: nowrap;
          min-height: 50dvh;
				}

        .profile__title {
					font-weight: 600;
					margin-left: 20px;
					display: flex;
					height: 50px;
					align-items: flex-end;
				}

				.container {
					margin-top: 0;
				}

				@media only screen and (max-width: 60em) {

					.main-wrapper {
						width: 100%;
            margin-left: 0;
            padding: 0;
					}

					.profile {
						flex-direction: column;
					}

          .profile__title {
						margin-bottom: 10px;
					}

				}
			`}</style>
    </div>
  );
};

export default index;