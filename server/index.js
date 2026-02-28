const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

// Initialize app - THIS MUST COME FIRST
const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://tripure.rookies-demo.online',
        'http://tripure.rookies-demo.online'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection Pool
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

// Test database connection
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Connected to MySQL database');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
})();

// ==================== MIDDLEWARE ====================
// Verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// ==================== AUTH ROUTES ====================
// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

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
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

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

        res.json({
            success: true,
            message: 'Login successful',
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
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, email, name, role, last_login, created_at FROM admin_users WHERE id = ?',
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

// ==================== DASHBOARD ROUTES ====================
// Get dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const [totalContacts] = await db.execute(
            'SELECT COUNT(*) as count FROM contacts'
        );

        const [newContactsToday] = await db.execute(
            'SELECT COUNT(*) as count FROM contacts WHERE DATE(created_at) = CURDATE() AND status = "new"'
        );

        const [totalProducts] = await db.execute(
            'SELECT COUNT(*) as count FROM products WHERE is_active = TRUE'
        );

        const [lowStockItems] = await db.execute(
            'SELECT COUNT(*) as count FROM products WHERE stock_quantity <= min_stock_level'
        );

        const [totalOrders] = await db.execute(
            'SELECT COUNT(*) as count FROM orders'
        );

        const [pendingOrders] = await db.execute(
            'SELECT COUNT(*) as count FROM orders WHERE status = "pending"'
        );

        const [totalRevenue] = await db.execute(
            'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = "paid"'
        );

        res.json({
            success: true,
            data: {
                contacts: {
                    total: totalContacts[0].count,
                    newToday: newContactsToday[0].count
                },
                products: {
                    total: totalProducts[0].count,
                    lowStock: lowStockItems[0].count
                },
                orders: {
                    total: totalOrders[0].count,
                    pending: pendingOrders[0].count
                },
                revenue: {
                    total: totalRevenue[0].total
                }
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats'
        });
    }
});

// Get recent contacts
app.get('/api/dashboard/recent-contacts', authenticateToken, async (req, res) => {
    try {
        const [contacts] = await db.execute(
            'SELECT id, name, email, subject, status, created_at FROM contacts ORDER BY created_at DESC LIMIT 5'
        );

        res.json({
            success: true,
            data: contacts
        });

    } catch (error) {
        console.error('Recent contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent contacts'
        });
    }
});

// Get recent orders
app.get('/api/dashboard/recent-orders', authenticateToken, async (req, res) => {
    try {
        const [orders] = await db.execute(
            'SELECT id, order_number, customer_name, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5'
        );

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Recent orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent orders'
        });
    }
});

// Get sales data for chart
app.get('/api/dashboard/sales-chart', authenticateToken, async (req, res) => {
    try {
        const [sales] = await db.execute(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as order_count,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC`
        );

        res.json({
            success: true,
            data: sales
        });

    } catch (error) {
        console.error('Sales chart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales data'
        });
    }
});

// ==================== CONTACT ROUTES (PUBLIC) ====================
// Submit contact form (public - no authentication)
app.post('/api/contact/submit', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO contacts (name, email, phone, subject, message, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                name, 
                email, 
                phone || null, 
                subject || null, 
                message,
                req.ip,
                req.headers['user-agent']
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Message sent successfully!',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});

// ==================== CONTACT ROUTES (ADMIN) ====================
// Get all contacts
app.get('/api/contacts', authenticateToken, async (req, res) => {
    try {
        const [contacts] = await db.execute(
            'SELECT * FROM contacts ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts'
        });
    }
});

// Get single contact
app.get('/api/contacts/:id', authenticateToken, async (req, res) => {
    try {
        const [contacts] = await db.execute(
            'SELECT * FROM contacts WHERE id = ?',
            [req.params.id]
        );

        if (contacts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: contacts[0]
        });
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact'
        });
    }
});

// Update contact status
app.patch('/api/contacts/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['new', 'read', 'replied', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const [result] = await db.execute(
            'UPDATE contacts SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully'
        });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status'
        });
    }
});

// Delete contact
app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM contacts WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}/api`);
});