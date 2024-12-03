/* eslint-disable react/jsx-filename-extension */
import React, {
	useState,
	useEffect,
	useContext,
	ReactNode,
	createContext,
} from 'react';
import { useCookies } from 'react-cookie';

const API_URL = 'https://api.pccdnapi.com';

const makeUrl = (endpoint: string): string => `${API_URL}${endpoint}`;

const fetchToken = async (
	username: string,
	password: string
): Promise<Response> => {
	const url = makeUrl('/token/');
	try {
		const response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({ username, password }),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (response.status === 401) {
			console.clear();
		}

		return response;
	} catch (error) {
		console.error('Error in fetchToken:', error);
		return { ok: false } as Response;
	}
};

const fetchNewToken = (refresh: string): Promise<Response> => {
	const url = makeUrl('/token/refresh/');
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ refresh }),
	});
};

interface AuthContextProps {
	isAuthenticated: boolean;
	loading: boolean;
	login: (username: string, password: string) => Promise<Response>;
	logout: () => void;
	getToken: () => Promise<string | undefined>;
	accessToken: string;
	isVerified: boolean;
}

const AuthContext = createContext<AuthContextProps>({
	isAuthenticated: false,
	loading: true,
	login: async () => new Response(),
	logout: () => {},
	getToken: async () => undefined,
	accessToken: '',
	isVerified: false,
});

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isVerified, setIsverified] = useState(false);
	const [accessToken, setAccessToken] = useState('');
	const [refreshTokenValue, setRefreshToken] = useState('');
	const [accessTokenExpiry, setAccessTokenExpiry] = useState<number | null>(
		null
	);
	const [cookies, setCookies, removeCookie] = useCookies();

	const setNotAuthenticated = () => {
		setIsAuthenticated(false);
		setLoading(false);
	};

	const accessTokenIsValid = async (): Promise<boolean> => {
		if (!cookies || !cookies.tk_refresh) {
			setNotAuthenticated();
			return false;
		}

		const expireCookie = cookies.tk_expire || '';
		if (!expireCookie) {
			setCookies('tk_expire', Date.now().toString(), {
				path: '/',
				sameSite: true,
				secure: true,
			});
		}

		setRefreshToken(cookies.tk_refresh);
		setAccessTokenExpiry(Number(expireCookie));

		const nowDate = Date.now();
		if (Number(expireCookie) <= nowDate || accessToken === '') {
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

	const refreshToken = async (refresh: string): Promise<boolean> => {
		if (!refresh || refresh === 'undefined') {
			setLoading(false);
			return false;
		}

		setLoading(true);
		try {
			const resp = await fetchNewToken(refresh);
			if (!resp.ok) {
				setNotAuthenticated();
				return false;
			}

			const tokenData = await resp.json();
			handleNewToken(tokenData);
			return true;
		} catch (error) {
			console.error('Error in refreshToken:', error);
			setNotAuthenticated();
			return false;
		}
	};

	const handleNewToken = (data: any) => {
		setAccessToken(data.access);
		const expiryInt = new Date();
		const convertExpireDate = expiryInt.setSeconds(
			expiryInt.getSeconds() + data.lifetime
		);
		setAccessTokenExpiry(convertExpireDate);

		setCookies('tk_expire', convertExpireDate.toString(), {
			path: '/',
			sameSite: true,
			secure: true,
		});

		if (data.refresh) {
			setRefreshToken(data.refresh);
			setCookies('tk_refresh', data.refresh, {
				path: '/',
				sameSite: true,
				secure: true,
			});
		}

		setIsAuthenticated(true);
		setLoading(false);
	};

	const login = async (
		username: string,
		password: string
	): Promise<Response> => {
		setLoading(true);
		const resp = await fetchToken(username, password);

		if (resp.ok) {
			const tokenData = await resp.json();
			localStorage.setItem('name', tokenData.name);
			setIsverified(tokenData.is_verified);
			handleNewToken(tokenData);
		} else {
			setNotAuthenticated();
		}

		return resp;
	};

	const getToken = async (): Promise<string | undefined> => {
		if ((await accessTokenIsValid()) || loading) {
			return accessToken;
		}

		return undefined;
	};

	const logout = () => {
		setAccessToken('');
		setAccessTokenExpiry(null);
		setNotAuthenticated();
		removeCookie('tk_refresh');
		localStorage.removeItem('name');
	};

	const value: AuthContextProps = {
		isAuthenticated,
		loading,
		login,
		logout,
		getToken,
		accessToken,
		isVerified
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
