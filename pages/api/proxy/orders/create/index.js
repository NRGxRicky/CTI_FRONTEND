import jwt from 'jsonwebtoken';
import prisma from '../../../../../lib/prisma';
import { IngramAdapter } from '../../../../../services/wholesalers/IngramAdapter';

const JWT_SECRET = process.env.JWT_SECRET || 'CTI_TEMP_SECRET_KEY';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ detail: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ detail: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return res.status(401).json({ detail: 'Token is invalid or expired' });
    }

    const db = prisma;
    const userId = decoded.user_id;

    try {
        const {
            payment_method,
            payment_id,
            result_indicator,
            success_indicator,
            paypalData,
            mpPaymentData,
            address,
            requireInvoice
        } = req.body;

        if (!payment_method) {
            return res.status(400).json({ detail: 'El método de pago es requerido' });
        }

        // 1. Fetch User Cart
        const cartItems = await db.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) {
            // Verificar si la orden ya existe (para evitar errores en doble callback o reintento de recarga)
            let existingOrderId = null;
            if (payment_method === 'globalpayments' && payment_id) {
                // Buscamos si ya existe una orden con ese paymentId
                const existingOrder = await db.order.findFirst({
                    where: { userId, paymentId: payment_id }
                });
                if (existingOrder) {
                    return res.status(200).json({
                        detail: 'Orden previamente procesada con éxito',
                        orderId: existingOrder.id,
                        status: existingOrder.status
                    });
                }
            }
            return res.status(400).json({ detail: 'El carrito está vacío o la orden ya fue procesada' });
        }

        // 2. Calcular los montos y preparar items
        let subtotal = 0;
        const orderItemsData = cartItems.map(item => {
            // Re-calculamos el precio real por seguridad (no confiar en el frontend)
            const price = item.product.price * 1.15 * 1.16; // Margen + IVA
            subtotal += price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: parseFloat(price.toFixed(2))
            };
        });

        const shipping = 150.0;
        const total = parseFloat((subtotal + shipping).toFixed(2));

        // 3. Verificar el pago según el método
        let transactionId = payment_id || `TX_${Date.now()}`;
        
        if (payment_method === 'globalpayments') {
            if (!result_indicator || !success_indicator) {
                return res.status(400).json({ detail: 'Indicadores de pago faltantes' });
            }

            if (result_indicator !== success_indicator) {
                console.error('[Global Payments] Desajuste de indicadores:', { result_indicator, success_indicator });
                return res.status(400).json({ detail: 'El pago no pudo ser verificado. Los indicadores no coinciden.' });
            }

            // Realizar verificación secundaria del lado del servidor contra la API de Global Payments si no es de pruebas
            const merchantId = process.env.GLOBAL_PAYMENTS_MERCHANT_ID || 'TEST_MERCHANT_ID';
            const apiPassword = process.env.GLOBAL_PAYMENTS_API_PASSWORD || 'TEST_API_PASSWORD';
            const gatewayUrl = process.env.GLOBAL_PAYMENTS_GATEWAY_URL || 'https://evopaymentsmexico.gateway.mastercard.com';

            if (merchantId !== 'TU_MERCHANT_ID_DE_PRUEBAS') {
                try {
                    const authString = `merchant.${merchantId}:${apiPassword}`;
                    const basicAuth = Buffer.from(authString).toString('base64');
                    const getOrderUrl = `${gatewayUrl}/api/rest/version/61/merchant/${merchantId}/order/${payment_id}`;
                    
                    console.log(`[Global Payments] Verificando orden en Gateway: ${getOrderUrl}`);
                    const checkRes = await fetch(getOrderUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Basic ${basicAuth}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (!checkRes.ok) {
                        const checkErr = await checkRes.text();
                        console.error('[Global Payments] Error al consultar orden en gateway:', checkErr);
                        return res.status(400).json({ detail: 'No se pudo verificar el pago con el banco.', debug: checkErr });
                    }

                    const gatewayOrder = await checkRes.json();
                    console.log('[Global Payments] Gateway Order status:', gatewayOrder.status);

                    if (gatewayOrder.status !== 'CAPTURED' && gatewayOrder.status !== 'SUCCESS' && gatewayOrder.status !== 'APPROVED') {
                        return res.status(400).json({ detail: `El pago no está aprobado. Estado en banco: ${gatewayOrder.status}` });
                    }
                } catch (error) {
                    console.error('[Global Payments] Excepción verificando orden con gateway:', error);
                    return res.status(500).json({ detail: 'Error interno al comunicarse con el banco.' });
                }
            } else {
                console.log('[Global Payments] MOCK MODE: Saltando verificación con Gateway.');
            }

            transactionId = payment_id;
        } else if (payment_method === 'paypal') {
            if (!paypalData) {
                return res.status(400).json({ detail: 'Datos de PayPal faltantes' });
            }
            transactionId = paypalData.id || transactionId;
        } else if (payment_method === 'mercadopago') {
            if (!mpPaymentData) {
                return res.status(400).json({ detail: 'Datos de Mercado Pago faltantes' });
            }
            transactionId = mpPaymentData.payment_id || mpPaymentData.collection_id || transactionId;
            
            // Validar que el pago haya sido aprobado
            if (mpPaymentData.status !== 'approved' && mpPaymentData.status !== 'SUCCESS') {
                return res.status(400).json({ detail: `El pago de Mercado Pago no está aprobado. Estado: ${mpPaymentData.status}` });
            }
        }

        // 4. Crear Orden Transaccional local y vaciar el carrito
        const [order] = await db.$transaction([
            db.order.create({
                data: {
                    userId: userId,
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    shipping: shipping,
                    total: total,
                    status: 'PAID',
                    paymentId: transactionId,
                    paymentMethod: payment_method,
                    items: {
                        create: orderItemsData
                    }
                }
            }),
            db.cart.deleteMany({
                where: { userId }
            })
        ]);

        console.log(`[Checkout] Orden CTI-${order.id} creada localmente. Estado: PAID.`);

        // 5. Automatización B2B: Enviar orden a Ingram Micro
        let ingramResponse = null;
        try {
            const user = await db.user.findUnique({ where: { id: userId } });
            
            const fallbackAddress = address || {
                calle: 'Av Principal',
                numero: '123',
                ciudad: 'Mexico City',
                estado: 'DF',
                codigo_postal: '11000',
                telefono: user?.telefono || '0000000000'
            };

            console.log(`[Checkout] Enviando orden CTI-${order.id} a Ingram Micro`);
            ingramResponse = await IngramAdapter.createIngramOrder(
                order.id,
                order.total,
                cartItems,
                fallbackAddress,
                user
            );

            console.log(`[Checkout] Respuesta de Ingram Micro:`, ingramResponse);

            // Actualizar status de la orden a INGRAM_SYNCED
            await db.order.update({
                where: { id: order.id },
                data: {
                    status: 'INGRAM_SYNCED',
                    ingramOrderId: ingramResponse?.orderNumber || 'API_SYNCED'
                }
            });

        } catch (ingramError) {
            console.error('CRITICAL: Falló la sincronización automática con Ingram API:', ingramError);
            // IMPORTANTE: Retornamos 200 porque el cliente YA PAGÓ. 
            // El administrador del backend puede re-sincronizar después.
        }

        return res.status(200).json({
            detail: 'Orden procesada exitosamente',
            orderId: order.id,
            ingramResponse
        });

    } catch (error) {
        console.error('[Checkout Error]:', error);
        return res.status(500).json({ detail: 'Error interno del servidor al procesar la orden' });
    }
}
