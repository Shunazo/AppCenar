const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/direcciones', isAuthenticated, (req, res) => {
    res.render('addresses/index', {
        user: req.session.user
    });
});

// Add new address
router.post('/', (req, res) => {
    const userId = req.session.user.id;
    const { 
        street, number, apartment, reference,
        latitude, longitude, is_default 
    } = req.body;
    
    if (is_default) {
        db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    
    db.run(`
        INSERT INTO addresses (
            user_id, street, number, apartment, 
            reference, latitude, longitude, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        userId, street, number, apartment, 
        reference, latitude, longitude, is_default ? 1 : 0
    ], (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al guardar dirección' });
        } else {
            res.json({ success: true });
        }
    });
});

// Update address
router.put('/:id', (req, res) => {
    const userId = req.session.user.id;
    const addressId = req.params.id;
    const { 
        street, number, apartment, reference,
        latitude, longitude, is_default 
    } = req.body;
    
    if (is_default) {
        db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    
    db.run(`
        UPDATE addresses 
        SET street = ?, number = ?, apartment = ?,
            reference = ?, latitude = ?, longitude = ?,
            is_default = ?
        WHERE id = ? AND user_id = ?
    `, [
        street, number, apartment, reference,
        latitude, longitude, is_default ? 1 : 0,
        addressId, userId
    ], (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al actualizar dirección' });
        } else {
            res.json({ success: true });
        }
    });
});

// Delete address
router.delete('/:id', (req, res) => {
    const userId = req.session.user.id;
    const addressId = req.params.id;
    
    db.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', 
        [addressId, userId], (err) => {
            if (err) {
                res.status(500).json({ error: 'Error al eliminar dirección' });
            } else {
                res.json({ success: true });
            }
    });
});

module.exports = router;