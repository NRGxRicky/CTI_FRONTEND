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
            rfc,
            razon_social,
            regimen,
            uso_de_cfdi,
            forma_de_pago,
            codigo_postal
        } = req.body;

        if (!rfc || !razon_social || !regimen || !uso_de_cfdi || !forma_de_pago || !codigo_postal) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados.' });
        }

        let taxInvoice;

        if (id) {
            // Update existing billing profile
            const existing = await db.taxInvoice.findFirst({
                where: { id: Number(id), userId }
            });

            if (!existing) {
                return res.status(404).json({ message: 'Registro de facturación no encontrado.' });
            }

            taxInvoice = await db.taxInvoice.update({
                where: { id: Number(id) },
                data: {
                    rfc,
                    razon_social,
                    regimen,
                    uso_de_cfdi,
                    forma_de_pago,
                    codigo_postal
                }
            });
        } else {
            // Check if user has any other billing profiles. If none, make active.
            const invoiceCount = await db.taxInvoice.count({
                where: { userId }
            });

            const makeActive = invoiceCount === 0;

            taxInvoice = await db.taxInvoice.create({
                data: {
                    userId,
                    rfc,
                    razon_social,
                    regimen,
                    uso_de_cfdi,
                    forma_de_pago,
                    codigo_postal,
                    active: makeActive
                }
            });
        }

        return res.status(200).json(taxInvoice);

    } catch (error) {
        console.error('Error adding/updating tax invoice profile:', error);
        return res.status(500).json({ message: 'Error interno al guardar los datos fiscales.' });
    }
}
