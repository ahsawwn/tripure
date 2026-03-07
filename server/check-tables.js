const mysql = require('mysql2/promise');

async function test() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tripure_db'
        });
        const [rows] = await conn.execute('SHOW TABLES');
        console.log('Tables:', JSON.stringify(rows, null, 2));
        conn.end();
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

test();
