import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from parent directory
dotenv.config({ path: join(__dirname, '.env') });

async function fixPasswords() {
    console.log('='.repeat(50));
    console.log('🔧 PASSWORD FIX UTILITY');
    console.log('='.repeat(50));

    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tripure_db'
        });

        console.log('📦 Connected to database');

        // Generate new hash for admin123
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(password, salt);

        console.log('🔑 New hash generated for password:', password);
        console.log('📝 Hash:', newHash);
        console.log('Hash length:', newHash.length);

        // Test the hash immediately
        const testValid = await bcrypt.compare(password, newHash);
        console.log('✅ Hash self-test:', testValid ? 'PASSED' : 'FAILED');

        // Update all admin users
        const [result] = await connection.execute(
            'UPDATE admin_users SET password = ?',
            [newHash]
        );

        console.log(`✅ Updated ${result.affectedRows} users with new password hash`);

        // Verify the update
        const [users] = await connection.execute(
            'SELECT id, username, email, password FROM admin_users'
        );

        console.log('\n📋 Current users in database:');
        let allValid = true;
        
        for (const user of users) {
            console.log(`- ${user.username} (${user.email})`);
            // Test the hash for each user
            const isValid = await bcrypt.compare(password, user.password);
            console.log(`  Password valid for ${user.username}: ${isValid ? '✅' : '❌'}`);
            if (!isValid) allValid = false;
        }

        if (allValid) {
            console.log('\n✅ All passwords are now working!');
            console.log('You can now login with:');
            console.log('  Email: admin@tripure.com');
            console.log('  Password: admin123');
        } else {
            console.log('\n❌ Some passwords are still not working!');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixPasswords();