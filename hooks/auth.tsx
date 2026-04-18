/* eslint-disable react/jsx-filename-extension */
import React, {
	useState,
	useEffect,
	useContext,
	ReactNode,
	createContext,
	Dispatch,
	SetStateAction,
} from 'react';
import { useCookies } from 'react-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const makeUrl = (endpoint: string): string => {
	const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	return `/api/proxy${normalized}`;
};

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

const fetchUpdateDataUser = (
	token: string,
	cart_msi: boolean
): Promise<Response> => {
	const url = makeUrl('/profile/user-details/');
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			cart_msi: cart_msi,
		}),
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
	updateDataUser: (CartStatus: boolean) => void;
	setCartMsi: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextProps>({
	isAuthenticated: false,
	loading: true,
	login: async () => new Response(),
	logout: () => { },
	getToken: async () => undefined,
	accessToken: '',
	isVerified: false,
	username: '',
	nombres: '',
	cartMsi: false,
	updateDataUser: async () => undefined,
	setCartMsi: () => { },
});

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isVerified, setIsverified] = useState(true);
	const [cartMsi, setCartMsi] = useState<boolean>(() => {
		if (typeof window !== 'undefined') {
			const storedValue = localStorage.getItem('cart_msi');
			return storedValue ? JSON.parse(storedValue) : false;
		}
		return false; // Valor predeterminado para el entorno no navegador
	});
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
				setCartMsi(dataUser.cart_msi);
			}
		} else {
			setUsername('');
			setIsverified(false);
			setNombres('Iniciar sesión / Registrarse');
		}
	};

	const updateDataUser = async (cartStatus: boolean) => {
		if (isAuthenticated) {
			const responseUpdateDataUser = await fetchUpdateDataUser(
				accessToken,
				cartStatus
			);
			if (responseUpdateDataUser.ok) {
				const dataUser = await responseUpdateDataUser.json();
				setCartMsi(dataUser.cart_msi);
			}
		} else {
			setCartMsi(cartStatus);
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

			// Notifica a otras pestañas sobre el inicio de sesión usando BroadcastChannel
			try {
				const authChannel = new BroadcastChannel('auth-sync');
				authChannel.postMessage({ type: 'login' });
				authChannel.close();
			} catch (error) {
				// BroadcastChannel no disponible
			}
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

	// Listener para sincronizar entre pestañas usando BroadcastChannel
	useEffect(() => {
		let authChannel: BroadcastChannel | null = null;

		try {
			authChannel = new BroadcastChannel('auth-sync');

			authChannel.onmessage = (event) => {
				if (event.data.type === 'logout') {
					setNotAuthenticated();
				}
				if (event.data.type === 'login') {
					initAuth();
				}
			};
		} catch (error) {
			// BroadcastChannel no disponible, usar localStorage como fallback
			console.warn('BroadcastChannel not available, using localStorage fallback');

			const handleStorageChange = (event: StorageEvent) => {
				if (event.key === 'auth-logout') {
					setNotAuthenticated();
				}
				if (event.key === 'auth-login') {
					initAuth();
				}
			};

			window.addEventListener('storage', handleStorageChange);

			return () => {
				window.removeEventListener('storage', handleStorageChange);
			};
		}

		return () => {
			if (authChannel) {
				authChannel.close();
			}
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
		cartMsi,
		setCartMsi,
		updateDataUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
