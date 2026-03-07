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

        console.log("Checking tables...");
        const [tables] = await db.execute('SHOW TABLES');
        console.log("Tables:", tables.map(t => Object.values(t)[0]));

        if (tables.some(t => Object.values(t)[0] === 'stock_adjustments')) {
            console.log("\nDescribing stock_adjustments...");
            const [columns] = await db.execute('DESCRIBE stock_adjustments');
            console.log(columns.map(c => `${c.Field} (${c.Type})`));
        } else {
            console.log("\nstock_adjustments table DOES NOT EXIST!");

            // Create the table if it's missing
            console.log("Attempting to create stock_adjustments table...");
            await db.execute(`
                CREATE TABLE IF NOT EXISTS stock_adjustments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    product_id INT NOT NULL,
                    adjustment_type ENUM('purchase', 'sale', 'return', 'damage', 'correction') NOT NULL,
                    quantity INT NOT NULL,
                    previous_quantity INT NOT NULL,
                    new_quantity INT NOT NULL,
                    reason VARCHAR(255),
                    notes TEXT,
                    adjusted_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
                )
            `);
            console.log("Table created successfully!");
        }

        db.end();
    } catch (e) {
        console.error("ERROR:", e);
    }
}

check();
