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

// ==================== BULK ORDER ROUTES ====================

// Submit bulk order inquiry (public)
app.post('/api/bulk-order/submit', async (req, res) => {
    try {
        const {
            companyName,
            contactPerson,
            email,
            phone,
            productType,
            quantity,
            deliveryAddress,
            preferredDate,
            message
        } = req.body;

        // Validation
        if (!companyName || !contactPerson || !email || !phone || !quantity || !deliveryAddress) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Insert into database
        const [result] = await db.execute(
            `INSERT INTO bulk_orders 
            (company_name, contact_person, email, phone, product_type, quantity, 
             delivery_address, preferred_date, requirements, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                companyName,
                contactPerson,
                email,
                phone,
                productType,
                quantity,
                deliveryAddress,
                preferredDate || null,
                message || null
            ]
        );

        // Also add to contacts for general visibility
        await db.execute(
            `INSERT INTO contacts (name, email, phone, subject, message, status) 
             VALUES (?, ?, ?, ?, ?, 'new')`,
            [
                contactPerson,
                email,
                phone,
                `Bulk Order Inquiry - ${companyName}`,
                `Company: ${companyName}\nProduct: ${productType}\nQuantity: ${quantity} bottles\nDelivery: ${deliveryAddress}\n\n${message || 'No additional requirements'}`
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Bulk order inquiry submitted successfully!',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Bulk order submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit bulk order inquiry'
        });
    }
});

// Get all bulk orders (admin only)
app.get('/api/bulk-orders', authenticateToken, async (req, res) => {
    try {
        const [orders] = await db.execute(
            'SELECT * FROM bulk_orders ORDER BY created_at DESC'
        );
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching bulk orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bulk orders' });
    }
});

// Get single bulk order (admin only)
app.get('/api/bulk-orders/:id', authenticateToken, async (req, res) => {
    try {
        const [orders] = await db.execute(
            'SELECT * FROM bulk_orders WHERE id = ?',
            [req.params.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Bulk order not found' });
        }

        res.json({ success: true, data: orders[0] });
    } catch (error) {
        console.error('Error fetching bulk order:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bulk order' });
    }
});

// Update bulk order status (admin only)
app.patch('/api/bulk-orders/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status, quoted_price, admin_notes } = req.body;

        const validStatuses = ['pending', 'quoted', 'confirmed', 'processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const [result] = await db.execute(
            `UPDATE bulk_orders 
             SET status = ?, quoted_price = ?, admin_notes = ? 
             WHERE id = ?`,
            [status, quoted_price || null, admin_notes || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Bulk order not found' });
        }

        res.json({ success: true, message: 'Bulk order updated successfully' });
    } catch (error) {
        console.error('Error updating bulk order:', error);
        res.status(500).json({ success: false, message: 'Failed to update bulk order' });
    }
});

// Update bulk order with quote (admin only)
app.post('/api/bulk-orders/:id/quote', authenticateToken, async (req, res) => {
    try {
        const { quoted_price, admin_notes } = req.body;

        const [result] = await db.execute(
            `UPDATE bulk_orders 
             SET status = 'quoted', quoted_price = ?, admin_notes = ? 
             WHERE id = ?`,
            [quoted_price, admin_notes, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Bulk order not found' });
        }

        // Here you could also send an email notification to the customer

        res.json({ success: true, message: 'Quote sent successfully' });
    } catch (error) {
        console.error('Error sending quote:', error);
        res.status(500).json({ success: false, message: 'Failed to send quote' });
    }
});

// Delete bulk order (admin only)
app.delete('/api/bulk-orders/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM bulk_orders WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Bulk order not found' });
        }

        res.json({ success: true, message: 'Bulk order deleted successfully' });
    } catch (error) {
        console.error('Error deleting bulk order:', error);
        res.status(500).json({ success: false, message: 'Failed to delete bulk order' });
    }
});

// Get bulk order statistics for dashboard
app.get('/api/bulk-orders/stats/summary', authenticateToken, async (req, res) => {
    try {
        const [total] = await db.execute('SELECT COUNT(*) as count FROM bulk_orders');
        const [pending] = await db.execute('SELECT COUNT(*) as count FROM bulk_orders WHERE status = "pending"');
        const [quoted] = await db.execute('SELECT COUNT(*) as count FROM bulk_orders WHERE status = "quoted"');
        const [confirmed] = await db.execute('SELECT COUNT(*) as count FROM bulk_orders WHERE status = "confirmed"');
        
        const [revenue] = await db.execute(
            'SELECT COALESCE(SUM(quoted_price), 0) as total FROM bulk_orders WHERE status IN ("confirmed", "completed")'
        );

        res.json({
            success: true,
            data: {
                total: total[0].count,
                pending: pending[0].count,
                quoted: quoted[0].count,
                confirmed: confirmed[0].count,
                revenue: revenue[0].total
            }
        });
    } catch (error) {
        console.error('Error fetching bulk order stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// ==================== MESSAGES ROUTES ====================

// Get all messages with filters
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        let query = 'SELECT * FROM messages WHERE 1=1';
        const params = [];
        
        if (req.query.type && req.query.type !== 'all') {
            query += ' AND type = ?';
            params.push(req.query.type);
        }
        
        if (req.query.status && req.query.status !== 'all') {
            query += ' AND status = ?';
            params.push(req.query.status);
        }
        
        if (req.query.priority && req.query.priority !== 'all') {
            query += ' AND priority = ?';
            params.push(req.query.priority);
        }
        
        if (req.query.search) {
            query += ' AND MATCH(name, email, subject, message) AGAINST(? IN NATURAL LANGUAGE MODE)';
            params.push(req.query.search);
        }
        
        if (req.query.dateRange === 'today') {
            query += ' AND DATE(created_at) = CURDATE()';
        } else if (req.query.dateRange === 'week') {
            query += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        } else if (req.query.dateRange === 'month') {
            query += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [messages] = await db.execute(query, params);
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

// Get single message with replies
app.get('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const [messages] = await db.execute('SELECT * FROM messages WHERE id = ?', [req.params.id]);
        
        if (messages.length === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        
        const [replies] = await db.execute('SELECT * FROM message_replies WHERE message_id = ? ORDER BY created_at', [req.params.id]);
        
        res.json({ success: true, data: messages[0], replies });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch message' });
    }
});

// Update message status
app.patch('/api/messages/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        await db.execute('UPDATE messages SET status = ? WHERE id = ?', [status, req.params.id]);
        
        // Create notification
        await createNotification({
            user_id: req.user.id,
            type: 'message',
            title: 'Message Status Updated',
            message: `Message #${req.params.id} marked as ${status}`,
            data: { messageId: req.params.id, status }
        });
        
        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

// Update message priority
app.patch('/api/messages/:id/priority', authenticateToken, async (req, res) => {
    try {
        const { priority } = req.body;
        await db.execute('UPDATE messages SET priority = ? WHERE id = ?', [priority, req.params.id]);
        res.json({ success: true, message: 'Priority updated' });
    } catch (error) {
        console.error('Error updating priority:', error);
        res.status(500).json({ success: false, message: 'Failed to update priority' });
    }
});

// Add reply to message
app.post('/api/messages/:id/reply', authenticateToken, async (req, res) => {
    try {
        const { reply, is_internal } = req.body;
        
        const [result] = await db.execute(
            'INSERT INTO message_replies (message_id, admin_id, reply_text, is_internal) VALUES (?, ?, ?, ?)',
            [req.params.id, req.user.id, reply, is_internal]
        );
        
        // If not internal, update message status to replied
        if (!is_internal) {
            await db.execute('UPDATE messages SET status = ? WHERE id = ?', ['replied', req.params.id]);
        }
        
        // Create notification for admins
        if (!is_internal) {
            await createNotification({
                user_id: null, // broadcast to all admins
                type: 'message',
                title: 'New Reply Sent',
                message: `Reply sent to message #${req.params.id}`,
                data: { messageId: req.params.id }
            });
        }
        
        const [newReply] = await db.execute('SELECT * FROM message_replies WHERE id = ?', [result.insertId]);
        
        res.json({ success: true, data: newReply[0] });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ success: false, message: 'Failed to add reply' });
    }
});

// Bulk actions
app.post('/api/messages/bulk', authenticateToken, async (req, res) => {
    try {
        const { action, messageIds } = req.body;
        
        if (!messageIds || messageIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No messages selected' });
        }
        
        const placeholders = messageIds.map(() => '?').join(',');
        
        if (action === 'read') {
            await db.execute(`UPDATE messages SET status = 'read' WHERE id IN (${placeholders})`, messageIds);
        } else if (action === 'archive') {
            await db.execute(`UPDATE messages SET status = 'archived' WHERE id IN (${placeholders})`, messageIds);
        } else if (action === 'delete') {
            await db.execute(`DELETE FROM messages WHERE id IN (${placeholders})`, messageIds);
        }
        
        res.json({ success: true, message: `${messageIds.length} messages ${action}ed` });
    } catch (error) {
        console.error('Error performing bulk action:', error);
        res.status(500).json({ success: false, message: 'Failed to perform bulk action' });
    }
});

// Delete message
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM messages WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
});

// ==================== NOTIFICATIONS ROUTES ====================

// Helper function to create notification
const createNotification = async ({ user_id, type, title, message, data }) => {
    try {
        const [result] = await db.execute(
            'INSERT INTO notifications (user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?)',
            [user_id, type, title, message, JSON.stringify(data)]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Get notifications for current user
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const [notifications] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        
        // Parse JSON data
        const parsed = notifications.map(n => ({
            ...n,
            data: n.data ? JSON.parse(n.data) : null
        }));
        
        res.json({ success: true, data: parsed });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
app.post('/api/notifications/read-all', authenticateToken, async (req, res) => {
    try {
        await db.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ? OR user_id IS NULL', [req.user.id]);
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }
});

// Archive notification
app.patch('/api/notifications/:id/archive', authenticateToken, async (req, res) => {
    try {
        await db.execute('UPDATE notifications SET is_archived = TRUE WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Notification archived' });
    } catch (error) {
        console.error('Error archiving notification:', error);
        res.status(500).json({ success: false, message: 'Failed to archive notification' });
    }
});

// Clear all notifications
app.delete('/api/notifications/clear-all', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM notifications WHERE user_id = ? OR user_id IS NULL', [req.user.id]);
        res.json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to clear notifications' });
    }
});

// ==================== MESSAGE TEMPLATES ROUTES ====================

// Get all templates
app.get('/api/message-templates', authenticateToken, async (req, res) => {
    try {
        const [templates] = await db.execute('SELECT * FROM message_templates ORDER BY name');
        res.json({ success: true, data: templates });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch templates' });
    }
});

// Create template
app.post('/api/message-templates', authenticateToken, async (req, res) => {
    try {
        const { name, subject, content, type } = req.body;
        
        const [result] = await db.execute(
            'INSERT INTO message_templates (name, subject, content, type, created_by) VALUES (?, ?, ?, ?, ?)',
            [name, subject, content, type, req.user.id]
        );
        
        res.json({ success: true, message: 'Template created', id: result.insertId });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ success: false, message: 'Failed to create template' });
    }
});

// Update template
app.put('/api/message-templates/:id', authenticateToken, async (req, res) => {
    try {
        const { name, subject, content, type } = req.body;
        
        await db.execute(
            'UPDATE message_templates SET name = ?, subject = ?, content = ?, type = ? WHERE id = ?',
            [name, subject, content, type, req.params.id]
        );
        
        res.json({ success: true, message: 'Template updated' });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ success: false, message: 'Failed to update template' });
    }
});

// Delete template
app.delete('/api/message-templates/:id', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM message_templates WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Template deleted' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ success: false, message: 'Failed to delete template' });
    }
});

// Compose and send new message
app.post('/api/messages/compose', authenticateToken, async (req, res) => {
    try {
        const { type, name, email, phone, company, subject, message, priority } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO messages (type, name, email, phone, company, subject, message, priority, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
            [type, name, email, phone, company, subject, message, priority]
        );
        
        // Create notification for admins
        await createNotification({
            user_id: null,
            type: 'message',
            title: 'New Message Created',
            message: `New ${type} message from ${name}`,
            data: { messageId: result.insertId }
        });
        
        res.json({ success: true, message: 'Message sent', id: result.insertId });
    } catch (error) {
        console.error('Error composing message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Assign message to user
app.patch('/api/messages/:id/assign', authenticateToken, async (req, res) => {
    try {
        const { assigned_to } = req.body;
        
        await db.execute('UPDATE messages SET assigned_to = ? WHERE id = ?', [assigned_to, req.params.id]);
        
        res.json({ success: true, message: 'Message assigned' });
    } catch (error) {
        console.error('Error assigning message:', error);
        res.status(500).json({ success: false, message: 'Failed to assign message' });
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