import React, {
	createContext,
	useState,
	useEffect,
	useLayoutEffect,
} from 'react';
import { useAuth } from '../hooks/auth';
import { useRouter } from 'next/router';
import GetShippingCost from '../hooks/GetShippingCost';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
	const { isAuthenticated, accessToken, cartMsi, updateDataUser } = useAuth();
	const [cart, setCart] = useState([]);
	const [subtotal, setSubtotal] = useState(0);
	const [shipping, setShipping] = useState(139);
	const [total, setTotal] = useState(0);
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [address, setAddress] = useState(null);
	const [taxInvoice, setTaxInvoice] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState(null);

	// Funcion revision carrito local con backend
	const localcheckBackend = async (cartLocal = cart) => {
		setLoading(true);
		if (cartLocal.length > 0) {
			const response = await fetch('https://api.pccdnapi.com/cart/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					cart: cartLocal,
				}),
			});
			if (response.ok) {
				const backendCart = await response.json();
				setCart(backendCart.cart_items);
				setShipping(backendCart.shipping_cost);
			}
		}
		setLoading(false);
	};

	// Sincronizar carrito local con backend cuando el usuario se autentica
	useEffect(() => {
		const syncCartWithBackend = async () => {
			setLoading(true);
			if (!isAuthenticated) {
				const localCart = JSON.parse(localStorage.getItem('cart')) || [];
				setCart(localCart);
				setLoading(false);
				return;
			}

			try {
				let backendCartResponse = await fetch(
					'https://api.pccdnapi.com/cart/',
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					}
				);

				if (!backendCartResponse.ok) {
					console.error('Error fetching backend cart.');
					setLoading(false);
					return;
				}

				let backendCart = await backendCartResponse.json();
				const localCart = JSON.parse(localStorage.getItem('cart')) || [];

				let needsUpdate = false;

				for (const localItem of localCart) {
					const existingItem = backendCart.cart_items.find(
						(item) => item.product.id === localItem.product.id
					);

					if (!existingItem) {
						const addItemResponse = await fetch(
							'https://api.pccdnapi.com/cart/',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${accessToken}`,
								},
								body: JSON.stringify({
									product_id: localItem.product.id,
									quantity: localItem.quantity,
								}),
							}
						);

						if (addItemResponse.ok) {
							needsUpdate = true;
						}
					}
				}

				if (needsUpdate) {
					backendCartResponse = await fetch('https://api.pccdnapi.com/cart/', {
						headers: { Authorization: `Bearer ${accessToken}` },
					});

					if (backendCartResponse.ok) {
						backendCart = await backendCartResponse.json();
					}
				}

				setCart(backendCart.cart_items);
				setShipping(backendCart.shipping_cost);
				localStorage.removeItem('cart');
				localStorage.removeItem('cart_msi');
			} catch (error) {
				console.error('Error syncing cart with backend:', error);
			}
			setLoading(false);
		};

		syncCartWithBackend();
	}, [isAuthenticated, accessToken]);

	// Revisar Carrito local
	useEffect(() => {
		if (!isAuthenticated) {
			localcheckBackend(cart);
		}
	}, []);

	// Actualizar carrito al cambiar de ruta
	useEffect(() => {
		const handleRouteChange = () => {
			if (!isAuthenticated) {
				const localCart = JSON.parse(localStorage.getItem('cart')) || [];
				setCart(localCart);
			} else {
				(async () => {
					try {
						const response = await fetch('https://api.pccdnapi.com/cart/', {
							headers: { Authorization: `Bearer ${accessToken}` },
						});

						if (response.ok) {
							const backendCart = await response.json();
							setCart(backendCart.cart_items);
							setShipping(backendCart.shipping_cost);
						}
					} catch (error) {
						console.error('Error fetching cart on route change:', error);
					}
				})();
			}
		};

		router.events.on('routeChangeComplete', handleRouteChange);

		return () => {
			router.events.off('routeChangeComplete', handleRouteChange);
		};
	}, [router.events, isAuthenticated, accessToken]);

	useEffect(() => {
		// Verifica si estás en el cliente antes de acceder a localStorage
		if (typeof window !== 'undefined' && !isAuthenticated) {
			localStorage.setItem('cart', JSON.stringify(cart));
		}
	}, [cart, isAuthenticated]);

	useEffect(() => {
		// Verifica si estás en el cliente antes de acceder a localStorage
		if (typeof window !== 'undefined' && !isAuthenticated) {
			// Obtener el valor de localCartMsi y convertirlo a booleano si existe
			const localCartMsi = localStorage.getItem('cart_msi');
			const parsedLocalCartMsi = localCartMsi
				? JSON.parse(localCartMsi)
				: false;

			// Si el valor actual en localStorage es diferente del estado, sincronízalos
			if (parsedLocalCartMsi !== cartMsi) {
				localStorage.setItem('cart_msi', JSON.stringify(cartMsi));
			}
		}
	}, [cartMsi]);

	// Calcular Peso total local
	useEffect(() => {
		if (!isAuthenticated) {
			let pesoTotal = parseFloat(0);
			cart.map(
				(item) => (pesoTotal += parseFloat(item.product.peso * item.quantity))
			);
			const costoEnvio = GetShippingCost(pesoTotal);
			setShipping(costoEnvio);
		}
	}, [cart]);

	// Calcular subtotal, envío y total
	useEffect(() => {
		const preSubtotal = cart.reduce((acc, item) => {
			const price = !cartMsi
				? parseFloat(item.product.precio_contado)
				: parseFloat(item.product.precio_final_descuento) > 0
				? parseFloat(item.product.precio_final_descuento)
					: parseFloat(item.product.precio_final);
			const priceTotal = parseInt(item.quantity) * price;
			return acc + priceTotal;
		}, 0);

		setSubtotal(preSubtotal);
		setTotal(preSubtotal + shipping);
	}, [cart, shipping, cartMsi]);

	// Agregar al Carrito
	const addToCart = async (product, quantity = 1, updateQuantity = false) => {
		setLoading(true);
		if (isAuthenticated) {
			try {
				const response = await fetch('https://api.pccdnapi.com/cart/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify({
						product_id: product.id,
						quantity,
						update_quantity: updateQuantity,
					}),
				});

				if (response.ok) {
					const newItem = await response.json();
					setCart(newItem.cart_items);
					setShipping(newItem.shipping_cost);
				}
			} catch (error) {
				console.error('Error adding to backend cart:', error);
			}
		} else {
			const existingItem = cart.find((item) => item.product.id === product.id);
			if (existingItem) {
				let finalQuantity = 0;
				if (updateQuantity) {
					finalQuantity = quantity;
				} else {
					finalQuantity = existingItem.quantity + quantity;
				}
				if (finalQuantity > product.stock_total) {
					finalQuantity = product.stock_total;
				}

				const prevCart = cart.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: finalQuantity }
						: item
				);
				localcheckBackend(prevCart);
			} else {
				const prevCart = [...cart, { id: product.id, product, quantity }];
				localcheckBackend(prevCart);
			}
		}
		setLoading(false);
	};

	// Actualizar cantidad
	const updateQuantity = async (productId, newQuantity) => {
		if (isAuthenticated) {
			try {
				await fetch(`https://api.pccdnapi.com/cart/`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify({
						product_id: productId,
						quantity: newQuantity,
					}),
				});
				setCart((prevCart) =>
					prevCart.map((item) =>
						item.product.id === productId
							? { ...item, quantity: newQuantity }
							: item
					)
				);
			} catch (error) {
				console.error('Error updating quantity:', error);
			}
		} else {
			setCart((prevCart) =>
				prevCart.map((item) =>
					item.product_id === productId
						? { ...item, quantity: newQuantity }
						: item
				)
			);
		}
	};

	// Eliminar del carrito
	const removeFromCart = async (productId) => {
		setLoading(true);
		if (isAuthenticated) {
			try {
				const response = await fetch(
					`https://api.pccdnapi.com/cart/${productId}/`,
					{
						method: 'DELETE',
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);

				if (response.ok) {
					const backendCart = await response.json();
					setCart(backendCart.cart_items);
				}
			} catch (error) {
				console.error('Error removing item from cart:', error);
			}
		} else {
			setCart((prevCart) =>
				prevCart.filter((item) => item.product.id !== productId)
			);
		}
		setLoading(false);
	};

	const clearCart = () => {
		setLoading(true);
		setCart([]);
		if (isAuthenticated) {
			fetch('https://api.pccdnapi.com/cart/clear/', {
				method: 'POST',
				headers: { Authorization: `Bearer ${accessToken}` },
			});
		}
		setLoading(false);
	};

	return (
		<CartContext.Provider
			value={{
				cart,
				addToCart,
				removeFromCart,
				clearCart,
				subtotal,
				shipping,
				total,
				loading,
				address,
				setAddress,
				taxInvoice,
				setTaxInvoice,
				paymentMethod,
				setPaymentMethod
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export default CartContext;
