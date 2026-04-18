// scripts/test-catalog-pages.js
// Prueba rápida para entender la paginación de Ingram

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { IngramAdapter } from '../services/wholesalers/IngramAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function test() {
    const token = await IngramAdapter.getAccessToken();
    const customerNumber = process.env.INGRAM_CUSTOMER_NUMBER;
    const apiUrl = process.env.INGRAM_API_URL || 'https://api.ingrammicro.com:443';

    // Test 1: Probar con pageSize=100
    console.log('--- TEST 1: pageSize=100, page=1 ---');
    let res = await fetch(`${apiUrl}/resellers/v6/catalog?pageSize=100&pageNumber=1`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'IM-CustomerNumber': customerNumber,
            'IM-CountryCode': 'MX',
            'IM-CorrelationID': `TEST1-${Date.now()}`,
            'Accept': 'application/json'
        }
    });
    let data = await res.json();
    console.log(`recordsFound: ${data.recordsFound}, items: ${data.catalog?.length}`);

    // Test 2: Probar page 2
    console.log('\n--- TEST 2: pageSize=100, page=2 ---');
    res = await fetch(`${apiUrl}/resellers/v6/catalog?pageSize=100&pageNumber=2`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'IM-CustomerNumber': customerNumber,
            'IM-CountryCode': 'MX',
            'IM-CorrelationID': `TEST2-${Date.now()}`,
            'Accept': 'application/json'
        }
    });
    data = await res.json();
    console.log(`recordsFound: ${data.recordsFound}, items: ${data.catalog?.length}`);
    if (data.catalog?.length > 0) {
        console.log('First item page 2:', data.catalog[0].ingramPartNumber, data.catalog[0].description);
    }

    // Test 3: Probar page 3
    console.log('\n--- TEST 3: pageSize=100, page=3 ---');
    res = await fetch(`${apiUrl}/resellers/v6/catalog?pageSize=100&pageNumber=3`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'IM-CustomerNumber': customerNumber,
            'IM-CountryCode': 'MX',
            'IM-CorrelationID': `TEST3-${Date.now()}`,
            'Accept': 'application/json'
        }
    });
    data = await res.json();
    console.log(`recordsFound: ${data.recordsFound}, items: ${data.catalog?.length}`);
    if (data.catalog?.length > 0) {
        console.log('First item page 3:', data.catalog[0].ingramPartNumber, data.catalog[0].description);
    } else {
        console.log('Response:', JSON.stringify(data).substring(0, 500));
    }

    // Test 4: keyword search
    console.log('\n--- TEST 4: keyword=laptop, pageSize=100 ---');
    res = await fetch(`${apiUrl}/resellers/v6/catalog?keyword=laptop&pageSize=100&pageNumber=1`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'IM-CustomerNumber': customerNumber,
            'IM-CountryCode': 'MX',
            'IM-CorrelationID': `TEST4-${Date.now()}`,
            'Accept': 'application/json'
        }
    });
    data = await res.json();
    console.log(`recordsFound: ${data.recordsFound}, items: ${data.catalog?.length}`);
}

test();
