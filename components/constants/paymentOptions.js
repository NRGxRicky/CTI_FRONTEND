// Helpers para leer variables de entorno de forma segura en runtime del navegador
const getEnv = (key, defaultValue = undefined) => {
  // Usa globalThis para evitar referenciar directamente 'process' y caer en no-undef
  const env = (typeof globalThis !== 'undefined' &&
    globalThis.process &&
    globalThis.process.env)
    ? globalThis.process.env
    : undefined;
  return env && env[key] !== undefined ? env[key] : defaultValue;
};

const getEnvBoolean = (key, defaultValue = false) => {
  const raw = getEnv(key, undefined);
  if (raw === undefined) return defaultValue;
  return String(raw).toLowerCase() === 'true';
};

const getEnvList = (key, defaultValue = []) => {
  const raw = getEnv(key, undefined);
  if (!raw) return defaultValue;
  return String(raw)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
};

// IDs habilitados (si no se define, se asume que todos están habilitados)
const enabledPaymentIds = new Set(
  getEnvList('NEXT_PUBLIC_PAYMENTS_ENABLED_IDS', [])
);

// Obtiene overrides por método
const resolveFlags = (id, defaults) => {
  const upperId = id.toUpperCase();
  const msi = getEnvBoolean(`NEXT_PUBLIC_PAYMENT_${upperId}_MSI`, defaults.msi);
  const contado = getEnvBoolean(
    `NEXT_PUBLIC_PAYMENT_${upperId}_CONTADO`,
    defaults.contado
  );
  return { msi, contado };
};

const basePaymentOptions = [
  {
    id: 'paypal',
    title: 'PayPal',
    subtitle: 'Hasta 3 MSI con tarjetas de crédito participantes con PayPal.',
    imgSrc: '/images/paypal-logo-footer.png',
    msi: true,
    contado: false,
  },
  {
    id: 'mercadopago',
    title: 'Mercado Pago',
    subtitle: 'Disfruta de un pago único con Mercado Pago o hasta 12 pagos con Mercado Crédito.',
    imgSrc: '/images/logo-mercado-pago.png',
    msi: false,
    contado: true,
  },
  {
    id: 'kueskipay',
    title: 'Kueski Pay',
    subtitle: 'Paga en hasta 12 quincenas con Kueski Pay, sin comisiones ocultas.',
    imgSrc: '/images/Logotipo_Kueski_pay.png',
    msi: true,
    contado: false,
  },
  {
    id: 'aplazo',
    title: 'Aplazo',
    subtitle: 'Divide tus pagos en quincenas con Aplazo, sin letras pequeñas.',
    imgSrc: '/images/logo-aplazo_v2.png',
    msi: true,
    contado: false,
  },
  {
    id: 'deposit',
    title: 'Depósito/Transferencia Interbancaria',
    subtitle: '',
    imgSrc: '/images/logos/deposit-3banks.png',
    msi: false,
    contado: false,
  },
];

// Aplica overrides desde .env.local y filtra por IDs habilitados
export const paymentOptions = basePaymentOptions
  .map(option => {
    const flags = resolveFlags(option.id, { msi: option.msi, contado: option.contado });
    return { ...option, ...flags };
  })
  .filter(option => {
    // Si no se especificaron IDs, no filtramos; si se especificaron, dejamos solo los habilitados
    return enabledPaymentIds.size === 0 || enabledPaymentIds.has(option.id);
  })
  // Oculta métodos completamente deshabilitados por env (sin MSI ni Contado)
  .filter(option => option.msi || option.contado);

// Función helper para encontrar una opción de pago por ID
export const getPaymentOption = (paymentId) =>
  paymentOptions.find(option => option.id === paymentId);

// Función helper para filtrar opciones por tipo (msi o contado)
export const getPaymentOptionsByType = (isMsi, includeSandbox = false) => {
  let options = paymentOptions.filter(option => (isMsi ? option.msi : option.contado));

  // Agregar opciones de sandbox si está habilitado
  if (includeSandbox) {
    const isDev = (typeof globalThis !== 'undefined' &&
      globalThis.process &&
      globalThis.process.env &&
      globalThis.process.env.NODE_ENV === 'development');
    const sandboxEnv = getEnvBoolean('NEXT_PUBLIC_SANDBOX_MODE', false);
    const isSandboxMode = isDev || sandboxEnv;

    if (isSandboxMode) {
      const sandboxOptions = [
        {
          id: 'sandbox_card',
          title: '💳 Tarjeta Sandbox',
          subtitle: 'Simula pago con tarjeta (siempre exitoso)',
          imgSrc: '/images/sandbox-card.png',
          msi: true,
          contado: true,
          sandbox: true
        },
        {
          id: 'sandbox_paypal',
          title: '🅿️ PayPal Sandbox',
          subtitle: 'Simula pago con PayPal (siempre exitoso)',
          imgSrc: '/images/paypal-logo-footer.png',
          msi: true,
          contado: true,
          sandbox: true
        },
        {
          id: 'sandbox_transfer',
          title: '🏦 Transferencia Sandbox',
          subtitle: 'Simula transferencia bancaria (siempre exitosa)',
          imgSrc: '/images/logos/deposit-3banks.png',
          msi: true,
          contado: true,
          sandbox: true
        },
        {
          id: 'sandbox_failure',
          title: '❌ Pago Fallido (Test)',
          subtitle: 'Simula fallo de pago para testing',
          imgSrc: '/images/sandbox-error.png',
          msi: true,
          contado: true,
          sandbox: true
        }
      ];

      options = [...options, ...sandboxOptions];
    }
  }

  return options;
}; 