// API Proxy para evitar problemas de CORS
export default async function handler(req, res) {
    const { path = [], ...queryParams } = req.query;

    // Construir la URL completa de la API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.pccdnapi.com';
    const apiPath = Array.isArray(path) ? path.join('/') : path;

    // Agregar query parameters si existen
    const searchParams = new URLSearchParams();
    Object.keys(queryParams).forEach(key => {
        searchParams.append(key, queryParams[key]);
    });
    const queryString = searchParams.toString();
    const fullUrl = `${apiUrl}/${apiPath}${queryString ? `?${queryString}` : ''}`;

    try {
        // Headers seguros para forward
        const safeHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        // Forward the request to the real API
        const apiResponse = await fetch(fullUrl, {
            method: req.method,
            headers: safeHeaders,
            ...(req.method !== 'GET' && req.method !== 'HEAD' && req.body && {
                body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
            }),
        });

        // Verificar si la respuesta es JSON válida
        const contentType = apiResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await apiResponse.json();
            res.status(apiResponse.status).json(data);
        } else {
            // Si no es JSON, enviar como texto
            const text = await apiResponse.text();
            res.status(apiResponse.status).send(text);
        }
    } catch (error) {
        console.error('API Proxy Error:', error);
        console.error('URL:', fullUrl);
        res.status(500).json({
            error: 'Error al conectar con la API',
            details: error.message
        });
    }
}

