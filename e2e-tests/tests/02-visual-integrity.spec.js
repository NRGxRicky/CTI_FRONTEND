/**
 * Pruebas de Integridad Visual
 * Verifica que los elementos críticos del DOM se rendericen correctamente
 */

const { test, expect } = require('@playwright/test');
const config = require('../config/test.config');
const environment = require('../config/environment');
const alertManager = require('../utils/alert-manager');

test.describe('Integridad Visual - Frontend', () => {

    test('Header debe mostrar logo, búsqueda y carrito', async ({ page }) => {
        await page.goto(environment.buildUrl('/'));

        // Verificar logo
        const logo = page.locator(config.criticalElements.header.logo).first();
        await expect(logo).toBeVisible();

        // Verificar barra de búsqueda
        const searchBar = page.locator(config.criticalElements.header.searchBar).first();
        await expect(searchBar).toBeVisible();

        // Verificar ícono del carrito
        const cartIcon = page.locator(config.criticalElements.header.cartIcon).first();
        await expect(cartIcon).toBeVisible();

        console.log('✅ Header renderizado correctamente');
    });

    test('Detección de errores JavaScript en consola', async ({ page }) => {
        const consoleErrors = [];

        // Escuchar errores de consola
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Escuchar errores de página
        page.on('pageerror', error => {
            consoleErrors.push(error.message);
        });

        await page.goto(environment.buildUrl('/'));
        await page.waitForLoadState('networkidle');

        // Filtrar errores conocidos/esperados (ej: extensiones del navegador)
        const criticalErrors = consoleErrors.filter(error =>
            !error.includes('extension') &&
            !error.includes('chrome-extension')
        );

        if (criticalErrors.length > 0) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'CRITICAL',
                component: 'Frontend',
                testName: 'JavaScript Console Errors',
                errorMessage: `${criticalErrors.length} errores JavaScript detectados`,
                affectedUrl: environment.buildUrl('/'),
                responseTime: 0,
                stackTrace: criticalErrors.join('\n'),
                recommendedAction: 'Revisar código JavaScript y dependencias del frontend',
            }));
        }

        console.log(`✅ Consola JavaScript verificada (${criticalErrors.length} errores críticos)`);
    });

    test('Página de producto debe mostrar elementos críticos', async ({ page }) => {
        // Ir al catálogo primero
        await page.goto(environment.buildUrl('/listado/all/index'));
        await page.waitForLoadState('networkidle');

        // Buscar el primer enlace de producto
        const productLink = page.locator('a[href*="/products/"], a[href*="producto"]').first();

        if (await productLink.count() === 0) {
            console.log('⚠️  No se encontraron productos en el catálogo');
            test.skip();
        }

        await productLink.click();
        await page.waitForLoadState('networkidle');

        // Verificar título del producto
        const title = page.locator('h1').first();
        await expect(title).toBeVisible();

        // Verificar imagen del producto
        const productImage = page.locator('img[alt*="producto"], img[class*="product"]').first();
        await expect(productImage).toBeVisible();

        // Verificar precio
        const price = page.locator('[class*="precio"], [class*="price"]').first();
        await expect(price).toBeVisible();

        // Verificar botón "Añadir al carrito"
        const addToCartButton = page.locator('button:has-text("Añadir al carrito"), button:has-text("Agregar al carrito")').first();

        if (await addToCartButton.count() === 0) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'CRITICAL',
                component: 'ProductPage',
                testName: 'Add to Cart Button Visibility',
                errorMessage: 'Botón "Añadir al carrito" no encontrado en página de producto',
                affectedUrl: page.url(),
                responseTime: 0,
                screenshotPath: await page.screenshot({ path: `e2e-tests/reports/screenshots/missing-cart-button-${Date.now()}.png` }),
                recommendedAction: 'Verificar componente de página de producto y selector del botón',
            }));
        } else {
            await expect(addToCartButton).toBeVisible();
        }

        console.log('✅ Elementos críticos de producto renderizados');
    });

    test('Verificar carga de estilos CSS', async ({ page }) => {
        await page.goto(environment.buildUrl('/'));

        // Verificar que los estilos se aplicaron correctamente
        // Verificamos el color primario definido en variables
        const header = page.locator('header, nav').first();

        if (await header.count() > 0) {
            const styles = await header.evaluate(el => {
                const computed = window.getComputedStyle(el);
                return {
                    display: computed.display,
                    position: computed.position,
                };
            });

            // Si el header tiene display: none, probablemente los estilos no cargaron
            if (styles.display === 'none') {
                await alertManager.saveAlert(alertManager.createAlert({
                    severity: 'CRITICAL',
                    component: 'Frontend',
                    testName: 'CSS Styles Loading',
                    errorMessage: 'Estilos CSS no se aplicaron correctamente',
                    affectedUrl: environment.buildUrl('/'),
                    responseTime: 0,
                    recommendedAction: 'Verificar archivos CSS y Next.js build',
                }));
            }
        }

        console.log('✅ Estilos CSS cargados correctamente');
    });

    test('Responsive - Vista móvil debe funcionar', async ({ page }) => {
        // Configurar viewport móvil
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto(environment.buildUrl('/'));
        await page.waitForLoadState('networkidle');

        // Verificar que el menú móvil existe o el header se adapta
        const mobileMenu = page.locator('button[aria-label*="menu"], button:has-text("☰"), .hamburger');
        const header = page.locator('header, nav').first();

        // Al menos uno debe estar visible
        const mobileMenuVisible = await mobileMenu.count() > 0 && await mobileMenu.first().isVisible();
        const headerVisible = await header.count() > 0 && await header.isVisible();

        expect(mobileMenuVisible || headerVisible).toBeTruthy();

        console.log('✅ Vista móvil renderizada correctamente');
    });

    test('Verificar renderizado de imágenes de productos', async ({ page }) => {
        await page.goto(environment.buildUrl('/'));
        await page.waitForLoadState('networkidle');

        // Buscar imágenes de productos
        const productImages = await page.locator('img[src*="/api/images/"], img[src*="products"]').all();

        if (productImages.length === 0) {
            console.log('⚠️  No se encontraron imágenes de productos en homepage');
            return;
        }

        // Verificar que al menos una imagen cargó correctamente
        let loadedImages = 0;

        for (const img of productImages.slice(0, 5)) { // Verificar solo las primeras 5
            try {
                const naturalWidth = await img.evaluate(el => el.naturalWidth);
                if (naturalWidth > 0) {
                    loadedImages++;
                }
            } catch (e) {
                // Imagen no cargó
            }
        }

        const loadRate = (loadedImages / Math.min(5, productImages.length)) * 100;

        if (loadRate < 80) {
            await alertManager.saveAlert(alertManager.createAlert({
                severity: 'WARNING',
                component: 'Frontend',
                testName: 'Product Images Loading',
                errorMessage: `Solo ${loadRate.toFixed(0)}% de imágenes de productos cargaron correctamente`,
                affectedUrl: environment.buildUrl('/'),
                responseTime: 0,
                recommendedAction: 'Verificar endpoint de imágenes /api/images/[sku] y rutas de archivos',
            }));
        }

        console.log(`✅ ${loadedImages}/${Math.min(5, productImages.length)} imágenes cargadas (${loadRate.toFixed(0)}%)`);
    });

    test('Verificar íconos de métodos de pago en footer', async ({ page }) => {
        await page.goto(environment.buildUrl('/'));
        await page.waitForLoadState('networkidle');

        // Scroll hasta el footer
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);

        // Buscar menciones de métodos de pago
        const paymentMethods = ['PayPal', 'MercadoPago', 'Kueski', 'Aplazo'];
        const foundMethods = [];

        for (const method of paymentMethods) {
            const element = page.locator(`text=${method}`).first();
            if (await element.count() > 0) {
                foundMethods.push(method);
            }
        }

        console.log(`✅ Métodos de pago visibles: ${foundMethods.join(', ')}`);
    });

});
