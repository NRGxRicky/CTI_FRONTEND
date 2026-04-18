// scripts/sync-ingram.js
// 🤖 Robot Sincronizador de Ingram Micro PRODUCCIÓN -> PostgreSQL (Coolify)

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { IngramAdapter } from '../services/wholesalers/IngramAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env primero (DATABASE_URL), luego .env.local (Ingram keys)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Prisma v7 requiere adapter explícito
const require = createRequire(import.meta.url);
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PAGE_SIZE = 50; // Máximo permitido por Ingram

async function runSync() {
    console.log('🤖 ============================================');
    console.log('   ROBOT SINCRONIZADOR CTI <-> INGRAM MICRO');
    console.log('   Ambiente: PRODUCCIÓN');
    console.log('============================================\n');

    let totalProcessed = 0;
    let totalSkipped = 0;
    let page = 1;
    let hasMore = true;

    try {
        // Validar conexión a DB primero
        await prisma.$connect();
        console.log('✅ Conexión a Base de Datos PostgreSQL exitosa\n');

        // Obtener token una vez
        await IngramAdapter.getAccessToken();
        console.log('✅ Token de Producción de Ingram obtenido\n');

        while (hasMore) {
            console.log(`📦 Descargando página ${page} (${PAGE_SIZE} productos por batch)...`);

            try {
                const catalogData = await IngramAdapter.fetchCatalog(page, PAGE_SIZE);
                const items = catalogData.catalog || [];

                if (items.length === 0) {
                    console.log('📭 Página vacía. Fin del catálogo.');
                    hasMore = false;
                    break;
                }

                // Procesar cada producto de la página
                for (const item of items) {
                    const ingramSku = item.ingramPartNumber;
                    if (!ingramSku) {
                        totalSkipped++;
                        continue;
                    }

                    const productData = {
                        ingramSku: String(ingramSku),
                        mpn: item.vendorPartNumber || null,
                        upc: item.upcCode || null,
                        title: item.description || 'Sin Titulo',
                        brand: item.vendorName || null,
                        category: item.category || null,
                        price: 0.0,
                        stock: 0,
                    };

                    try {
                        await prisma.product.upsert({
                            where: { ingramSku: productData.ingramSku },
                            update: {
                                mpn: productData.mpn,
                                upc: productData.upc,
                                title: productData.title,
                                brand: productData.brand,
                                category: productData.category,
                            },
                            create: productData,
                        });
                        totalProcessed++;
                    } catch (dbError) {
                        console.error(`  ⚠️ Error en SKU ${ingramSku}: ${dbError.message}`);
                        totalSkipped++;
                    }
                }

                console.log(`  ✅ Página ${page} procesada (${items.length} productos) | Total: ${totalProcessed}`);

                if (items.length < PAGE_SIZE) {
                    hasMore = false;
                } else {
                    page++;
                }

                // Pausa de 500ms entre páginas para no saturar a Ingram
                await new Promise(r => setTimeout(r, 500));

            } catch (pageError) {
                console.error(`  ❌ Error en página ${page}: ${pageError.message}`);
                if (pageError.message.includes('429')) {
                    console.log('  ⏳ Rate limit. Esperando 10 segundos...');
                    await new Promise(r => setTimeout(r, 10000));
                } else {
                    hasMore = false;
                }
            }
        }

        console.log('\n🏁 ============================================');
        console.log('   SINCRONIZACIÓN COMPLETADA');
        console.log('============================================');
        console.log(`   📥 Productos guardados/actualizados: ${totalProcessed}`);
        console.log(`   ⏭️  Productos saltados: ${totalSkipped}`);
        console.log(`   📄 Páginas procesadas: ${page}`);
        console.log('============================================\n');

    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO:', error.message);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

runSync();
