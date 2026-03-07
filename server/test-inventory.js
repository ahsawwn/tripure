const mysql = require('mysql2/promise');
require('dotenv').config();

async function testInventory() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });

        console.log("Testing inventory query...");

        let query = `
            SELECT 
                p.*,
                b.name as brand_name
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = TRUE
        `;

        const [products] = await db.execute(query);
        console.log("Success! Found " + products.length + " products.");
        console.log(products);

        db.end();
    } catch (e) {
        console.error("Error executing query:", e);
    }
}

testInventory();
