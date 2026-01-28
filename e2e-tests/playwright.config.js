const { defineConfig, devices } = require('@playwright/test');

/**
 * Configuración de Playwright para pruebas E2E del sistema de monitoreo CTI
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    testDir: './tests',

    // Directorio para resultados de pruebas
    outputDir: './reports/test-results',

    // Timeout global para cada prueba (aumentado para mejor tolerancia)
    timeout: 90 * 1000, // 90 segundos

    // Configuración de expect
    expect: {
        timeout: 15000, // 15 segundos para assertions
    },

    // Configuración de ejecución
    fullyParallel: false, // Ejecutar pruebas en secuencia para monitoreo
    forbidOnly: !!process.env.CI, // Fallar si hay test.only en CI
    retries: 2, // Reintentar pruebas fallidas 2 veces
    workers: 1, // Un solo worker para monitoreo secuencial

    // Reporteros
    reporter: [
        ['html', { outputFolder: './reports/html-report' }],
        ['json', { outputFile: './reports/latest-run.json' }],
        ['list'] // Output en consola
    ],

    // Configuración compartida para todos los proyectos
    use: {
        // URL base para navegación
        baseURL: process.env.TEST_BASE_URL || 'https://ctimx.io',

        // Captura de trazas en primera reintento
        trace: 'on-first-retry',

        // Capturas de pantalla solo en fallos
        screenshot: 'only-on-failure',

        // Videos solo en fallos
        video: 'retain-on-failure',

        // Timeout de navegación (aumentado para páginas lentas)
        navigationTimeout: 45000, // 45 segundos

        // Timeout de acciones
        actionTimeout: 20000, // 20 segundos
    },

    // Configurar proyectos para diferentes navegadores
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 }
            },
        },

        // Descomenta para probar en más navegadores
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        // Pruebas móviles
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],

    // Servidor de desarrollo local (opcional)
    // webServer: {
    //   command: 'npm run dev',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
