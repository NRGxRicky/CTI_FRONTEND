// scripts/test-ingram.js
// Script de uso local para probar si las credenciales de Ingram Micro sirven

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { IngramAdapter } from '../services/wholesalers/IngramAdapter.js';

// Configurar dotenv para leer .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runTest() {
    console.log('🧪 Iniciando Test de Integración Ingram Micro...');
    console.log(`URL Configurada: ${process.env.INGRAM_API_URL}`);
    console.log(`Cliente ID: ${process.env.INGRAM_CLIENT_ID ? 'Configurado ⭐' : 'FALTA ❌'}`);
    
    try {
        // 1. Probar Autenticación
        console.log('\n--- FASE 1: AUTENTICACIÓN ---');
        const token = await IngramAdapter.getAccessToken();
        console.log(`✅ EXITO! Token recibido (starts with): ${token.substring(0, 15)}...`);

        // 2. Probar llamado rápido al catálogo (solo para ver si la API responde 200)
        console.log('\n--- FASE 2: CATÁLOGO API ---');
        const catalog = await IngramAdapter.fetchCatalog(1, 5);
        console.log(`✅ EXITO! Respuesta del catálogo recibida.`);
        console.log(JSON.stringify(catalog).substring(0, 500) + '...');
        
    } catch (error) {
        console.error('\n❌ ERROR DURANTE LA PRUEBA:');
        console.error(error.message);
    }
}

runTest();
