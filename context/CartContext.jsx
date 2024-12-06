import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/auth';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
	const { isAuthenticated, accessToken } = useAuth();
	const [cart, setCart] = useState([]);
	const [subtotal, setSubtotal] = useState(0);
	const [shipping, setShipping] = useState(129);
	const [total, setTotal] = useState(0);

	// Sincronizar carrito local con backend cuando el usuario se autentica
	useEffect(() => {
		const syncCartWithBackend = async () => {
			if (isAuthenticated) {
				try {
					const response = await fetch('https://api.pccdnapi.com/cart/', {
						headers: { Authorization: `Bearer ${accessToken}` },
					});

					if (response.ok) {
						const backendCart = await response.json();

						setCart(backendCart.cart_items);
						setShipping(backendCart.shipping_cost)
					}
				} catch (error) {
					console.error('Error syncing cart with backend:', error);
				}
			} else {
				const localCart = JSON.parse(localStorage.getItem('cart')) || [];
				setCart(localCart);
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


	useEffect(() => {
		// Calcular subtotal, envío y total
		const preSubtotal = cart.reduce(
			(acc, item) => acc + item.quantity * item.product.precio_final,
			0
		);
		setSubtotal(preSubtotal) // Envío gratuito si el subtotal es mayor a $1000
		setTotal(preSubtotal + shipping);
	}, [cart])

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

					console.log(newItem)

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
			const existingItem = cart.find((item) => item.product_id === product.id);
			if (existingItem) {
				setCart(
					cart.map((item) =>
						item.product_id === product.id
							? { ...item, quantity: item.quantity + quantity }
							: item
					)
				);
			} else {
				setCart([...cart, { product_id: product.id, quantity }]);
			}
		}
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
			setCart((prevCart) =>
				prevCart.filter((item) => item.product_id !== productId)
			);
		}
	};

	// Vaciar el carrito
	const clearCart = async () => {
		if (isAuthenticated) {
			try {
				await fetch('https://api.pccdnapi.com/cart/clear/', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				setCart([]);
			} catch (error) {
				console.error('Error clearing backend cart:', error);
			}
		} else {
			setCart([]);
		}
	};

	return (
		<CartContext.Provider
			value={{
				cart, // Alias para cart
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
