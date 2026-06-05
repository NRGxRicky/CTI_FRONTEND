import jwt from 'jsonwebtoken';
import prisma from '../../../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'CTI_TEMP_SECRET_KEY';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
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
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Se requiere el ID de la dirección.' });
        }

        // Verify address belongs to the user
        const targetAddress = await db.address.findFirst({
            where: { id: Number(id), userId }
        });

        if (!targetAddress) {
            return res.status(404).json({ message: 'Dirección no encontrada.' });
        }

        // Deactivate all addresses for the user and activate the target one in a transaction
        await db.$transaction([
            db.address.updateMany({
                where: { userId },
                data: { active: false }
            }),
            db.address.update({
                where: { id: Number(id) },
                data: { active: true }
            })
        ]);

        return res.status(200).json({ message: 'Dirección activa configurada correctamente.' });

    } catch (error) {
        console.error('Error setting active address:', error);
        return res.status(500).json({ message: 'Error interno al configurar dirección activa.' });
    }
}
