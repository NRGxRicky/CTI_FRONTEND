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
        const {
            id,
            nombres,
            apellidos,
            telefono,
            calle,
            numero,
            numero_interior,
            colonia,
            codigo_postal,
            ciudad,
            estado,
            referencias
        } = req.body;

        if (!nombres || !apellidos || !telefono || !calle || !numero || !colonia || !codigo_postal || !ciudad || !estado) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados.' });
        }

        let address;

        if (id) {
            // Update existing address
            // Verify address belongs to the user
            const existing = await db.address.findFirst({
                where: { id: Number(id), userId }
            });

            if (!existing) {
                return res.status(404).json({ message: 'Dirección no encontrada.' });
            }

            address = await db.address.update({
                where: { id: Number(id) },
                data: {
                    nombres,
                    apellidos,
                    telefono,
                    calle,
                    numero,
                    numero_interior: numero_interior || null,
                    colonia,
                    codigo_postal,
                    ciudad,
                    estado,
                    referencias: referencias || null
                }
            });
        } else {
            // Check if user has any other addresses. If none, make this active.
            const addressCount = await db.address.count({
                where: { userId }
            });

            const makeActive = addressCount === 0;

            address = await db.address.create({
                data: {
                    userId,
                    nombres,
                    apellidos,
                    telefono,
                    calle,
                    numero,
                    numero_interior: numero_interior || null,
                    colonia,
                    codigo_postal,
                    ciudad,
                    estado,
                    referencias: referencias || null,
                    active: makeActive
                }
            });
        }

        return res.status(200).json(address);

    } catch (error) {
        console.error('Error adding/updating address:', error);
        return res.status(500).json({ message: 'Error interno al guardar la dirección.' });
    }
}
