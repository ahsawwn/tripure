const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Submit contact form
    router.post('/submit', async (req, res) => {
        try {
            const { name, email, phone, subject, message } = req.body;

            // Validation
            if (!name || !email || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and message are required'
                });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Start by checking if contact already exists
            const [existingContacts] = await db.execute(
                'SELECT id FROM contacts WHERE email = ?',
                [email]
            );

            let contactId = null;

            if (existingContacts.length > 0) {
                contactId = existingContacts[0].id;
                // Update existing contact's total_messages and last_message_at
                await db.execute(
                    'UPDATE contacts SET phone = COALESCE(?, phone), company = COALESCE(?, company), total_messages = total_messages + 1, last_message_at = NOW() WHERE id = ?',
                    [phone || null, req.body.company || null, contactId]
                );
            } else {
                // Insert into contacts table
                const [contactResult] = await db.execute(
                    'INSERT INTO contacts (name, email, phone, company, source) VALUES (?, ?, ?, ?, ?)',
                    [name, email, phone || null, req.body.company || null, 'contact_form']
                );
                contactId = contactResult.insertId;
            }

            // Insert into messages table
            const type = req.body.type || 'contact';
            const page_url = req.body.page_url || '/';

            const [result] = await db.execute(
                'INSERT INTO messages (type, name, email, phone, company, subject, message, status, page_url, customer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [type, name, email, phone || null, req.body.company || null, subject || null, message, 'new', page_url, contactId]
            );

            // Create an admin notification
            try {
                await db.execute(
                    `INSERT INTO notifications (type, title, message, data, is_read) 
                     VALUES ('message', 'New Contact Message', ?, ?, 0)`,
                    [
                        `New message received from ${name} (${email})`,
                        JSON.stringify({
                            message_id: result.insertId,
                            sender: name,
                            subject: subject || 'Contact Form Submission'
                        })
                    ]
                );
            } catch (notifError) {
                console.error('Failed to create notification:', notifError);
            }

            res.status(201).json({
                success: true,
                message: 'Message sent successfully!',
                data: {
                    id: result.insertId,
                    name,
                    email
                }
            });

        } catch (error) {
            console.error('Contact form error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message. Please try again.'
            });
        }
    });

    // Get all contact messages (for admin)
    router.get('/messages', async (req, res) => {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM contacts ORDER BY created_at DESC'
            );
            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch messages'
            });
        }
    });

    // Get single message by ID
    router.get('/messages/:id', async (req, res) => {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM contacts WHERE id = ?',
                [req.params.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
            }

            // Mark as read if it's new
            if (rows[0].status === 'new') {
                await db.execute(
                    'UPDATE contacts SET status = ? WHERE id = ?',
                    ['read', req.params.id]
                );
                rows[0].status = 'read';
            }

            res.json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error('Error fetching message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch message'
            });
        }
    });

    // Update message status
    router.patch('/messages/:id/status', async (req, res) => {
        try {
            const { status } = req.body;

            if (!['new', 'read', 'replied'].includes(status)) {
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
                    message: 'Message not found'
                });
            }

            res.json({
                success: true,
                message: 'Status updated successfully'
            });
        } catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update status'
            });
        }
    });

    // Delete message
    router.delete('/messages/:id', async (req, res) => {
        try {
            const [result] = await db.execute(
                'DELETE FROM contacts WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
            }

            res.json({
                success: true,
                message: 'Message deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete message'
            });
        }
    });

    return router;
};