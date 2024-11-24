const db = require('../config/database');

const favoritesController = {
    getFavorites: async (req, res) => {
        const userId = req.session.user.id;

        db.all(`
            SELECT 
                f.id as favorite_id,
                b.id as business_id,
                b.name,
                b.logo,
                b.address,
                b.rating,
                bt.name as business_type,
                (
                    SELECT COUNT(*) 
                    FROM orders 
                    WHERE business_id = b.id 
                    AND user_id = ?
                ) as order_count
            FROM favorites f
            JOIN businesses b ON f.business_id = b.id
            JOIN business_types bt ON b.business_type_id = bt.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `, [userId, userId], (err, favorites) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar favoritos' });
            }
            res.render('customer/favorites', { favorites });
        });
    },

    toggleFavorite: async (req, res) => {
        const userId = req.session.user.id;
        const { businessId } = req.params;

        db.get(`
            SELECT id FROM favorites 
            WHERE user_id = ? AND business_id = ?
        `, [userId, businessId], (err, favorite) => {
            if (err) {
                return res.status(500).json({ error: 'Error al procesar solicitud' });
            }

            if (favorite) {
                // Remove from favorites
                db.run(`
                    DELETE FROM favorites 
                    WHERE user_id = ? AND business_id = ?
                `, [userId, businessId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error al eliminar favorito' });
                    }
                    res.json({ success: true, isFavorite: false });
                });
            } else {
                // Add to favorites
                db.run(`
                    INSERT INTO favorites (user_id, business_id)
                    VALUES (?, ?)
                `, [userId, businessId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error al agregar favorito' });
                    }
                    res.json({ success: true, isFavorite: true });
                });
            }
        });
    }
};

module.exports = favoritesController;
