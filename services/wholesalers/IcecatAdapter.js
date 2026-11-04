// services/wholesalers/IcecatAdapter.js

const BRAND_CANONICAL_MAP = {
    'hp inc': 'HP',
    'hp impresión': 'HP',
    'hp impresion': 'HP',
    'hewlett packard': 'HP',
    'zebra tech.': 'Zebra',
    'zebra technologies': 'Zebra',
    'tripplite': 'Tripp Lite',
    'tripp-lite': 'Tripp Lite',
    'kingston technology': 'Kingston',
    'lenovo group': 'Lenovo',
    'dell technologies': 'Dell',
    'tp link': 'TP-Link',
    'tp-link technologies': 'TP-Link',
    'startech': 'StarTech.com',
};

function normalizeBrand(rawBrand) {
    if (!rawBrand) return null;
    const clean = rawBrand.toString().trim();
    const lower = clean.toLowerCase();
    return BRAND_CANONICAL_MAP[lower] || clean;
}

function isValidUpc(upc) {
    if (!upc) return false;
    const s = upc.toString().trim();
    // Descartar UPCs de prueba o falsos de Ingram (ej: 9999999999999, 0000000000000)
    if (!/^\d{8,14}$/.test(s)) return false;
    if (/^9{8,}$/.test(s) || /^0{8,}$/.test(s)) return false;
    return true;
}

async function queryIcecat(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) return { mainImage: null, gallery: [] };

        const json = await response.json();
        
        if (json?.msg === 'OK' && json?.data) {
            const mainImage = json.data.Image?.HighPic || json.data.Image?.Pic500x500 || json.data.Image?.LowPic || null;
            const gallery = [];
            
            if (json.data.Gallery && Array.isArray(json.data.Gallery)) {
                json.data.Gallery.forEach(img => {
                    const picUrl = img.HighPic || img.Pic || img.Pic500x500 || img.LowPic;
                    if (picUrl) gallery.push(picUrl);
                });
            }

            return { mainImage, gallery: [...new Set(gallery)] };
        }

        return { mainImage: null, gallery: [] };
    } catch {
        return { mainImage: null, gallery: [] };
    }
}

export class IcecatAdapter {
    /**
     * Busca la imagen oficial de un producto solicitándola al catálogo abierto de Icecat.
     * Con fallback automático: primero UPC válido -> si falla, Marca normalizada + MPN.
     * 
     * @param {string} upc - Código de barras universal (GTIN/EAN)
     * @param {string} mpn - Número de parte del fabricante (PartCode)
     * @param {string} brand - Nombre del fabricante
     * @returns {Promise<{mainImage: string|null, gallery: string[]}>}
     */
    static async fetchProductImage(upc, mpn, brand) {
        const username = 'openicecat-live';
        const baseUrl = 'https://live.icecat.biz/api/';
        
        const canonicalBrand = normalizeBrand(brand);
        const validUpc = isValidUpc(upc) ? upc.toString().trim() : null;
        
        // 1. Alta prioridad: Match exacto mundial por Código de barras válido
        if (validUpc) {
            const url = `${baseUrl}?UserName=${username}&Language=es&GTIN=${encodeURIComponent(validUpc)}`;
            const result = await queryIcecat(url);
            if (result.mainImage) {
                return result;
            }
        } 
        
        // 2. Fallback heurístico: Si falló el UPC o no era válido, intentar por Marca canónica y MPN
        if (mpn && canonicalBrand) {
            const url = `${baseUrl}?UserName=${username}&Language=es&Brand=${encodeURIComponent(canonicalBrand)}&PartCode=${encodeURIComponent(mpn.toString().trim())}`;
            const result = await queryIcecat(url);
            if (result.mainImage) {
                return result;
            }
        } 

        return { mainImage: null, gallery: [] };
    }
}
