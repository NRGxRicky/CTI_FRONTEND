// API Proxy para evitar problemas de CORS
export default async function handler(req, res) {
    const { path = [] } = req.query;

    // Construir la URL completa de la API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.pccdnapi.com';
    const apiPath = Array.isArray(path) ? path.join('/') : path;
    const fullUrl = `${apiUrl}/${apiPath}`;

    try {
        // Forward the request to the real API
        const apiResponse = await fetch(fullUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...req.headers,
            },
            ...(req.method !== 'GET' && req.method !== 'HEAD' && { body: JSON.stringify(req.body) }),
        });

        const data = await apiResponse.json();

        // Return the API response
        res.status(apiResponse.status).json(data);
    } catch (error) {
        console.error('API Proxy Error:', error);
        res.status(500).json({ error: 'Error al conectar con la API' });
    }
}
