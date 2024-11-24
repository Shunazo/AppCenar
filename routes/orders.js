const express = require('express');
const router = express.Router();
const db = require('../config/database');

// List user orders
router.get('/', (req, res) => {
    const userId = req.session.user.id;
    
    db.all(`
        SELECT o.*, b.name as business_name, 
               os.status_name, os.color as status_color
        FROM orders o
        JOIN businesses b ON o.business_id = b.id
        JOIN order_statuses os ON o.status = os.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `, [userId], (err, orders) => {
        res.render('orders/index', {
            title: 'Mis Pedidos',
            orders
        });
    });
});

// Order details
router.get('/:id', (req, res) => {
    const orderId = req.params.id;
    const userId = req.session.user.id;
    
    db.get(`
        SELECT o.*, b.name as business_name, 
               os.status_name, os.color as status_color
        FROM orders o
        JOIN businesses b ON o.business_id = b.id
        JOIN order_statuses os ON o.status = os.id
        WHERE o.id = ? AND o.user_id = ?
    `, [orderId, userId], (err, order) => {
        if (order) {
            db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, items) => {
                res.render('orders/detail', {
                    title: `Pedido #${order.id}`,
                    order,
                    items
                });
            });
        } else {
            res.status(404).render('errors/404');
        }
    });
});

// Create new order
router.post('/', (req, res) => {
    const userId = req.session.user.id;
    const { businessId, items, address, total } = req.body;
    
    db.run(`
        INSERT INTO orders (user_id, business_id, address_id, total, status)
        VALUES (?, ?, ?, ?, 1)
    `, [userId, businessId, address, total], function(err) {
        if (err) {
            res.status(500).json({ error: 'Error al crear el pedido' });
        } else {
            const orderId = this.lastID;
            const itemValues = items.map(item => 
                `(${orderId}, ${item.productId}, ${item.quantity}, ${item.price})`
            ).join(',');
            
            db.run(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ${itemValues}
            `, [], (err) => {
                if (err) {
                    res.status(500).json({ error: 'Error al agregar items' });
                } else {
                    res.json({ 
                        success: true, 
                        orderId: orderId 
                    });
                }
            });
        }
    });
});

module.exports = router;
