import React, { useState, useEffect } from 'react';
import { useEnv } from '../../context/EnvContext';
import { useAuth } from '../../hooks/auth';

function ShippingQuote({ productId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingData, setShippingData] = useState(null);
  const { storeId } = useEnv();
  const { accessToken } = useAuth();

  useEffect(() => {
    async function fetchShipping() {
      try {
        setLoading(true);
        setError(null);

        // Petición al endpoint de Django
        const response = await fetch('https://api.pccdnapi.com/services/quote/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            store_id: storeId,
            product_id: productId
            // Si tu endpoint requiere algo más, agrégalo aquí
          })
        });

        if (!response.ok) {
          throw new Error('Error al obtener la cotización de envío');
        }

        const data = await response.json();
        setShippingData(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) {
      fetchShipping();
    }
  }, [accessToken]);

  if (loading) {
    return <p>Cargando cotización...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!shippingData) {
    return <p>No hay datos de envío disponibles.</p>;
  }

  /*
    Aquí depende totalmente de cómo tu endpoint retorne los datos.
    Por ejemplo, Envía.com suele regresar algo como:
    {
      "data": [
        {
          "carrier": "DHL",
          "service": "express",
          "total_price": 129.0,
          "days": "2-5",
          ...
          "delivery_estimate": {
             "min_date": "2025-03-02",
             "max_date": "2025-03-07"
          }
        }
      ]
    }

    Supongamos que shippingData tiene forma:
    { data: [ { carrier, total_price, delivery_estimate: { min_date, max_date } } ] }
  */
  const { data } = shippingData;
  if (!data || !data.length) {
    return <p>No se encontraron cotizaciones de envío.</p>;
  }

  // Tomemos la primera opción de envío como ejemplo
  const rate = data[0];
  const price = rate.total_price;
  const minDate = rate.delivery_estimate?.min_date;
  const maxDate = rate.delivery_estimate?.max_date;

  // Ejemplo: formatear fechas en español
  const formatDateEs = (isoDate) => {
    if (!isoDate) return '';
    const dateObj = new Date(isoDate);
    return dateObj.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const fechaMin = formatDateEs(minDate);
  const fechaMax = formatDateEs(maxDate);

  return (
    <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
      <p>
        Recíbelo por <strong>${price}</strong> entre el <strong>{fechaMin}</strong>
        &nbsp;y el <strong>{fechaMax}</strong>
      </p>
    </div>
  );
}

export default ShippingQuote;
