const db = require('../config/database');
const bcrypt = require('bcryptjs');

const adminUserController = {
    getUsers: async (req, res) => {
        try {
            const [clients, delivery, admins] = await Promise.all([
                getUsersByRole('client'),
                getUsersByRole('delivery'),
                getUsersByRole('admin')
            ]);

            res.render('admin/users', { clients, delivery, admins });
        } catch (error) {
            res.status(500).json({ error: 'Error al cargar usuarios' });
        }
    },

    createUser: async (req, res) => {
        const { name, lastname, email, phone, role, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(`
            INSERT INTO users (name, lastname, email, phone, role, password, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [name, lastname, email, phone, role, hashedPassword], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear usuario' });
            }
            res.json({ id: this.lastID });
        });
    },

    updateUser: async (req, res) => {
        const { userId, name, lastname, email, phone, role, password } = req.body;
        
        let query = `
            UPDATE users 
            SET name = ?, lastname = ?, email = ?, phone = ?, role = ?
            WHERE id = ?
        `;
        let params = [name, lastname, email, phone, role, userId];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = query.replace('role = ?', 'role = ?, password = ?');
            params.splice(5, 0, hashedPassword);
        }

        db.run(query, params, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar usuario' });
            }
            res.json({ success: true });
        });
    },

    toggleUserStatus: (req, res) => {
        const { userId } = req.params;
        
        db.run(`
            UPDATE users 
            SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END
            WHERE id = ?
        `, [userId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cambiar estado del usuario' });
            }
            res.json({ success: true });
        });
    }
};

// Helper function to get users by role
function getUsersByRole(role) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users WHERE role = ? ORDER BY name', [role], (err, users) => {
            if (err) reject(err);
            resolve(users);
        });
    });
}

module.exports = adminUserController;
