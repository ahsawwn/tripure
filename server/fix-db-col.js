const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: 'c:/Projects/tripure/tripure/server/.env' });

async function fixColumn() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });

        const [cols] = await db.execute('SHOW COLUMNS FROM stock_adjustments');
        const hasNotes = cols.some(c => c.Field === 'notes');
        const output = [];

        if (!hasNotes) {
            output.push('Adding notes column...');
            await db.execute('ALTER TABLE stock_adjustments ADD COLUMN notes TEXT NULL');
            output.push('notes column added.');
        } else {
            output.push('notes column already exists.');
        }

        const [newCols] = await db.execute('SHOW COLUMNS FROM stock_adjustments');
        output.push(newCols.map(c => `${c.Field}`).join(', '));

        fs.writeFileSync('c:/Projects/tripure/tripure/server/schema-result.txt', output.join('\n'));

        await db.end();
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('c:/Projects/tripure/tripure/server/schema-result.txt', e.toString());
        process.exit(1);
    }
}
fixColumn();
