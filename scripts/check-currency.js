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

async function checkCurrency() {
    try {
        await prisma.$connect();
        
        // Obtenemos 5 productos al azar de la BD para sacar sus SKUs
        const products = await prisma.product.findMany({
            where: { price: { gt: 0 } },
            take: 5
        });
        
        const skus = products.map(p => p.ingramSku);
        console.log("Checando SKUs:", skus);
        
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
                'IM-CorrelationID': `PNA-CHECK-${Date.now()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const pnaData = await response.json();
        const items = Array.isArray(pnaData) ? pnaData : (pnaData.products || pnaData);
        
        for (const item of items) {
            console.log("\n------------------");
            console.log(`SKU: ${item.ingramPartNumber}`);
            if (item.pricing) {
                console.log(`Precio (customerPrice): ${item.pricing.customerPrice}`);
                console.log(`Precio (retailPrice): ${item.pricing.retailPrice}`);
                console.log(`Moneda (currencyCode): ${item.pricing.currencyCode}`);
            } else {
                console.log("No pricing data");
            }
        }
        
    } catch(e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

checkCurrency();
