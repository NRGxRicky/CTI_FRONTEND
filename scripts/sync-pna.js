// scripts/sync-pna.js
// 🤖 Robot de Precios y Stock (PNA) - Ingram Micro PRODUCCIÓN
// Descarga precios y disponibilidad en bloques de 50 SKUs

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { IngramAdapter } from '../services/wholesalers/IngramAdapter.js';

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

const BATCH_SIZE = 50; // Máximo permitido por Ingram

async function fetchPNA(skus) {
    const token = await IngramAdapter.getAccessToken();
    const customerNumber = process.env.INGRAM_CUSTOMER_NUMBER;
    const apiUrl = process.env.INGRAM_API_URL || 'https://api.ingrammicro.com:443';

    const url = `${apiUrl}/resellers/v6/catalog/priceandavailability?includeAvailability=true&includePricing=true&includeProductAttributes=false`;

    const payload = {
        products: skus.map(sku => ({ ingramPartNumber: sku }))
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'IM-CustomerNumber': customerNumber,
            'IM-CountryCode': 'MX',
            'IM-CorrelationID': `PNA-${Date.now()}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`PNA Failed (${response.status}): ${err}`);
    }
    return await response.json();
}

async function runPNA() {
    console.log('🤖 ============================================');
    console.log('   DESCARGA DE PRECIOS Y STOCK (PNA)');
    console.log('   INGRAM MICRO → POSTGRESQL');
    console.log('============================================\n');

    const startTime = Date.now();
    let totalUpdated = 0;
    let totalSkipped = 0;
    let batchNum = 0;

    try {
        await prisma.$connect();
        console.log('✅ PostgreSQL conectado');
        await IngramAdapter.getAccessToken();
        console.log('✅ Token Ingram listo\n');

        // Obtener TODOS los SKUs de la base de datos
        const allProducts = await prisma.product.findMany({
            select: { ingramSku: true },
            orderBy: { id: 'asc' }
        });

        const allSkus = allProducts.map(p => p.ingramSku);
        const totalBatches = Math.ceil(allSkus.length / BATCH_SIZE);
        console.log(`📊 ${allSkus.length} SKUs en BD | ${totalBatches} batches de ${BATCH_SIZE}\n`);

        // Procesar en bloques de 50
        for (let i = 0; i < allSkus.length; i += BATCH_SIZE) {
            batchNum++;
            const batch = allSkus.slice(i, i + BATCH_SIZE);

            try {
                const pnaData = await fetchPNA(batch);

                // La respuesta puede ser un array directo o tener propiedad
                const items = Array.isArray(pnaData) ? pnaData : (pnaData.products || pnaData);

                if (!Array.isArray(items)) {
                    console.log(`  ⚠️ Batch ${batchNum}: Respuesta inesperada`);
                    totalSkipped += batch.length;
                    continue;
                }

                for (const item of items) {
                    const sku = item.ingramPartNumber;
                    if (!sku) continue;

                    // Extraer precio - Ingram puede usar diferentes campos
                    let price = 0;
                    if (item.pricing) {
                        price = parseFloat(item.pricing.customerPrice) ||
                                parseFloat(item.pricing.retailPrice) ||
                                parseFloat(item.pricing.msrp) || 0;
                    }

                    // Extraer stock total sumando todos los almacenes
                    let stock = 0;
                    if (item.availability) {
                        stock = parseInt(item.availability.totalAvailability, 10) || 0;
                        // Si hay detalle por almacén, sumar
                        if (item.availability.availabilityByWarehouse && Array.isArray(item.availability.availabilityByWarehouse)) {
                            const warehouseTotal = item.availability.availabilityByWarehouse
                                .reduce((sum, wh) => sum + (parseInt(wh.quantityAvailable, 10) || 0), 0);
                            if (warehouseTotal > 0) stock = warehouseTotal;
                        }
                    }

                    try {
                        await prisma.product.update({
                            where: { ingramSku: String(sku) },
                            data: { price, stock }
                        });
                        totalUpdated++;
                    } catch (e) {
                        // SKU no encontrado en BD local, ignorar
                        totalSkipped++;
                    }
                }

                const pct = ((batchNum / totalBatches) * 100).toFixed(1);
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
                console.log(`  Batch ${batchNum}/${totalBatches} ✅ | ${totalUpdated} precios | ${pct}% | ${elapsed}s`);

                // Pausa entre batches (respetando rate limits)
                await new Promise(r => setTimeout(r, 800));

            } catch (batchError) {
                console.error(`  ❌ Batch ${batchNum}: ${batchError.message}`);
                if (batchError.message.includes('429')) {
                    console.log('  ⏳ Rate limit. Esperando 15s...');
                    await new Promise(r => setTimeout(r, 15000));
                    i -= BATCH_SIZE; // Reintentar este batch
                    batchNum--;
                } else if (batchError.message.includes('401')) {
                    IngramAdapter.accessToken = null;
                    await IngramAdapter.getAccessToken();
                    console.log('  🔄 Token renovado');
                    i -= BATCH_SIZE;
                    batchNum--;
                } else {
                    totalSkipped += batch.length;
                }
            }
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('\n🏁 ============================================');
        console.log('   ✅ PNA COMPLETADO');
        console.log(`   💰 ${totalUpdated} precios actualizados`);
        console.log(`   ⏭️  ${totalSkipped} saltados`);
        console.log(`   ⏱️  ${totalTime} segundos`);
        console.log('============================================\n');

    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO:', error.message);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

runPNA();
