const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });

        console.log("Describing stock_adjustments table...");
        const [columns] = await db.execute('DESCRIBE stock_adjustments');
        console.log(JSON.stringify(columns, null, 2));

        db.end();
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

check();
