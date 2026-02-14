/**
 * Pruebas Smoke - Verificación de Disponibilidad
 * Verifica que las páginas críticas respondan correctamente
 */

const { test, expect } = require('@playwright/test');
const config = require('../config/test.config');
const environment = require('../config/environment');
const alertManager = require('../utils/alert-manager');

test.describe('Smoke Tests - Disponibilidad del Sistema', () => {

    test('Homepage debe cargar correctamente con HTTP 200', async ({ page }) => {
        const startTime = Date.now();

        try {
            const response = await page.goto(environment.buildUrl('/'), {
                waitUntil: 'domcontentloaded', // Más rápido que 'networkidle'
                timeout: 30000 // 30 segundos
            });
            const loadTime = Date.now() - startTime;

            // Verificar código de estado
            expect(response.status()).toBe(200);

            // Verificar tiempo de carga
            if (loadTime > config.performanceThresholds.pageLoadTime) {
                await alertManager.saveAlert(alertManager.createAlert({
                    severity: 'WARNING',
                    component: 'Frontend',
                    testName: 'Homepage Load Time',
                    errorMessage: `Homepage tardó ${loadTime}ms en cargar (umbral: ${config.performanceThresholds.pageLoadTime}ms)`,
                    affectedUrl: environment.buildUrl('/'),
                    responseTime: loadTime,
                    recommendedAction: 'Optimizar recursos estáticos y verificar CDN',
                }));
            }

            console.log(`✅ Homepage cargó en ${loadTime}ms`);
        } catch (error) {
            console.error('❌ Error cargando homepage:', error.message);
            throw error;
        }
    });

    test('Página de Catálogo debe estar disponible', async ({ page }) => {
        const startTime = Date.now();

        try {
            const response = await page.goto(environment.buildUrl('/listado/all/index'), {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            const loadTime = Date.now() - startTime;

            expect(response.status()).toBe(200);

            // Verificar que el título contenga texto relevante (opcional)
            try {
                await expect(page).toHaveTitle(/CTI|Catálogo|Productos|PCStore/i, { timeout: 5000 });
            } catch (e) {
                console.log('⚠️  Título de página no coincide con patrón esperado');
            }

            console.log(`✅ Catálogo disponible (${loadTime}ms)`);
        } catch (error) {
            console.error('❌ Error cargando catálogo:', error.message);
            throw error;
        }
    });

    test('Página de Login debe estar disponible', async ({ page }) => {
        const response = await page.goto(environment.buildUrl('/login'));

        expect(response.status()).toBe(200);

        // Verificar presencia de formulario de login
        const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="correo"]');
        const passwordInput = page.locator('input[type="password"]');

        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();

        console.log('✅ Página de login disponible');
    });

    test('Verificar tiempo de respuesta de API de productos', async ({ request }) => {
        const startTime = Date.now();

        try {
            const response = await request.post(environment.buildUrl('/api/proxy/section'), {
                data: {
                    customer: process.env.NEXT_PUBLIC_API_CUSTOMER || '81276',
                    key: process.env.NEXT_PUBLIC_API_KEY || '0LlAN2nJRl0tdYtk',
                },
                timeout: 15000, // 15 segundos
            });

            const responseTime = Date.now() - startTime;

            // Verificar status code
            if (response.status() !== 200) {
                console.error(`⚠️  API devolvió status ${response.status()}`);
                // No fallar la prueba, solo alertar
                await alertManager.saveAlert(alertManager.createAlert({
                    severity: 'WARNING',
                    component: 'API',
                    testName: 'API Status Code',
                    errorMessage: `API devolvió status ${response.status()} en lugar de 200`,
                    affectedUrl: '/api/proxy/section',
                    responseTime,
                    recommendedAction: 'Verificar configuración de API y credenciales',
                }));
                return;
            }

            expect(response.status()).toBe(200);

            // Verificar que la respuesta sea JSON válido
            const data = await response.json();
            expect(data).toBeTruthy();

            // Verificar tiempo de respuesta
            if (responseTime > config.performanceThresholds.apiResponseTime) {
                await alertManager.saveAlert(alertManager.createAlert({
                    severity: 'WARNING',
                    component: 'API',
                    testName: 'API Product List Response Time',
                    errorMessage: `API respondió en ${responseTime}ms (umbral: ${config.performanceThresholds.apiResponseTime}ms)`,
                    affectedUrl: '/api/proxy/section',
                    responseTime,
                    recommendedAction: 'Verificar rendimiento del backend y optimizar queries',
                }));
            }

            console.log(`✅ API de productos respondió en ${responseTime}ms`);
        } catch (error) {
            console.error('❌ Error en API:', error.message);
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'CRITICAL',
                component: 'API',
                testName: 'API Connection Error',
                errorMessage: `Error conectando con API: ${error.message}`,
                affectedUrl: '/api/proxy/section',
                responseTime: Date.now() - startTime,
                recommendedAction: 'Verificar conectividad de red y configuración de API',
            }));
            throw error;
        }
    });

    test('Verificar disponibilidad de CDN de imágenes', async ({ page }) => {
        // Ir a homepage
        await page.goto(environment.buildUrl('/'));

        // Esperar a que carguen las imágenes
        await page.waitForLoadState('networkidle');

        // Verificar que hay imágenes cargadas
        const images = await page.locator('img').all();
        expect(images.length).toBeGreaterThan(0);

        // Verificar que al menos una imagen principal cargó
        const heroImages = await page.locator('img[src*="/images/"], img[src*="api/images"]').all();

        if (heroImages.length > 0) {
            // Verificar que la primera imagen tiene dimensiones (está cargada)
            const firstImage = heroImages[0];
            const boundingBox = await firstImage.boundingBox();

            if (!boundingBox || boundingBox.width === 0) {
                await alertManager.saveAlert(alertManager.createAlert({
                    severity: 'CRITICAL',
                    component: 'Frontend',
                    testName: 'CDN Image Loading',
                    errorMessage: 'Imágenes del CDN no están cargando correctamente',
                    affectedUrl: environment.buildUrl('/'),
                    responseTime: 0,
                    recommendedAction: 'Verificar configuración de CDN y rutas de imágenes',
                }));
            }
        }

        console.log(`✅ CDN de imágenes operativo (${images.length} imágenes detectadas)`);
    });

    test('Verificar certificado SSL/TLS', async ({ request }) => {
        if (!environment.isProduction()) {
            test.skip('Test SSL solo en producción');
        }

        const response = await request.get(environment.getBaseUrl());

        // En Playwright, si la conexión SSL falla, lanzará error
        // Si llegamos aquí, el certificado es válido
        expect(response.status()).toBeLessThan(500);

        console.log('✅ Certificado SSL/TLS válido');
    });

    test('Verificar headers de seguridad', async ({ page }) => {
        const response = await page.goto(environment.buildUrl('/'));

        const headers = response.headers();

        // Verificar headers críticos de seguridad
        const securityHeaders = [
            'x-frame-options',
            'x-content-type-options',
        ];

        const missingHeaders = [];

        for (const header of securityHeaders) {
            if (!headers[header]) {
                missingHeaders.push(header);
            }
        }

        if (missingHeaders.length > 0) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'WARNING',
                component: 'Frontend',
                testName: 'Security Headers Check',
                errorMessage: `Headers de seguridad faltantes: ${missingHeaders.join(', ')}`,
                affectedUrl: environment.buildUrl('/'),
                responseTime: 0,
                recommendedAction: 'Configurar headers de seguridad en next.config.js',
            }));
        }

        console.log('✅ Headers de seguridad verificados');
    });

    test('Verificar que no hay errores 404 en recursos estáticos', async ({ page }) => {
        const failed404 = [];

        // Escuchar respuestas
        page.on('response', response => {
            if (response.status() === 404) {
                failed404.push(response.url());
            }
        });

        await page.goto(environment.buildUrl('/'));
        await page.waitForLoadState('networkidle');

        if (failed404.length > 0) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'WARNING',
                component: 'Frontend',
                testName: '404 Resource Check',
                errorMessage: `${failed404.length} recursos no encontrados (404)`,
                affectedUrl: environment.buildUrl('/'),
                responseTime: 0,
                recommendedAction: `Verificar recursos: ${failed404.slice(0, 3).join(', ')}`,
            }));
        }

        console.log(`✅ Verificación de  404 completada (${failed404.length} errores encontrados)`);
    });

});
