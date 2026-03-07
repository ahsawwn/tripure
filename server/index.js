const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tripure_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

// Activity Logger
const ActivityLogger = require('./utils/activityLogger');
const activityLogger = new ActivityLogger(db);

// Middleware to capture IP and user agent
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    if (activityLogger) {
        activityLogger.setClientInfo(ip, userAgent);
    }
    next();
});

// Test database connection
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Connected to MySQL database');

        // Initialize activity logs table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                user_name VARCHAR(255),
                user_role VARCHAR(50),
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50),
                entity_id VARCHAR(50),
                details TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                status VARCHAR(20) DEFAULT 'success',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Activity logs table initialized');

        // Initialize app settings table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS app_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Seed initial settings if they don't exist
        const [settings] = await connection.execute('SELECT setting_key FROM app_settings WHERE setting_key = ?', ['coming_soon_mode']);
        if (settings.length === 0) {
            await connection.execute('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)', ['coming_soon_mode', 'false']);
            console.log('✅ Initial app settings seeded');
        }

        // Initialize customers table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                address TEXT,
                city VARCHAR(100),
                type ENUM('individual', 'company') DEFAULT 'individual',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Initialize distributors table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS distributors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                contact_person VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                address TEXT,
                region VARCHAR(100),
                status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Initialize orders table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_number VARCHAR(50) UNIQUE NOT NULL,
                customer_id INT,
                distributor_id INT,
                status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                total_amount DECIMAL(15, 2) NOT NULL,
                payment_status ENUM('unpaid', 'partially_paid', 'paid', 'refunded') DEFAULT 'unpaid',
                payment_method VARCHAR(50),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
                FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE SET NULL
            )
        `);

        // Initialize order_items table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(15, 2) NOT NULL,
                total_price DECIMAL(15, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        // Initialize invoices table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                order_id INT,
                customer_id INT,
                issue_date DATE NOT NULL,
                due_date DATE,
                status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
                subtotal DECIMAL(15, 2) NOT NULL,
                tax_amount DECIMAL(15, 2) DEFAULT 0,
                discount_amount DECIMAL(15, 2) DEFAULT 0,
                total_amount DECIMAL(15, 2) NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
            )
        `);

        // Initialize stock_adjustments table
        await connection.execute(`
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

        // Migration: add 'notes' column if missing
        try {
            await connection.execute('ALTER TABLE stock_adjustments ADD COLUMN notes TEXT NULL AFTER reason');
            console.log('✅ Added missing notes column to stock_adjustments table');
        } catch (colError) {
            if (colError.code !== 'ER_DUP_FIELDNAME') {
                console.error('Migration notice for stock_adjustments:', colError.message);
            }
        }

        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
})();

// ==================== MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('='.repeat(50));
        console.log('🔐 LOGIN ATTEMPT');
        console.log('='.repeat(50));
        console.log('Email/Username:', email);
        console.log('Password:', password);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const [users] = await db.execute(
            'SELECT * FROM admin_users WHERE email = ? OR username = ?',
            [email, email]
        );

        if (users.length === 0) {
            console.log('❌ User not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];
        console.log('✅ User found:', user.username);
        console.log('Stored hash:', user.password);

        // Use try-catch for bcrypt compare
        let validPassword = false;
        try {
            validPassword = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
            console.error('❌ Bcrypt error:', bcryptError.message);
        }

        console.log('Password valid:', validPassword);

        if (!validPassword) {
            console.log('❌ Password invalid');
            // Log failed login
            try {
                await activityLogger.logLogin({ email }, false);
            } catch (logError) {
                console.error('Failed login logging failed:', logError.message);
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('✅ Password valid, login successful');

        await db.execute(
            'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Log successful login
        try {
            await activityLogger.logLogin({
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                name: user.name
            }, true);
        } catch (logError) {
            console.error('Login logging failed:', logError.message);
        }

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name || user.username,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, name, role, last_login FROM admin_users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== APP SETTINGS ROUTES ====================

// Get all app settings
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT setting_key, setting_value FROM app_settings');
        const settings = {};
        rows.forEach(row => {
            try {
                if (row.setting_value && ((row.setting_value.startsWith('{') && row.setting_value.endsWith('}')) ||
                    (row.setting_value.startsWith('[') && row.setting_value.endsWith(']')))) {
                    settings[row.setting_key] = JSON.parse(row.setting_value);
                } else {
                    settings[row.setting_key] = row.setting_value === 'true' ? true :
                        row.setting_value === 'false' ? false :
                            row.setting_value;
                }
            } catch (e) {
                settings[row.setting_key] = row.setting_value === 'true' ? true :
                    row.setting_value === 'false' ? false :
                        row.setting_value;
            }
        });
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
});

// Update app settings
app.patch('/api/settings', authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            await db.execute(
                'INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, stringValue, stringValue]
            );
        }
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
});

// ==================== USER PERMISSIONS ROUTE ====================
app.get('/api/users/permissions', authenticateToken, async (req, res) => {
    try {
        const rolePermissions = {
            super_admin: [
                'view_dashboard', 'view_messages', 'reply_messages', 'view_customers',
                'view_users', 'create_users', 'edit_users', 'delete_users',
                'view_activity_logs', 'manage_roles', 'view_orders', 'view_products',
                'export_reports', 'view_settings', 'edit_settings'
            ],
            admin: [
                'view_dashboard', 'view_messages', 'reply_messages', 'view_customers',
                'view_users', 'create_users', 'edit_users', 'view_orders', 'view_products',
                'export_reports', 'view_settings'
            ],
            manager: [
                'view_dashboard', 'view_messages', 'reply_messages', 'view_customers',
                'view_orders', 'view_products'
            ],
            support: [
                'view_dashboard', 'view_messages', 'reply_messages', 'view_customers'
            ],
            viewer: [
                'view_dashboard', 'view_messages', 'view_customers'
            ]
        };

        const permissions = rolePermissions[req.user.role] || [];
        res.json({ success: true, data: permissions });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch permissions' });
    }
});

// ==================== ACTIVITY LOGS ROUTES ====================

// Get activity logs with filters
app.get('/api/activity-logs', authenticateToken, async (req, res) => {
    try {
        const {
            action,
            user_id,
            entity_type,
            date_from,
            date_to,
            search,
            limit = 50,
            page = 1
        } = req.query;

        let query = 'SELECT * FROM activity_logs WHERE 1=1';
        const params = [];
        const offset = (page - 1) * limit;

        if (action && action !== 'all') {
            query += ' AND action = ?';
            params.push(action);
        }

        if (user_id && user_id !== 'all') {
            query += ' AND user_id = ?';
            params.push(user_id);
        }

        if (entity_type && entity_type !== 'all') {
            query += ' AND entity_type = ?';
            params.push(entity_type);
        }

        if (date_from) {
            query += ' AND DATE(created_at) >= ?';
            params.push(date_from);
        }

        if (date_to) {
            query += ' AND DATE(created_at) <= ?';
            params.push(date_to);
        }

        if (search) {
            query += ' AND (action LIKE ? OR details LIKE ? OR user_name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Get total count
        const [countResult] = await db.execute(
            query.replace('*', 'COUNT(*) as total'),
            params
        );
        const total = countResult[0].total;

        // Get paginated results
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [logs] = await db.execute(query, params);

        // Parse JSON details
        const parsedLogs = logs.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null
        }));

        res.json({
            success: true,
            data: parsedLogs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch activity logs' });
    }
});

// Get activity logs stats
app.get('/api/activity-logs/stats', authenticateToken, async (req, res) => {
    try {
        const [today] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM activity_logs 
            WHERE DATE(created_at) = CURDATE()
        `);

        const [week] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM activity_logs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        const [month] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM activity_logs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        const [byAction] = await db.execute(`
            SELECT action, COUNT(*) as count 
            FROM activity_logs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY action 
            ORDER BY count DESC 
            LIMIT 10
        `);

        const [byUser] = await db.execute(`
            SELECT user_name, COUNT(*) as count 
            FROM activity_logs 
            WHERE user_id IS NOT NULL 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY user_id, user_name 
            ORDER BY count DESC 
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                today: today[0].count,
                week: week[0].count,
                month: month[0].count,
                byAction,
                byUser
            }
        });

    } catch (error) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// Get single activity log
app.get('/api/activity-logs/:id', authenticateToken, async (req, res) => {
    try {
        const [logs] = await db.execute(
            'SELECT * FROM activity_logs WHERE id = ?',
            [req.params.id]
        );

        if (logs.length === 0) {
            return res.status(404).json({ success: false, message: 'Log not found' });
        }

        const log = {
            ...logs[0],
            details: logs[0].details ? JSON.parse(logs[0].details) : null
        };

        res.json({ success: true, data: log });
    } catch (error) {
        console.error('Error fetching activity log:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch log' });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// ==================== USERS ROUTES ====================
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, username, email, name, role, status, 
                   created_at, last_login
            FROM admin_users 
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, username, email, name, role, department, position, 
                   phone, status, last_login, created_at
            FROM admin_users 
            ORDER BY created_at DESC
        `);

        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Get single user
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, name, role, department, position, phone, status FROM admin_users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});

// Create new user
app.post('/api/users', authenticateToken, async (req, res) => {
    try {
        const { username, email, password, name, role, department, position, phone, status } = req.body;

        console.log('Creating user:', { username, email, role }); // Debug log

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email and password are required'
            });
        }

        // Check if user exists
        const [existing] = await db.execute(
            'SELECT id FROM admin_users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.execute(
            `INSERT INTO admin_users 
            (username, email, password, name, role, department, position, phone, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username,
                email,
                hashedPassword,
                name || null,
                role || 'viewer',
                department || null,
                position || null,
                phone || null,
                status || 'active'
            ]
        );

        console.log('User created with ID:', result.insertId);

        // Log activity
        try {
            await activityLogger.logUserCreate(req.user, {
                id: result.insertId,
                username,
                email,
                role
            });
        } catch (logError) {
            console.log('Activity logging skipped:', logError.message);
        }

        res.json({
            success: true,
            message: 'User created successfully',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user: ' + error.message
        });
    }
});

// Update user
app.patch('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { username, email, name, role, department, position, phone, status } = req.body;

        // Build update query
        const updates = [];
        const params = [];

        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (email) {
            updates.push('email = ?');
            params.push(email);
        }
        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }
        if (department !== undefined) {
            updates.push('department = ?');
            params.push(department);
        }
        if (position !== undefined) {
            updates.push('position = ?');
            params.push(position);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (status) {
            updates.push('status = ?');
            params.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        params.push(req.params.id);
        const query = `UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`;

        await db.execute(query, params);

        // Log activity
        try {
            await activityLogger.logUserUpdate(req.user, req.params.id, { updates });
        } catch (logError) {
            // Skip logging if table doesn't exist
        }

        res.json({
            success: true,
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});

// Update user status
app.patch('/api/users/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;

        await db.execute(
            'UPDATE admin_users SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        res.json({
            success: true,
            message: 'User status updated'
        });

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
});

// Delete user
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        // Prevent deleting yourself
        if (req.user.id === parseInt(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Get user data before deletion for logging
        const [userData] = await db.execute(
            'SELECT username, email FROM admin_users WHERE id = ?',
            [req.params.id]
        );

        await db.execute('DELETE FROM admin_users WHERE id = ?', [req.params.id]);

        // Log activity
        try {
            await activityLogger.logUserDelete(req.user, userData[0]);
        } catch (logError) {
            // Skip logging if table doesn't exist
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

// ==================== MESSAGES ROUTES ====================
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const { search, status, priority, folder, dateRange } = req.query;
        let query = 'SELECT * FROM messages WHERE 1=1';
        const params = [];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        if (priority && priority !== 'all') {
            query += ' AND priority = ?';
            params.push(priority);
        }

        if (folder) {
            if (folder === 'starred') {
                query += ' AND starred = 1';
            } else if (folder === 'urgent') {
                query += ' AND priority = "urgent"';
            } else if (folder === 'archived') {
                query += ' AND status = "archived"';
            } else if (folder === 'inbox') {
                query += ' AND status != "archived"';
            }
        }

        if (search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        if (dateRange && dateRange !== 'all') {
            if (dateRange === 'today') {
                query += ' AND DATE(created_at) = CURDATE()';
            } else if (dateRange === 'week') {
                query += ' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
            } else if (dateRange === 'month') {
                query += ' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
            }
        }

        query += ' ORDER BY created_at DESC';

        const [messages] = await db.execute(query, params);
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

app.get('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const [messages] = await db.execute('SELECT * FROM messages WHERE id = ?', [req.params.id]);
        if (messages.length === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Also fetch replies
        let replies = [];
        try {
            const [repliesResult] = await db.execute('SELECT * FROM message_replies WHERE message_id = ? ORDER BY created_at ASC', [req.params.id]);
            replies = repliesResult;
        } catch (e) {
            // Table might not exist yet, that's fine
            console.log('No replies table or error fetching replies');
        }

        res.json({ success: true, data: messages[0], replies });
    } catch (error) {
        console.error('Error fetching message details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch message' });
    }
});

app.patch('/api/messages/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        await db.execute('UPDATE messages SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Message status updated' });
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

app.patch('/api/messages/:id/star', authenticateToken, async (req, res) => {
    try {
        const { starred } = req.body;
        await db.execute('UPDATE messages SET starred = ? WHERE id = ?', [starred ? 1 : 0, req.params.id]);
        res.json({ success: true, message: 'Message star status updated' });
    } catch (error) {
        console.error('Error updating message star status:', error);
        res.status(500).json({ success: false, message: 'Failed to update star status' });
    }
});

app.post('/api/messages/:id/reply', authenticateToken, async (req, res) => {
    try {
        const { reply, is_internal } = req.body;

        // Create table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS message_replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                message_id INT NOT NULL,
                user_id INT NOT NULL,
                reply_text TEXT NOT NULL,
                is_internal TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.execute(
            'INSERT INTO message_replies (message_id, user_id, reply_text, is_internal) VALUES (?, ?, ?, ?)',
            [req.params.id, req.user.id, reply, is_internal ? 1 : 0]
        );

        // If it's a real reply to the user, update the master message status
        if (!is_internal) {
            await db.execute('UPDATE messages SET status = ? WHERE id = ?', ['replied', req.params.id]);
        }
        res.json({ success: true, message: 'Reply saved' });
    } catch (error) {
        console.error('Error saving message reply:', error);
        res.status(500).json({ success: false, message: 'Failed to save reply' });
    }
});

app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM messages WHERE id = ?', [req.params.id]);

        // Log message deletion
        try {
            await activityLogger.logMessageAction(req.user, 'deleted', req.params.id, { id: req.params.id });
        } catch (logError) {
            console.error('Message delete logging failed:', logError.message);
        }

        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
});

app.post('/api/messages/bulk', authenticateToken, async (req, res) => {
    try {
        const { action, messageIds } = req.body;

        if (!messageIds || messageIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No messages provided' });
        }

        const placeholders = messageIds.map(() => '?').join(',');

        if (action === 'read') {
            await db.execute(`UPDATE messages SET status = 'read' WHERE id IN (${placeholders})`, messageIds);
        } else if (action === 'delete') {
            await db.execute(`DELETE FROM messages WHERE id IN (${placeholders})`, messageIds);
        }

        // Log bulk action
        try {
            await activityLogger.logBulkAction(req.user, action, 'message', messageIds.length, { ids: messageIds });
        } catch (logError) {
            console.error('Bulk message logging failed:', logError.message);
        }

        res.json({ success: true, message: 'Bulk action completed' });
    } catch (error) {
        console.error('Error performing bulk action:', error);
        res.status(500).json({ success: false, message: 'Failed to perform bulk action' });
    }
});

app.get('/api/message-templates', authenticateToken, async (req, res) => {
    try {
        let templates = [];
        try {
            const [rows] = await db.execute('SELECT * FROM message_templates ORDER BY name ASC');
            templates = rows;
        } catch (e) {
            // Ignore if table doesn't exist
        }
        res.json({ success: true, data: templates });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch templates' });
    }
});

// ==================== CONTACTS ROUTES ====================
app.get('/api/contacts', authenticateToken, async (req, res) => {
    try {
        const [contacts] = await db.execute(`
            SELECT * FROM contacts ORDER BY created_at DESC
        `);
        res.json({ success: true, data: contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
    }
});

// Setup public contact routes (e.g. form submission)
app.use('/api/contact', require('./routes/contact')(db));


// ==================== PRODUCTS ROUTES ====================

// Get all products with filters
app.get('/api/products', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT p.*, b.name as brand_name, b.id as brand_id, c.name as category_name, c.name as category
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        // Filter by brand
        if (req.query.brand && req.query.brand !== 'all') {
            query += ' AND p.brand_id = ?';
            params.push(req.query.brand);
        }

        // Filter by category
        if (req.query.category && req.query.category !== 'all') {
            query += ' AND (p.category_id = ? OR c.name = ?)';
            params.push(req.query.category, req.query.category);
        }

        // Filter by stock status
        if (req.query.stock_status === 'low') {
            query += ' AND p.stock_quantity <= p.min_stock_level AND p.stock_quantity > 0';
        } else if (req.query.stock_status === 'out') {
            query += ' AND p.stock_quantity <= 0';
        } else if (req.query.stock_status === 'in') {
            query += ' AND p.stock_quantity > 0';
        }

        // Search
        if (req.query.search) {
            query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)';
            const searchTerm = `%${req.query.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Filter by active
        query += ' AND p.is_active = 1';

        query += ' ORDER BY p.created_at DESC';

        const [products] = await db.execute(query, params);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// Get single product
app.get('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const [products] = await db.execute(
            'SELECT * FROM products WHERE id = ?',
            [req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Get stock adjustment history
        const [history] = await db.execute(
            'SELECT * FROM stock_adjustments WHERE product_id = ? ORDER BY created_at DESC LIMIT 10',
            [req.params.id]
        );

        res.json({
            success: true,
            data: {
                ...products[0],
                history
            }
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
});

// Create product
app.post('/api/products', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const {
            name, sku, brand_id, category, description,
            price, cost_price, size, unit,
            stock_quantity, min_stock_level, max_stock_level,
            reorder_point, is_active, is_featured
        } = req.body;

        console.log('Creating product:', { name, sku, brand_id, price }); // Debug log

        // Validation
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Product name and price are required'
            });
        }

        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if SKU already exists (if provided)
        if (sku) {
            const [existing] = await connection.execute(
                'SELECT id FROM products WHERE sku = ?',
                [sku]
            );
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'SKU already exists'
                });
            }
        }

        // Insert product
        const [result] = await connection.execute(
            `INSERT INTO products (
                name, slug, sku, brand_id, category_id, description,
                price, cost_price, size, unit,
                stock_quantity, min_stock_level, max_stock_level,
                reorder_point, is_active, is_featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                slug,
                sku || null,
                brand_id || null,
                req.body.category_id || null,
                description || null,
                parseFloat(price),
                cost_price ? parseFloat(cost_price) : null,
                size || null,
                unit || 'l',
                parseInt(stock_quantity) || 0,
                parseInt(min_stock_level) || 10,
                parseInt(max_stock_level) || 1000,
                parseInt(reorder_point) || 20,
                is_active !== false ? 1 : 0,
                is_featured ? 1 : 0
            ]
        );

        console.log('Product created with ID:', result.insertId);

        // Log initial stock if > 0
        if (stock_quantity > 0) {
            await connection.execute(
                `INSERT INTO stock_adjustments 
                (product_id, adjustment_type, quantity, previous_quantity, new_quantity, reason, adjusted_by) 
                VALUES (?, 'purchase', ?, 0, ?, 'Initial stock', ?)`,
                [result.insertId, stock_quantity, stock_quantity, req.user.id]
            );
        }

        await connection.commit();

        // Log activity
        try {
            await activityLogger.logProductCreate(req.user, {
                id: result.insertId,
                name,
                sku,
                price,
                stock_quantity
            });
        } catch (logError) {
            console.error('Product create logging failed:', logError.message);
        }

        res.json({
            success: true,
            message: 'Product created successfully',
            id: result.insertId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product: ' + error.message
        });
    } finally {
        connection.release();
    }
});

// Update product
app.patch('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const {
            name, sku, brand_id, category, description,
            price, cost_price, size, unit,
            min_stock_level, max_stock_level, reorder_point,
            is_active, is_featured
        } = req.body;

        // Build update query
        const updates = [];
        const params = [];

        if (name !== undefined) {
            const slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            updates.push('name = ?, slug = ?');
            params.push(name, slug);
        }
        if (sku !== undefined) {
            updates.push('sku = ?');
            params.push(sku || null);
        }
        if (brand_id !== undefined) {
            updates.push('brand_id = ?');
            params.push(brand_id || null);
        }
        if (req.body.category_id !== undefined) {
            updates.push('category_id = ?');
            params.push(req.body.category_id || null);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description || null);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            params.push(parseFloat(price));
        }
        if (cost_price !== undefined) {
            updates.push('cost_price = ?');
            params.push(cost_price ? parseFloat(cost_price) : null);
        }
        if (size !== undefined) {
            updates.push('size = ?');
            params.push(size || null);
        }
        if (unit !== undefined) {
            updates.push('unit = ?');
            params.push(unit);
        }
        if (min_stock_level !== undefined) {
            updates.push('min_stock_level = ?');
            params.push(parseInt(min_stock_level));
        }
        if (max_stock_level !== undefined) {
            updates.push('max_stock_level = ?');
            params.push(parseInt(max_stock_level));
        }
        if (reorder_point !== undefined) {
            updates.push('reorder_point = ?');
            params.push(parseInt(reorder_point));
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active ? 1 : 0);
        }
        if (is_featured !== undefined) {
            updates.push('is_featured = ?');
            params.push(is_featured ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        params.push(req.params.id);
        const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;

        await db.execute(query, params);

        // Log activity
        try {
            await activityLogger.logProductUpdate(req.user, req.params.id, updates);
        } catch (logError) {
            console.error('Product update logging failed:', logError.message);
        }

        res.json({
            success: true,
            message: 'Product updated successfully'
        });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
});

// Delete product (soft delete)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        await db.execute(
            'UPDATE products SET is_active = FALSE WHERE id = ?',
            [req.params.id]
        );

        // Log activity
        try {
            await activityLogger.logProductDelete(req.user, req.params.id, 'Product'); // We don't have name easily here without another query, but we can log the ID
        } catch (logError) {
            console.error('Product delete logging failed:', logError.message);
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
});

// ==================== CATEGORIES ROUTES ====================

// Get all categories (with alias for frontend)
app.get(['/api/categories', '/api/product-categories'], authenticateToken, async (req, res) => {
    try {
        const [categories] = await db.execute(`
            SELECT * FROM product_categories 
            WHERE is_active = TRUE 
            ORDER BY sort_order ASC, name ASC
        `);
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});

// Get single category
app.get('/api/categories/:id', authenticateToken, async (req, res) => {
    try {
        const [categories] = await db.execute(
            'SELECT * FROM product_categories WHERE id = ?',
            [req.params.id]
        );

        if (categories.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Get products in this category
        const [products] = await db.execute(
            'SELECT id, name, price FROM products WHERE category_id = ? AND is_active = TRUE',
            [req.params.id]
        );

        res.json({
            success: true,
            data: {
                ...categories[0],
                products
            }
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch category' });
    }
});

// Create category
app.post('/api/categories', authenticateToken, async (req, res) => {
    try {
        const { name, description, parent_id, sort_order } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        // Generate slug
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const [result] = await db.execute(
            `INSERT INTO product_categories (name, slug, description, parent_id, sort_order) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, slug, description || null, parent_id || null, sort_order || 0]
        );

        // Activity Logging
        await activityLogger.logCategoryAction(req.user.id, 'category_created', result.insertId, {
            name,
            slug
        }, req.ip);

        res.json({
            success: true,
            message: 'Category created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Failed to create category' });
    }
});

// Update category
app.patch('/api/categories/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description, parent_id, sort_order, is_active } = req.body;

        const updates = [];
        const params = [];

        if (name) {
            const slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            updates.push('name = ?, slug = ?');
            params.push(name, slug);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (parent_id !== undefined) {
            updates.push('parent_id = ?');
            params.push(parent_id);
        }
        if (sort_order !== undefined) {
            updates.push('sort_order = ?');
            params.push(sort_order);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        params.push(req.params.id);
        const query = `UPDATE product_categories SET ${updates.join(', ')} WHERE id = ?`;

        await db.execute(query, params);

        // Activity Logging
        await activityLogger.logCategoryAction(req.user.id, 'updated', req.params.id, {
            changes: req.body
        }, req.ip);

        res.json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Failed to update category' });
    }
});

// Delete category
app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    try {
        // Check if category has products
        const [products] = await db.execute(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
            [req.params.id]
        );

        if (products[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing products. Archive it instead.'
            });
        }

        await db.execute('UPDATE product_categories SET is_active = FALSE WHERE id = ?', [req.params.id]);

        // Activity Logging
        try {
            await activityLogger.logCategoryAction(req.user.id, 'archived', req.params.id);
        } catch (logError) {
            console.error('Category archiving logging failed:', logError.message);
        }

        res.json({ success: true, message: 'Category archived successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
});

// ==================== BRANDS ROUTES ====================

// Get all brands
app.get('/api/brands', authenticateToken, async (req, res) => {
    try {
        const [brands] = await db.execute(`
            SELECT * FROM brands 
            WHERE is_active = TRUE 
            ORDER BY name ASC
        `);
        res.json({ success: true, data: brands });
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch brands' });
    }
});

// Get single brand
app.get('/api/brands/:id', authenticateToken, async (req, res) => {
    try {
        const [brands] = await db.execute(
            'SELECT * FROM brands WHERE id = ?',
            [req.params.id]
        );

        if (brands.length === 0) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }

        // Get products in this brand
        const [products] = await db.execute(
            'SELECT id, name, price FROM products WHERE brand_id = ? AND is_active = TRUE',
            [req.params.id]
        );

        res.json({
            success: true,
            data: {
                ...brands[0],
                products
            }
        });
    } catch (error) {
        console.error('Error fetching brand:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch brand' });
    }
});

// Stock adjustment route
app.post('/api/products/:id/adjust-stock', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { type, quantity, reason, notes } = req.body;
        const productId = req.params.id;

        // Get current stock
        const [products] = await connection.execute(
            'SELECT name, stock_quantity FROM products WHERE id = ?',
            [productId]
        );

        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = products[0];
        const previousQuantity = product.stock_quantity;
        const adjustmentQuantity = parseInt(quantity);
        const newQuantity = type === 'add' ? previousQuantity + adjustmentQuantity : previousQuantity - adjustmentQuantity;

        if (newQuantity < 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        // Update product stock
        await connection.execute(
            'UPDATE products SET stock_quantity = ? WHERE id = ?',
            [newQuantity, productId]
        );

        // Record adjustment
        await connection.execute(
            `INSERT INTO stock_adjustments 
            (product_id, adjustment_type, quantity, previous_quantity, new_quantity, reason, notes, adjusted_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [productId, type === 'add' ? 'purchase' : 'sale', adjustmentQuantity, previousQuantity, newQuantity, reason, notes || null, req.user.id]
        );

        await connection.commit();

        // Log activity
        try {
            await activityLogger.logStockAdjustment(req.user, {
                product_id: productId,
                product_name: product.name,
                adjustment_type: type,
                quantity: adjustmentQuantity,
                previous_quantity: previousQuantity,
                new_quantity: newQuantity,
                reason: reason
            });
        } catch (logError) {
            console.error('Stock adjustment logging failed:', logError.message);
        }

        res.json({
            success: true,
            message: 'Stock adjusted successfully',
            new_quantity: newQuantity
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error adjusting stock:', error);
        res.status(500).json({ success: false, message: 'Failed to adjust stock: ' + error.message });
    } finally {
        connection.release();
    }
});

// Create brand
app.post('/api/brands', authenticateToken, async (req, res) => {
    try {
        const { name, description, logo_url } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Brand name is required'
            });
        }

        // Generate slug
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if brand already exists
        const [existing] = await db.execute(
            'SELECT id FROM brands WHERE name = ? OR slug = ?',
            [name, slug]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Brand already exists'
            });
        }

        const [result] = await db.execute(
            `INSERT INTO brands (name, slug, description, logo_url) 
             VALUES (?, ?, ?, ?)`,
            [name, slug, description || null, logo_url || null]
        );

        // Activity Logging
        try {
            await activityLogger.logBrandAction(req.user.id, 'created', result.insertId, name);
        } catch (logError) {
            console.error('Brand creation logging failed:', logError.message);
        }

        res.json({
            success: true,
            message: 'Brand created successfully',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create brand'
        });
    }
});

// Update brand
app.patch('/api/brands/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description, logo_url, is_active } = req.body;

        const updates = [];
        const params = [];

        if (name) {
            const slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            updates.push('name = ?, slug = ?');
            params.push(name, slug);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (logo_url !== undefined) {
            updates.push('logo_url = ?');
            params.push(logo_url);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        params.push(req.params.id);
        const query = `UPDATE brands SET ${updates.join(', ')} WHERE id = ?`;

        await db.execute(query, params);

        // Activity Logging
        try {
            await activityLogger.logBrandAction(req.user.id, 'updated', req.params.id, { changes: req.body });
        } catch (logError) {
            console.error('Brand update logging failed:', logError.message);
        }

        res.json({
            success: true,
            message: 'Brand updated successfully'
        });

    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update brand'
        });
    }
});

// Delete brand (soft delete)
app.delete('/api/brands/:id', authenticateToken, async (req, res) => {
    try {
        // Check if brand has products
        const [products] = await db.execute(
            'SELECT COUNT(*) as count FROM products WHERE brand_id = ?',
            [req.params.id]
        );

        if (products[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete brand with existing products. Archive it instead.'
            });
        }

        await db.execute(
            'UPDATE brands SET is_active = FALSE WHERE id = ?',
            [req.params.id]
        );

        // Activity Logging
        try {
            await activityLogger.logBrandAction(req.user.id, 'deleted', req.params.id);
        } catch (logError) {
            console.error('Brand deletion logging failed:', logError.message);
        }

        res.json({
            success: true,
            message: 'Brand archived successfully'
        });

    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete brand'
        });
    }
});

// ==================== INVENTORY ROUTES ====================

// Get inventory list
app.get('/api/inventory', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT 
                p.*,
                b.name as brand_name,
                c.name as category_name,
                c.name as category
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE p.is_active = TRUE
        `;
        const params = [];

        // Filter by brand
        if (req.query.brand_id && req.query.brand_id !== 'all') {
            query += ' AND p.brand_id = ?';
            params.push(req.query.brand_id);
        }

        // Filter by category
        if (req.query.category && req.query.category !== 'all') {
            query += ' AND (p.category_id = ? OR c.name = ?)';
            params.push(req.query.category, req.query.category);
        }

        // Filter by stock status
        if (req.query.stock_status === 'low') {
            query += ' AND p.stock_quantity <= p.min_stock_level AND p.stock_quantity > 0';
        } else if (req.query.stock_status === 'out') {
            query += ' AND p.stock_quantity <= 0';
        } else if (req.query.stock_status === 'in') {
            query += ' AND p.stock_quantity > 0';
        }

        // Search
        if (req.query.search) {
            query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
            const searchTerm = `%${req.query.search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY p.created_at DESC';

        const [products] = await db.execute(query, params);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
    }
});

// Get inventory summary
app.get('/api/inventory/summary', authenticateToken, async (req, res) => {
    try {
        // Total products
        const [totalProducts] = await db.execute(
            'SELECT COUNT(*) as count FROM products WHERE is_active = TRUE'
        );

        // Total stock value
        const [totalValue] = await db.execute(
            `SELECT COALESCE(SUM(stock_quantity * price), 0) as value 
             FROM products WHERE is_active = TRUE`
        );

        // Low stock items
        const [lowStock] = await db.execute(
            'SELECT COUNT(*) as count FROM products WHERE is_active = TRUE AND stock_quantity <= min_stock_level AND stock_quantity > 0'
        );

        // Out of stock items
        const [outOfStock] = await db.execute(
            'SELECT COUNT(*) as count FROM products WHERE is_active = TRUE AND stock_quantity <= 0'
        );

        res.json({
            success: true,
            data: {
                total_products: totalProducts[0].count,
                total_value: totalValue[0].value,
                low_stock_count: lowStock[0].count,
                out_of_stock_count: outOfStock[0].count
            }
        });
    } catch (error) {
        console.error('Error fetching inventory summary:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch inventory summary' });
    }
});

// Get stock adjustment history
app.get('/api/inventory/history/:productId', authenticateToken, async (req, res) => {
    try {
        const [history] = await db.execute(
            `SELECT * FROM stock_adjustments 
             WHERE product_id = ? 
             ORDER BY created_at DESC`,
            [req.params.productId]
        );
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error fetching stock history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stock history' });
    }
});


// ==================== GLOBAL SEARCH ROUTE ====================
app.get('/api/search', authenticateToken, async (req, res) => {
    try {
        const query = req.query.q;

        if (!query || query.trim().length < 2) {
            return res.json({
                success: true,
                data: { contacts: [], orders: [], products: [], bulkOrders: [], customers: [] }
            });
        }

        const searchPattern = `%${query.trim()}%`;
        const results = {
            contacts: [],
            orders: [], // Placeholder if orders table exists later
            products: [],
            bulkOrders: [], // Handled by messages table (bulk orders usually come from contact forms)
            customers: []
        };

        // 1. Search Messages & Contacts (used for Contacts and Bulk Orders)
        try {
            const [messages] = await db.execute(`
                SELECT id, name, email, phone, subject, message, status, created_at
                FROM messages
                WHERE name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?
                ORDER BY created_at DESC
                LIMIT 10
            `, [searchPattern, searchPattern, searchPattern, searchPattern]);

            // Map messages to contacts format based on the frontend expectation
            results.contacts = messages;
        } catch (e) { console.error('Error searching messages:', e); }

        // 2. Search Products
        try {
            const [products] = await db.execute(`
                SELECT p.id, p.name, p.price, p.stock_quantity as stock, p.description, p.sku, b.name as brand
                FROM products p
                LEFT JOIN brands b ON p.brand_id = b.id
                WHERE p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR b.name LIKE ?
                LIMIT 10
            `, [searchPattern, searchPattern, searchPattern, searchPattern]);

            results.products = products;
        } catch (e) { console.error('Error searching products:', e); }

        // 3. Search Users (mapped to Customers for admin view if no external customers exist)
        try {
            const [users] = await db.execute(`
                SELECT id, name, email, phone, role
                FROM admin_users
                WHERE name LIKE ? OR email LIKE ? OR username LIKE ?
                LIMIT 10
            `, [searchPattern, searchPattern, searchPattern]);

            results.customers = users;
        } catch (e) { console.error('Error searching users:', e); }

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});


// ==================== TEST ENDPOINT - REMOVE AFTER FIXING ====================
app.post('/api/test-login-direct', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Test login - Email:', email);
        console.log('Test login - Password:', password);

        const [users] = await db.execute(
            'SELECT * FROM admin_users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        const user = users[0];

        // For testing only - direct password comparison
        if (password === 'admin123') {
            const token = jwt.sign(
                { id: user.id, email: user.email, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name || user.username,
                    email: user.email,
                    username: user.username,
                    role: user.role
                }
            });
        } else {
            return res.json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Test login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== CUSTOMERS ROUTES ====================
app.get('/api/customers', authenticateToken, async (req, res) => {
    try {
        const [customers] = await db.execute('SELECT * FROM customers ORDER BY name ASC');
        res.json({ success: true, data: customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch customers' });
    }
});

app.post('/api/customers', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, address, city, type } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const [result] = await db.execute(
            'INSERT INTO customers (name, email, phone, address, city, type) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email || null, phone || null, address || null, city || null, type || 'individual']
        );

        await activityLogger.logCustomerAction(req.user, 'created', result.insertId, { name, email });
        res.json({ success: true, message: 'Customer created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ success: false, message: 'Failed to create customer' });
    }
});

app.patch('/api/customers/:id', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, address, city, type, is_active } = req.body;
        const updates = [];
        const params = [];

        if (name) { updates.push('name = ?'); params.push(name); }
        if (email !== undefined) { updates.push('email = ?'); params.push(email); }
        if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
        if (address !== undefined) { updates.push('address = ?'); params.push(address); }
        if (city !== undefined) { updates.push('city = ?'); params.push(city); }
        if (type) { updates.push('type = ?'); params.push(type); }
        if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

        if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

        params.push(req.params.id);
        const query = `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`;
        await db.execute(query, params);

        await activityLogger.logCustomerAction(req.user, 'updated', req.params.id, { changes: req.body });
        res.json({ success: true, message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ success: false, message: 'Failed to update customer' });
    }
});

// ==================== DISTRIBUTORS ROUTES ====================
app.get('/api/distributors', authenticateToken, async (req, res) => {
    try {
        const [distributors] = await db.execute('SELECT * FROM distributors ORDER BY name ASC');
        res.json({ success: true, data: distributors });
    } catch (error) {
        console.error('Error fetching distributors:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch distributors' });
    }
});

app.post('/api/distributors', authenticateToken, async (req, res) => {
    try {
        const { name, contact_person, email, phone, address, region } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const [result] = await db.execute(
            'INSERT INTO distributors (name, contact_person, email, phone, address, region) VALUES (?, ?, ?, ?, ?, ?)',
            [name, contact_person || null, email || null, phone || null, address || null, region || null]
        );

        await activityLogger.logDistributorAction(req.user, 'created', result.insertId, { name, email });
        res.json({ success: true, message: 'Distributor created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to create distributor' });
    }
});

app.patch('/api/distributors/:id', authenticateToken, async (req, res) => {
    try {
        const { name, contact_person, email, phone, address, region, status } = req.body;
        const updates = [];
        const params = [];

        if (name) { updates.push('name = ?'); params.push(name); }
        if (contact_person !== undefined) { updates.push('contact_person = ?'); params.push(contact_person); }
        if (email !== undefined) { updates.push('email = ?'); params.push(email); }
        if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
        if (address !== undefined) { updates.push('address = ?'); params.push(address); }
        if (region !== undefined) { updates.push('region = ?'); params.push(region); }
        if (status) { updates.push('status = ?'); params.push(status); }

        if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

        params.push(req.params.id);
        const query = `UPDATE distributors SET ${updates.join(', ')} WHERE id = ?`;
        await db.execute(query, params);

        await activityLogger.logDistributorAction(req.user, 'updated', req.params.id, { changes: req.body });
        res.json({ success: true, message: 'Distributor updated successfully' });
    } catch (error) {
        console.error('Error updating distributor:', error);
        res.status(500).json({ success: false, message: 'Failed to update distributor' });
    }
});

// ==================== ORDERS ROUTES ====================
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const [orders] = await db.execute(`
            SELECT o.*, c.name as customer_name, d.name as distributor_name 
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN distributors d ON o.distributor_id = d.id
            ORDER BY o.created_at DESC
        `);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { customer_id, distributor_id, items, status, payment_method, notes } = req.body;

        // Calculate total
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += item.quantity * item.unit_price;
        }

        // Generate order number
        const orderNumber = `ORD-${Date.now()}`;

        const [result] = await connection.execute(
            'INSERT INTO orders (order_number, customer_id, distributor_id, status, total_amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [orderNumber, customer_id || null, distributor_id || null, status || 'pending', totalAmount, payment_method || null, notes || null]
        );

        const orderId = result.insertId;

        // Insert items
        for (const item of items) {
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
            );
        }

        await connection.commit();
        await activityLogger.logOrderAction(req.user, 'created', orderId, { order_number: orderNumber, total: totalAmount });
        res.json({ success: true, message: 'Order created successfully', id: orderId, order_number: orderNumber });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    } finally {
        connection.release();
    }
});

// ==================== INVOICES ROUTES ====================
app.get('/api/invoices', authenticateToken, async (req, res) => {
    try {
        const [invoices] = await db.execute(`
            SELECT i.*, c.name as customer_name, o.order_number 
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            LEFT JOIN orders o ON i.order_id = o.id
            ORDER BY i.created_at DESC
        `);
        res.json({ success: true, data: invoices });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
});

app.post('/api/invoices', authenticateToken, async (req, res) => {
    try {
        const { order_id, customer_id, issue_date, due_date, status, subtotal, tax_amount, discount_amount, total_amount, notes } = req.body;

        const invoiceNumber = `INV-${Date.now()}`;

        const [result] = await db.execute(
            'INSERT INTO invoices (invoice_number, order_id, customer_id, issue_date, due_date, status, subtotal, tax_amount, discount_amount, total_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [invoiceNumber, order_id || null, customer_id || null, issue_date, due_date || null, status || 'draft', subtotal, tax_amount || 0, discount_amount || 0, total_amount, notes || null]
        );

        await activityLogger.logInvoiceAction(req.user, 'created', result.insertId, { invoice_number: invoiceNumber, total: total_amount });
        res.json({ success: true, message: 'Invoice created successfully', id: result.insertId, invoice_number: invoiceNumber });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
});

// ==================== DASHBOARD STATS ROUTE ====================
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        // Contacts stats
        const [contactsTotal] = await db.execute('SELECT COUNT(*) as total FROM contacts');
        const [contactsToday] = await db.execute(
            'SELECT COUNT(*) as total FROM contacts WHERE DATE(created_at) = CURDATE()'
        );

        // Products stats
        const [productsTotal] = await db.execute(
            'SELECT COUNT(*) as total FROM products WHERE is_active = 1'
        );
        const [productsLowStock] = await db.execute(
            'SELECT COUNT(*) as total FROM products WHERE stock_quantity <= min_stock_level AND stock_quantity > 0 AND is_active = 1'
        );
        const [productsOutOfStock] = await db.execute(
            'SELECT COUNT(*) as total FROM products WHERE stock_quantity <= 0 AND is_active = 1'
        );

        // Orders stats (bulk orders)
        const [ordersTotal] = await db.execute('SELECT COUNT(*) as total FROM messages').catch(() => [[{ total: 0 }]]);
        const [ordersPending] = await db.execute(
            "SELECT COUNT(*) as total FROM messages WHERE status = 'unread' OR status = 'pending'"
        ).catch(() => [[{ total: 0 }]]);

        // Revenue (if orders table exists)
        let revenueTotal = 0, revenueToday = 0, revenueMonth = 0;

        res.json({
            success: true,
            data: {
                contacts: {
                    total: contactsTotal[0].total,
                    newToday: contactsToday[0].total
                },
                products: {
                    total: productsTotal[0].total,
                    lowStock: productsLowStock[0].total,
                    outOfStock: productsOutOfStock[0].total
                },
                orders: {
                    total: ordersTotal[0].total,
                    pending: ordersPending[0].total
                },
                revenue: {
                    total: revenueTotal,
                    today: revenueToday,
                    month: revenueMonth
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
});

// Get chart data for dashboard
app.get('/api/dashboard/chart-data', authenticateToken, async (req, res) => {
    try {
        // Get message counts for the last 7 days
        const [chartData] = await db.execute(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM messages
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Get product counts by category for a pie chart
        const [categoryData] = await db.execute(`
            SELECT 
                c.name as name,
                COUNT(p.id) as value
            FROM products p
            JOIN product_categories c ON p.category_id = c.id
            WHERE p.is_active = 1
            GROUP BY c.name
        `);

        res.json({
            success: true,
            data: {
                messages: chartData,
                categories: categoryData
            }
        });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chart data' });
    }
});

// ==================== NOTIFICATIONS ROUTES ====================
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const [notifications] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        // Return empty array if table doesn't exist yet
        res.json({ success: true, data: [] });
    }
});

app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        await db.execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
            [req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.json({ success: true, message: 'Done' });
    }
});

app.post('/api/notifications/read-all', authenticateToken, async (req, res) => {
    try {
        await db.execute(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL',
            [req.user.id]
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.json({ success: true, message: 'Done' });
    }
});


// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}/api`);
    console.log(`🔑 Test login: admin@tripure.com / admin123`);
});