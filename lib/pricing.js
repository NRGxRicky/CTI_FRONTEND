// lib/pricing.js
// FUENTE ÚNICA DE VERDAD PARA EL CÁLCULO DE PRECIOS EN CTI SYSTEMS
//
// Unifica el margen de ganancia comercial y el IVA en todo el sitio:
// Catálogo, Ficha de Producto, Carrito de Compras, Cotizador, Órdenes y Pasarelas de Pago.

const DEFAULT_MARGIN = 1.15; // 15% de margen comercial
const IVA_RATE = 1.16;       // 16% IVA oficial México

/**
 * Obtiene el margen de ganancia configurado en las variables de entorno o el 1.15 por defecto.
 */
export function getProfitMargin() {
    const raw = process.env.PROFIT_MARGIN;
    if (!raw) return DEFAULT_MARGIN;
    const parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed < 1.0 || parsed > 3.0) {
        return DEFAULT_MARGIN;
    }
    return parsed;
}

/**
 * Obtiene la tasa de IVA oficial (1.16).
 */
export function getIvaMultiplier() {
    return IVA_RATE;
}

/**
 * Calcula el precio final de venta al público (MXN) con margen e IVA incluidos.
 * Siempre redondeado financieramente a 2 decimales para evitar desbordamiento flotante.
 * 
 * @param {number} cost - Costo puro del mayorista (Ingram Micro)
 * @returns {number} Precio de venta al público en MXN con IVA
 */
export function computeSalePrice(cost) {
    if (!cost || typeof cost !== 'number' || cost <= 0 || isNaN(cost)) {
        return 0.0;
    }
    const margin = getProfitMargin();
    const rawPrice = cost * margin * IVA_RATE;
    return Math.round(rawPrice * 100) / 100;
}

/**
 * Calcula el precio unitario antes de IVA (Subtotal de producto).
 * 
 * @param {number} cost - Costo base del mayorista
 * @returns {number} Subtotal antes de IVA redondeado a 2 decimales
 */
export function computeSubtotalBeforeIva(cost) {
    if (!cost || typeof cost !== 'number' || cost <= 0 || isNaN(cost)) {
        return 0.0;
    }
    const margin = getProfitMargin();
    const rawSubtotal = cost * margin;
    return Math.round(rawSubtotal * 100) / 100;
}

/**
 * Calcula el total para una línea de producto (precio unitario * cantidad).
 * 
 * @param {number} cost - Costo base
 * @param {number} quantity - Cantidad de piezas
 * @returns {number} Total con IVA redondeado a 2 decimales
 */
export function computeLineTotal(cost, quantity) {
    const unitPrice = computeSalePrice(cost);
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    return Math.round(unitPrice * qty * 100) / 100;
}

export default {
    getProfitMargin,
    getIvaMultiplier,
    computeSalePrice,
    computeSubtotalBeforeIva,
    computeLineTotal,
};
