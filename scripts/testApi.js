/**
 * Script de prueba para la nueva API - Probando SKU vacío vs específico
 */

const API_URL = 'https://pchtest.to-do.mx';
const CUSTOMER = '81276';
const API_KEY = '0LlAN2nJRl0idYtk';

async function testAPI(sku, testName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${testName}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`SKU: "${sku}"\n`);

    const body = {
        customer: CUSTOMER,
        key: API_KEY,
        sku: sku,
    };

    try {
        const response = await fetch(`${API_URL}/extcust/getprodlist/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        const data = await response.json();

        if (data.status === 200 || data.status === '200') {
            console.log(`✅ ÉXITO: ${data.message}\n`);

            if (data.data && data.data.productos) {
                const productos = data.data.productos;
                console.log(`📊 Total de productos: ${productos.length}`);

                if (productos.length > 0) {
                    console.log(`\n📦 Primer producto:`);
                    console.log(`   SKU: ${productos[0].sku}`);
                    console.log(`   Descripción: ${productos[0].descripcion}`);
                    console.log(`   Precio: $${productos[0].peso_bruto} ${productos[0].moneda}`);
                    console.log(`   Stock: ${productos[0].inventario?.[0]?.cantidad || 0}`);
                }
            }
        } else {
            console.log(`❌ ERROR: ${data.message || 'Error desconocido'}`);
            if (data.message_detail) {
                console.log(`   Detalle: ${data.message_detail}`);
            }
        }

    } catch (error) {
        console.error(`❌ Error de red: ${error.message}`);
    }
}

async function runTests() {
    console.log('\n🔍 PROBANDO API DE PCH\n');

    // Test 1: SKU vacío (intento de obtener todos)
    await testAPI('', 'Test 1: SKU Vacío (listar todos)');

    // Test 2: SKU específico (como en Postman)
    await testAPI('QWM581N2', 'Test 2: SKU Específico (QWM581N2)');

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Pruebas completadas');
    console.log(`${'='.repeat(60)}\n`);
}

runTests();
