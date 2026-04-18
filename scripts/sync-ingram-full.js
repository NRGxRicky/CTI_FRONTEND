// scripts/sync-ingram-full.js
// 🤖 Robot Sincronizador COMPLETO - Descarga TODAS las páginas del catálogo

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

const PAGE_SIZE = 50; // Máximo real de Ingram
const MAX_PAGES = 500; // Tope de seguridad ampliado

async function fetchPage(page) {
    const token = await IngramAdapter.getAccessToken();
    const customerNumber = process.env.INGRAM_CUSTOMER_NUMBER;
    const apiUrl = process.env.INGRAM_API_URL || 'https://api.ingrammicro.com:443';

    const url = `${apiUrl}/resellers/v6/catalog?pageSize=${PAGE_SIZE}&pageNumber=${page}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'IM-CustomerNumber': customerNumber,
            'IM-CountryCode': 'MX',
            'IM-CorrelationID': `SYNC-${page}-${Date.now()}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Page ${page} failed (${response.status}): ${err}`);
    }
    return await response.json();
}

async function runSync() {
    console.log('🤖 ============================================');
    console.log('   SINCRONIZACIÓN MASIVA INGRAM -> POSTGRESQL');
    console.log('============================================\n');

    let totalProcessed = 0;
    let totalSkipped = 0;
    let page = 1;
    let totalRecords = 0;
    const startTime = Date.now();

    try {
        await prisma.$connect();
        console.log('✅ PostgreSQL conectado');
        await IngramAdapter.getAccessToken();
        console.log('✅ Token Ingram listo\n');

        while (page <= MAX_PAGES) {
            try {
                const data = await fetchPage(page);
                const items = data.catalog || [];

                if (page === 1) {
                    totalRecords = data.recordsFound || 0;
                    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
                    console.log(`📊 ${totalRecords} productos | ~${totalPages} páginas\n`);
                }

                if (items.length === 0) {
                    console.log('\n📭 Sin más datos. Fin.');
                    break;
                }

                for (const item of items) {
                    const sku = item.ingramPartNumber;
                    if (!sku) { totalSkipped++; continue; }

                    try {
                        await prisma.product.upsert({
                            where: { ingramSku: String(sku) },
                            update: {
                                mpn: item.vendorPartNumber || null,
                                upc: item.upcCode || null,
                                title: item.description || 'Sin Titulo',
                                brand: item.vendorName || null,
                                category: item.category || null,
                            },
                            create: {
                                ingramSku: String(sku),
                                mpn: item.vendorPartNumber || null,
                                upc: item.upcCode || null,
                                title: item.description || 'Sin Titulo',
                                brand: item.vendorName || null,
                                category: item.category || null,
                                price: 0.0,
                                stock: 0,
                            },
                        });
                        totalProcessed++;
                    } catch (e) { totalSkipped++; }
                }

                const pct = totalRecords > 0 ? ((totalProcessed / totalRecords) * 100).toFixed(1) : '?';
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
                console.log(`  Pág ${page} ✅ | ${totalProcessed}/${totalRecords} (${pct}%) | ${elapsed}s`);

                page++;
                await new Promise(r => setTimeout(r, 600));

            } catch (err) {
                console.error(`  ❌ Pág ${page}: ${err.message}`);
                if (err.message.includes('429')) {
                    console.log('  ⏳ Rate limit. 15s...');
                    await new Promise(r => setTimeout(r, 15000));
                } else if (err.message.includes('401')) {
                    IngramAdapter.accessToken = null;
                    await IngramAdapter.getAccessToken();
                    console.log('  🔄 Token renovado');
                } else {
                    break;
                }
            }
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('\n🏁 ============================================');
        console.log('   ✅ SINCRONIZACIÓN COMPLETADA');
        console.log(`   📥 ${totalProcessed} productos en BD`);
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

runSync();
