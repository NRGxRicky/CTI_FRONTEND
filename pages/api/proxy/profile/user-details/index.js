import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

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
    // Verificar Auth
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

    const db = getPrisma();

    if (req.method === 'GET') {
        try {
            const user = await db.user.findUnique({
                where: { id: decoded.user_id }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json({
                username: user.email,
                is_verified: user.is_verified,
                nombres: user.nombres || '',
                cart_msi: user.cart_msi
            });
        } catch (error) {
            return res.status(500).json({ error: 'Server Error' });
        }
    }

    if (req.method === 'POST') {
        const { cart_msi } = req.body;
        try {
            const updatedUser = await db.user.update({
                where: { id: decoded.user_id },
                data: { cart_msi: Boolean(cart_msi) }
            });

            return res.status(200).json({
                cart_msi: updatedUser.cart_msi
            });
        } catch (error) {
            return res.status(500).json({ error: 'Server Error' });
        }
    }

    return res.status(405).json({ detail: 'Method not allowed' });
}
