const db = require('../config/database');
const jwt = require('jsonwebtoken');

const activationController = {
    activateAccount: async (req, res) => {
        const { token } = req.params;
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            db.run(
                'UPDATE users SET is_active = 1, activation_token = NULL WHERE email = ? AND activation_token = ?',
                [decoded.email, token],
                function(err) {
                    if (err || this.changes === 0) {
                        return res.render('auth/activation-error', {
                            message: 'El enlace de activación es inválido o ha expirado'
                        });
                    }
                    
                    res.render('auth/activation-success', {
                        message: 'Tu cuenta ha sido activada exitosamente'
                    });
                }
            );
        } catch (error) {
            res.render('auth/activation-error', {
                message: 'El enlace de activación es inválido o ha expirado'
            });
        }
    }
};

module.exports = activationController;
