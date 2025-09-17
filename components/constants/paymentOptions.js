export const paymentOptions = [
  {
    id: 'paypal',
    title: 'PayPal',
    subtitle: 'Hasta 3 MSI con tarjetas de crédito participantes con PayPal.',
    imgSrc: '/images/paypal-logo-footer.png',
    msi: false,
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

// Función helper para encontrar una opción de pago por ID
export const getPaymentOption = (paymentId) =>
  paymentOptions.find(option => option.id === paymentId);

// Función helper para filtrar opciones por tipo (msi o contado)
export const getPaymentOptionsByType = (isMsi, includeSandbox = false) => {
  let options = paymentOptions.filter(option => isMsi ? option.msi : option.contado);
  
  // Agregar opciones de sandbox si está habilitado
  if (includeSandbox && typeof window !== 'undefined') {
    const isSandboxMode = process.env.NODE_ENV === 'development' || 
                          process.env.NEXT_PUBLIC_SANDBOX_MODE === 'true' ||
                          new URLSearchParams(window.location.search).get('sandbox');
    
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