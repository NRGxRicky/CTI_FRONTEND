// scripts/sync-icecat-images.js
// 🤖 Robot Fotográfico (Extracción Estándar desde Open Icecat Live API)

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { IcecatAdapter } from '../services/wholesalers/IcecatAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const require = createRequire(import.meta.url);
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runImageSync() {
    console.log('📸 ========================================================');
    console.log('   MOTOR FOTOGRÁFICO (EXTRACCIÓN MUNDIAL ICECAT)');
    console.log('========================================================\n');

    try {
        await prisma.$connect();
        console.log('✅ Base de datos montada.\n');
        
        // Aislar estrictamente a los productos "ciegos"
        const productsToUpdate = await prisma.product.findMany({
            where: {
                imageUrl: null,
            },
            take: 5, // LÍMITE DE PRUEBA INICIAL: Procesar solo 5 productos para demostrar que funciona
            select: { id: true, ingramSku: true, title: true, upc: true, mpn: true, brand: true }
        });

        console.log(`📊 Extrayendo fotografías para ${productsToUpdate.length} productos en esta tanda.\n`);

        let procesados = 0;
        let fantasmas = 0;

        for (const prod of productsToUpdate) {
            console.log(`⏳ [${prod.ingramSku}] Buscando imagen para: ${prod.brand || ''} ${prod.mpn || prod.title?.substring(0, 15)}...`);
            
            try {
                // Cross-matching con nuestro Adaptador
                const fotoUrl = await IcecatAdapter.fetchProductImage(prod.upc, prod.mpn, prod.brand);

                if (fotoUrl) {
                     await prisma.product.update({
                        where: { id: prod.id },
                        data: { imageUrl: fotoUrl }
                    });
                    console.log(`   ✅ ¡Match Fotográfico! URL: ${fotoUrl}`);
                    procesados++;
                } else {
                    console.log(`   👻 Producto no hallado en el catálogo mundial (Icecat no lo tiene).`);
                    fantasmas++;
                }
            } catch (err) {
                 console.error(`   ❌ Error procesando foto: ${err.message}`);
            }

            // Regla de Oro de las APIs Públicas: Nunca hagas peticiones simultáneas, detente 1.5s
            await new Promise(r => setTimeout(r, 1500));
        }

        console.log('\n🏁 ============================================');
        console.log(`   ✅ TEST COMPLETADO:`);
        console.log(`   📸 Fotos exitosas: ${procesados}`);
        console.log(`   👻 Artículos fantasma: ${fantasmas}`);
        console.log('============================================\n');

    } catch (e) {
        console.error('❌ Error Crítico de Orquestación:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

runImageSync();
