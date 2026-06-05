/**
 * Configuración de pruebas E2E para monitoreo SRE
 * Define umbrales de rendimiento, URLs críticas y configuraciones de entorno
 */

module.exports = {
    // Configuración de entorno
    environments: {
        production: {
            baseUrl: 'https://ctisystems.com.mx',
            apiUrl: 'https://pchtest.to-do.mx',
            name: 'Producción',
        },
        staging: {
            baseUrl: 'https://staging.ctimx.io',
            apiUrl: 'https://pchtest.to-do.mx',
            name: 'Staging',
        },
        local: {
            baseUrl: 'http://localhost:3000',
            apiUrl: 'http://localhost:8000',
            name: 'Local',
        },
    },

    // Entorno actual (puede sobreescribirse con variable de entorno)
    currentEnvironment: process.env.TEST_ENV || 'production',

    // Umbrales de rendimiento (en milisegundos)
    performanceThresholds: {
        pageLoadTime: 3000,        // Tiempo máximo de carga de página
        apiResponseTime: 2000,      // Tiempo máximo de respuesta de API
        criticalApiTime: 5000,      // APIs críticas (ej: checkout)
        imageLoadTime: 5000,        // Carga de imágenes
    },

    // URLs críticas para smoke tests
    criticalPages: [
        { path: '/', name: 'Página de Inicio' },
        { path: '/listado/all/index', name: 'Catálogo de Productos' },
        { path: '/login', name: 'Login' },
        { path: '/carrito', name: 'Carrito', requiresAuth: true },
    ],

    // Productos de prueba para E2E
    testProducts: {
        // SKU de producto de prueba en tu catálogo
        sampleSku: '100066',  // Ajusta según un producto real
        sampleHandle: 'laptop-test', // Ajusta según un producto real
    },

    // Credenciales de prueba (modo sandbox)
    testCredentials: {
        email: 'test@example.com',
        password: 'TestPassword123!',
        // IMPORTANTE: Estas son credenciales SANDBOX, no reales
    },

    // Configuración de pasarelas de pago en sandbox
    paymentGateways: {
        paypal: {
            enabled: true,
            sandbox: true,
            testAccount: 'sb-buyer@test.com',
        },
        mercadopago: {
            enabled: true,
            sandbox: true,
            testCard: '5031 7557 3453 0604', // Tarjeta de prueba MP
        },
        kueskipay: {
            enabled: true,
            sandbox: true,
        },
        aplazo: {
            enabled: true,
            sandbox: true,
        },
    },

    // Configuración de reintentos
    retryConfig: {
        maxRetries: 2,
        retryDelay: 1000, // ms entre reintentos
    },

    // Configuración de timeouts
    timeouts: {
        test: 60000,           // 60 segundos por prueba
        assertion: 10000,      // 10 segundos para assertions
        navigation: 30000,     // 30 segundos para navegación
    },

    // Configuración de alertas
    alertConfig: {
        severityLevels: {
            CRITICAL: {
                // Fallos que impiden compras
                components: ['Checkout', 'PaymentGateway', 'Cart'],
                responseTime: 5000,
            },
            WARNING: {
                // Problemas que afectan UX pero no bloquean
                components: ['ProductPage', 'Search', 'Images'],
                responseTime: 3000,
            },
            INFO: {
                // Información general
                components: ['Footer', 'Newsletter'],
                responseTime: 2000,
            },
        },

        // Guardar alertas localmente
        saveToFile: true,
        alertsDirectory: './reports/alerts',

        // Integración con servicios externos (opcional)
        slack: {
            enabled: false,
            webhook: process.env.SLACK_WEBHOOK_URL,
        },
        email: {
            enabled: false,
            smtp: process.env.SMTP_CONFIG,
        },
    },

    // Elementos críticos del DOM para verificar
    criticalElements: {
        header: {
            logo: 'img[alt*="CTI"]',
            searchBar: 'input[type="search"], input[placeholder*="Buscar"]',
            cartIcon: 'a[href*="carrito"]',
        },
        productPage: {
            addToCartButton: 'button:has-text("Añadir al carrito")',
            price: '[class*="precio"], [class*="price"]',
            image: 'img[alt*="producto"], img[src*="products"]',
            title: 'h1',
        },
        cart: {
            summary: '[class*="cart-summary"], [class*="carrito"]',
            checkoutButton: 'button:has-text("Continuar"), a:has-text("Continuar")',
            productList: '[class*="cart-item"], [class*="producto"]',
        },
    },

    // Configuración de métricas
    metricsConfig: {
        collectMetrics: true,
        metricsFile: './reports/metrics.json',
        trackHistory: true,
        historyDays: 30,
    },
};
