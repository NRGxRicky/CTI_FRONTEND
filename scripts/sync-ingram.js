// scripts/sync-ingram.js
// Robot Sincronizador de Ingram Micro -> PostgreSQL

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { IngramAdapter } from '../services/wholesalers/IngramAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function runSync() {
    console.log('🤖 Iniciando Robot Sincronizador CTI <-> Ingram Micro');
    
    try {
        const token = await IngramAdapter.getAccessToken();
        console.log(`🔐 Autenticación Exitosa (Token OK)`);

        // Solicitaríamos la página 1 del catálogo (en producción iteraríamos hasta páginas vacías)
        console.log(`📡 Descargando página 1 del catálogo de Ingram...`);
        const catalogData = await IngramAdapter.fetchCatalog(1, 100);

        // Si catalogData tiene items, los guardamos en Prisma
        const items = catalogData.catalog || catalogData.products || catalogData;
        
        if (!Array.isArray(items)) {
            console.log('⚠️ Formato de catálogo inesperado o vacío.');
            console.log(catalogData);
            return;
        }

        console.log(`📥 Se descargaron ${items.length} productos. Guardando en Base de Datos PostgreSQL...`);

        let inserted = 0;
        let updated = 0;

        for (const item of items) {
            // Mapeo defensivo de Ingram a nuestro Prisma Model
            // Nota: Este mapeo debe ajustarse a los campos exactos de Ingram v6 
            // cuando la API comience a devolver datos exitosos.
            const ingramSku = item.ingramPartNumber || item.ingramSku || item.sku;
            if (!ingramSku) continue;

            const productData = {
                ingramSku: String(ingramSku),
                mpn: item.vendorPartNumber || '',
                title: item.description || item.title || 'Sin Título',
                brand: item.vendorName || item.brand || 'Desconocida',
                category: item.category || 'Varios',
                price: parseFloat(item.customerPrice || item.price) || 0.0,
                stock: parseInt(item.totalAvailability || item.stock, 10) || 0,
            };

            // Prisma UPSERT: Si existe lo actualiza (ideal para precios nuevos), si no, lo crea.
            try {
                const result = await prisma.product.upsert({
                    where: { ingramSku: productData.ingramSku },
                    update: {
                        price: productData.price,
                        stock: productData.stock
                    },
                    create: { ...productData }
                });

                if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                    inserted++;
                } else {
                    updated++;
                }

            } catch (dbError) {
                console.error(`❌ Error guardando SKU ${ingramSku}:`, dbError.message);
            }
        }

        console.log(`✅ Sincronización Completada:`);
        console.log(`   🔸 Creados: ${inserted}`);
        console.log(`   🔹 Actualizados: ${updated}`);

    } catch (error) {
        if (error.message.includes('NoApiProductMatchFound')) {
            console.error('\n======================================================');
            console.error('⏳ APROBACIÓN PENDIENTE DE INGRAM MICRO (ESPERADO)');
            console.error('El Robot se conectó exitosamente a Ingram, pero la cuenta');
            console.error('aún no ha sido aprobada manualmente por tu ejecutivo.');
            console.error('(Normalmente tarda hasta 48 horas como dijo la página).');
            console.error('======================================================\n');
        } else {
            console.error('\n❌ ERROR CRÍTICO DURANTE LA SINCRONIZACIÓN:');
            console.error(error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

runSync();
