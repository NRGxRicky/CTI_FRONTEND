import React, { useState } from 'react';
import { useAuth } from '../../hooks/auth';
import useCart from '../../hooks/useCart'; // Importa el hook personalizado
import {
	showCart,
} from '../../lib/features/showOpacityContainerSlide';
import { useAppDispatch } from '../../lib/hooks';

const ProductsButtonsActions = ({ product, quantity = 1 }) => {
	const [isLoading, setIsLoading] = useState(false);
	const { isAuthenticated } = useAuth(); // Accede a la autenticación
	const { addToCart: addProductToCart, syncCart } = useCart(); // Obtén las funciones del contexto del carrito
  
  const dispatch = useAppDispatch();

	const addToCart = async () => {
    setIsLoading(true);
		try {

			// Si el usuario está autenticado, agrega el producto al backend
			await addProductToCart(product, quantity, isAuthenticated);
			
		} catch (error) {
			console.error('Error al añadir al carrito:', error);
			alert('Hubo un error al añadir el producto al carrito.');
		} finally {
      setIsLoading(false);
      dispatch(showCart());
		}
	};

	const buyNow = async () => {
		try {
			if (isAuthenticated) {
				// Opción para sincronizar el carrito antes de proceder a la compra
				await syncCart();
			}
			alert('Función de "Comprar Ahora" en desarrollo.');
		} catch (error) {
			console.error('Error al procesar la compra:', error);
		}
	};

	return (
		<div>
			<div className='product__actions'>
				<a
					className={`product__actions__add-to-cart ${
						isLoading ? 'disabled' : ''
					}`}
          onClick={addToCart}
				>
					{isLoading ? 'Añadiendo...' : 'Añadir al Carrito'}
				</a>
				<a className='product__actions__buy' onClick={buyNow}>
					Comprar
				</a>
			</div>
			<style jsx>
				{`
					.product__actions {
						margin-top: 15px;
						display: flex;
						gap: 10px;
					}

					.product__actions__add-to-cart {
						line-height: 48px;
						height: 48px;
						position: relative;
						min-width: 150px;
						text-align: center;
						font-size: 16px;
						cursor: pointer;
						background-color: #ffb116;
						color: #ffffff;
						font-weight: 600;
						border-radius: 5px;
						padding: 0 10px;
						flex-grow: 1;
						transition: background-color 0.3s;
					}

					.product__actions__add-to-cart:hover {
						background-color: #ffa01b;
					}

					.product__actions__add-to-cart.disabled {
						background-color: #ccc;
						cursor: not-allowed;
					}

					.product__actions__buy {
						line-height: 48px;
						height: 48px;
						position: relative;
						padding: 0 10px;
						min-width: 150px;
						text-align: center;
						font-size: 16px;
						cursor: pointer;
						background-color: #ff002c;
						color: #ffffff;
						font-weight: 600;
						border-radius: 5px;
						flex-grow: 2;
						transition: background-color 0.3s;
					}

					.product__actions__buy:hover {
						background-color: #e00028;
					}

					@media only screen and (max-width: 62em) {
						.product__actions {
							flex-wrap: wrap;
						}
						.product__actions__add-to-cart,
						.product__actions__buy {
							flex: 0 0 100%;
						}
					}
				`}
			</style>
		</div>
	);
};

export default ProductsButtonsActions;
