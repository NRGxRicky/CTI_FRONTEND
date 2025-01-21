import React from 'react';
import UserOrdersList from '../../components/UserOrdersList/UserOrdersList';
import UserNavLeft from '../../components/UserNavLeft/UserNavLeft';
import FooterMini from '../../components/FooterMini/FooterMini';
import Router from 'next/router';
import { useAuth } from '../../hooks/auth';
import { useAppSelector } from '../../lib/hooks';

const index = () => {
  const { isAuthenticated, loading } = useAuth();
  const mobileView = useAppSelector((state) => state.mobileSlide.mobileView);

  if (!loading && !isAuthenticated) {
    Router.push(`/login?redirect=${encodeURIComponent(Router.asPath)}`);
  }


  return (
    <div className='container'>
      <div className='profile '>
        <UserNavLeft />
        <div className='main-wrapper'>
          <UserOrdersList />
        </div>
      </div>
      {!mobileView &&
        < FooterMini />
      }
      <style jsx>{`
				.main-wrapper {
					width: calc(100% - 200px);
				}
				.profile {
					display: flex;
					flex-wrap: nowrap;
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