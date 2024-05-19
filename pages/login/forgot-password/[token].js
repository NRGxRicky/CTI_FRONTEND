import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/auth';
import Router from 'next/router';

export const getServerSideProps = async (context) => {
	return {
		props: {
			tokenRecovery: context.query.token,
		},
	};
};

const token = ({ tokenRecovery }) => {
	const { loading, isAuthenticated, login, logout } = useAuth();

	if (!loading && isAuthenticated) Router.push('/');

	return (
		<div className='container'>
			<p>{tokenRecovery}</p>
		</div>
	);
};

export default token;
