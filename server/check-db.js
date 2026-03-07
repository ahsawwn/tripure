const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function test() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });
        const [rows] = await db.execute('SHOW TABLES');
        fs.writeFileSync('tables.txt', JSON.stringify(rows));
        db.end();
    } catch (e) {
        fs.writeFileSync('tables.txt', 'ERROR: ' + e.message);
    }
}
test();
