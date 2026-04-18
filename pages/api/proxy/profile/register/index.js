import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

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

    const { email, password, confirm_password, nombres } = req.body;

    if (!email || !password || (password !== confirm_password)) {
        return res.status(400).json({ detail: 'Datos inválidos o las contraseñas no coinciden' });
    }

    try {
        const db = getPrisma();

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return res.status(400).json({ detail: 'El correo electrónico ya está en uso.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await db.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                nombres: nombres || ''
            }
        });

        return res.status(201).json({
            detail: 'Usuario registrado exitosamente',
            user_id: newUser.id
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ detail: 'Error interno del servidor' });
    }
}
