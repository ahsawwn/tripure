class ActivityLogger {
    constructor(db) {
        this.db = db;
        this.clientIp = null;
        this.userAgent = null;
    }

    setClientInfo(ip, userAgent) {
        this.clientIp = ip;
        this.userAgent = userAgent;
    }

    async log(user, action, entityType = null, entityId = null, details = null, status = 'success') {
        try {
            const [result] = await this.db.execute(
                `INSERT INTO activity_logs 
                (user_id, user_name, user_role, action, entity_type, entity_id, details, ip_address, user_agent, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user?.id || null,
                    user?.name || user?.username || 'System',
                    user?.role || 'system',
                    action,
                    entityType,
                    entityId,
                    details ? JSON.stringify(details) : null,
                    this.clientIp || null,
                    this.userAgent || null,
                    status
                ]
            );

            return result.insertId;
        } catch (error) {
            console.error('❌ Activity Logger Error:', error.message);
            return null;
        }
    }

    // Helper method to log user login
    async logLogin(user, success = true) {
        return this.log(
            user,
            success ? 'user_login' : 'user_login_failed',
            'auth',
            user?.id,
            { email: user?.email },
            success ? 'success' : 'failed'
        );
    }

    // Helper method to log user logout
    async logLogout(user) {
        return this.log(user, 'user_logout', 'auth', user?.id);
    }

    // Helper method to log user creation
    async logUserCreate(admin, newUser) {
        return this.log(
            admin,
            'user_created',
            'user',
            newUser.id,
            {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        );
    }

    // Helper method to log user update
    async logUserUpdate(admin, userId, changes) {
        return this.log(
            admin,
            'user_updated',
            'user',
            userId,
            { changes }
        );
    }

    // Helper method to log user delete
    async logUserDelete(admin, userData) {
        return this.log(
            admin,
            'user_deleted',
            'user',
            userData.id,
            {
                username: userData.username,
                email: userData.email
            }
        );
    }

    // Helper method to log customer actions
    async logCustomerAction(user, action, customerId, details) {
        return this.log(
            user,
            `customer_${action}`,
            'customer',
            customerId,
            details
        );
    }

    // Helper method to log distributor actions
    async logDistributorAction(user, action, distributorId, details) {
        return this.log(
            user,
            `distributor_${action}`,
            'distributor',
            distributorId,
            details
        );
    }

    // Helper method to log invoice actions
    async logInvoiceAction(user, action, invoiceId, details) {
        return this.log(
            user,
            `invoice_${action}`,
            'invoice',
            invoiceId,
            details
        );
    }

    // Helper method to log message actions
    async logMessageAction(user, action, messageId, details) {
        return this.log(
            user,
            `message_${action}`,
            'message',
            messageId,
            details
        );
    }

    // Helper method to log order actions
    async logOrderAction(user, action, orderId, details) {
        return this.log(
            user,
            `order_${action}`,
            'order',
            orderId,
            details
        );
    }

    // Helper method to log bulk actions
    async logBulkAction(user, action, entityType, count, details) {
        return this.log(
            user,
            `bulk_${action}`,
            entityType,
            null,
            { count, ...details }
        );
    }

    // Helper method to log product creation
    async logProductCreate(user, product) {
        return this.log(
            user,
            'product_created',
            'product',
            product.id,
            { name: product.name, sku: product.sku, price: product.price, stock: product.stock_quantity }
        );
    }

    // Helper method to log product update
    async logProductUpdate(user, productId, changes) {
        return this.log(
            user,
            'product_updated',
            'product',
            productId,
            { changes }
        );
    }

    // Helper method to log product delete
    async logProductDelete(user, productId, productName) {
        return this.log(
            user,
            'product_deleted',
            'product',
            productId,
            { name: productName }
        );
    }

    // Helper method to log stock adjustment
    async logStockAdjustment(user, adjustment) {
        return this.log(
            user,
            'stock_adjusted',
            'inventory',
            adjustment.product_id,
            {
                product_name: adjustment.product_name,
                type: adjustment.adjustment_type,
                quantity: adjustment.quantity,
                previous: adjustment.previous_quantity,
                new: adjustment.new_quantity,
                reason: adjustment.reason
            }
        );
    }

    // Helper method to log brand actions
    async logBrandAction(user, action, brandId, brandName) {
        return this.log(
            user,
            `brand_${action}`,
            'brand',
            brandId,
            { name: brandName }
        );
    }

    // Helper method to log category actions
    async logCategoryAction(user, action, categoryId, categoryName) {
        return this.log(
            user,
            `category_${action}`,
            'category',
            categoryId,
            { name: categoryName }
        );
    }

    // Helper method to log errors
    async logError(user, action, error, entityType = null, entityId = null) {
        return this.log(
            user,
            action,
            entityType,
            entityId,
            { error: error.message, stack: error.stack },
            'failed'
        );
    }
}

module.exports = ActivityLogger;