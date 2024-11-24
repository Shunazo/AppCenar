const db = require('../config/database');

const reviewController = {
    getReviewForm: async (req, res) => {
        const { orderId } = req.params;
        const userId = req.session.user.id;

        db.get(`
            SELECT o.*, b.name as business_name, u.name as delivery_name
            FROM orders o
            JOIN businesses b ON o.business_id = b.id
            LEFT JOIN users u ON o.delivery_id = u.id
            WHERE o.id = ? AND o.user_id = ? AND o.status = 'delivered'
        `, [orderId, userId], (err, order) => {
            if (err || !order) {
                return res.redirect('/pedidos');
            }
            res.render('orders/review', { order });
        });
    },

    submitReview: async (req, res) => {
        const { 
            orderId, 
            businessRating, 
            businessComment, 
            deliveryRating, 
            deliveryComment 
        } = req.body;
        const userId = req.session.user.id;

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Save business review
            db.run(`
                INSERT INTO business_reviews (
                    business_id, user_id, order_id, rating, comment
                ) SELECT business_id, ?, ?, ?, ?
                FROM orders WHERE id = ?
            `, [userId, orderId, businessRating, businessComment, orderId], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Error al guardar reseña del comercio' });
                }

                // Save delivery review if exists
                if (deliveryRating) {
                    db.run(`
                        INSERT INTO delivery_reviews (
                            delivery_id, user_id, order_id, rating, comment
                        ) SELECT delivery_id, ?, ?, ?, ?
                        FROM orders WHERE id = ?
                    `, [userId, orderId, deliveryRating, deliveryComment, orderId], function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Error al guardar reseña del delivery' });
                        }

                        // Mark order as reviewed
                        db.run(`
                            UPDATE orders 
                            SET reviewed = 1 
                            WHERE id = ?
                        `, [orderId], function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Error al actualizar estado de reseña' });
                            }

                            db.run('COMMIT');
                            res.json({ success: true });
                        });
                    });
                } else {
                    db.run('COMMIT');
                    res.json({ success: true });
                }
            });
        });
    }
};

module.exports = reviewController;
