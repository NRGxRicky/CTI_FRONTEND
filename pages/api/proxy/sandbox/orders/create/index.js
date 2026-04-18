import jwt from 'jsonwebtoken';
import { PrismaClient, OrderStatus } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import IngramAdapter from '../../../../../../services/wholesalers/IngramAdapter';

const JWT_SECRET = process.env.JWT_SECRET || 'CTI_TEMP_SECRET_KEY';

let prisma;
function getPrisma() {
    if (!prisma) {
        const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
    }
    return prisma;
}

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

    const db = getPrisma();
    const userId = decoded.user_id;

    try {
        const { payment_method, total_amount, sandboxPayment } = req.body;

        // 1. Fetch User Cart
        const cartItems = await db.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ detail: 'El carrito está vacío' });
        }

        // 2. Calcular los montos y crear la orden
        let subtotal = 0;
        const orderItemsData = cartItems.map(item => {
            // Re-calculamos el precio real por seguridad (no confiar en el frontend)
            const price = item.product.price * 1.15 * 1.16; // Margen + IVA (igual que mapProductToFrontend)
            subtotal += price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: price
            };
        });

        const shipping = 150.0;
        const total = subtotal + shipping;

        // Validar que el total cobrado coincida con nuestro back (con un margen de error menor por redondeos)
        // O lo ignoramos por tratarse de la fase sandbox
        
        // 3. Crear Orden Transaccional
        const [order] = await db.$transaction([
            db.order.create({
                data: {
                    userId: userId,
                    subtotal: subtotal,
                    shipping: shipping,
                    total: total,
                    status: 'PAID', // In sandbox we assume it is paid instantly
                    paymentId: sandboxPayment?.transactionId || 'SANDBOX_TX_123',
                    paymentMethod: payment_method || 'sandbox',
                    items: {
                        create: orderItemsData
                    }
                }
            }),
            db.cart.deleteMany({
                where: { userId }
            })
        ]);

        // ==========================================
        // API INGRAM MICRO: PILOTO AUTOMÁTICO B2B
        // ==========================================
        let ingramResponse = null;
        try {
            // Buscamos el email del Customer y enviamos a Ingram 
            // address viene en req.body si está en el frontend
            const { sandboxPayment } = req.body;
            const fallbackAddress = sandboxPayment?.address || {
                calle: 'Av Principal', numero: '123', ciudad: 'Mexico City', estado: 'EM', codigo_postal: '11000'
            };
            const user = await db.user.findUnique({ where: { id: userId } });

            console.log(`Disparando webhook hacia Ingram Micro para la Orden CTI-${order.id}`);
            
            ingramResponse = await IngramAdapter.createIngramOrder(
                order.id, 
                order.total, 
                cartItems, 
                fallbackAddress, 
                user
            );

            // Actualizar status si es exitoso
            await db.order.update({
                where: { id: order.id },
                data: {
                    status: 'INGRAM_SYNCED',
                    ingramOrderId: ingramResponse?.orderNumber || 'API_SYNCED'
                }
            });

        } catch (ingramError) {
            console.error('CRITICAL: Fallo la sincronización con Ingram API:', ingramError);
            // De igual modo retornamos 200 al frontend porque el cliente YA PAGÓ
            // El administrador tendrá que revisar el log o el panel de base de datos
        }
        
        return res.status(200).json({
            detail: 'Orden procesada y solicitada a Ingram Micro',
            orderId: order.id,
            ingramResponse
        });

    } catch (error) {
        console.error('Checkout Error:', error);
        return res.status(500).json({ detail: 'Error interno al crear orden' });
    }
}
