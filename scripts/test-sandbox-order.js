// scripts/test-sandbox-order.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { IngramAdapter } from '../services/wholesalers/IngramAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runSandboxTest() {
    console.log('🧪 Iniciando Prueba de Módulo Sandbox...');
    console.log(`URL Configurada: ${process.env.INGRAM_API_URL}`);

    try {
        console.log('\n--- FASE 1: OBTENIENDO ACCESO ---');
        const token = await IngramAdapter.getAccessToken();
        console.log(`✅ Token de Sandbox interceptado exitosamente`);

        console.log('\n--- FASE 2: ENVIANDO ORDEN DE PRUEBA ---');
        console.log('Sanitizando direcciones con reglas de caracteres y enviando payload "allowOrderOnCustomerHold: false"...');
        
        const response = await IngramAdapter.createSandboxTestOrder();
        console.log(`✅ EXITO TOTAL: El servidor de Ingram respondió correctamente a la orden.`);
        console.log(JSON.stringify(response, null, 2));

    } catch (error) {
        console.error('\n❌ ERROR DURANTE LA PRUEBA (Sandbox):');
        console.error(error.message);
    }
}

runSandboxTest();
