import { useState, useEffect } from 'react';

/**
 * Hook para manejar el modo sandbox de forma segura
 * Solo se activa en desarrollo o con parámetros específicos
 */
export const useSandbox = () => {
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [sandboxConfig, setSandboxConfig] = useState({
    enabled: false,
    skipPayment: false,
    autoApprove: false,
    mockPaymentMethods: [],
    debugMode: false
  });

  useEffect(() => {
    // Verificar si estamos en modo desarrollo
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Verificar variables de entorno para sandbox
    const sandboxEnabled = process.env.NEXT_PUBLIC_SANDBOX_MODE === 'true';
    const sandboxKey = process.env.NEXT_PUBLIC_SANDBOX_KEY;
    
    // Verificar parámetros URL para activación temporal
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSandbox = urlParams.get('sandbox');
      const urlKey = urlParams.get('sandbox_key');
      
      // Solo activar sandbox si:
      // 1. Estamos en desarrollo, O
      // 2. Sandbox está habilitado en .env Y la clave coincide, O
      // 3. Se proporciona clave correcta via URL
      const validKey = sandboxKey && (urlKey === sandboxKey);
      const shouldEnable = isDevelopment || (sandboxEnabled && validKey) || validKey;
      
      if (shouldEnable) {
        setIsSandboxMode(true);
        setSandboxConfig({
          enabled: true,
          skipPayment: urlParams.get('skip_payment') !== 'false', // true por defecto
          autoApprove: urlParams.get('auto_approve') !== 'false', // true por defecto
          mockPaymentMethods: ['sandbox_card', 'sandbox_paypal', 'sandbox_transfer'],
          debugMode: urlParams.get('debug') === 'true' || isDevelopment
        });
        
        // Log de activación solo en modo debug
        if (isDevelopment || urlParams.get('debug') === 'true') {
          console.log('🏖️ SANDBOX MODE ACTIVADO', {
            isDevelopment,
            sandboxEnabled,
            hasValidKey: !!validKey,
            config: sandboxConfig
          });
        }
      }
    }
  }, []);

  // Función para simular procesamiento de pago
  const simulatePayment = async (paymentData) => {
    if (!isSandboxMode) {
      throw new Error('Sandbox mode not enabled');
    }

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular respuesta exitosa
    return {
      success: true,
      orderId: `SANDBOX_${Date.now()}`,
      transactionId: `TXN_${Math.random().toString(36).substr(2, 9)}`,
      status: 'approved',
      paymentMethod: paymentData.payment_method || 'sandbox_payment',
      amount: paymentData.amount || 0,
      currency: 'MXN',
      timestamp: new Date().toISOString(),
      sandbox: true
    };
  };

  // Función para simular fallo de pago (para testing)
  const simulatePaymentFailure = async (reason = 'insufficient_funds') => {
    if (!isSandboxMode) {
      throw new Error('Sandbox mode not enabled');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: false,
      error: reason,
      errorMessage: getSandboxErrorMessage(reason),
      sandbox: true
    };
  };

  // Función para obtener métodos de pago de sandbox
  const getSandboxPaymentMethods = () => {
    if (!isSandboxMode) return [];

    return [
      {
        id: 'sandbox_card',
        title: '💳 Tarjeta Sandbox',
        subtitle: 'Simula pago con tarjeta (siempre exitoso)',
        imgSrc: '/images/sandbox-card.png',
        sandbox: true
      },
      {
        id: 'sandbox_paypal',
        title: '🅿️ PayPal Sandbox',
        subtitle: 'Simula pago con PayPal (siempre exitoso)',
        imgSrc: '/images/paypal-logo-footer.png',
        sandbox: true
      },
      {
        id: 'sandbox_transfer',
        title: '🏦 Transferencia Sandbox',
        subtitle: 'Simula transferencia bancaria (siempre exitosa)',
        imgSrc: '/images/logos/deposit-3banks.png',
        sandbox: true
      },
      {
        id: 'sandbox_failure',
        title: '❌ Pago Fallido (Test)',
        subtitle: 'Simula fallo de pago para testing',
        imgSrc: '/images/sandbox-error.png',
        sandbox: true
      }
    ];
  };

  // Función para verificar si se debe saltar la pasarela de pago
  const shouldSkipPaymentGateway = (paymentMethod) => {
    return isSandboxMode && 
           sandboxConfig.skipPayment && 
           (paymentMethod?.startsWith('sandbox_') || sandboxConfig.autoApprove);
  };

  return {
    isSandboxMode,
    sandboxConfig,
    simulatePayment,
    simulatePaymentFailure,
    getSandboxPaymentMethods,
    shouldSkipPaymentGateway,
    
    // Utilidades
    log: (message, data) => {
      if (sandboxConfig.debugMode) {
        console.log(`🏖️ SANDBOX: ${message}`, data);
      }
    },
    
    // Estado visual para la UI
    getSandboxBadge: () => isSandboxMode ? {
      show: true,
      text: 'MODO SANDBOX',
      className: 'sandbox-mode-badge'
    } : { show: false }
  };
};

// Mensajes de error para sandbox
const getSandboxErrorMessage = (reason) => {
  const messages = {
    insufficient_funds: 'Fondos insuficientes (simulado)',
    card_declined: 'Tarjeta rechazada (simulado)',
    payment_timeout: 'Timeout de pago (simulado)',
    network_error: 'Error de red (simulado)',
    invalid_data: 'Datos inválidos (simulado)'
  };
  
  return messages[reason] || `Error de pago: ${reason} (simulado)`;
};

export default useSandbox;
