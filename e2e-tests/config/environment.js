/**
 * Gestión de variables de entorno para pruebas E2E
 */

const config = require('./test.config');

class Environment {
    constructor() {
        this.currentEnv = process.env.TEST_ENV || config.currentEnvironment;
        this.envConfig = config.environments[this.currentEnv];

        if (!this.envConfig) {
            throw new Error(`Entorno no válido: ${this.currentEnv}`);
        }
    }

    /**
     * Obtiene la URL base del entorno actual
     */
    getBaseUrl() {
        return process.env.TEST_BASE_URL || this.envConfig.baseUrl;
    }

    /**
     * Obtiene la URL de la API
     */
    getApiUrl() {
        return process.env.TEST_API_URL || this.envConfig.apiUrl;
    }

    /**
     * Obtiene el nombre del entorno
     */
    getEnvironmentName() {
        return this.envConfig.name;
    }

    /**
     * Verifica si estamos en producción
     */
    isProduction() {
        return this.currentEnv === 'production';
    }

    /**
     * Verifica si estamos en staging
     */
    isStaging() {
        return this.currentEnv === 'staging';
    }

    /**
     * Verifica si estamos en local
     */
    isLocal() {
        return this.currentEnv === 'local';
    }

    /**
     * Obtiene credenciales de prueba
     */
    getTestCredentials() {
        return config.testCredentials;
    }

    /**
     * Obtiene configuración de pasarelas de pago
     */
    getPaymentGateways() {
        return config.paymentGateways;
    }

    /**
     * Genera URL completa a partir de path
     */
    buildUrl(path) {
        const baseUrl = this.getBaseUrl();
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${normalizedPath}`;
    }
}

module.exports = new Environment();
