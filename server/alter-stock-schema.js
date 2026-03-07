const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });

        console.log("Adding notes column to stock_adjustments...");
        try {
            await db.execute('ALTER TABLE stock_adjustments ADD COLUMN notes TEXT NULL AFTER reason');
            console.log("Added notes column.");
        } catch (e) {
            console.log("Could not add notes column (might already exist):", e.message);
        }

        await db.end();
        process.exit(0);
    } catch (e) {
        console.error("Error connecting to DB:", e.message);
        process.exit(1);
    }
}
updateSchema();
