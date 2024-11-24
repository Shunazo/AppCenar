const db = require('../config/database');
const { io } = require('../config/socket');

const orderController = {
    createOrder: (req, res) => {
        const { addressId, items, total } = req.body;
        const userId = req.session.user.id;
        const businessId = items[0].businessId; // Assuming all items are from same business
        
        db.run(`
            INSERT INTO orders (user_id, business_id, total, status)
            VALUES (?, ?, ?, 'pending')
        `, [userId, businessId, total], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear pedido' });
            }
            
            const orderId = this.lastID;
            
            // Insert order items
            const itemValues = items.map(item => 
                `(${orderId}, ${item.productId}, ${item.quantity}, ${item.price})`
            ).join(',');
            
            db.run(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ${itemValues}
            `, [], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al guardar items del pedido' });
                }
                
                res.json({ success: true, orderId });
            });
        });
    },
    
    getOrderDetails: (req, res) => {
        const orderId = req.params.id;
        
        db.get(`
            SELECT o.*, b.name as business_name, u.name as client_name
            FROM orders o
            JOIN businesses b ON o.business_id = b.id
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [orderId], (err, order) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar pedido' });
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
                
                res.render('orders/detail', { order, items });
            });
        });
    },

    getBusinessOrders: async (req, res) => {
        const businessId = req.session.user.businessId;
        const { status } = req.query;
        
        let query = `
            SELECT o.*, u.name as client_name, u.phone as client_phone,
                   d.name as delivery_name, d.phone as delivery_phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN users d ON o.delivery_id = d.id
            WHERE o.business_id = ?
        `;
        
        if (status) {
            query += ' AND o.status = ?';
        }
        
        query += ' ORDER BY o.created_at DESC';
        
        const params = status ? [businessId, status] : [businessId];
        
        db.all(query, params, (err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching orders' });
            }
            res.json({ orders });
        });
    },

    updateOrderStatus: async (req, res) => {
        const { orderId } = req.params;
        const { status } = req.body;
        
        db.run(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error updating order status' });
                }
                
                // Notify client through WebSocket
                io.to(`order_${orderId}`).emit('orderStatusUpdate', { status });
                
                res.json({ success: true });
            }
        );
    },

    assignDelivery: async (req, res) => {
        const { orderId } = req.params;
        const { deliveryId } = req.body;
        
        db.run(
            'UPDATE orders SET delivery_id = ?, status = "assigned" WHERE id = ?',
            [deliveryId, orderId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error assigning delivery' });
                }
                
                // Notify delivery through WebSocket
                io.to(`delivery_${deliveryId}`).emit('newOrderAssigned', { orderId });
                
                res.json({ success: true });
            }
        );
    }
};

module.exports = orderController;