const db = require('../config/database');

const businessDashboardController = {
    getDashboardData: async (req, res) => {
        const businessId = req.session.user.businessId;
        
        try {
            const [stats, activeOrders] = await Promise.all([
                getBusinessStats(businessId),
                getActiveOrders(businessId)
            ]);

            res.render('business/dashboard', { 
                stats, 
                activeOrders,
                helpers: {
                    statusColor: getStatusColor,
                    statusText: getStatusText,
                    timeElapsed: formatTimeElapsed
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al cargar datos del dashboard' });
        }
    },

    getOrderDetails: (req, res) => {
        const { orderId } = req.params;
        const businessId = req.session.user.businessId;

        db.get(`
            SELECT o.*, u.name as client_name, u.phone as client_phone,
                   a.address as delivery_address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN addresses a ON o.address_id = a.id
            WHERE o.id = ? AND o.business_id = ?
        `, [orderId, businessId], (err, order) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar detalles del pedido' });
            }

            db.all(`
                SELECT oi.*, p.name as product_name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [orderId], (err, items) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al cargar items del pedido' });
                }

                res.json({ order, items });
            });
        });
    },

    updateOrderStatus: (req, res) => {
        const { orderId } = req.params;
        const { status } = req.body;
        const businessId = req.session.user.businessId;

        db.run(`
            UPDATE orders 
            SET status = ?
            WHERE id = ? AND business_id = ?
        `, [status, orderId, businessId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar estado del pedido' });
            }
            res.json({ success: true });
        });
    }
};

// Helper functions
async function getBusinessStats(businessId) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as todayOrders,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders,
                SUM(CASE WHEN DATE(created_at) = DATE('now') THEN total ELSE 0 END) as todaySales,
                SUM(CASE WHEN created_at >= DATE('now', '-7 days') THEN total ELSE 0 END) as weekSales,
                (SELECT COUNT(*) FROM products WHERE business_id = ? AND active = 1) as activeProducts,
                (SELECT COUNT(*) FROM categories WHERE business_id = ?) as categories,
                ROUND(AVG(rating), 1) as rating,
                COUNT(DISTINCT rating) as totalReviews
            FROM orders
            WHERE business_id = ?
        `, [businessId, businessId, businessId], (err, stats) => {
            if (err) reject(err);
            resolve(stats);
        });
    });
}

async function getActiveOrders(businessId) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT o.*, u.name as client_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.business_id = ? 
            AND o.status IN ('pending', 'accepted', 'preparing')
            ORDER BY o.created_at DESC
        `, [businessId], (err, orders) => {
            if (err) reject(err);
            resolve(orders);
        });
    });
}

function getStatusColor(status) {
    const colors = {
        pending: 'warning',
        accepted: 'primary',
        preparing: 'info',
        ready: 'success',
        delivered: 'secondary',
        cancelled: 'danger'
    };
    return colors[status] || 'secondary';
}

function getStatusText(status) {
    const texts = {
        pending: 'Pendiente',
        accepted: 'Aceptado',
        preparing: 'En Preparación',
        ready: 'Listo',
        delivered: 'Entregado',
        cancelled: 'Cancelado'
    };
    return texts[status] || status;
}

function formatTimeElapsed(timestamp) {
    const minutes = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}

module.exports = businessDashboardController;
