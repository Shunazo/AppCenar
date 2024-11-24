const db = require('../config/database');

const orderTrackingController = {
    getOrderTracking: async (req, res) => {
        const { orderId } = req.params;
        const userId = req.session.user.id;

        try {
            const [order, statusSteps] = await Promise.all([
                getOrderDetails(orderId, userId),
                getOrderStatusSteps(orderId)
            ]);

            res.render('orders/tracking', {
                order,
                statusSteps,
                helpers: {
                    formatTime: timestamp => new Date(timestamp).toLocaleTimeString()
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al cargar seguimiento del pedido' });
        }
    },

    getOrderLocation: async (req, res) => {
        const { orderId } = req.params;
        
        db.get(`
            SELECT current_location, delivery_status
            FROM orders
            WHERE id = ?
        `, [orderId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener ubicación' });
            }
            res.json(result);
        });
    }
};

function getOrderDetails(orderId, userId) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT o.*, 
                   b.name as business_name,
                   a.address as delivery_address,
                   u.name as delivery_name,
                   b.latitude as business_lat,
                   b.longitude as business_lng,
                   a.latitude as delivery_lat,
                   a.longitude as delivery_lng
            FROM orders o
            JOIN businesses b ON o.business_id = b.id
            JOIN addresses a ON o.address_id = a.id
            LEFT JOIN users u ON o.delivery_id = u.id
            WHERE o.id = ? AND o.user_id = ?
        `, [orderId, userId], (err, order) => {
            if (err) reject(err);
            
            // Get order items
            db.all(`
                SELECT oi.*, p.name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [orderId], (err, items) => {
                if (err) reject(err);
                order.items = items.map(item => ({
                    ...item,
                    subtotal: (item.quantity * item.price).toFixed(2)
                }));
                resolve(order);
            });
        });
    });
}

function getOrderStatusSteps(orderId) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                created_at,
                accepted_at,
                preparing_at,
                ready_at,
                delivery_accepted_at,
                delivery_picked_at,
                delivered_at,
                status,
                delivery_status
            FROM orders
            WHERE id = ?
        `, [orderId], (err, result) => {
            if (err) reject(err);
            
            const steps = [
                {
                    label: 'Pedido Realizado',
                    icon: 'fa-shopping-cart',
                    timestamp: result.created_at,
                    completed: true
                },
                {
                    label: 'Pedido Aceptado',
                    icon: 'fa-check',
                    timestamp: result.accepted_at,
                    completed: !!result.accepted_at
                },
                {
                    label: 'En Preparación',
                    icon: 'fa-utensils',
                    timestamp: result.preparing_at,
                    completed: !!result.preparing_at
                },
                {
                    label: 'Listo para Entrega',
                    icon: 'fa-box',
                    timestamp: result.ready_at,
                    completed: !!result.ready_at
                },
                {
                    label: 'En Camino',
                    icon: 'fa-motorcycle',
                    timestamp: result.delivery_picked_at,
                    completed: !!result.delivery_picked_at
                },
                {
                    label: 'Entregado',
                    icon: 'fa-flag-checkered',
                    timestamp: result.delivered_at,
                    completed: !!result.delivered_at
                }
            ];

            // Mark current step as active
            let activeFound = false;
            steps.forEach(step => {
                if (!step.completed && !activeFound) {
                    step.active = true;
                    activeFound = true;
                }
            });

            resolve(steps);
        });
    });
}

module.exports = orderTrackingController;
