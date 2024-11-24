const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendActivationEmail, sendResetPasswordEmail } = require('../utils/mailer');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = file.fieldname === 'logo' ? 'businesses' : 'users';
        cb(null, `public/uploads/${folder}`);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const authController = {
    login: async (req, res) => {
        const { email, password } = req.body;
        
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err || !user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            req.session.user = {
                id: user.id,
                name: user.name,
                role: user.role
            };

            res.json({ success: true, redirect: '/' });
        });
    },

    register: async (req, res) => {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role],
            (err) => {
                if (err) {
                    return res.status(400).json({ error: 'Error al registrar usuario' });
                }
                res.json({ success: true, message: 'Usuario registrado exitosamente' });
            });
    },

    activateUser: async (req, res) => {
        const { token } = req.params;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            db.run('UPDATE users SET is_active = 1 WHERE email = ?', [decoded.email]);
            res.redirect('/login?activated=true');
        } catch (error) {
            res.status(400).json({ error: 'Token inválido' });
        }
    },
    
    registerBusiness: async (req, res) => {
        const { name, email, password, businessType } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO businesses (name, email, password, type) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, businessType],
            (err) => {
                if (err) {
                    return res.status(400).json({ error: 'Error al registrar comercio' });
                }
                res.json({ success: true, message: 'Comercio registrado exitosamente' });
            });
    },
    
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/auth/login');
    },

    requestPasswordReset: async (req, res) => {
        const { email } = req.body;
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await sendResetPasswordEmail(email, token);
        res.json({ success: true, message: 'Correo de recuperación enviado' });
    },

    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.run('UPDATE users SET password = ? WHERE email = ?', 
                [hashedPassword, decoded.email]);
                
            res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
        } catch (error) {
            res.status(400).json({ error: 'Token inválido' });
        }
    }
};

module.exports = authController;