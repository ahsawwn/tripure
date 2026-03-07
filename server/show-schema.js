const mysql = require('mysql2/promise');
require('dotenv').config();

async function showLogs() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });

        const [cols] = await db.execute('SHOW COLUMNS FROM stock_adjustments');
        console.log(cols.map(c => `${c.Field} - ${c.Type}`).join('\n'));

        await db.end();
        process.exit(0);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
showLogs();
