const db = require('../config/database');
const geocoder = require('../services/geocoder');

const addressController = {
    getAddresses: async (req, res) => {
        const userId = req.session.user.id;

        db.all(`
            SELECT * FROM addresses 
            WHERE user_id = ?
            ORDER BY is_default DESC, created_at DESC
        `, [userId], (err, addresses) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar direcciones' });
            }
            res.render('customer/addresses', { addresses });
        });
    },

    addAddress: async (req, res) => {
        const userId = req.session.user.id;
        const { label, address, reference, is_default } = req.body;

        try {
            // Geocode address
            const coordinates = await geocoder.geocode(address);
            
            db.serialize(() => {
                if (is_default) {
                    // Remove current default
                    db.run(`
                        UPDATE addresses 
                        SET is_default = 0 
                        WHERE user_id = ?
                    `, [userId]);
                }

                // Insert new address
                db.run(`
                    INSERT INTO addresses (
                        user_id, label, address, reference, 
                        latitude, longitude, is_default
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    userId, label, address, reference,
                    coordinates.lat, coordinates.lng,
                    is_default ? 1 : 0
                ], function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error al guardar dirección' });
                    }
                    res.json({ 
                        success: true, 
                        addressId: this.lastID,
                        coordinates
                    });
                });
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al geocodificar dirección' });
        }
    },

    updateAddress: async (req, res) => {
        const userId = req.session.user.id;
        const { addressId } = req.params;
        const { label, address, reference, is_default } = req.body;

        try {
            // Geocode new address if changed
            const coordinates = await geocoder.geocode(address);

            db.serialize(() => {
                if (is_default) {
                    // Remove current default
                    db.run(`
                        UPDATE addresses 
                        SET is_default = 0 
                        WHERE user_id = ? AND id != ?
                    `, [userId, addressId]);
                }

                // Update address
                db.run(`
                    UPDATE addresses 
                    SET label = ?, address = ?, reference = ?,
                        latitude = ?, longitude = ?, is_default = ?
                    WHERE id = ? AND user_id = ?
                `, [
                    label, address, reference,
                    coordinates.lat, coordinates.lng,
                    is_default ? 1 : 0,
                    addressId, userId
                ], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error al actualizar dirección' });
                    }
                    res.json({ success: true, coordinates });
                });
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al geocodificar dirección' });
        }
    },

    deleteAddress: async (req, res) => {
        const userId = req.session.user.id;
        const { addressId } = req.params;

        db.run(`
            DELETE FROM addresses 
            WHERE id = ? AND user_id = ? AND is_default = 0
        `, [addressId, userId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar dirección' });
            }
            res.json({ success: true });
        });
    },

    setDefaultAddress: async (req, res) => {
        const userId = req.session.user.id;
        const { addressId } = req.params;

        db.serialize(() => {
            // Remove current default
            db.run(`
                UPDATE addresses 
                SET is_default = 0 
                WHERE user_id = ?
            `, [userId]);

            // Set new default
            db.run(`
                UPDATE addresses 
                SET is_default = 1 
                WHERE id = ? AND user_id = ?
            `, [addressId, userId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar dirección principal' });
                }
                res.json({ success: true });
            });
        });
    }
};

module.exports = addressController;