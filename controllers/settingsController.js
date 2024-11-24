const db = require('../config/database');

const settingsController = {
    getSystemSettings: async (req, res) => {
        const query = `
            SELECT key, value, description
            FROM system_settings
            ORDER BY key
        `;
        
        db.all(query, [], (err, settings) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching settings' });
            }
            res.json({ settings });
        });
    },

    updateSettings: async (req, res) => {
        const { settings } = req.body;
        
        const updatePromises = settings.map(setting => {
            return new Promise((resolve, reject) => {
                db.run(
                    'UPDATE system_settings SET value = ? WHERE key = ?',
                    [setting.value, setting.key],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        });

        try {
            await Promise.all(updatePromises);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Error updating settings' });
        }
    }
};

module.exports = settingsController;
