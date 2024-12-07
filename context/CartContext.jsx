import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/auth';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
	const { isAuthenticated, accessToken, logout } = useAuth();
	const [cart, setCart] = useState([]);
	const [subtotal, setSubtotal] = useState(0);
	const [shipping, setShipping] = useState(129);
	const [total, setTotal] = useState(0);

	// Sincronizar carrito local con backend cuando el usuario se autentica
	useEffect(() => {
		const syncCartWithBackend = async () => {
			if (!isAuthenticated) {
				// Usuario no autenticado: cargar carrito local
				const localCart = JSON.parse(localStorage.getItem('cart')) || [];
				setCart(localCart);
				return;
			}

			try {
				// Obtener el carrito del backend
				let backendCartResponse = await fetch(
					'https://api.pccdnapi.com/cart/',
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					}
				);

				if (!backendCartResponse.ok) {
					console.error('Error fetching backend cart.');
					return;
				}

				let backendCart = await backendCartResponse.json();
				const localCart = JSON.parse(localStorage.getItem('cart')) || [];
				let needsUpdate = false;

				// Sincronizar artículos locales con el backend
				for (const localItem of localCart) {
					const existingItem = backendCart.cart_items.find(
						(item) => item.product.id === localItem.product.id
					);

					if (!existingItem) {
						// Agregar artículo local al backend
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

				// Si se actualizó el backend, volver a obtener el carrito
				if (needsUpdate) {
					backendCartResponse = await fetch('https://api.pccdnapi.com/cart/', {
						headers: { Authorization: `Bearer ${accessToken}` },
					});

					if (backendCartResponse.ok) {
						backendCart = await backendCartResponse.json();
					}
				}

				// Actualizar carrito con datos del backend y limpiar carrito local
				setCart(backendCart.cart_items);
				setShipping(backendCart.shipping_cost);
				localStorage.removeItem('cart');
			} catch (error) {
				console.error('Error syncing cart with backend:', error);
			}
		};

		syncCartWithBackend();
	}, [isAuthenticated, accessToken]);

	// Guardar carrito local en localStorage
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

	// Agregar al carrito
	const addToCart = async (product, quantity = 1) => {
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

					setShipping(newItem.shipping_cost);

					setCart((prevCart) => {
						const existingItem = prevCart.find(
							(item) => item.product.id === product.id
						);
						if (existingItem) {
							return prevCart.map((item) =>
								item.product.id === product.id
									? { ...item, quantity: newItem.cart_items.quantity }
									: item
							);
						} else {
							return [...prevCart, newItem.cart_items];
						}
					});
				}
			} catch (error) {
				console.error('Error adding to backend cart:', error);
			}
		} else {
			const existingItem = cart.find((item) => item.id === product.id);
			if (existingItem) {
				let finalQuantity = existingItem.quantity + quantity;
				if (finalQuantity > product.stock_total) {
					finalQuantity = product.stock_total;
				}
				setCart(
					cart.map((item) =>
						item.id === product.id ? { ...item, quantity: finalQuantity } : item
					)
				);
			} else {
				setCart([...cart, { id: product.id, product: product, quantity }]);
			}
		}
	};

	// Eliminar carrito local al cerrar sesión
	useEffect(() => {
		const clearLocalCartOnLogout = () => {
			if (!isAuthenticated) {
				localStorage.removeItem('cart');
			}
		};
		clearLocalCartOnLogout();
	}, [isAuthenticated]);

	// Eliminar del carrito
	const removeFromCart = async (productId) => {
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
					const newCart = await response.json();

					setShipping(newCart.shipping_cost);
					setCart((prevCart) =>
						prevCart.filter((item) => item.id !== productId)
					);
				}
			} catch (error) {
				console.error('Error removing from backend cart:', error);
			}
		} else {
			setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
		}
	};

	// Vaciar el carrito
	const clearCart = async () => {
		if (isAuthenticated) {
			try {
				const response = await fetch('https://api.pccdnapi.com/cart/clear/', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				const backendCart = await response.json();

				setCart(backendCart.cart_items);
			} catch (error) {
				console.error('Error clearing backend cart:', error);
			}
		} else {
			setCart([]);
		}
	};

	const updateQuantity = async (productId, newQuantity) => {
		if (isAuthenticated) {
			try {
				const response = await fetch('https://api.pccdnapi.com/cart/', {
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

				if (response.ok) {
					const updatedCart = await response.json();
					setCart((prevCart) =>
						prevCart.map((item) =>
							item.product.id === productId
								? { ...item, quantity: newQuantity }
								: item
						)
					);
					setShipping(updatedCart.shipping_cost);
				}
			} catch (error) {
				console.error('Error updating quantity:', error);
			}
		} else {
			setCart((prevCart) =>
				prevCart.map((item) =>
					item.product.id === productId
						? { ...item, quantity: newQuantity }
						: item
				)
			);
		}
	};

	return (
		<CartContext.Provider
			value={{
				cart,
				addToCart,
				updateQuantity,
				removeFromCart,
				clearCart,
				subtotal,
				shipping,
				total,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export default CartContext;
