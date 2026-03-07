const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });
        const [columns] = await db.execute('SHOW COLUMNS FROM products');
        console.log('Columns in products table:');
        console.log(columns.map(c => c.Field).join(', '));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
