const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function check() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });

        const [columns] = await db.execute('DESCRIBE stock_adjustments');
        fs.writeFileSync('schema_output.json', JSON.stringify(columns, null, 2));

        db.end();
    } catch (e) {
        fs.writeFileSync('schema_output.json', JSON.stringify({ error: e.message }, null, 2));
    }
}

check();
