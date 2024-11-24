const express = require('express');
const router = express.Router();
const db = require('../config/database');

// List user favorites
router.get('/', (req, res) => {
    const userId = req.session.user.id;
    
    db.all(`
        SELECT b.*, f.created_at as favorited_at
        FROM favorites f
        JOIN businesses b ON f.business_id = b.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    `, [userId], (err, favorites) => {
        res.render('favorites/index', {
            title: 'Mis Favoritos',
            favorites
        });
    });
});

// Add to favorites
router.post('/:businessId', (req, res) => {
    const userId = req.session.user.id;
    const businessId = req.params.businessId;
    
    db.run(`
        INSERT INTO favorites (user_id, business_id)
        VALUES (?, ?)
    `, [userId, businessId], (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al agregar a favoritos' });
        } else {
            res.json({ success: true });
        }
    });
});

// Remove from favorites
router.delete('/:businessId', (req, res) => {
    const userId = req.session.user.id;
    const businessId = req.params.businessId;
    
    db.run(`
        DELETE FROM favorites
        WHERE user_id = ? AND business_id = ?
    `, [userId, businessId], (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al eliminar de favoritos' });
        } else {
            res.json({ success: true });
        }
    });
});

module.exports = router;
