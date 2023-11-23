/* eslint-disable react/jsx-filename-extension */
import React, { useState, useEffect, useContext } from 'react';
import { useCookies } from 'react-cookie';

const API_URL = 'https://api.pccdnapi.com';
const API_URLx = 'http://api.pccomputo.local:8000';

const makeUrl = (endpoint) => API_URL + endpoint;

const fetchToken = (username, password) => {
	const url = makeUrl('/token/');
	try {
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify({ username, password }),
			headers: {
				'Content-Type': 'application/json',
			},
		}).then((response) => {
			if (response.status == 401) {
				console.clear();
      }
      return response
		});
	} catch (error) {
		return { ok: false };
	}
};

const fetchNewToken = (refresh) => {
	const url = makeUrl('/token/refresh/');
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ refresh }),
	});
};

const AuthContext = React.createContext({});

export const AuthProvider = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [accessToken, setAccessToken] = useState('');
	const [refreshTokenValue, setRefreshToken] = useState('');
	const [accessTokenExpiry, setAccessTokenExpiry] = useState(null);
	const [cookies, setCookies, removeCookie] = useCookies(['tk_refresh']);

	const setNotAuthenticated = () => {
		setIsAuthenticated(false);
		setLoading(false);
	};

	const accessTokenIsValid = async () => {
		if (String(cookies.tk_refresh) === 'undefined') {
			setIsAuthenticated(false);
			setLoading(false);
			return false;
		}
		if (cookies.tk_expire === '') {
			setCookies('tk_expire', Date.now(), {
				path: '/',
				sameSite: true,
				secure: true
			});
		}

		setRefreshToken(cookies.tk_refresh);
		setAccessTokenExpiry(cookies.tk_expire);

		const nowDate = parseInt(Date.now());
		if (parseInt(cookies.tk_expire) <= nowDate || accessToken === '') {
			const response = await refreshToken(cookies.tk_refresh);
			return response;
		} else {
			setIsAuthenticated(true);
			setLoading(false);
			return true;
		}
	};

	const initAuth = async () => {
		setLoading(true);
		await accessTokenIsValid();
	};

	useEffect(() => {
		initAuth();
	}, []);

	const refreshToken = async (refress) => {
		if (refress !== '' && refress !== 'undefined') {
			setLoading(true);
			const resp = await fetchNewToken(refress);
			if (!resp.ok) {
				setNotAuthenticated();
				return false;
			}
			const tokenData = await resp.json();
			handleNewToken(tokenData);
			return tokenData;
		}
		setLoading(false);
		return false;
	};

	const handleNewToken = (data) => {
		setAccessToken(data.access);
		const expiryInt = new Date();
		const convertExpireDate = expiryInt.setSeconds(
			expiryInt.getSeconds() + data.lifetime
		);
		setAccessTokenExpiry(convertExpireDate);
		setCookies('tk_expire', convertExpireDate, {
			path: '/',
			sameSite: true,
				secure: true
		});
		if (data.refresh) {
			setRefreshToken(data.refresh);
			setCookies('tk_refresh', data.refresh, {
				path: '/',
				sameSite: true,
					secure: true
			});
		}
		setIsAuthenticated(true);
		setLoading(false);
	};

	const login = async (username, password) => {
		setLoading(true);
		const resp = await fetchToken(username, password);
		if (resp.ok) {
			const tokenData = await resp.json();
			localStorage.setItem('name', tokenData.name);
			handleNewToken(tokenData);
		} else {
			setIsAuthenticated(false);
			setLoading(false);
			// Let the page handle the error
		}
		return resp;
	};

	const getToken = async () => {
		// Returns an access token if there's one or refetches a new one
		if (accessTokenIsValid()) {
			return Promise.resolve(accessToken);
		} else if (loading) {
			// Assume this means the token is in the middle of refreshing
			return Promise.resolve(accessToken);
		}
	};

	const logout = () => {
		setAccessToken('');
		setAccessTokenExpiry(null);
		setNotAuthenticated();
		removeCookie('tk_refresh');
		localStorage.removeItem('name');
	};

	const value = {
		isAuthenticated,
		loading,
		login,
		logout,
		getToken,
		accessToken,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
