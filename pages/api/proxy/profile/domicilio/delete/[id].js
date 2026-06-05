import jwt from 'jsonwebtoken';
import prisma from '../../../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'CTI_TEMP_SECRET_KEY';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ detail: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Se requiere el ID de la dirección.' });
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
        // Verify address belongs to the user
        const existing = await db.address.findFirst({
            where: { id: Number(id), userId }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Dirección no encontrada.' });
        }

        // Delete address
        await db.address.delete({
            where: { id: Number(id) }
        });

        // If the deleted address was active, set another one as active
        if (existing.active) {
            const nextAddress = await db.address.findFirst({
                where: { userId }
            });

            if (nextAddress) {
                await db.address.update({
                    where: { id: nextAddress.id },
                    data: { active: true }
                });
            }
        }

        return res.status(200).json({ message: 'Dirección eliminada correctamente.' });

    } catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).json({ message: 'Error interno al eliminar la dirección.' });
    }
}
