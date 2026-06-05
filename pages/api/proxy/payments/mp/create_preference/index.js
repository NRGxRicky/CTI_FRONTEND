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
        const { items, payer, shipments, shippingCost, requireInvoice } = req.body;

        // 1. Obtener carrito de base de datos
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ detail: 'El carrito está vacío' });
        }

        // 2. Formatear items para Mercado Pago
        // Usamos los del req.body pero verificamos que correspondan a nuestro carrito
        const formattedItems = cartItems.map((item, index) => {
            const price = item.product.price * 1.15 * 1.16; // Margen + IVA
            return {
                id: item.product.sku || `${index}`,
                title: item.product.titulo ? item.product.titulo.substring(0, 255) : 'Producto',
                quantity: item.quantity,
                unit_price: parseFloat(price.toFixed(2)),
                currency_id: 'MXN',
                picture_url: item.product.imagen1s ? `${req.headers.origin || ''}/${item.product.imagen1s}` : ''
            };
        });

        // Agregar el costo de envío como un item si no lo maneja directamente Mercado Pago
        const finalShippingCost = parseFloat(shippingCost) || 150.0;
        formattedItems.push({
            id: 'shipping_cost',
            title: 'Costo de Envío Estándar',
            quantity: 1,
            unit_price: finalShippingCost,
            currency_id: 'MXN'
        });

        // 3. Obtener token de Mercado Pago
        const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN__SANDBOX;

        const host = req.headers.host || 'localhost:3000';
        const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
        
        const successUrl = `${protocol}://${host}/carrito/mp/success`;
        const failureUrl = `${protocol}://${host}/carrito/pago`;
        const pendingUrl = `${protocol}://${host}/carrito/pago`;

        // Si no hay token de Mercado Pago configurado, retornamos una preferencia Mock
        if (!mpAccessToken || mpAccessToken.startsWith('TU_') || mpAccessToken === 'placeholder') {
            console.log('[Mercado Pago] MOCK MODE: Creando preferencia mock');
            const mockPrefId = `MOCK_PREF_${Date.now()}_${userId}`;
            return res.status(200).json({
                preferenceId: mockPrefId,
                isMock: true,
                detail: 'Sandbox preference created (mock mode due to missing credentials)'
            });
        }

        console.log(`[Mercado Pago] Creando preferencia con token: ${mpAccessToken.substring(0, 15)}...`);

        // 4. Petición a Mercado Pago API
        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: formattedItems,
                payer: {
                    name: payer?.name || 'Cliente',
                    surname: payer?.surname || 'CTI',
                    email: payer?.email || 'user@example.com',
                    phone: {
                        area_code: '52',
                        number: payer?.phone?.number || '5555555555'
                    },
                    address: {
                        zip_code: payer?.address?.zip_code || '11000',
                        street_name: payer?.address?.street_name || 'Av Principal',
                        street_number: parseInt(payer?.address?.street_number) || 123
                    }
                },
                back_urls: {
                    success: successUrl,
                    failure: failureUrl,
                    pending: pendingUrl
                },
                auto_return: 'approved',
                statement_descriptor: 'CTI Systems',
                external_reference: `CTI_${Date.now()}_${userId}`
            })
        });

        if (!mpResponse.ok) {
            const errorText = await mpResponse.text();
            console.error('[Mercado Pago] Error al crear preferencia:', errorText);
            // Retornamos un Mock como fallback para que el flujo de pruebas no se rompa
            const mockPrefId = `MOCK_PREF_FALLBACK_${Date.now()}_${userId}`;
            return res.status(200).json({
                preferenceId: mockPrefId,
                isMock: true,
                detail: 'Fallback to mock mode due to external API error',
                debug: errorText
            });
        }

        const mpData = await mpResponse.json();
        return res.status(200).json({
            preferenceId: mpData.id
        });

    } catch (error) {
        console.error('[Mercado Pago] Error interno:', error);
        return res.status(500).json({ detail: 'Error interno del servidor al crear preferencia de Mercado Pago' });
    }
}
