import jwt from 'jsonwebtoken';
import prisma from '../../../../../../lib/prisma';

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

    const userId = decoded.user_id;

    try {
        // 1. Obtener carrito de la base de datos
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ detail: 'El carrito está vacío' });
        }

        // 2. Calcular montos de forma segura en backend (margen + IVA)
        let subtotal = 0;
        cartItems.forEach(item => {
            const price = item.product.price * 1.15 * 1.16;
            subtotal += price * item.quantity;
        });

        const shipping = 150.0;
        const total = parseFloat((subtotal + shipping).toFixed(2));

        // 3. Obtener credenciales del gateway
        const merchantId = process.env.GLOBAL_PAYMENTS_MERCHANT_ID || 'TEST_MERCHANT_ID';
        const apiPassword = process.env.GLOBAL_PAYMENTS_API_PASSWORD || 'TEST_API_PASSWORD';
        const gatewayUrl = process.env.GLOBAL_PAYMENTS_GATEWAY_URL || 'https://evopaymentsmexico.gateway.mastercard.com';

        // 4. Construir URL de callback dinámica (local vs producción)
        const host = req.headers.host || 'localhost:3000';
        const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
        const returnUrl = `${protocol}://${host}/carrito/global/callback`;

        // Generar ID único para rastrear la orden/sesión
        const orderId = `CTI_${Date.now()}_${userId}`;

        // 5. Consumir la API REST de Global Payments para iniciar la sesión de Hosted Checkout
        // Basic Auth en MPGS usa: 'merchant.<merchantId>:<apiPassword>'
        const authString = `merchant.${merchantId}:${apiPassword}`;
        const basicAuth = Buffer.from(authString).toString('base64');

        const sessionEndpoint = `${gatewayUrl}/api/rest/version/61/merchant/${merchantId}/session`;

        console.log(`[Global Payments] Iniciando sesión para Orden ${orderId}, Total: $${total} MXN`);
        console.log(`[Global Payments] Usando Endpoint: ${sessionEndpoint}`);

        if (merchantId === 'TU_MERCHANT_ID_DE_PRUEBAS') {
            console.log(`[Global Payments] Modo Sandbox / Mock activado para TU_MERCHANT_ID_DE_PRUEBAS`);
            return res.status(200).json({
                sessionId: `MOCK_SESSION_${Date.now()}_${userId}`,
                successIndicator: `MOCK_INDICATOR_${orderId}`,
                orderId: orderId,
                merchantId: merchantId,
                amount: total
            });
        }

        const gatewayResponse = await fetch(sessionEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiOperation: 'INITIATE_CHECKOUT',
                interaction: {
                    operation: 'PURCHASE',
                    returnUrl: returnUrl,
                    merchant: {
                        name: 'CTI Systems'
                    }
                },
                order: {
                    currency: 'MXN',
                    amount: total,
                    id: orderId,
                    description: `Compra de ${cartItems.length} producto(s) en CTI Systems`
                }
            })
        });

        if (!gatewayResponse.ok) {
            const errorText = await gatewayResponse.text();
            console.error('[Global Payments] Error del Gateway al crear sesión:', errorText);
            return res.status(502).json({ 
                detail: 'Error al comunicarse con la pasarela de pagos del banco',
                debug: errorText
            });
        }

        const sessionData = await gatewayResponse.json();

        if (sessionData.result === 'SUCCESS') {
            return res.status(200).json({
                sessionId: sessionData.session.id,
                successIndicator: sessionData.successIndicator,
                orderId: orderId,
                merchantId: merchantId,
                amount: total
            });
        } else {
            console.error('[Global Payments] El Gateway no devolvió SUCCESS:', sessionData);
            return res.status(400).json({ 
                detail: 'No se pudo inicializar la sesión de pago correctamente',
                gatewayData: sessionData 
            });
        }

    } catch (error) {
        console.error('[Global Payments] Error interno en sesión:', error);
        return res.status(500).json({ detail: 'Error interno del servidor al iniciar pasarela' });
    }
}
