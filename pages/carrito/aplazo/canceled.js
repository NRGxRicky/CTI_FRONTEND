import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Preloader, TailSpin } from 'react-preloader-icon';
import { useAuth } from '../../../hooks/auth';

export default function AplazoCanceled() {
  const router = useRouter();
  const { orderId } = router.query;
  const { accessToken } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady) return; // Espera a que los parámetros estén listos

    async function cancelOrder() {
      try {
        const res = await fetch('https://api.pccdnapi.com/payments/aplazo/canceled', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ orderId }),
        });

        if (res.ok) {
          // Si se canceló (eliminó) la orden, redirige al usuario al carrito
          router.push('/carrito/');
          
        } else {
          const errData = await res.json();
          setError(errData.error || 'Error al cancelar la orden');

          // Derigir a carrito por posible error de que no exista.
          router.push('/carrito/');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión.');
      } finally {
        setProcessing(false);
      }
    }

    if (orderId && accessToken) {
      cancelOrder();
    }
  }, [accessToken, orderId]);

  if (processing) {
    return (
      <div className="component-loading">
        <div className="cart__loading__container">
          <Preloader
            use={TailSpin}
            size={30}
            strokeWidth={8}
            strokeColor="var(--primary-color)"
            duration={900}
          />
        </div>
        <style jsx>{`
          .component-loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .cart__loading__container {
            display: flex;
            justify-content: center;
            align-items: center;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Ocurrió un error</h2>
        <p>{error}</p>
        <button onClick={() => router.push('/')}>Volver a inicio</button>
        <style jsx>{`
          .container p {
            line-height: 1.5;
          }
          button {
            flex: 1;
            background: var(--primary-color);
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 10px;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
            margin-top: 40px;
          }
        `}</style>
      </div>
    );
  }

  return null; // Mientras se procesa o se redirige, no se muestra nada
}
