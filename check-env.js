// Script para verificar variables de entorno
console.log('=== VARIABLES DE ENTORNO ===');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NEXT_PUBLIC_API_CUSTOMER:', process.env.NEXT_PUBLIC_API_CUSTOMER);
console.log('NEXT_PUBLIC_API_KEY:', process.env.NEXT_PUBLIC_API_KEY);
console.log('\n=== VERIFICACIÓN ===');
console.log('URL length:', process.env.NEXT_PUBLIC_API_URL?.length);
console.log('Customer length:', process.env.NEXT_PUBLIC_API_CUSTOMER?.length);
console.log('Key length:', process.env.NEXT_PUBLIC_API_KEY?.length);
console.log('\n=== VALORES ESPERADOS ===');
console.log('Expected URL: https://pchtest.to-do.mx');
console.log('Expected Customer: 81276');
console.log('Expected Key: 0LIAN2nJRl0tdYtk');
