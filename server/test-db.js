const mysql = require('mysql2/promise');

async function test() {
    try {
        console.log('Connecting to DB...');
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'tripure_db'
        });
        console.log('Connected!');
        const [rows] = await conn.execute('SELECT id, username, email, role, LEFT(password,30) as pass_prefix FROM admin_users LIMIT 5');
        console.log('Users:', JSON.stringify(rows, null, 2));
        conn.end();
    } catch (e) {
        console.error('ERROR:', e.message);
        console.error('CODE:', e.code);
    }
}

test();
