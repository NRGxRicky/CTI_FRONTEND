import jwt from 'jsonwebtoken';
import prisma from '../../../../../../lib/prisma';
import { IngramAdapter } from '../../../../../../services/wholesalers/IngramAdapter';

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
        return res.status(401).json({ error: 'Token is invalid or expired' });
    }

    const userId = decoded.user_id;
    const db = prisma;

    try {
        // 1. Obtener carrito del usuario para verificar montos y stock
        const cartItems = await db.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ detail: 'El carrito está vacío' });
        }

        // 2. Calcular montos reales
        let subtotal = 0;
        const orderItemsData = cartItems.map(item => {
            const price = item.product.price * 1.15 * 1.16; // Margen + IVA
            subtotal += price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: parseFloat(price.toFixed(2))
            };
        });

        // Obtener dirección activa del usuario para Ingram Micro
        const activeAddress = await db.address.findFirst({
            where: { userId, active: true }
        });

        const shippingCost = 150.0;
        const total = parseFloat((subtotal + shippingCost).toFixed(2));

        // 3. Crear la orden localmente en estado PAID
        const transactionId = `APLAZO_${Date.now()}_${userId}`;
        
        const [order] = await db.$transaction([
            db.order.create({
                data: {
                    userId: userId,
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    shipping: shippingCost,
                    total: total,
                    status: 'PAID', // Se asume pagado/aprobado para el flujo mock sandbox
                    paymentId: transactionId,
                    paymentMethod: 'aplazo',
                    items: {
                        create: orderItemsData
                    }
                }
            }),
            db.cart.deleteMany({
                where: { userId }
            })
        ]);

        console.log(`[Aplazo] Orden CTI-${order.id} creada en base de datos.`);

        // 4. Sincronizar automáticamente con Ingram Micro (B2B Automation)
        let ingramResponse = null;
        try {
            const user = await db.user.findUnique({ where: { id: userId } });
            
            // Construir dirección de envío para Ingram
            const fallbackAddress = activeAddress ? {
                calle: activeAddress.calle,
                numero: activeAddress.numero,
                ciudad: activeAddress.ciudad,
                estado: activeAddress.estado,
                codigo_postal: activeAddress.codigo_postal,
                telefono: activeAddress.telefono || user?.telefono || '0000000000'
            } : {
                calle: 'Av Principal',
                numero: '123',
                ciudad: 'Puebla',
                estado: 'Pue',
                codigo_postal: '72000',
                telefono: user?.telefono || '0000000000'
            };

            console.log(`[Aplazo] Sincronizando orden CTI-${order.id} con Ingram Micro API`);
            ingramResponse = await IngramAdapter.createIngramOrder(
                order.id,
                order.total,
                cartItems,
                fallbackAddress,
                user
            );

            // Actualizar status de la orden a INGRAM_SYNCED
            await db.order.update({
                where: { id: order.id },
                data: {
                    status: 'INGRAM_SYNCED',
                    ingramOrderId: ingramResponse?.orderNumber || 'API_SYNCED'
                }
            });
            console.log(`[Aplazo] Orden CTI-${order.id} sincronizada con éxito en Ingram.`);

        } catch (ingramError) {
            console.error('CRITICAL: Falló la sincronización automática con Ingram API:', ingramError);
        }

        // 5. Retornar URL de callback exitosa para el redirect del frontend
        const host = req.headers.host || 'localhost:3000';
        const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
        const successUrl = `${protocol}://${host}/carrito/aplazo/success?orderId=${order.id}`;

        return res.status(200).json({
            status: 'success',
            aplazo_response: {
                url: successUrl
            },
            orderId: order.id,
            ingramResponse
        });

    } catch (error) {
        console.error('[Aplazo API Error]:', error);
        return res.status(500).json({ detail: 'Error interno al inicializar pago con Aplazo' });
    }
}
