import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CurrencyFormat from '../../../hooks/CurrencyFormat';
import Image from 'next/image';
import useCart from '../../../hooks/useCart';

const index = () => {
  const router = useRouter();
  const { orderId } = router.query;

  const {
    clearCart
  } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`https://api.pccdnapi.com/orders/${orderId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Incluye autenticación si es necesaria
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else {
          const errData = await response.json();
          setError(errData.detail || 'Error al obtener la orden.');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión al obtener la orden.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className='container'>Loading...</div>;
  }

  if (error) {
    return (
      <div className='container'>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => router.push('/')}>Volver a la tienda</button>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <h2>No se encontró la orden</h2>
        <button onClick={() => router.push('/')}>Volver a la tienda</button>
      </div>
    );
  }

  return (
    <div className='container'>
      <div className='confirmation-page'>
        <h1>¡Gracias por tu compra!</h1>
        <p>Tu pedido ha sido confirmado exitosamente.</p>
        <h2>Detalles de la Orden #{order.id}</h2>

        <div className='order-details'>
          <h3>Productos:</h3>
          <table className='order-table'>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>SKU</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={`Imagen de ${item.producto_nombre}`}
                        width={60}
                        height={60}
                        objectFit='contain'
                      />
                    ) : (
                      <Image
                        src='https://via.placeholder.com/60'
                        alt='Sin imagen'
                        width={60}
                        height={60}
                        objectFit='contain'
                      />
                    )}
                  </td>
                  <td>{item.producto_nombre}</td>
                  <td>{item.sku}</td>
                  <td>{item.cantidad}</td>
                  <td>${CurrencyFormat(item.precio_unitario, 2, '.', ',')}</td>
                  <td>${CurrencyFormat(item.subtotal, 2, '.', ',')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='totals-section'>
            <p><strong>Envío:</strong> ${CurrencyFormat(order.shipping_cost, 2, '.', ',')}</p>
            <p><strong>Total:</strong> ${CurrencyFormat(order.total, 2, '.', ',')}</p>
          </div>

          <hr className='separator' />

          <h3>Datos de Envío:</h3>
          {order.domicilio ? (
            <p>
              Dirección: {order.domicilio.calle} {order.domicilio.numero}
              {order.domicilio.numero_interior ? ` Int. ${order.domicilio.numero_interior}` : ''},
              {order.domicilio.colonia}, {order.domicilio.ciudad}, {order.domicilio.estado},
              C.P. {order.domicilio.codigo_postal}
            </p>
          ) : (
            <p>No se registró dirección de envío.</p>
          )}

          <hr className='separator' />

          <h3>Datos de Facturación:</h3>
          {order.facturacion ? (
            <div>
              <p>Razón social: {order.facturacion.razon_social}</p>
              <p>RFC: {order.facturacion.rfc}</p>
              <p>Uso de CFDI: {order.uso_cfdi_full}</p>
              <p>Régimen: {order.regimen_full}</p>
              <p>Forma de Pago: {order.forma_pago_full}</p>
              <p>C.P.: {order.facturacion.codigo_postal}</p>
            </div>
          ) : (
            <p>No se ingresaron datos de facturación (RFC genérico).</p>
          )}
        </div>

        <button onClick={() => router.push('/')} className='continue-shopping'>
          Continuar comprando
        </button>
      </div>
      {/* ESTILOS */}
      <style jsx>
        {`
                    .confirmation-page {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        color: #333;
                    }

                    h1 {
                        color: var(--primary-color);
                        text-align: center;
                        margin-bottom: 20px;
                    }

                    h2 {
                        margin-top: 30px;
                        margin-bottom: 10px;
                    }

                    .order-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }

                    .order-table th,
                    .order-table td {
                        border: 1px solid #eaeaea;
                        padding: 10px;
                        text-align: center;
                    }

                    .order-table th {
                        background-color: #f2f2f2;
                    }

                    .totals-section {
                        text-align: right;
                        margin-top: 10px;
                        font-size: 16px;
                    }

                    .separator {
                        border: none;
                        border-top: 1px solid #eaeaea;
                        margin: 20px 0;
                    }

                    .continue-shopping {
                        display: block;
                        margin: 30px auto 0 auto;
                        padding: 10px 20px;
                        background-color: var(--primary-color);
                        color: #fff;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    }

                    .continue-shopping:hover {
                        background-color: #e00028;
                    }

                    @media only screen and (max-width: 600px) {
                        .order-table th,
                        .order-table td {
                            padding: 5px;
                        }

                        .confirmation-page {
                            padding: 10px;
                        }

                        .continue-shopping {
                            width: 100%;
                        }
                    }
                `}
      </style>
    </div>
  );
};

export default index;