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
        
        // Buscar productos que no tengan imagen principal
        const productsToUpdate = await prisma.product.findMany({
            where: {
                imageUrl: null,
            },
            orderBy: {
                updatedAt: 'asc', // Ordenar por los más antiguos para no repetir los fantasmas recién revisados
            },
            take: 2000, // Bloque masivo de 2000 productos
        });

        console.log(`📊 Extrayendo fotografías para ${productsToUpdate.length} productos en esta tanda.\n`);

        let procesados = 0;
        let fantasmas = 0;

        for (const prod of productsToUpdate) {
            console.log(`⏳ [${prod.ingramSku}] Buscando imagen para: ${prod.brand || ''} ${prod.mpn || prod.title?.substring(0, 15)}...`);
            
            try {
                // Cross-matching con nuestro Adaptador
                const { mainImage, gallery } = await IcecatAdapter.fetchProductImage(prod.upc, prod.mpn, prod.brand);

                if (mainImage) {
                     await prisma.product.update({
                        where: { id: prod.id },
                        data: { 
                            imageUrl: mainImage,
                            gallery: gallery
                        }
                    });
                    console.log(`   ✅ ¡Match! (${gallery.length} fotos). URL: ${mainImage.substring(0, 50)}...`);
                    procesados++;
                } else {
                    console.log(`   👻 No hallado (UPC: ${prod.upc || 'N/A'}, MPN: ${prod.mpn || 'N/A'})`);
                    // Touch al producto para actualizar su fecha de modificación y enviarlo al final de la cola
                    await prisma.product.update({
                        where: { id: prod.id },
                        data: { updatedAt: new Date() }
                    });
                    fantasmas++;
                }
            } catch (err) {
                 console.error(`   ❌ Error: ${err.message}`);
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
