const db = require('../config/database');
const geolib = require('geolib');
const { io } = require('../config/socket');

const deliveryController = {
    getDashboard: async (req, res) => {
        const deliveryId = req.session.user.id;
        
        try {
            const [stats, availableOrders, activeDeliveries] = await Promise.all([
                getDeliveryStats(deliveryId),
                getAvailableOrders(deliveryId),
                getActiveDeliveries(deliveryId)
            ]);

            res.render('delivery/dashboard', {
                stats,
                availableOrders,
                activeDeliveries
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al cargar dashboard' });
        }
    },

    updateAvailability: (req, res) => {
        const deliveryId = req.session.user.id;
        const { isAvailable } = req.body;

        db.run(`
            UPDATE delivery_status 
            SET is_available = ?, last_updated = CURRENT_TIMESTAMP
            WHERE delivery_id = ?
        `, [isAvailable ? 1 : 0, deliveryId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar disponibilidad' });
            }
            res.json({ success: true });
        });
    },

    acceptDelivery: (req, res) => {
        const deliveryId = req.session.user.id;
        const { orderId } = req.params;

        db.run(`
            UPDATE orders 
            SET delivery_id = ?, 
                delivery_status = 'accepted',
                delivery_accepted_at = CURRENT_TIMESTAMP
            WHERE id = ? AND delivery_id IS NULL
        `, [deliveryId, orderId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al aceptar entrega' });
            }
            res.json({ success: true });
        });
    },

    getActiveDeliveries: async (req, res) => {
        const deliveryId = req.session.user.id;
        
        db.all(`
            SELECT o.*, 
                   b.name as business_name, b.address as pickup_address,
                   u.name as client_name, u.phone as client_phone,
                   d.address as delivery_address
            FROM orders o
            JOIN businesses b ON o.business_id = b.id
            JOIN users u ON o.user_id = u.id
            JOIN delivery_addresses d ON o.delivery_address_id = d.id
            WHERE o.delivery_id = ? 
            AND o.status IN ('assigned', 'picked_up')
            ORDER BY o.created_at DESC
        `, [deliveryId], (err, deliveries) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching deliveries' });
            }
            res.json({ deliveries });
        });
    },

    updateDeliveryStatus: async (req, res) => {
        const { orderId } = req.params;
        const { status, location } = req.body;
        
        db.run(`
            UPDATE orders 
            SET status = ?,
                current_location = ?
            WHERE id = ?
        `, [status, JSON.stringify(location), orderId], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error updating delivery status' });
            }
            
            // Notify client and business through WebSocket
            io.to(`order_${orderId}`).emit('deliveryStatusUpdate', { 
                status,
                location 
            });
            
            res.json({ success: true });
        });
    },

    getDeliveryStats: async (req, res) => {
        const deliveryId = req.session.user.id;
        
        db.get(`
            SELECT 
                COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as today_deliveries,
                COUNT(CASE WHEN status = 'delivered' AND DATE(created_at) = DATE('now') THEN 1 END) as completed_deliveries,
                AVG(CASE WHEN status = 'delivered' THEN 
                    (strftime('%s', delivered_at) - strftime('%s', assigned_at))/60.0 
                END) as avg_delivery_time
            FROM orders
            WHERE delivery_id = ?
        `, [deliveryId], (err, stats) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching statistics' });
            }
            res.json({ stats });
        });
    }
};

// Helper functions
async function getDeliveryStats(deliveryId) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                COUNT(CASE WHEN DATE(delivery_completed_at) = DATE('now') THEN 1 END) as todayDeliveries,
                COUNT(CASE WHEN delivery_status IN ('accepted', 'picked_up') THEN 1 END) as pendingDeliveries,
                SUM(CASE WHEN DATE(delivery_completed_at) = DATE('now') THEN delivery_fee ELSE 0 END) as todayEarnings,
                SUM(CASE WHEN delivery_completed_at >= DATE('now', '-7 days') THEN delivery_fee ELSE 0 END) as weekEarnings,
                ROUND(AVG(delivery_rating), 1) as rating,
                COUNT(delivery_rating) as totalReviews,
                (SELECT is_available FROM delivery_status WHERE delivery_id = ?) as isAvailable
            FROM orders
            WHERE delivery_id = ?
        `, [deliveryId, deliveryId], (err, stats) => {
            if (err) reject(err);
            resolve(stats);
        });
    });
}

async function getAvailableOrders(deliveryId) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT o.*, 
                   b.name as business_name, 
                   b.address as business_address,
                   a.address as delivery_address,
                   b.latitude as business_lat,
                   b.longitude as business_lng,
                   a.latitude as delivery_lat,
                   a.longitude as delivery_lng
            FROM orders o
            JOIN businesses b ON o.business_id = b.id
            JOIN addresses a ON o.address_id = a.id
            WHERE o.delivery_id IS NULL 
            AND o.status = 'ready'
            ORDER BY o.created_at ASC
        `, [], (err, orders) => {
            if (err) reject(err);
            
            // Calculate distances and delivery fees
            orders.forEach(order => {
                const distance = calculateDistance(
                    order.business_lat, order.business_lng,
                    order.delivery_lat, order.delivery_lng
                );
                order.distance = distance;
                order.delivery_fee = calculateDeliveryFee(distance);
            });
            
            resolve(orders);
        });
    });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const distance = geolib.getDistance(
        { latitude: lat1, longitude: lng1 },
        { latitude: lat2, longitude: lng2 }
    );
    return (distance / 1000).toFixed(1); // Convert to kilometers
}

function calculateDeliveryFee(distance) {
    const baseFee = 100; // RD$100
    const perKmFee = 20; // RD$20 per km
    return (baseFee + (distance * perKmFee)).toFixed(2);
}
module.exports = deliveryController;