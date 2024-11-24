const { body, validationResult } = require('express-validator');

const validationRules = {
    validateLogin: [
        body('email').isEmail().withMessage('Ingrese un correo válido'),
        body('password').notEmpty().withMessage('La contraseña es requerida'),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    ],

    validateRegister: [
        body('name').notEmpty().withMessage('El nombre es requerido'),
        body('email').isEmail().withMessage('Ingrese un correo válido'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres')
            .matches(/\d/)
            .withMessage('La contraseña debe contener al menos un número'),
        body('phone').notEmpty().withMessage('El teléfono es requerido'),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    ],

    validateBusinessRegister: [
        body('name').notEmpty().withMessage('El nombre es requerido'),
        body('email').isEmail().withMessage('Ingrese un correo válido'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres')
            .matches(/\d/)
            .withMessage('La contraseña debe contener al menos un número'),
        body('phone').notEmpty().withMessage('El teléfono es requerido'),
        body('businessType').notEmpty().withMessage('El tipo de comercio es requerido'),
        body('openTime').notEmpty().withMessage('El horario de apertura es requerido'),
        body('closeTime').notEmpty().withMessage('El horario de cierre es requerido'),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    ]
};

module.exports = validationRules;