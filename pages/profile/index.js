import React from 'react';
import AccountSummary from '../../components/AccountSummary/AccountSummary';
import UserNavLeft from '../../components/UserNavLeft/UserNavLeft';
import Footer from '../../components/Footer/Footer';
import Router from 'next/router';
import { useAuth } from '../../hooks/auth';
import { useAppSelector } from '../../lib/hooks';
import { useEnv } from '../../context/EnvContext';
import Head from 'next/head';
import Link from 'next/link';

const index = () => {
  const { isAuthenticated, loading, isVerified } = useAuth();
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
          {`Resumen de tu cuenta | ${storeName}: ${titlePostDescription}`}
        </title>
        <meta name='description' content={`${metaDescription}`} />
      </Head>
      <div className='profile'>
        <UserNavLeft />
        <div className='main-wrapper'>
          {!isVerified && (
            <Link href={'/profile/verify-email/resend-email'} legacyBehavior>
              <a>
                <div className='alert'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='var(--primary-color)'
                    viewBox='0 0 24 24'
                    width='24'
                    height='24'
                  >
                    <path d='M1 21h22L12 2 1 21zm13-3h-4v-2h4v2zm0-4h-4v-4h4v4z' />
                  </svg>
                  <span>
                    Atención: se requiere verificación de tu Email. Haz clic
                    aquí para más detalles.
                  </span>
                </div>
              </a>
            </Link>
          )}
         <AccountSummary />
        </div>
      </div>
      {!mobileView &&
        < Footer />
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