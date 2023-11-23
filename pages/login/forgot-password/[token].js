import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';
import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile,
} from 'react-device-detect';

export const getServerSideProps = async (context) => {
	return {
		props: {
			tokenRecovery: context.query.token,
		},
	};
};

const token = ({ tokenRecovery }) => {
	const [tempMobile, setTempMobile] = useState(false);
	const { loading, isAuthenticated, login, logout } = useAuth();

	useEffect(() => {
		setTempMobile(isMobile);
	}, [isMobile]);

	if (!loading && isAuthenticated) Router.push('/');

	return (
		<div className='container'>
			<p>{tokenRecovery}</p>
		</div>
	);
};

export default token;
