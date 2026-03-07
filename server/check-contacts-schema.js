const mysql = require('mysql2/promise');

async function check() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tripure_db'
        });
        const [rows] = await db.query('DESCRIBE contacts');
        console.log(rows);
        db.end();
    } catch (e) {
        console.error(e);
    }
}
check();
