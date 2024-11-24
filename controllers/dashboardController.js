const db = require('../config/database');

const dashboardController = {
    clientDashboard: (req, res) => {
        db.all('SELECT * FROM business_types WHERE active = 1', [], (err, businessTypes) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar tipos de comercios' });
            }
            res.render('client/dashboard', { businessTypes });
        });
    },

    businessDashboard: (req, res) => {
        const businessId = req.session.user.businessId;
        
        db.all(`
            SELECT o.*, u.name as client_name 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.business_id = ? 
            ORDER BY o.created_at DESC
        `, [businessId], (err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar pedidos' });
            }
            res.render('business/dashboard', { orders });
        });
    },

    deliveryDashboard: (req, res) => {
        const deliveryId = req.session.user.id;
        
        db.all(`
            SELECT o.*, u.name as client_name, b.name as business_name
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            JOIN businesses b ON o.business_id = b.id
            WHERE o.delivery_id = ? 
            ORDER BY o.created_at DESC
        `, [deliveryId], (err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar pedidos' });
            }
            res.render('delivery/dashboard', { orders });
        });
    }
};

module.exports = dashboardController;
