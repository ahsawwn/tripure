const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });

        console.log("Connected to DB, attempting insert...");

        try {
            // Check what columns are in stock_adjustments
            const [cols] = await db.execute('SHOW COLUMNS FROM stock_adjustments');
            console.log("Columns:", cols.map(c => c.Field));

            // Check if product 1 exists
            const [prods] = await db.execute('SELECT id FROM products LIMIT 1');
            const prodId = prods.length > 0 ? prods[0].id : null;

            if (prodId) {
                const [res] = await db.execute(
                    `INSERT INTO stock_adjustments 
                    (product_id, adjustment_type, quantity, previous_quantity, new_quantity, reason, notes, adjusted_by) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [prodId, 'purchase', 10, 0, 10, 'restock', 'test', 1]
                );
                console.log('Insert success:', res.insertId);
            } else {
                console.log('No products found to test insert');
            }
        } catch (err) {
            console.error('Insert Error:', err.message);
        }

        await db.end();
        process.exit(0);
    } catch (e) {
        console.error('Connection Error:', e.message);
        process.exit(1);
    }
}
run();
