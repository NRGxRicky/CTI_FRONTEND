import jwt from 'jsonwebtoken';
import prisma from '../../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'CTI_TEMP_SECRET_KEY';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ detail: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
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
        // Query addresses and tax invoices for the user
        const [domicilios, facturacion] = await Promise.all([
            db.address.findMany({
                where: { userId },
                orderBy: { id: 'asc' }
            }),
            db.taxInvoice.findMany({
                where: { userId },
                orderBy: { id: 'asc' }
            })
        ]);

        return res.status(200).json({
            domicilios: domicilios,
            PccomputoUsuarioDatosFacturacion: facturacion
        });

    } catch (error) {
        console.error('Error fetching profile resume:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
