const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function run() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });

        const [tables] = await db.execute('SHOW TABLES');
        let tablesStr = JSON.stringify(tables);

        let tableDetails = "Describing stock_adjustments:\\n";
        try {
            const [cols] = await db.execute('DESCRIBE stock_adjustments');
            tableDetails += JSON.stringify(cols, null, 2);
        } catch (e) {
            tableDetails += "Error: " + e.message;
        }

        fs.writeFileSync('output-db.txt', tablesStr + "\\n" + tableDetails);
        await db.end();
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('output-db.txt', "Error: " + e.message);
        process.exit(1);
    }
}
run();
