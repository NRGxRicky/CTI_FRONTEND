import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'CTI_TEMP_SECRET_KEY';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ detail: 'Method not allowed' });
    }

    const { refresh } = req.body;
    
    if (!refresh) {
        return res.status(400).json({ detail: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refresh, JWT_SECRET);

        // Generate new access token
        const newAccessToken = jwt.sign(
            { user_id: decoded.user_id, email: decoded.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Can optionally issue a new refresh token or let the old one persist
        return res.status(200).json({
            access: newAccessToken,
            refresh: refresh, // keeps the same refresh
            lifetime: 3600
        });

    } catch (error) {
        console.error('Refresh Token Error:', error);
        return res.status(401).json({ detail: 'Refresh token invalid or expired' });
    }
}
