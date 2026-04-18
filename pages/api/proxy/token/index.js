import bcrypt from 'bcryptjs';
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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ detail: 'Faltan credenciales' });
    }

    try {
        const db = getPrisma();
        
        // Find user
        const user = await db.user.findUnique({
            where: { email: username.toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({ detail: 'No active account found with the given credentials' });
        }

        // Validate password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ detail: 'No active account found with the given credentials' });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { user_id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { user_id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            access: accessToken,
            refresh: refreshToken,
            lifetime: 3600 // 1 hr in seconds
        });

    } catch (error) {
        console.error('Token Error:', error);
        return res.status(500).json({ detail: 'Server Error' });
    }
}
