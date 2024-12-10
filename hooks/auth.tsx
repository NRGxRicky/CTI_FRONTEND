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
		return { ok: false } as Response;
	}
};

const fetchDataUser = (token: string): Promise<Response> => {
	const url = makeUrl('/profile/user-details/');
	return fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});
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
	username: string;
	nombres: string;
	cartMsi: boolean;
}

const AuthContext = createContext<AuthContextProps>({
	isAuthenticated: false,
	loading: true,
	login: async () => new Response(),
	logout: () => {},
	getToken: async () => undefined,
	accessToken: '',
	isVerified: false,
	username: '',
	nombres: '',
	cartMsi: false,
});

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isVerified, setIsverified] = useState(true);
	const [cartMsi, setCartMsi] = useState(false);
	const [accessToken, setAccessToken] = useState('');
	const [username, setUsername] = useState('');
	const [nombres, setNombres] = useState('Iniciar sesión / Registrarse');
	const [refreshTokenValue, setRefreshToken] = useState('');
	const [accessTokenExpiry, setAccessTokenExpiry] = useState<number | null>(
		null
	);
	const [cookies, setCookies, removeCookie] = useCookies();

	const setNotAuthenticated = () => {
		setIsAuthenticated(false);
		setLoading(false);
	};

	const setDataUser = async () => {
		if (isAuthenticated) {
			const responseUserData = await fetchDataUser(accessToken);
			if (responseUserData.ok) {
				const dataUser = await responseUserData.json();
				setUsername(dataUser.username);
				setIsverified(dataUser.is_verified);
				setNombres(dataUser.nombres);
				setCartMsi(dataUser.cart_msi)
			}
		} else {
			setUsername('');
			setIsverified(false);
			setCartMsi(false);
			setNombres('Iniciar sesión / Registrarse');
		}
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
				sameSite: 'strict',
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

	useEffect(() => {
		setDataUser();
	}, [isAuthenticated]);

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
			sameSite: 'strict',
			secure: true,
		});

		if (data.refresh) {
			setRefreshToken(data.refresh);
			setCookies('tk_refresh', data.refresh, {
				path: '/',
				sameSite: 'strict',
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
			handleNewToken(tokenData);

			// Notifica a otras pestañas sobre el inicio de sesión
			localStorage.setItem('login', Date.now().toString());
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
		removeCookie('tk_refresh', {
			path: '/',
			sameSite: 'strict',
			secure: true,
		});
		setAccessToken('');
		setAccessTokenExpiry(null);
		setNotAuthenticated();

		// Notifica a otras pestañas
		localStorage.setItem('logout', Date.now().toString());
	};

	// Listener para sincronizar entre pestañas
	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === 'logout') {
				// Cerrar sesión en otras pestañas
				setNotAuthenticated();
			}

			if (event.key === 'login') {
				// Intentar revalidar sesión si otra pestaña inició sesión
				initAuth();
			}
		};

		window.addEventListener('storage', handleStorageChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);

	const value: AuthContextProps = {
		isAuthenticated,
		loading,
		login,
		logout,
		getToken,
		accessToken,
		isVerified,
		username,
		nombres,
		cartMsi
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
