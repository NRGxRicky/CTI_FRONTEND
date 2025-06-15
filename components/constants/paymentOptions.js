export const paymentOptions = [
  {
    id: 'paypal',
    title: 'PayPal',
    subtitle: 'Hasta 3 MSI con tarjetas participantes PayPal.',
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

// Función helper para encontrar una opción de pago por ID
export const getPaymentOption = (paymentId) =>
  paymentOptions.find(option => option.id === paymentId);

// Función helper para filtrar opciones por tipo (msi o contado)
export const getPaymentOptionsByType = (isMsi) =>
  paymentOptions.filter(option => isMsi ? option.msi : option.contado); 