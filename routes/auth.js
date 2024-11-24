const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { uploadUserImage, uploadBusinessLogo } = require('../config/multer');

router.get('/login', (req, res) => {
    if (req.session.user) {
        const routes = {
            'cliente': '/cliente/home',
            'delivery': '/delivery/home',
            'comercio': '/comercio/home',
            'admin': '/admin/home'
        };
        return res.redirect(routes[req.session.user.role]);
    }
    res.render('auth/login');
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('auth/login', {
                error: 'Credenciales incorrectas'
            });
        }

        if (!user.isActive) {
            return res.render('auth/login', {
                error: 'Cuenta inactiva. Por favor revise su correo o contacte a un administrador'
            });
        }

        req.session.user = {
            id: user.id,
            role: user.role,
            email: user.email
        };

        const routes = {
            'cliente': '/cliente/home',
            'delivery': '/delivery/home',
            'comercio': '/comercio/home',
            'admin': '/admin/home'
        };

        res.redirect(routes[user.role]);
    } catch (error) {
        res.render('auth/login', {
            error: 'Error al iniciar sesión'
        });
    }
});

router.post('/register/user', uploadUserImage.single('photo'), async (req, res) => {
    // Your registration logic here
});

module.exports = router;
// Registration routes for Client/Delivery
router.get('/registro-cliente-delivery', (req, res) => {
    res.render('auth/register-client-delivery', {
        title: 'Registro Cliente/Delivery'
    });
});

router.get('/registro-comercio', (req, res) => {
    res.render('auth/register-business', {
        title: 'Registro Comercio'
    });
});

router.post('/registro-cliente-delivery', uploadUserImage.single('foto'), async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            telefono,
            email,
            username,
            role,
            password,
            confirmPassword
        } = req.body;

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            return res.render('auth/register-client-delivery', {
                error: 'Las contraseñas no coinciden',
                data: req.body,
                title: 'Registro Cliente/Delivery'
            });
        }

        // Verificar si el usuario o email ya existe
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return res.render('auth/register-client-delivery', {
                error: 'El email o nombre de usuario ya está registrado',
                data: req.body,
                title: 'Registro Cliente/Delivery'
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Token de activación
        const activationToken = require('crypto').randomBytes(32).toString('hex');

        // Crear el usuario
        const newUser = await User.create({
            nombre,
            apellido,
            telefono,
            email,
            username,
            password: hashedPassword,
            role,
            foto: req.file ? `/uploads/users/${req.file.filename}` : null,
            isActive: false,
            activationToken
        });

        // Enviar correo de activación
        await sendActivationEmail(newUser.email, newUser.activationToken);

        res.render('auth/registration-success', {
            message: 'Registro exitoso. Por favor revisa tu correo para activar tu cuenta.',
            title: 'Registro Exitoso'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.render('auth/register-client-delivery', {
            error: 'Error en el registro. Por favor intenta nuevamente.',
            data: req.body,
            title: 'Registro Cliente/Delivery'
        });
    }
});

// Account activation route
router.get('/activar-cuenta/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findOne({ 
            email: decoded.email,
            activationToken: token,
            isActive: false
        });

        if (!user) {
            return res.render('auth/activation-error', {
                error: 'El enlace de activación no es válido o ha expirado',
                title: 'Error de Activación'
            });
        }

        user.isActive = true;
        user.activationToken = null;
        await user.save();

        res.render('auth/activation-success', {
            message: 'Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión.',
            title: 'Cuenta Activada'
        });

    } catch (error) {
        res.render('auth/activation-error', {
            error: 'Error al activar la cuenta',
            title: 'Error de Activación'
        });
    }
});

// Reset password routes
router.get('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findOne({ 
            _id: decoded.userId,
            resetPasswordToken: token
        });

        if (!user) {
            return res.render('auth/reset-password-error', {
                error: 'El enlace ha expirado o no es válido',
                title: 'Error'
            });
        }

        res.render('auth/reset-password', {
            token,
            title: 'Restablecer Contraseña'
        });

    } catch (error) {
        res.render('auth/reset-password-error', {
            error: 'Error al procesar la solicitud',
            title: 'Error'
        });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        const user = await User.findOne({ resetPasswordToken: token });
        
        if (!user) {
            return res.render('auth/reset-password-error', {
                error: 'El enlace ha expirado o no es válido',
                title: 'Error'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        await user.save();

        res.render('auth/reset-password-success', {
            message: 'Tu contraseña ha sido actualizada exitosamente',
            title: 'Contraseña Actualizada'
        });

    } catch (error) {
        res.render('auth/reset-password-error', {
            error: 'Error al actualizar la contraseña',
            title: 'Error'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;

const { Op } = require('sequelize');

const crypto = require('node:crypto');

const { sendActivationEmail } = require('../utils/emailService');

// Add this route
router.get('/reset-password', (req, res) => {
    res.render('auth/reset-password', {
        title: 'Restablecer Contraseña'
    });
});

router.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();
            
            await sendResetPasswordEmail(email, resetToken);
            
            res.render('auth/reset-password', {
                message: 'Se ha enviado un enlace a tu correo para restablecer tu contraseña'
            });
        } else {
            res.render('auth/reset-password', {
                error: 'No existe una cuenta con ese correo electrónico'
            });
        }
    } catch (error) {
        res.render('auth/reset-password', {
            error: 'Error al procesar la solicitud'
        });
    }
});
