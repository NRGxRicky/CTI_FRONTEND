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
    
    // Contenedor principal estilo Tarjeta
    let html = '<div class="technical-specs" style="padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; margin-top: 15px; background-color: #ffffff;">';
    // Título Principal
    html += '<h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px;">Especificaciones esenciales</h3>';
    
    // Lista sin estilos heredados
    html += '<ul style="list-style-type: none; padding-left: 0; margin: 0;">';
    
    // Variables para el diseño de cada fila
    const liStyle = 'margin-bottom: 8px; font-size: 14.5px; color: #666; display: flex; align-items: flex-start;';
    const caret = '<span style="color: #a0a0a0; margin-right: 10px; font-size: 16px; line-height: 1.2;">›</span>';

    const addRow = (label, value) => {
        if (!value) return '';
        return `<li style="${liStyle}">${caret}<span>${label}: <strong style="color: #333; font-weight: 600;">${value}</strong></span></li>`;
    };
    
    html += addRow('Fabricante', details.vendorName);
    html += addRow('Número de Parte (MPN)', details.vendorPartNumber);
    html += addRow('Código de Barras (UPC)', details.upc);
    if (details.productCategory) {
        html += addRow('Categoría', `${details.productCategory} > ${details.productSubCategory || ''}`);
    }
    
    const w = details.additionalInformation?.width;
    const h = details.additionalInformation?.height;
    const l = details.additionalInformation?.length;
    
    if (w && h && l) {
        html += addRow('Dimensiones físicas', `${h} (Alto) x ${w} (Ancho) x ${l} (Largo)`);
    }
    
    const weightInfo = details.additionalInformation?.productWeight?.[0];
    if (weightInfo) {
        html += addRow('Peso bruto', `${weightInfo.weight} ${weightInfo.weightUnit}`);
    }
    
    // Si viene la cadena de especificaciones amplias
    if (details.technicalSpecifications && Array.isArray(details.technicalSpecifications)) {
        details.technicalSpecifications.forEach(spec => {
             html += addRow(spec.headerName, spec.headerValue);
        });
    }

    html += '</ul>';
    
    // Link falso visual (simulando "Ver especificaciones completas")
    // html += '<div style="margin-top: 20px; text-align: right;"><a href="#" style="color: #0066cc; font-weight: 500; font-size: 14px; text-decoration: none;">Ver especificaciones completas</a></div>';
    
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
            // take: 1000, // Descomentar y ajustar si se desea ir por lotes
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
