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

        const [tables] = await db.query('SHOW TABLES LIKE "notifications"');
        console.log("Notifications table exists:", tables.length > 0);

        if (tables.length > 0) {
            const [columns] = await db.query('DESCRIBE notifications');
            console.log(columns);
        } else {
            console.log("No notifications table found.");
        }
        db.end();
    } catch (e) {
        console.error(e);
    }
}

check();
