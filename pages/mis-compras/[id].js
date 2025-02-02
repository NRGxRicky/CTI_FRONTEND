import React from 'react';
import UserOrderDetail from '../../components/UserOrderDetail/UserOrderDetail'
import UserNavLeft from '../../components/UserNavLeft/UserNavLeft';
import Footer from '../../components/Footer/Footer';
import Router from 'next/router';
import { useAuth } from '../../hooks/auth';
import { useAppSelector } from '../../lib/hooks';
import { useEnv } from '../../context/EnvContext';
import Head from 'next/head';
import { useRouter } from 'next/router';

const index = () => {
  const { isAuthenticated, loading } = useAuth();
  const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);
  const router = useRouter();
  const { id } = router.query; 

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
          {`Detalle de compra #${id} | ${storeName}: ${titlePostDescription}`}
        </title>
        <meta name='description' content={`${metaDescription}`} />
      </Head>
      <div className='profile '>
        <UserNavLeft />
        <div className='main-wrapper'>
          <UserOrderDetail orderId={id} />
        </div>
      </div>
        < Footer />
      <style jsx>{`
				.main-wrapper {
					width: calc(100% - 200px);
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