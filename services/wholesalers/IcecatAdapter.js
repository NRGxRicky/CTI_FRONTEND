// services/wholesalers/IcecatAdapter.js

export class IcecatAdapter {
    /**
     * Busca la imagen oficial de un producto solicitándola al catálogo abierto de Icecat.
     * Emplea Lógica asimétrica priorizando en orden de exactitud: UPC -> MPN+Marca.
     * 
     * @param {string} upc - Código de barras universal (GTIN/EAN)
     * @param {string} mpn - Número de parte del fabricante (PartCode)
     * @param {string} brand - Nombre del fabricante
     * @returns {string|null} - URL absoluta de la fotografía o null si el producto es fantasma
     */
    static async fetchProductImage(upc, mpn, brand) {
        // Credencial gratuita pública de la comunidad Icecat
        const username = 'openicecat-live';
        const baseUrl = 'https://live.icecat.biz/api/';
        
        let url = null;
        
        // 1. Alta prioridad: Match exacto mundial por Código de barras
        if (upc && upc.toString().length >= 8) {
            url = `${baseUrl}?UserName=${username}&Language=es&GTIN=${encodeURIComponent(upc.toString())}`;
        } 
        // 2. Media prioridad: Match heurístico por Marca y Modelo (ej. "Logitech" + "981-000060")
        else if (mpn && brand) {
            url = `${baseUrl}?UserName=${username}&Language=es&Brand=${encodeURIComponent(brand.toString())}&PartCode=${encodeURIComponent(mpn.toString())}`;
        } 
        // 3. Imposibilidad Técnica (SKU totalmente genérico sin rastros)
        else {
            return { mainImage: null, gallery: [] };
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) return null;

            const json = await response.json();
            
            // Extraer imagen principal y galería completa
            if (json?.msg === 'OK' && json?.data) {
                const mainImage = json.data.Image?.HighPic || json.data.Image?.Pic500x500 || json.data.Image?.LowPic || null;
                const gallery = [];
                
                if (json.data.Gallery && Array.isArray(json.data.Gallery)) {
                    json.data.Gallery.forEach(img => {
                        const url = img.Pic || img.LowPic;
                        if (url) gallery.push(url);
                    });
                }

                return { mainImage, gallery };
            }

            return { mainImage: null, gallery: [] };
        } catch (err) {
            // Falla de Red silenciosa, devolver nulo para no crashear el orquestador maestro
            return { mainImage: null, gallery: [] };
        }
    }
}
