/**
 * Gestor de Alertas para Sistema de Monitoreo SRE
 * Genera alertas en formato JSON y las distribuye a diferentes canales
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config/test.config');

class AlertManager {
    constructor() {
        this.alertsDir = path.join(__dirname, '..', config.alertConfig.alertsDirectory);
    }

    /**
     * Crea una alerta estructurada
     * @param {Object} alertData - Datos de la alerta
     * @returns {Object} Alerta formateada
     */
    createAlert({
        severity,
        component,
        testName,
        errorMessage,
        affectedUrl,
        responseTime,
        screenshotPath = null,
        stackTrace = null,
        recommendedAction = null,
    }) {
        const alert = {
            status: 'ALERT',
            severity: severity || 'WARNING',
            component,
            timestamp: new Date().toISOString(),
            test_name: testName,
            error_message: errorMessage,
            affected_url: affectedUrl,
            response_time_ms: responseTime,
            screenshot_path: screenshotPath,
            stack_trace: stackTrace,
            recommended_action: recommendedAction || this.getRecommendedAction(component),
            runbook_url: this.getRunbookUrl(component),
            environment: process.env.TEST_ENV || 'production',
        };

        return alert;
    }

    /**
     * Determina la severidad basada en el componente y tiempo de respuesta
     */
    determineSeverity(component, responseTime) {
        const { CRITICAL, WARNING } = config.alertConfig.severityLevels;

        // Verificar componentes críticos
        if (CRITICAL.components.includes(component)) {
            return 'CRITICAL';
        }

        // Verificar tiempo de respuesta
        if (responseTime > CRITICAL.responseTime) {
            return 'CRITICAL';
        }

        if (responseTime > WARNING.responseTime) {
            return 'WARNING';
        }

        return 'INFO';
    }

    /**
     * Guarda la alerta en un archivo JSON
     */
    async saveAlert(alert) {
        try {
            // Crear directorio si no existe
            await fs.mkdir(this.alertsDir, { recursive: true });

            // Nombre de archivo con fecha
            const today = new Date().toISOString().split('T')[0];
            const filename = `alerts-${today}.json`;
            const filepath = path.join(this.alertsDir, filename);

            // Leer alertas existentes o crear array vacío
            let alerts = [];
            try {
                const existing = await fs.readFile(filepath, 'utf-8');
                alerts = JSON.parse(existing);
            } catch (err) {
                // Archivo no existe, crear nuevo
            }

            // Agregar nueva alerta
            alerts.push(alert);

            // Guardar
            await fs.writeFile(filepath, JSON.stringify(alerts, null, 2), 'utf-8');

            console.log(`\n🚨 ALERTA ${alert.severity}: ${alert.error_message}`);
            console.log(`📁 Guardada en: ${filepath}\n`);

            return filepath;
        } catch (error) {
            console.error('Error al guardar alerta:', error);
            throw error;
        }
    }

    /**
     * Genera alerta desde un error de Playwright
     */
    async alertFromTestError(testInfo, error, severity = null) {
        const component = this.extractComponent(testInfo.title);
        const responseTime = testInfo.duration;

        const alert = this.createAlert({
            severity: severity || this.determineSeverity(component, responseTime),
            component,
            testName: testInfo.title,
            errorMessage: error.message || error.toString(),
            affectedUrl: testInfo.project?.use?.baseURL || 'unknown',
            responseTime,
            screenshotPath: testInfo.attachments?.find(a => a.name === 'screenshot')?.path,
            stackTrace: error.stack,
        });

        await this.saveAlert(alert);

        // Enviar a canales externos si está configurado
        await this.distributeAlert(alert);

        return alert;
    }

    /**
     * Extrae el componente del nombre de la prueba
     */
    extractComponent(testTitle) {
        const lowerTitle = testTitle.toLowerCase();

        if (lowerTitle.includes('checkout') || lowerTitle.includes('pago')) {
            return 'Checkout';
        }
        if (lowerTitle.includes('cart') || lowerTitle.includes('carrito')) {
            return 'Cart';
        }
        if (lowerTitle.includes('payment') || lowerTitle.includes('pasarela')) {
            return 'PaymentGateway';
        }
        if (lowerTitle.includes('api') || lowerTitle.includes('backend')) {
            return 'API';
        }
        if (lowerTitle.includes('database') || lowerTitle.includes('db')) {
            return 'Database';
        }
        if (lowerTitle.includes('product') || lowerTitle.includes('producto')) {
            return 'ProductPage';
        }

        return 'Frontend';
    }

    /**
     * Obtiene acción recomendada basada en el componente
     */
    getRecommendedAction(component) {
        const actions = {
            Checkout: 'Verificar flujo de checkout y validación de formularios',
            Cart: 'Revisar funcionalidad del carrito y actualización de items',
            PaymentGateway: 'Validar integración con pasarelas de pago (PayPal, MercadoPago)',
            API: 'Verificar conectividad y respuestas de API backend',
            Database: 'Revisar conexión a base de datos y queries',
            ProductPage: 'Verificar renderizado de productos y carga de imágenes',
            Frontend: 'Revisar consola del navegador para errores JavaScript',
        };

        return actions[component] || 'Investigar error y revisar logs del servidor';
    }

    /**
     * Obtiene URL del runbook (documentación)
     */
    getRunbookUrl(component) {
        // Puedes personalizar esto con URLs reales de tu documentación
        return `https://docs.internal/runbooks/${component.toLowerCase()}`;
    }

    /**
     * Distribuye la alerta a canales externos
     */
    async distributeAlert(alert) {
        const promises = [];

        // Slack
        if (config.alertConfig.slack?.enabled) {
            promises.push(this.sendToSlack(alert));
        }

        // Email
        if (config.alertConfig.email?.enabled) {
            promises.push(this.sendToEmail(alert));
        }

        await Promise.allSettled(promises);
    }

    /**
     * Envía alerta a Slack
     */
    async sendToSlack(alert) {
        // Implementación de webhook de Slack
        const webhook = config.alertConfig.slack.webhook;
        if (!webhook) return;

        const color = {
            CRITICAL: '#ff0000',
            WARNING: '#ffa500',
            INFO: '#0000ff',
        }[alert.severity];

        const payload = {
            attachments: [{
                color,
                title: `🚨 ${alert.severity}: ${alert.component}`,
                text: alert.error_message,
                fields: [
                    { title: 'URL Afectada', value: alert.affected_url, short: true },
                    { title: 'Tiempo de Respuesta', value: `${alert.response_time_ms}ms`, short: true },
                    { title: 'Prueba', value: alert.test_name, short: false },
                    { title: 'Acción Recomendada', value: alert.recommended_action, short: false },
                ],
                footer: 'Sistema de Monitoreo CTI',
                ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
            }],
        };

        try {
            const response = await fetch(webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error('Error al enviar a Slack:', response.statusText);
            }
        } catch (error) {
            console.error('Error al enviar a Slack:', error);
        }
    }

    /**
     * Envía alerta por email
     */
    async sendToEmail(alert) {
        // Placeholder - implementar con nodemailer u otro servicio SMTP
        console.log('📧 Email notification (not implemented):', alert.error_message);
    }

    /**
     * Genera resumen de alertas del día
     */
    async getDailySummary() {
        const today = new Date().toISOString().split('T')[0];
        const filename = `alerts-${today}.json`;
        const filepath = path.join(this.alertsDir, filename);

        try {
            const data = await fs.readFile(filepath, 'utf-8');
            const alerts = JSON.parse(data);

            const summary = {
                date: today,
                total: alerts.length,
                critical: alerts.filter(a => a.severity === 'CRITICAL').length,
                warning: alerts.filter(a => a.severity === 'WARNING').length,
                info: alerts.filter(a => a.severity === 'INFO').length,
                components: this.groupByComponent(alerts),
            };

            return summary;
        } catch (error) {
            return {
                date: today,
                total: 0,
                critical: 0,
                warning: 0,
                info: 0,
                components: {},
            };
        }
    }

    /**
     * Agrupa alertas por componente
     */
    groupByComponent(alerts) {
        return alerts.reduce((acc, alert) => {
            if (!acc[alert.component]) {
                acc[alert.component] = 0;
            }
            acc[alert.component]++;
            return acc;
        }, {});
    }
}

module.exports = new AlertManager();
