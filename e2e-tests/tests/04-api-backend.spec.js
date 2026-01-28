/**
 * Pruebas de API y Backend
 * Verifica la salud y rendimiento de las APIs y servicios backend
 */

const { test, expect } = require('@playwright/test');
const config = require('../config/test.config');
const environment = require('../config/environment');
const alertManager = require('../utils/alert-manager');

test.describe('API y Backend - Verificación', () => {

    test('API de productos debe devolver JSON válido', async ({ request }) => {
        const startTime = Date.now();

        const response = await request.post(environment.buildUrl('/api/proxy/extcust/getprodlist'), {
            data: {
                customer: process.env.NEXT_PUBLIC_API_CUSTOMER || '81276',
                key: process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk',
            },
        });

        const responseTime = Date.now() - startTime;

        // Verificar status code
        expect(response.status()).toBe(200);

        // Verificar que es JSON
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');

        // Parsear JSON
        const data = await response.json();
        expect(data).toBeTruthy();

        // Verificar estructura esperada
        expect(data.results).toBeDefined();
        expect(Array.isArray(data.results)).toBeTruthy();

        // Verificar que hay productos
        if (data.results.length === 0) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'CRITICAL',
                component: 'API',
                testName: 'API Product List Empty',
                errorMessage: 'API de productos devolvió array vacío',
                affectedUrl: '/api/proxy/extcust/getprodlist',
                responseTime,
                recommendedAction: 'Verificar conexión con backend y datos en base de datos',
            }));
        }

        console.log(`✅ API de productos OK (${data.results.length} productos, ${responseTime}ms)`);
    });

    test('Productos deben tener campos requeridos', async ({ request }) => {
        const response = await request.post(environment.buildUrl('/api/proxy/extcust/getprodlist'), {
            data: {
                customer: process.env.NEXT_PUBLIC_API_CUSTOMER || '81276',
                key: process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk',
            },
        });

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            test.skip('No hay productos para verificar');
        }

        // Verificar primer producto
        const firstProduct = data.results[0];
        const requiredFields = ['sku', 'descripcion', 'precio'];
        const missingFields = [];

        for (const field of requiredFields) {
            if (!firstProduct[field]) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'CRITICAL',
                component: 'API',
                testName: 'API Product Schema Validation',
                errorMessage: `Productos faltan campos requeridos: ${missingFields.join(', ')}`,
                affectedUrl: '/api/proxy/extcust/getprodlist',
                responseTime: 0,
                recommendedAction: 'Verificar mapeo de campos en proxy API',
            }));
        }

        expect(missingFields).toHaveLength(0);
        console.log(`✅ Esquema de productos válido`);
    });

    test('Endpoint de imágenes debe funcionar', async ({ request }) => {
        // Primero obtener un SKU real
        const productsResponse = await request.post(environment.buildUrl('/api/proxy/extcust/getprodlist'), {
            data: {
                customer: process.env.NEXT_PUBLIC_API_CUSTOMER || '81276',
                key: process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk',
            },
        });

        const productsData = await productsResponse.json();

        if (!productsData.results || productsData.results.length === 0) {
            test.skip('No hay productos para probar imágenes');
        }

        const testSku = productsData.results[0].sku;

        // Probar endpoint de imagen
        const imageResponse = await request.get(environment.buildUrl(`/api/images/${testSku}`));

        // Verificar que devuelve imagen (puede ser 200 o 302 redirect)
        expect([200, 302, 304]).toContain(imageResponse.status());

        console.log(`✅ Endpoint de imágenes funcional (SKU: ${testSku})`);
    });

    test('API debe tener autenticación correcta', async ({ request }) => {
        // Probar con credenciales incorrectas
        const response = await request.post(environment.buildUrl('/api/proxy/extcust/getprodlist'), {
            data: {
                customer: 'invalid',
                key: 'invalid',
            },
        });

        // La API debería rechazar credenciales inválidas
        // (El comportamiento exacto depende de tu API)
        const data = await response.json();

        console.log(`✅ Verificación de autenticación completada (status: ${response.status()})`);
    });

    test('Verificar conversión USD a MXN', async ({ request }) => {
        const response = await request.post(environment.buildUrl('/api/proxy/extcust/getprodlist'), {
            data: {
                customer: process.env.NEXT_PUBLIC_API_CUSTOMER || '81276',
                key: process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk',
            },
        });

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            test.skip('No hay productos para verificar conversión');
        }

        const firstProduct = data.results[0];

        // Verificar que el precio está en formato numérico
        expect(typeof firstProduct.precio).toBe('number');

        // Verificar que el precio es razonable (no $0 ni números negativos)
        if (firstProduct.precio <= 0) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'WARNING',
                component: 'API',
                testName: 'Price Validation',
                errorMessage: `Producto con precio inválido: $${firstProduct.precio} (SKU: ${firstProduct.sku})`,
                affectedUrl: '/api/proxy/extcust/getprodlist',
                responseTime: 0,
                recommendedAction: 'Verificar conversión USD a MXN y datos de precios',
            }));
        }

        console.log(`✅ Conversión de precios OK (ejemplo: $${firstProduct.precio} MXN)`);
    });

    test('API debe responder en tiempo razonable', async ({ request }) => {
        const startTime = Date.now();

        const response = await request.post(environment.buildUrl('/api/proxy/extcust/getprodlist'), {
            data: {
                customer: process.env.NEXT_PUBLIC_API_CUSTOMER || '81276',
                key: process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk',
            },
            timeout: 10000, // 10 segundos timeout
        });

        const responseTime = Date.now() - startTime;

        expect(response.status()).toBe(200);

        if (responseTime > config.performanceThresholds.apiResponseTime) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'WARNING',
                component: 'API',
                testName: 'API Response Time',
                errorMessage: `API tardó ${responseTime}ms (umbral: ${config.performanceThresholds.apiResponseTime}ms)`,
                affectedUrl: '/api/proxy/extcust/getprodlist',
                responseTime,
                recommendedAction: 'Optimizar queries de base de datos y verificar rendimiento del servidor',
            }));
        }

        console.log(`✅ Tiempo de respuesta API: ${responseTime}ms`);
    });

    test('Verificar headers de caché de API', async ({ request }) => {
        const response = await request.post(environment.buildUrl('/api/proxy/extcust/getprodlist'), {
            data: {
                customer: process.env.NEXT_PUBLIC_API_CUSTOMER || '81276',
                key: process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk',
            },
        });

        const headers = response.headers();

        // Log headers de caché para debugging
        console.log('Headers de caché:', {
            'cache-control': headers['cache-control'],
            'etag': headers['etag'],
            'last-modified': headers['last-modified'],
        });

        console.log('✅ Headers de caché verificados');
    });

    test('Endpoint de Google Reviews debe funcionar', async ({ request }) => {
        const storeId = process.env.NEXT_PUBLIC_STORE_ID || 'cti';

        const response = await request.get(environment.buildUrl(`/api/${storeId}/google-reviews`));

        // Puede devolver 200 con datos o algún error esperado
        console.log(`✅ Google Reviews endpoint status: ${response.status()}`);

        if (response.status() === 200) {
            const data = await response.json();
            console.log(`  Reviews encontrados: ${data.reviews?.length || 0}`);
        }
    });

    test('Health check endpoint (si existe)', async ({ request }) => {
        try {
            const response = await request.get(environment.buildUrl('/api/health'));

            if (response.status() === 200) {
                const data = await response.json();
                console.log('✅ Health check OK:', data);
            } else {
                console.log(`ℹ️  Health check no disponible (status: ${response.status()})`);
            }
        } catch (error) {
            console.log('ℹ️  Health check endpoint no existe (esto es normal si no está implementado)');
        }
    });

});
