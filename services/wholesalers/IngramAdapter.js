// services/wholesalers/IngramAdapter.js
// ADAPTADOR PARA INGRAM MICRO (OAuth 2.0 + v6 API)

const MEXICO_STATES_MAP = {
    'aguascalientes': 'AG',
    'baja california': 'BC',
    'baja california sur': 'BS',
    'campeche': 'CM',
    'chiapas': 'CS',
    'chihuahua': 'CH',
    'coahuila': 'CO',
    'colima': 'CL',
    'ciudad de mexico': 'DF',
    'distrito federal': 'DF',
    'durango': 'DG',
    'estado de mexico': 'EM',
    'guanajuato': 'GT',
    'guerrero': 'GR',
    'hidalgo': 'HG',
    'jalisco': 'JC',
    'michoacan': 'MN',
    'morelos': 'MS',
    'nayarit': 'NT',
    'nuevo leon': 'NL',
    'oaxaca': 'OC',
    'puebla': 'PL',
    'queretaro': 'QT',
    'quintana roo': 'QR',
    'san luis potosi': 'SP',
    'sinaloa': 'SL',
    'sonora': 'SR',
    'tabasco': 'TC',
    'tamaulipas': 'TS',
    'tlaxcala': 'TL',
    'veracruz': 'VZ',
    'yucatan': 'YN',
    'zacatecas': 'ZS'
};

const getStateCode = (stateName) => {
    if (!stateName) return 'EM';
    const clean = stateName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z\s]/g, '').trim();
    return MEXICO_STATES_MAP[clean] || 'EM';
};

export class IngramAdapter {
    static accessToken = null;
    static tokenExpiry = null;

    /**
     * Obtiene el token de Sandbox o Producción según .env.local
     */
    static async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
            return this.accessToken;
        }

        const clientId = process.env.INGRAM_CLIENT_ID;
        const clientSecret = process.env.INGRAM_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
            throw new Error('❌ Faltan credenciales de Ingram Micro');
        }

        console.log('🔐 Obteniendo nuevo token de acceso de Ingram Micro...');

        // OAuth global host for Apigee
        const tokenUrl = `https://api.ingrammicro.com:443/oauth/oauth20/token`;
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ingram Auth Failed (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            const expiresInMs = (parseInt(data.expires_in, 10) || 7200) * 1000;
            this.tokenExpiry = Date.now() + expiresInMs;

            return this.accessToken;
        } catch (error) {
            throw error;
        }
    }

    /** 
     * REGLA DE NEGOCIO 2: Sanitización estricta de direcciones
     * "Evita poner caracteres especiales puntos, acentos, comas, comillas, signos o Ñ."
     * "Recordemos que el string máx. es de 35 caracteres dentro de los campos"
     */
    static sanitizeText(text) {
        if (!text) return '';
        return text
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remueve acentos
            .replace(/[.,'"ñÑ]/g, '') // Remueve puntuaciones y la letra Ñ
            .replace(/[^a-zA-Z0-9\s-]/g, '') // Deja solo alfanuméricos, espacios y guiones
            .substring(0, 35) // Corta tajantemente a 35 caracteres máximo
            .trim();
    }

    /**
     * Divide una dirección larga en 3 líneas de max 35 caracteres cada una,
     * sanitizando el texto y cortando por palabras para evitar truncar datos clave.
     */
    static getAddressLines(address) {
        if (!address) {
            return {
                addressLine1: 'Sin Direccion',
                addressLine2: '',
                addressLine3: ''
            };
        }

        const calleYNum = `${address.calle || ''} ${address.numero || ''} ${address.numero_interior ? 'Int ' + address.numero_interior : ''}`.trim();
        const colonia = address.colonia ? `Col ${address.colonia}` : '';
        const referencias = address.referencias ? `Ref ${address.referencias}` : '';

        const parts = [calleYNum, colonia, referencias].filter(Boolean);
        const fullText = parts.join(', ');

        const sanitized = fullText
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[.,'"ñÑ]/g, '')
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .trim();

        const words = sanitized.split(/\s+/);
        
        let line1 = '';
        let line2 = '';
        let line3 = '';

        for (const word of words) {
            if (!word) continue;

            if ((line1 + (line1 ? ' ' : '') + word).length <= 35) {
                line1 += (line1 ? ' ' : '') + word;
            }
            else if ((line2 + (line2 ? ' ' : '') + word).length <= 35) {
                line2 += (line2 ? ' ' : '') + word;
            }
            else if ((line3 + (line3 ? ' ' : '') + word).length <= 35) {
                line3 += (line3 ? ' ' : '') + word;
            }
            else {
                const spaceLeft = 35 - line3.length - 1;
                if (spaceLeft > 0) {
                    line3 += (line3 ? ' ' : '') + word.substring(0, spaceLeft);
                }
                break;
            }
        }

        return {
            addressLine1: line1.trim() || 'Direccion principal',
            addressLine2: line2.trim(),
            addressLine3: line3.trim()
        };
    }

    /** Descarga de catálogo base (Search API) */
    static async fetchCatalog(page = 1, pageSize = 50) {
        const token = await this.getAccessToken();
        const customerNumber = process.env.INGRAM_CUSTOMER_NUMBER;
        const apiUrl = process.env.INGRAM_API_URL || 'https://api.ingrammicro.com:443/sandbox';

        const url = `${apiUrl}/resellers/v6/catalog?pageNumber=${page}&pageSize=${pageSize}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'IM-CustomerNumber': customerNumber,
                'IM-CountryCode': 'MX',
                'IM-CorrelationID': `CAT-${Date.now()}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ingram Catalog API Failed (${response.status}): ${errorText}`);
        }
        return await response.json();
    }

    /** 
     * REGLA DE NEGOCIO 1: Consultas PNA (Price & Availability)
     * "Bloques no mayor a 50 Skus"
     */
    static async fetchPNA(skus) {
        if (!Array.isArray(skus) || skus.length === 0) return [];
        if (skus.length > 50) throw new Error("PNA Block: Ingram prohíbe más de 50 SKUs por petición. Partir el array.");

        const token = await this.getAccessToken();
        const customerNumber = process.env.INGRAM_CUSTOMER_NUMBER;
        const apiUrl = process.env.INGRAM_API_URL || 'https://api.ingrammicro.com:443/sandbox';

        const url = `${apiUrl}/resellers/v6/catalog/priceandavailability?includeAvailability=true&includePricing=true`;
        
        const payload = {
            products: skus.map(sku => ({ ingramPartNumber: sku }))
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'IM-CustomerNumber': customerNumber,
                'IM-CountryCode': 'MX',
                'IM-CorrelationID': `PNA-${Date.now()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`PNA Error (${response.status}): ${err}`);
        }
        return await response.json();
    }

    /**
     * OBTENCIÓN DE DETALLES DEL CATÁLOGO (Imágenes y Descripciones Técnicas)
     */
    static async fetchProductDetails(ingramPartNumber) {
        if (!ingramPartNumber) throw new Error("Se requiere un SKU de Ingram (ingramPartNumber)");

        const token = await this.getAccessToken();
        const customerNumber = process.env.INGRAM_CUSTOMER_NUMBER;
        const apiUrl = process.env.INGRAM_API_URL || 'https://api.ingrammicro.com:443/sandbox';

        // Endpoint v6 para obtener la profundidad de catálogo
        // Parámetros clave para forzar la descarga de la hoja técnica y media
        const url = `${apiUrl}/resellers/v6/catalog/details/${ingramPartNumber}?includeProductFeatures=true&includeTechnicalSpecifications=true`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'IM-CustomerNumber': customerNumber,
                'IM-CountryCode': 'MX',
                'IM-CorrelationID': `CAT-DETAILS-${ingramPartNumber}-${Date.now()}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            // El SKU no existe o fue descontinuado, lanzar error manejable
            const err = await response.text();
            throw new Error(`Catalog Details Error (${response.status}): ${err}`);
        }

        return await response.json();
    }

    /**
     * CREACIÓN DE ORDEN SANDBOX (La Prueba Final)
     */
    static async createSandboxTestOrder() {
        const token = await this.getAccessToken();
        const customerNumber = process.env.INGRAM_CUSTOMER_NUMBER;
        const apiUrl = process.env.INGRAM_API_URL || 'https://api.ingrammicro.com:443/sandbox';

        const url = `${apiUrl}/resellers/v6/orders`;

        // Construcción matemática siguiendo todos los tips de "IMPORTANTE"
        const payload = {
            "customerOrderNumber": `T-${Date.now()}`,
            "notes": "Telefono:5513843595",
            "shipToInfo": {
                "contact": this.sanitizeText("Ricardo Integracion"),
                "companyName": this.sanitizeText("CTI Systems Pruebas"),
                "addressLine1": this.sanitizeText("Calle Falsa 123"),
                "city": this.sanitizeText("Metepec"),
                "state": "EM", // REGLA 3: Código de estado a 2 dígitos de The Matrix
                "postalCode": "52140",
                "countryCode": "MX",
                "email": "esteban.hurtado@ingrammicro.com",
                "phoneNumber": "5513843595"
            },
            "lines": [
                {
                    "customerLineNumber": "1",
                    "ingramPartNumber": "123456", // SKU Ficticio usual o reemplazar por uno real
                    "quantity": 1
                }
            ],
            "additionalAttributes": [
                {
                    "attributeName": "allowOrderOnCustomerHold",
                    "attributeValue": "false" // REGLA: Retención de Órdenes
                }
            ]
        };

        console.log("🚀 Disparando Orden Sandbox hacia Ingram...");
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'IM-CustomerNumber': customerNumber,
                'IM-CountryCode': 'MX',
                'IM-CorrelationID': `SANDBOX-TEST-${Date.now()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Order Submit Sandbox Failed (${response.status}): ${errText}`);
        }

        return await response.json();
    }

    /**
     * CREACIÓN DE ORDEN AUTOMÁTICA
     */
    static async createIngramOrder(orderId, orderTotal, items, address, user) {
        const token = await this.getAccessToken();
        const customerNumber = process.env.INGRAM_CUSTOMER_NUMBER;
        const apiUrl = process.env.INGRAM_API_URL || 'https://api.ingrammicro.com:443/sandbox';

        const url = `${apiUrl}/resellers/v6/orders`;

        // Adaptar items al formato de Ingram
        const lines = items.map((item, index) => ({
            customerLineNumber: (index + 1).toString(),
            ingramPartNumber: item.product.ingramSku,
            quantity: item.quantity
        }));

        const addressLines = this.getAddressLines(address);

        const payload = {
            "customerOrderNumber": `CTI-${orderId}`,
            "notes": `Telefono:${address?.telefono || 'N/A'}`,
            "shipToInfo": {
                "contact": this.sanitizeText(`${user?.nombres || ''} ${user?.apellidos || ''}`),
                "companyName": this.sanitizeText(`${user?.nombres || ''} ${user?.apellidos || ''}`),
                "addressLine1": addressLines.addressLine1,
                ...(addressLines.addressLine2 ? { "addressLine2": addressLines.addressLine2 } : {}),
                ...(addressLines.addressLine3 ? { "addressLine3": addressLines.addressLine3 } : {}),
                "city": this.sanitizeText(`${address?.ciudad || ''}`),
                "state": getStateCode(address?.estado),
                "postalCode": `${address?.codigo_postal || '00000'}`,
                "countryCode": "MX",
                "email": `${user?.email || 'ventas@cti.com'}`,
                "phoneNumber": `${address?.telefono || '0000000000'}`
            },
            "lines": lines,
            "additionalAttributes": [
                {
                    "attributeName": "allowOrderOnCustomerHold",
                    "attributeValue": "false"
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'IM-CustomerNumber': customerNumber,
                'IM-CountryCode': 'MX',
                'IM-CorrelationID': `CTI-ORD-${orderId}-${Date.now()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Ingram Order Failed: ${errText}`);
        }

        return await response.json();
    }
}
