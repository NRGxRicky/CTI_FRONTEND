import jwt from 'jsonwebtoken';
import prisma from '../../../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'CTI_TEMP_SECRET_KEY';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ detail: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Se requiere el ID del registro de facturación.' });
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
        // Verify invoice belongs to the user
        const existing = await db.taxInvoice.findFirst({
            where: { id: Number(id), userId }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Registro de facturación no encontrado.' });
        }

        // Delete invoice profile
        await db.taxInvoice.delete({
            where: { id: Number(id) }
        });

        // If it was active, activate another one if available
        if (existing.active) {
            const nextInvoice = await db.taxInvoice.findFirst({
                where: { userId }
            });

            if (nextInvoice) {
                await db.taxInvoice.update({
                    where: { id: nextInvoice.id },
                    data: { active: true }
                });
            }
        }

        return res.status(200).json({ message: 'Registro de facturación eliminado correctamente.' });

    } catch (error) {
        console.error('Error deleting tax invoice:', error);
        return res.status(500).json({ message: 'Error interno al eliminar el registro de facturación.' });
    }
}
