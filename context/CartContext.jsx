import React, {
	createContext,
	useState,
	useEffect,
	useLayoutEffect,
} from 'react';
import { useAuth } from '../hooks/auth';
import { useRouter } from 'next/router';
import GetShippingCost from '../hooks/GetShippingCost';
import { trackAddToCart, trackRemoveFromCart } from '../utils/analytics';
import { useApi } from '../hooks/useApi';
import {
	trackMetaAddToCart,
	trackMetaRemoveFromCart,
} from '../utils/metaAnalytics';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
	const { buildUrl } = useApi();
	const { isAuthenticated, accessToken, cartMsi, updateDataUser } = useAuth();
	const [cart, setCart] = useState([]);
	const [subtotal, setSubtotal] = useState(0);
	const [shipping, setShipping] = useState(129);
	const [total, setTotal] = useState(0);
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [address, setAddress] = useState(null);
	const [taxInvoice, setTaxInvoice] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState(null);

	// Funcion revision carrito local con backend
	const localcheckBackend = async (cartLocal = cart) => {
		setLoading(true);
		try {
			if (cartLocal.length > 0) {
				const response = await fetch(buildUrl('/cart/'), {
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
					// Validar que el servidor devolvió el formato correcto
					if (Array.isArray(backendCart.cart_items)) {
						setCart(backendCart.cart_items);
						setShipping(backendCart.shipping_cost ?? 129);
					} else {
						// Respuesta inesperada: mantener carrito local sin cambios
						console.warn('Respuesta de /cart inesperada, manteniendo carrito local:', backendCart);
						setCart(cartLocal);
					}
				}
			}
		} catch (err) {
			console.error('Error en localcheckBackend:', err);
			// Mantener el carrito local en caso de error de red
			setCart(cartLocal);
		} finally {
			setLoading(false);
		}
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
				let backendCartResponse = await fetch(buildUrl('/cart/'), {
					headers: { Authorization: `Bearer ${accessToken}` },
				});

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
						const addItemResponse = await fetch(buildUrl('/cart/'), {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${accessToken}`,
							},
							body: JSON.stringify({
								product_id: localItem.product.id,
								quantity: localItem.quantity,
							}),
						});

						if (addItemResponse.ok) {
							needsUpdate = true;
						}
					}
				}

				if (needsUpdate) {
					backendCartResponse = await fetch(buildUrl('/cart/'), {
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
						const response = await fetch(buildUrl('/cart/'), {
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
			// En lugar de calcular solo el peso total, pasamos el array de productos completo
			// para que la función pueda agruparlos por almacén
			const costoEnvio = GetShippingCost(cart);
			setShipping(costoEnvio);
		}
	}, [cart]);

	// Calcular subtotal, envío y total
	useEffect(() => {
		const preSubtotal = cart.reduce((acc, item) => {
			// Si el item tiene un unit_price y quote_id, usar ese precio (desde la cotización)
			if (item.unit_price && item.quote_id) {
				const priceTotal =
					parseInt(item.quantity) * parseFloat(item.unit_price);
				return acc + priceTotal;
			}

			// Sino, usar la lógica normal
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

	// Verificar si hay productos de cotización en el carrito
	const hasQuoteItems = cart.some((item) => item.quote_id && item.unit_price);

	// Agregar al Carrito
	const addToCart = async (
		product,
		quantity = 1,
		updateQuantity = false,
		quoteId = null
	) => {
		setLoading(true);

		// Si hay productos de cotización y este producto no pertenece a la misma cotización, bloquear
		if (hasQuoteItems && !quoteId) {
			// Si intentamos agregar un producto que no es de cotización, mostramos mensaje y bloqueamos
			alert(
				'No puedes añadir productos normales cuando tienes productos de cotización en el carrito.'
			);
			setLoading(false);
			return;
		}

		if (isAuthenticated) {
			try {
				const response = await fetch(buildUrl('/cart/'), {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify({
						product_id: product.id,
						quantity,
						update_quantity: updateQuantity,
						quote_id: quoteId,
					}),
				});

				if (response.ok) {
					const newItem = await response.json();
					setCart(newItem.cart_items);
					setShipping(newItem.shipping_cost);

					// Trackear evento de Google Analytics
					const cartValue = newItem.cart_items.reduce((acc, item) => {
						const price = !cartMsi
							? parseFloat(item.product.precio_contado)
							: parseFloat(item.product.precio_final_descuento) > 0
							? parseFloat(item.product.precio_final_descuento)
							: parseFloat(item.product.precio_final);
						return acc + price * item.quantity;
					}, 0);

					// Google Analytics
					trackAddToCart(product, quantity, cartValue);

					// Meta Pixel
					trackMetaAddToCart(product, quantity, cartValue);
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

				// Trackear evento de Google Analytics para carrito local
				const cartValue = prevCart.reduce((acc, item) => {
					const price = !cartMsi
						? parseFloat(item.product.precio_contado)
						: parseFloat(item.product.precio_final_descuento) > 0
						? parseFloat(item.product.precio_final_descuento)
						: parseFloat(item.product.precio_final);
					return acc + price * item.quantity;
				}, 0);

				// Google Analytics
				trackAddToCart(product, quantity, cartValue);

				// Meta Pixel
				trackMetaAddToCart(product, quantity, cartValue);
			} else {
				const prevCart = [
					...cart,
					{ id: product.id, product, quantity, quote_id: quoteId },
				];
				localcheckBackend(prevCart);

				// Trackear eventos de Analytics para nuevo producto en carrito local
				const cartValue = prevCart.reduce((acc, item) => {
					const price = !cartMsi
						? parseFloat(item.product.precio_contado)
						: parseFloat(item.product.precio_final_descuento) > 0
						? parseFloat(item.product.precio_final_descuento)
						: parseFloat(item.product.precio_final);
					return acc + price * item.quantity;
				}, 0);

				// Google Analytics
				trackAddToCart(product, quantity, cartValue);

				// Meta Pixel
				trackMetaAddToCart(product, quantity, cartValue);
			}
		}
		setLoading(false);
	};

	// Actualizar cantidad
	const updateQuantity = async (productId, newQuantity) => {
		if (isAuthenticated) {
			try {
				await fetch(buildUrl(`/cart/`), {
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
		// Ya no bloqueamos la eliminación de productos
		// El usuario debe poder eliminar productos de cotización si lo desea
		setLoading(true);
		if (isAuthenticated) {
			try {
				const response = await fetch(buildUrl(`/cart/${productId}/`), {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});

				if (response.ok) {
					const backendCart = await response.json();

					// Trackear evento de Google Analytics antes de actualizar el estado
					const removedProduct = cart.find(
						(item) => item.product.id === productId
					);
					if (removedProduct) {
						const cartValue = backendCart.cart_items.reduce((acc, item) => {
							const price = !cartMsi
								? parseFloat(item.product.precio_contado)
								: parseFloat(item.product.precio_final_descuento) > 0
								? parseFloat(item.product.precio_final_descuento)
								: parseFloat(item.product.precio_final);
							return acc + price * item.quantity;
						}, 0);

						// Google Analytics
						trackRemoveFromCart(
							removedProduct.product,
							removedProduct.quantity,
							cartValue
						);

						// Meta Pixel
						trackMetaRemoveFromCart(
							removedProduct.product,
							removedProduct.quantity,
							cartValue
						);
					}

					setCart(backendCart.cart_items);
					setShipping(backendCart.shipping_cost);
				}
			} catch (error) {
				console.error('Error removing item from cart:', error);
			}
		} else {
			// Trackear evento de Google Analytics para carrito local antes de remover
			const removedProduct = cart.find((item) => item.product.id === productId);
			if (removedProduct) {
				const newCart = cart.filter((item) => item.product.id !== productId);
				const cartValue = newCart.reduce((acc, item) => {
					const price = !cartMsi
						? parseFloat(item.product.precio_contado)
						: parseFloat(item.product.precio_final_descuento) > 0
						? parseFloat(item.product.precio_final_descuento)
						: parseFloat(item.product.precio_final);
					return acc + price * item.quantity;
				}, 0);

				trackRemoveFromCart(
					removedProduct.product,
					removedProduct.quantity,
					cartValue
				);
			}

			setCart((prevCart) =>
				prevCart.filter((item) => item.product.id !== productId)
			);
		}
		setLoading(false);
	};

	const clearCart = () => {
		// Ya no bloqueamos la limpieza del carrito
		// El usuario debe poder vaciar el carrito incluso con productos de cotización
		setLoading(true);
		setCart([]);
		if (isAuthenticated) {
			fetch(buildUrl('/cart/clear/'), {
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
				setPaymentMethod,
				hasQuoteItems,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export default CartContext;
