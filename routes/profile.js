const express = require('express');
const router = express.Router();

// Profile route
router.get('/perfil', (req, res) => {
    res.render('profile/index', {
        title: 'Mi Perfil',
        user: req.session.user
    });
});

// Addresses route
router.get('/direcciones', (req, res) => {
    res.render('addresses/index', {
        title: 'Mis Direcciones',
        user: req.session.user
    });
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;