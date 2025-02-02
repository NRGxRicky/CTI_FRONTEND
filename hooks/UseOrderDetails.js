import { useEffect, useState } from 'react';
import { useAuth } from './auth';

export function UseOrderDetails(orderId) {
  const { accessToken } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || !accessToken) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const url = `https://api.pccdnapi.com/orders/${orderId}/`;
        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!resp.ok) {
          throw new Error('Error al obtener la orden');
        }
        const data = await resp.json();
        console.log(data)
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, accessToken]);

  return { order, loading, error };
}