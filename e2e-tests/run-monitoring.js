#!/usr/bin/env node

/**
 * Script de Orquestación de Monitoreo SRE
 * Ejecuta todas las pruebas E2E y genera reportes consolidados
 * Configurado para ejecutarse cada 30 minutos
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');

const REPORTS_DIR = path.join(__dirname, 'reports');
const ALERTS_DIR = path.join(REPORTS_DIR, 'alerts');

class MonitoringOrchestrator {
    constructor() {
        this.isRunning = false;
        this.lastRun = null;
        this.runCount = 0;
    }

    /**
     * Ejecuta todas las pruebas
     */
    async runTests() {
        if (this.isRunning) {
            console.log('⚠️  Ya hay una ejecución en progreso, saltando...');
            return;
        }

        this.isRunning = true;
        this.runCount++;
        const startTime = Date.now();

        console.log('\n' + '='.repeat(60));
        console.log(`🚀 INICIANDO MONITOREO #${this.runCount}`);
        console.log(`⏰ ${new Date().toLocaleString('es-MX')}`);
        console.log('='.repeat(60) + '\n');

        try {
            // Ejecutar Playwright tests
            console.log('📊 Ejecutando pruebas Playwright...\n');

            const output = execSync('npx playwright test', {
                cwd: path.join(__dirname, '..'),
                encoding: 'utf-8',
                stdio: 'pipe',
            });

            console.log(output);

            // Generar reporte consolidado
            await this.generateConsolidatedReport();

            // Mostrar resumen de alertas
            await this.displayAlertsSummary();

            const duration = Date.now() - startTime;
            console.log(`\n✅ Monitoreo completado en ${(duration / 1000).toFixed(2)}s`);

        } catch (error) {
            console.error('\n❌ Error durante la ejecución de pruebas:');
            console.error(error.message);

            if (error.stdout) {
                console.log('\n📋 Output de pruebas:');
                console.log(error.stdout.toString());
            }

            // Incluso con errores, generar reporte
            await this.generateConsolidatedReport();
            await this.displayAlertsSummary();

        } finally {
            this.isRunning = false;
            this.lastRun = new Date();

            console.log('\n' + '='.repeat(60));
            console.log(`⏭️  Próxima ejecución en 30 minutos`);
            console.log('='.repeat(60) + '\n');
        }
    }

    /**
     * Genera reporte consolidado
     */
    async generateConsolidatedReport() {
        try {
            // Leer el reporte JSON de Playwright
            const reportPath = path.join(REPORTS_DIR, 'latest-run.json');

            let playwrightReport = null;
            try {
                const reportData = await fs.readFile(reportPath, 'utf-8');
                playwrightReport = JSON.parse(reportData);
            } catch (err) {
                console.log('ℹ️  No se pudo leer reporte de Playwright');
            }

            // Generar resumen
            const summary = {
                timestamp: new Date().toISOString(),
                runNumber: this.runCount,
                environment: process.env.TEST_ENV || 'production',
                baseUrl: process.env.TEST_BASE_URL || 'https://ctisystems.com.mx',
                tests: playwrightReport?.suites?.length || 0,
                duration: playwrightReport?.duration || 0,
            };

            // Guardar resumen
            const summaryPath = path.join(REPORTS_DIR, 'monitoring-summary.json');
            await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

            console.log('\n📄 Reporte consolidado generado:', summaryPath);

        } catch (error) {
            console.error('Error generando reporte consolidado:', error.message);
        }
    }

    /**
     * Muestra resumen de alertas del día
     */
    async displayAlertsSummary() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const alertsFile = path.join(ALERTS_DIR, `alerts-${today}.json`);

            try {
                const alertsData = await fs.readFile(alertsFile, 'utf-8');
                const alerts = JSON.parse(alertsData);

                if (alerts.length === 0) {
                    console.log('\n✅ No hay alertas hoy');
                    return;
                }

                const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
                const warnings = alerts.filter(a => a.severity === 'WARNING').length;
                const info = alerts.filter(a => a.severity === 'INFO').length;

                console.log('\n' + '='.repeat(60));
                console.log('🚨 RESUMEN DE ALERTAS DEL DÍA');
                console.log('='.repeat(60));
                console.log(`Total: ${alerts.length} alertas`);
                console.log(`  🔴 CRITICAL: ${critical}`);
                console.log(`  🟡 WARNING: ${warnings}`);
                console.log(`  🔵 INFO: ${info}`);
                console.log('='.repeat(60));

                // Mostrar últimas 3 alertas
                if (alerts.length > 0) {
                    console.log('\n📋 Últimas alertas:');
                    alerts.slice(-3).reverse().forEach((alert, index) => {
                        const icon = {
                            CRITICAL: '🔴',
                            WARNING: '🟡',
                            INFO: '🔵',
                        }[alert.severity];

                        console.log(`\n${index + 1}. ${icon} ${alert.severity} - ${alert.component}`);
                        console.log(`   ${alert.error_message}`);
                        console.log(`   URL: ${alert.affected_url}`);
                        console.log(`   Tiempo: ${new Date(alert.timestamp).toLocaleTimeString('es-MX')}`);
                    });
                }

                console.log('\n📁 Archivo completo de alertas:', alertsFile);

            } catch (err) {
                console.log('\n✅ No hay alertas registradas hoy');
            }

        } catch (error) {
            console.error('Error mostrando resumen de alertas:', error.message);
        }
    }

    /**
     * Inicia el monitoreo programado con cron
     */
    startScheduledMonitoring() {
        console.log('🔄 Iniciando monitoreo programado...');
        console.log('⏰ Intervalo: Cada 30 minutos');
        console.log('🌐 Entorno:', process.env.TEST_ENV || 'production');
        console.log('🔗 Base URL:', process.env.TEST_BASE_URL || 'https://ctisystems.com.mx');
        console.log('\nPresiona Ctrl+C para detener el monitoreo');
        console.log('='.repeat(60));

        // Ejecutar inmediatamente
        this.runTests();

        // Programar cada 30 minutos
        // Formato cron: */30 * * * * (cada 30 minutos)
        // TEMPORALMENTE DESACTIVADO - 2026-02-09
// Razón: Actualizando tests para usar nuevos endpoints (catalog, getprodstock, getprodprice_warehouse)
// TODO: Reactivar después de actualizar tests
/*
cron.schedule('*/30 * * * * ', async () => {
        console.log('🔄 Starting scheduled monitoring...');
        await this.runTests();
    }, {
    timezone: "America/Mexico_City"
});
*/

console.log('⚠️  MONITOREO DESACTIVADO TEMPORALMENTE - Actualizando a nuevos endpoints');
console.log('Para ejecutar tests manualmente: npm run monitor:once');
// Mantener el proceso vivo
process.on('SIGINT', () => {
    console.log('\n\n👋 Deteniendo monitoreo...');
    console.log(`Total de ejecuciones: ${this.runCount}`);
    console.log('¡Hasta pronto!\n');
    process.exit(0);
});
    }

    /**
     * Ejecuta una sola vez (para testing)
     */
    async runOnce() {
    console.log('🔄 Ejecutando monitoreo una sola vez...\n');
    await this.runTests();
    process.exit(0);
}
}

// ============================================
// MAIN
// ============================================

const orchestrator = new MonitoringOrchestrator();

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--once')) {
    // Ejecutar una sola vez
    orchestrator.runOnce();
} else {
    // Ejecutar programado (cada 30 minutos)
    orchestrator.startScheduledMonitoring();
}
