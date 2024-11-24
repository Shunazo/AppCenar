const db = require('../config/database');
const geocoder = require('../services/geocoder');

const deliveryZoneController = {
    getDeliveryZones: async (req, res) => {
        const businessId = req.session.user.businessId;

        db.all(`
            SELECT * FROM delivery_zones 
            WHERE business_id = ?
            ORDER BY created_at DESC
        `, [businessId], (err, zones) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar zonas de entrega' });
            }
            res.render('business/delivery-zones', { zones });
        });
    },

    addDeliveryZone: async (req, res) => {
        const businessId = req.session.user.businessId;
        const { name, coordinates, deliveryFee, minOrder, estimatedTime } = req.body;

        db.run(`
            INSERT INTO delivery_zones (
                business_id, name, coordinates, delivery_fee,
                min_order, estimated_time
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            businessId, name, JSON.stringify(coordinates),
            deliveryFee, minOrder, estimatedTime
        ], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear zona de entrega' });
            }
            res.json({ 
                success: true, 
                zoneId: this.lastID 
            });
        });
    },

    updateDeliveryZone: async (req, res) => {
        const businessId = req.session.user.businessId;
        const { zoneId } = req.params;
        const { name, coordinates, deliveryFee, minOrder, estimatedTime } = req.body;

        db.run(`
            UPDATE delivery_zones 
            SET name = ?, coordinates = ?, delivery_fee = ?,
                min_order = ?, estimated_time = ?
            WHERE id = ? AND business_id = ?
        `, [
            name, JSON.stringify(coordinates), deliveryFee,
            minOrder, estimatedTime, zoneId, businessId
        ], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar zona de entrega' });
            }
            res.json({ success: true });
        });
    },

    deleteDeliveryZone: async (req, res) => {
        const businessId = req.session.user.businessId;
        const { zoneId } = req.params;

        db.run(`
            DELETE FROM delivery_zones 
            WHERE id = ? AND business_id = ?
        `, [zoneId, businessId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar zona de entrega' });
            }
            res.json({ success: true });
        });
    }
};

module.exports = deliveryZoneController;
