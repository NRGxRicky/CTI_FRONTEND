// scripts/sync-ingram-details.js
// 🤖 Robot Enriquecedor de Catálogo (Imágenes y Descripciones Técnicas)

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

function formatToHTML(details) {
    if (!details) return null;
    let html = '<div class="technical-specs mt-4">';
    html += '<h3 class="font-bold text-lg mb-2 text-gray-800">Especificaciones Técnicas</h3>';
    html += '<ul class="list-disc pl-5 space-y-1 text-gray-600 text-sm">';
    
    if (details.vendorName) html += `<li><strong>Fabricante:</strong> ${details.vendorName}</li>`;
    if (details.vendorPartNumber) html += `<li><strong>Número de Parte (MPN):</strong> ${details.vendorPartNumber}</li>`;
    if (details.upc) html += `<li><strong>Código de Barras (UPC):</strong> ${details.upc}</li>`;
    if (details.productCategory) html += `<li><strong>Categoría:</strong> ${details.productCategory} > ${details.productSubCategory || ''}</li>`;
    
    const w = details.additionalInformation?.width;
    const h = details.additionalInformation?.height;
    const l = details.additionalInformation?.length;
    
    if (w && h && l) {
        html += `<li><strong>Dimensiones físicas:</strong> ${h} (Alto) x ${w} (Ancho) x ${l} (Largo)</li>`;
    }
    
    const weightInfo = details.additionalInformation?.productWeight?.[0];
    if (weightInfo) {
        html += `<li><strong>Peso bruto:</strong> ${weightInfo.weight} ${weightInfo.weightUnit}</li>`;
    }
    
    // Si viene la cadena de especificaciones amplias (casos raros)
    if (details.technicalSpecifications && Array.isArray(details.technicalSpecifications)) {
        details.technicalSpecifications.forEach(spec => {
             html += `<li><strong>${spec.headerName}:</strong> ${spec.headerValue}</li>`;
        });
    }

    html += '</ul>';
    html += '</div>';
    
    return html;
}

async function runDetailsSync() {
    console.log('🤖 ========================================================');
    console.log('   MOTOR DE ENRIQUECIMIENTO (HOJAS TÉCNICAS HTML)');
    console.log('========================================================\n');

    try {
        await prisma.$connect();
        console.log('✅ PostgreSQL conectado');
        
        // Buscar sólo los que no tengan descripción rica
        const productsToUpdate = await prisma.product.findMany({
            where: {
                description: null,
            },
            take: 10, // LIMITE INICIAL: Solo 10 para hacer la prueba. Luego quitamos el límite.
            select: { id: true, ingramSku: true, title: true }
        });

        console.log(`📊 Encontrados ${productsToUpdate.length} productos sin hoja técnica (Procesando 10 en esta tirada). Empezando...\n`);

        let procesados = 0;

        for (const prod of productsToUpdate) {
            console.log(`⏳ [${prod.ingramSku}] Consultando detalles para generar HTML...`);
            try {
                const details = await IngramAdapter.fetchProductDetails(prod.ingramSku);
                
                const buildHtml = formatToHTML(details);

                if (buildHtml) {
                     await prisma.product.update({
                        where: { id: prod.id },
                        data: {
                            description: buildHtml // Inyectamos el HTML al campo nativo
                        }
                    });
                    console.log(`   ✅ ¡Éxito! HTML inyectado a la base de datos.`);
                    procesados++;
                }

            } catch (err) {
                console.error(`   ❌ Error con SKU ${prod.ingramSku}: ${err.message}`);
                if (err.message.includes('429')) { // Rate limit
                    console.log("   ⏸️ RATE LIMIT DETECTADO. Pausando 15s...");
                    await new Promise(r => setTimeout(r, 15000));
                }
            }

            // Throttling: Parar 1.5 segundos entre peticiones para eludir castigos
            await new Promise(r => setTimeout(r, 1500));
        }

        console.log('\n🏁 ============================================');
        console.log(`   ✅ TEST COMPLETADO: ${procesados} HOJAS CREADAS`);
        console.log('============================================\n');

    } catch (e) {
        console.error('❌ Error Crítico:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

runDetailsSync();
