# Sistema de Monitoreo SRE/QA para CTI E-Commerce

Sistema automatizado de monitoreo y pruebas para asegurar 99.9% de disponibilidad y funcionalidad perfecta del flujo de compra.

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Instalar dependencias (si no está hecho)
npm install

# Instalar navegadores de Playwright
npx playwright install
```

### 2. Configuración

Las pruebas usan las variables de entorno de tu archivo `.env.local`. Asegúrate de que estén configuradas:

```env
NEXT_PUBLIC_API_URL=https://pchtest.to-do.mx
NEXT_PUBLIC_API_CUSTOMER=81276
NEXT_PUBLIC_API_KEY=0LlAN2nJRl0tdYtk
NEXT_PUBLIC_SANDBOX_MODE=true
```

### 3. Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas una vez
npm run test:e2e

# Ejecutar pruebas específicas
npm run test:smoke      # Pruebas de disponibilidad
npm run test:visual     # Pruebas de integridad visual
npm run test:critical   # Flujo crítico de compra
npm run test:api        # Pruebas de API/backend

# Iniciar monitoreo continuo (cada 30 minutos)
npm run monitor

# Ejecutar una sola vez (para probar)
npm run monitor:once
```

## 📊 Estructura de Pruebas

```
e2e-tests/
├── config/
│   ├── test.config.js       # Configuración principal
│   └── environment.js       # Gestión de entornos
├── tests/
│   ├── 01-smoke-tests.spec.js      # ✅ Disponibilidad HTTP, SSL, CDN
│   ├── 02-visual-integrity.spec.js # ✅ DOM, JavaScript, CSS, Responsive
│   ├── 03-critical-path.spec.js    # ✅ Flujo E2E de compra
│   └── 04-api-backend.spec.js      # ✅ APIs, autenticación, rendimiento
├── utils/
│   └── alert-manager.js     # Sistema de alertas JSON
├── reports/
│   ├── latest-run.json      # Último resultado
│   ├── alerts/              # Alertas por día
│   └── screenshots/         # Capturas de pantalla de errores
└── run-monitoring.js        # Orquestador principal
```

## 🚨 Sistema de Alertas

Las alertas se guardan en archivos JSON por fecha:

```
e2e-tests/reports/alerts/alerts-2026-01-25.json
```

### Formato de Alerta

```json
{
  "status": "ALERT",
  "severity": "CRITICAL|WARNING|INFO",
  "component": "Checkout|API|Frontend|PaymentGateway",
  "timestamp": "2026-01-25T20:00:00Z",
  "test_name": "Critical Path E2E Flow",
  "error_message": "Descripción del error",
  "affected_url": "https://ctimx.io/carrito",
  "response_time_ms": 4523,
  "screenshot_path": "./reports/screenshots/error.png",
  "recommended_action": "Acción sugerida para resolver"
}
```

### Ver Alertas

```bash
# Las alertas se muestran automáticamente al final de cada ejecución
# O puedes ver el archivo directamente:
cat e2e-tests/reports/alerts/alerts-$(date +%Y-%m-%d).json
```

## 📈 Métricas Monitoreadas

### Disponibilidad
- ✅ HTTP 200 OK en páginas críticas
- ✅ Tiempo de respuesta < 3 segundos
- ✅ Certificado SSL válido
- ✅ CDN de imágenes operativo

### Integridad Visual
- ✅ Elementos DOM críticos presentes
- ✅ Sin errores JavaScript en consola
- ✅ CSS cargando correctamente
- ✅ Responsive design funcional

### Flujo de Compra (E2E)
- ✅ Búsqueda de productos
- ✅ Selección de producto
- ✅ Añadir al carrito
- ✅ Proceso de checkout
- ✅ Pasarelas de pago (sandbox)

### API/Backend
- ✅ API de productos respondiendo
- ✅ JSON válido con campos requeridos
- ✅ Tiempo de respuesta < 2 segundos
- ✅ Conversión USD a MXN correcta
- ✅ Endpoint de imágenes funcional

## ⚙️ Configuración Avanzada

### Cambiar Entorno

```bash
# Producción (default)
export TEST_ENV=production
export TEST_BASE_URL=https://ctimx.io

# Staging
export TEST_ENV=staging
export TEST_BASE_URL=https://staging.ctimx.io

# Local
export TEST_ENV=local
export TEST_BASE_URL=http://localhost:3000
```

### Ajustar Umbrales de Rendimiento

Edita `e2e-tests/config/test.config.js`:

```javascript
performanceThresholds: {
  pageLoadTime: 3000,      // ms
  apiResponseTime: 2000,   // ms
  criticalApiTime: 5000,   // ms
}
```

### Configurar Alertas Externas

Para enviar alertas a Slack/Email, edita `e2e-tests/config/test.config.js`:

```javascript
alertConfig: {
  slack: {
    enabled: true,
    webhook: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  },
  email: {
    enabled: true,
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      user: 'tu-email@gmail.com',
      pass: 'tu-password',
    },
  },
}
```

## 🔧 Troubleshooting

### Error: "Playwright no instalado"

```bash
npx playwright install
```

### Error: "Timeout navegando a página"

Verifica tu conexión a internet y que el sitio esté disponible. Puedes aumentar el timeout en `playwright.config.js`:

```javascript
timeout: 120 * 1000, // 2 minutos
```

### Pruebas fallan por cambios en el diseño

Actualiza los selectores en `e2e-tests/config/test.config.js`:

```javascript
criticalElements: {
  productPage: {
    addToCartButton: 'button:has-text("Añadir al carrito")',
    // Actualiza según tu HTML
  },
}
```

## 📝 Reportes

### Reporte HTML

Después de ejecutar pruebas, abre:

```
e2e-tests/reports/html-report/index.html
```

### Reporte JSON

```bash
cat e2e-tests/reports/latest-run.json | jq
```

### Resumen Diario de Alertas

El script de monitoreo muestra automáticamente un resumen al final de cada ejecución.

## 🔄 Programación Automática

### Linux/Mac (Cron)

```bash
# Editar crontab
crontab -e

# Agregar línea (cada 30 minutos)
*/30 * * * * cd /ruta/a/CTI_FRONTEND && npm run monitor:once >> /var/log/cti-monitoring.log 2>&1
```

### Windows (Task Scheduler)

1. Abrir "Programador de tareas"
2. Crear tarea básica
3. Trigger: Cada 30 minutos
4. Acción: Ejecutar `npm run monitor:once` en el directorio del proyecto

### GitHub Actions

Creamos un workflow que se ejecuta cada 30 minutos:

```yaml
# .github/workflows/monitoring.yml
name: Monitoreo E2E

on:
  schedule:
    - cron: '*/30 * * * *'  # Cada 30 minutos
  workflow_dispatch:  # Ejecución manual

jobs:
  monitoring:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: e2e-tests/reports/
```

## 🎯 Objetivos de Monitoreo

- **Uptime**: 99.9%
- **Tiempo de respuesta**: < 3 segundos
- **API latencia**: < 2 segundos
- **Zero JavaScript errors** en páginas críticas
- **100% disponibilidad** de pasarelas de pago

## 📞 Soporte

Si encuentras problemas con el sistema de monitoreo, verifica:

1. ✅ Todas las dependencias instaladas (`npm install`)
2. ✅ Playwright instalado (`npx playwright install`)
3. ✅ Variables de entorno configuradas (`.env.local`)
4. ✅ Conexión a internet estable
5. ✅ Sitio web accesible

---

**¡Sistema de Monitoreo SRE Activo! 🚀**

Ejecuta `npm run monitor` para comenzar el monitoreo continuo cada 30 minutos.
