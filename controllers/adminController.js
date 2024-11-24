const db = require('../config/database');

const adminController = {
    getDashboard: async (req, res) => {
        try {
            // Get statistics
            const stats = await getSystemStats();
            
            // Get recent activity
            const activity = await getRecentActivity();
            
            // Get system alerts
            const alerts = await getSystemAlerts();
            
            res.render('home/admin', {
                stats,
                activity,
                alerts,
                title: 'Panel de Administración'
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('errors/500');
        }
    },

    getUsers: async (req, res) => {
        const query = `
            SELECT id, name, email, role, is_active, created_at
            FROM users
            ORDER BY created_at DESC
        `;
        
        db.all(query, [], (err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener usuarios' });
            }
            res.json({ users });
        });
    },

    getBusinesses: async (req, res) => {
        const query = `
            SELECT id, name, email, type, is_active, created_at
            FROM businesses
            ORDER BY created_at DESC
        `;
        
        db.all(query, [], (err, businesses) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener comercios' });
            }
            res.json({ businesses });
        });
    },

    toggleUserStatus: async (req, res) => {
        const { userId } = req.params;
        const { status } = req.body;
        
        db.run(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [status ? 1 : 0, userId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar estado' });
                }
                res.json({ success: true });
            }
        );
    },

    toggleBusinessStatus: async (req, res) => {
        const { businessId } = req.params;
        const { status } = req.body;
        
        db.run(
            'UPDATE businesses SET is_active = ? WHERE id = ?',
            [status ? 1 : 0, businessId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar estado' });
                }
                res.json({ success: true });
            }
        );
    },

    updateITBIS: (req, res) => {
        const { itbis } = req.body;
        
        db.run('UPDATE configuration SET itbis = ? WHERE id = 1', [itbis], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar ITBIS' });
            }
            res.json({ success: true });
        });
    }
};

// Helper functions for statistics
async function getSystemStats() {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
                (SELECT COUNT(*) FROM businesses WHERE is_active = 1) as active_businesses,
                (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = DATE('now')) as today_orders,
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE DATE(created_at) = DATE('now')) as today_earnings
        `, [], (err, stats) => {
            if (err) reject(err);
            else resolve(stats);
        });
    });
}

async function getRecentActivity() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM orders
            WHERE created_at >= date('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [], (err, activity) => {
            if (err) reject(err);
            else {
                resolve({
                    labels: activity.map(a => a.date),
                    orders: activity.map(a => a.count)
                });
            }
        });
    });
}

async function getSystemAlerts() {
    // Implement system alerts logic
    return [
        {
            type: 'warning',
            message: 'Alto volumen de pedidos detectado'
        },
        {
            type: 'info',
            message: 'Nuevos comercios pendientes de aprobación'
        }
    ];
}

async function getConfiguration() {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM configuration WHERE id = 1', [], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
}

module.exports = adminController;