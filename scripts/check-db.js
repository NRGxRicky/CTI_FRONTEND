const pg = require('pg');
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://cti_admin:2Z77wQlT3T0F9IXigJgfFmv4UByAXgMrt0fnl7sZR4dH6E6ofwM6poSTTORJaKsR@191.101.1.67:5432/cti_catalog'
});

async function check() {
    const count = await pool.query('SELECT COUNT(*) as total FROM "Product"');
    console.log('Total productos en DB:', count.rows[0].total);

    const sample = await pool.query('SELECT "ingramSku", "title", "brand", "category" FROM "Product" LIMIT 10');
    console.table(sample.rows);

    await pool.end();
}
check();
