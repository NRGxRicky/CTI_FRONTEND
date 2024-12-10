import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/auth';
import { useRouter } from 'next/router';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
	const { isAuthenticated, accessToken } = useAuth();
	const [cart, setCart] = useState([]);
	const [subtotal, setSubtotal] = useState(0);
	const [shipping, setShipping] = useState(129);
	const [total, setTotal] = useState(0);
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	// Función para desplazar y enfocar CartSummaryMini


	// Sincronizar carrito local con backend cuando el usuario se autentica
	useEffect(() => {
		const syncCartWithBackend = async () => {
			setLoading(true)
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
			} catch (error) {
				console.error('Error syncing cart with backend:', error);
			}
			setLoading(false);
		};

		syncCartWithBackend();
	}, [isAuthenticated, accessToken]);

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

	// Guardar carrito local
	useEffect(() => {
		if (!isAuthenticated) {
			localStorage.setItem('cart', JSON.stringify(cart));
		}
	}, [cart, isAuthenticated]);

	// Calcular subtotal, envío y total
	useEffect(() => {
		const preSubtotal = cart.reduce(
			(acc, item) => acc + item.quantity * item.product.precio_final,
			0
		);
		setSubtotal(preSubtotal);
		setTotal(preSubtotal + shipping);
	}, [cart, shipping]);

	// Agregar al Carrito
	const addToCart = async (product, quantity = 1) => {
		setLoading(true)
		if (isAuthenticated) {
			try {
				const response = await fetch('https://api.pccdnapi.com/cart/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify({ product_id: product.id, quantity }),
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
				let finalQuantity = existingItem.quantity + quantity;

				if (finalQuantity > product.stock_total) {
					finalQuantity = product.stock_total;
				}

				setCart((prevCart) =>
					prevCart.map((item) =>
						item.product.id === product.id
							? { ...item, quantity: finalQuantity }
							: item
					)
				);
			} else {
				setCart([...cart, { id: product.id, product, quantity }]);
			}
		}
		setLoading(false)
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
		setLoading(true)
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
		setLoading(false)
	};

	const clearCart = () => {
		setLoading(true)
		setCart([]);
		if (isAuthenticated) {
			fetch('https://api.pccdnapi.com/cart/clear/', {
				method: 'POST',
				headers: { Authorization: `Bearer ${accessToken}` },
			});
		}
		setLoading(false)
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
				loading
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export default CartContext;
