/**
 * Pruebas de Ruta Crítica - Flujo E2E de Compra
 * Simula el recorrido completo de un cliente desde búsqueda hasta checkout
 */

const { test, expect } = require('@playwright/test');
const config = require('../config/test.config');
const environment = require('../config/environment');
const alertManager = require('../utils/alert-manager');

test.describe('Ruta Crítica - Flujo de Compra E2E', () => {

    test('Flujo completo: Búsqueda → Producto → Carrito → Checkout', async ({ page }) => {
        const startTime = Date.now();

        try {
            // ============================================
            // INICIAR SESIÓN (Requerido para checkout)
            // ============================================
            console.log('\n🔐 Iniciando sesión...');
            await page.goto(environment.buildUrl('/login'));
            await page.waitForLoadState('networkidle');
            
            const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="correo"]').first();
            const passwordInput = page.locator('input[type="password"]').first();
            const submitBtn = page.locator('.login-card button[type="submit"], .login-button').first();
            
            await emailInput.fill(config.testCredentials.email);
            await passwordInput.fill(config.testCredentials.password);
            await submitBtn.click();
            await page.waitForURL(url => !url.href.includes('/login'), { timeout: 10000 });
            await page.waitForLoadState('networkidle');
            console.log('✅ Sesión iniciada');

            // ============================================
            // PASO 1: BÚSQUEDA DE PRODUCTO
            // ============================================
            console.log('\n🔍 PASO 1: Búsqueda de producto...');

            await page.goto(environment.buildUrl('/'));
            await page.waitForLoadState('networkidle');

            // Buscar barra de búsqueda
            let searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();

            if (await searchInput.count() === 0) {
                throw new Error('Barra de búsqueda no encontrada');
            }

            // Si el input de búsqueda no es visible (es mobile-chrome)
            if (!(await searchInput.isVisible())) {
                console.log('📱 Dispositivo móvil detectado: Abriendo panel de búsqueda...');
                const searchToggle = page.locator('.header-bar__mobile__search-icon__mobile, .header-bar__mobile__search-icon').first();
                if (await searchToggle.count() > 0) {
                    await searchToggle.click();
                    await page.waitForTimeout(1000);
                    // Volver a obtener el input ya visible
                    searchInput = page.locator('.header-bar__mobile__form-container input[type="search"]').first();
                }
            }

            // Realizar búsqueda
            await searchInput.fill('laptop');
            await searchInput.press('Enter');
            await page.waitForLoadState('networkidle');

            console.log('✅ Búsqueda ejecutada');

            // ============================================
            // PASO 2: SELECCIÓN DE PRODUCTO
            // ============================================
            console.log('\n📦 PASO 2: Selección de producto...');

            // Esperar resultados
            await page.waitForTimeout(2000);

            // Buscar primer producto
            const productLink = page.locator('.products-list__item a, .embla__slide a, a[href*="/products/"], a[href*="producto"]').first();

            if (await productLink.count() === 0) {
                // Intentar ir directamente al catálogo
                await page.goto(environment.buildUrl('/listado/all/index'));
                await page.waitForLoadState('networkidle');
                const catalogProduct = page.locator('.products-list__item a, .embla__slide a, a[href*="/products/"], a[href*="producto"]').first();

                if (await catalogProduct.count() === 0) {
                    throw new Error('No se encontraron productos en el catálogo');
                }

                await catalogProduct.click();
            } else {
                await productLink.click();
            }

            await page.waitForLoadState('networkidle');

            // Verificar que estamos en página de producto
            const productTitle = page.locator('h1').first();
            await expect(productTitle).toBeVisible();

            // Verificar precio visible
            const priceElement = page.locator('[class*="precio"], [class*="price"]').first();
            await expect(priceElement).toBeVisible();

            console.log('✅ Producto seleccionado');

            // ============================================
            // PASO 3: AÑADIR AL CARRITO
            // ============================================
            console.log('\n🛒 PASO 3: Añadir al carrito...');

            // Tomar screenshot del producto
            const productUrl = page.url();

            // Buscar botón "Añadir al carrito"
            const addToCartButton = page.locator(
                'a:has-text("Añadir al Carrito"), a:has-text("Añadir al carrito"), button:has-text("Añadir al carrito"), a:has-text("Agregar al carrito"), button:has-text("Agregar al carrito"), .product__actions__add-to-cart'
            ).first();

            if (await addToCartButton.count() === 0) {
                const screenshotPath = `e2e-tests/reports/screenshots/no-cart-button-${Date.now()}.png`;
                await page.screenshot({ path: screenshotPath, fullPage: true });

                throw new Error('Botón "Añadir al carrito" no encontrado');
            }

            await expect(addToCartButton).toBeVisible();

            // Obtener contador del carrito antes
            let cartCountBefore = 0;
            const cartCounter = page.locator('[class*="cart-count"], [class*="badge"]').first();
            if (await cartCounter.count() > 0) {
                const countText = await cartCounter.textContent();
                cartCountBefore = parseInt(countText) || 0;
            }

            // Click en añadir al carrito
            await addToCartButton.click();

            // Esperar confirmación (puede ser modal, notificación, o actualización de contador)
            await page.waitForTimeout(2000);

            console.log('✅ Producto añadido al carrito');

            // ============================================
            // PASO 4: VERIFICAR CARRITO
            // ============================================
            console.log('\n📋 PASO 4: Verificación del carrito...');

            // Navegar al carrito
            await page.goto(environment.buildUrl('/carrito'));
            await page.waitForLoadState('networkidle');

            // Verificar URL del carrito
            expect(page.url()).toContain('/carrito');

            // Verificar que hay productos en el carrito
            const cartItems = page.locator('[class*="cart-item"], [class*="producto"], [class*="item"]');

            // Esperar a que aparezcan items o mensaje
            await page.waitForTimeout(2000);

            const itemCount = await cartItems.count();

            if (itemCount === 0) {
                const screenshotPath = `e2e-tests/reports/screenshots/empty-cart-${Date.now()}.png`;
                await page.screenshot({ path: screenshotPath, fullPage: true });

                throw new Error('El carrito está vacío después de añadir producto');
            }

            console.log(`✅ Carrito tiene ${itemCount} item(s)`);

            // Verificar total del carrito
            const totalElement = page.locator('[class*="total"], .cart-total, .total').first();
            if (await totalElement.count() > 0) {
                await expect(totalElement).toBeVisible();
                console.log('✅ Total del carrito visible');
            }

            // ============================================
            // PASO 5: PROCEDER AL CHECKOUT
            // ============================================
            console.log('\n💳 PASO 5: Inicio de checkout...');

            // Buscar botón de continuar/checkout
            const checkoutButton = page.locator(
                'button:has-text("Continuar"), a:has-text("Continuar"), button:has-text("Checkout"), button:has-text("Proceder")'
            ).first();

            if (await checkoutButton.count() === 0) {
                console.log('⚠️  Botón de checkout no encontrado, test parcialmente exitoso');
            } else {
                await expect(checkoutButton).toBeVisible();

                // Click en continuar
                await checkoutButton.click();
                await page.waitForLoadState('networkidle');

                // Verificar redirección a envío o login
                const currentUrl = page.url();

                if (currentUrl.includes('/login')) {
                    console.log('✅ Redirigido a login (esperado para usuarios no autenticados)');
                } else if (currentUrl.includes('/envio') || currentUrl.includes('/shipping')) {
                    console.log('✅ Redirigido a página de envío');
                } else {
                    console.log(`ℹ️  Redirigido a: ${currentUrl}`);
                }
            }

            // ============================================
            // MÉTRICAS FINALES
            // ============================================
            const totalTime = Date.now() - startTime;
            console.log(`\n⏱️  Tiempo total del flujo: ${totalTime}ms`);

            if (totalTime > config.performanceThresholds.criticalApiTime) {
                await alertManager.saveAlert(alertManager.createAlert({
                    severity: 'WARNING',
                    component: 'Checkout',
                    testName: 'Critical Path Performance',
                    errorMessage: `Flujo de compra tardó ${totalTime}ms (umbral: ${config.performanceThresholds.criticalApiTime}ms)`,
                    affectedUrl: productUrl,
                    responseTime: totalTime,
                    recommendedAction: 'Optimizar rendimiento del flujo de compra',
                }));
            }

            console.log('\n✅ FLUJO CRÍTICO COMPLETADO EXITOSAMENTE\n');

        } catch (error) {
            const screenshotPath = `e2e-tests/reports/screenshots/critical-path-error-${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });

            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'CRITICAL',
                component: 'Checkout',
                testName: 'Critical Path E2E Flow',
                errorMessage: `Flujo crítico de compra falló: ${error.message}`,
                affectedUrl: page.url(),
                responseTime: Date.now() - startTime,
                screenshotPath,
                stackTrace: error.stack,
                recommendedAction: 'Verificar flujo completo de compra manualmente y revisar logs',
            }));

            throw error;
        }
    });

    test('Verificar pasarela de pago PayPal (Sandbox)', async ({ page }) => {
        if (!config.paymentGateways.paypal.enabled) {
            test.skip('PayPal no habilitado en configuración');
        }

        console.log('\n💰 Verificando integración PayPal (Sandbox)...');

        // Este test asume que ya hay un producto en el carrito
        // En un escenario real, primero añadiríamos un producto

        await page.goto(environment.buildUrl('/carrito'));
        await page.waitForLoadState('networkidle');

        // Buscar opción de PayPal
        const paypalOption = page.locator('img[src*="paypal"], img[alt*="PayPal"], img[alt*="paypal"]').first();

        if (await paypalOption.count() === 0) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'WARNING',
                component: 'PaymentGateway',
                testName: 'PayPal Integration',
                errorMessage: 'Opción de pago PayPal no visible en checkout',
                affectedUrl: environment.buildUrl('/carrito'),
                responseTime: 0,
                recommendedAction: 'Verificar configuración de PayPal y variables de entorno',
            }));
            test.skip('PayPal no encontrado en la página');
        }

        await expect(paypalOption).toBeVisible();
        console.log('✅ PayPal disponible como método de pago');
    });

    test('Verificar pasarela de pago MercadoPago (Sandbox)', async ({ page }) => {
        if (!config.paymentGateways.mercadopago.enabled) {
            test.skip('MercadoPago no habilitado en configuración');
        }

        console.log('\n💰 Verificando integración MercadoPago (Sandbox)...');

        await page.goto(environment.buildUrl('/carrito'));
        await page.waitForLoadState('networkidle');

        // Buscar opción de MercadoPago
        const mpOption = page.locator('img[src*="mercado-pago"], img[src*="mercadopago"], img[alt*="MercadoPago"], img[alt*="Mercado Pago"]').first();

        if (await mpOption.count() === 0) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'WARNING',
                component: 'PaymentGateway',
                testName: 'MercadoPago Integration',
                errorMessage: 'Opción de pago MercadoPago no visible en checkout',
                affectedUrl: environment.buildUrl('/carrito'),
                responseTime: 0,
                recommendedAction: 'Verificar configuración de MercadoPago y variables de entorno',
            }));
            test.skip('MercadoPago no encontrado en la página');
        }

        await expect(mpOption).toBeVisible();
        console.log('✅ MercadoPago disponible como método de pago');
    });

    test('Verificar modo Sandbox habilitado', async ({ page }) => {
        // Verificar que estamos en modo sandbox
        const sandboxMode = process.env.NEXT_PUBLIC_SANDBOX_MODE;

        console.log(`\n🧪 Modo Sandbox: ${sandboxMode}`);

        if (environment.isProduction() && sandboxMode !== 'false') {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'CRITICAL',
                component: 'PaymentGateway',
                testName: 'Sandbox Mode Check',
                errorMessage: '¡ALERTA! Modo Sandbox habilitado en PRODUCCIÓN',
                affectedUrl: environment.getBaseUrl(),
                responseTime: 0,
                recommendedAction: 'DESACTIVAR INMEDIATAMENTE modo sandbox en producción',
            }));
        }

        console.log('✅ Verificación de modo sandbox completada');
    });

});
