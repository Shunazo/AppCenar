const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Public pages
router.get('/', (req, res) => {
    res.render('home');
});

// Protected pages
router.get('/comercios', isAuthenticated, (req, res) => {
    res.render('comercios/index');
});

router.get('/pedidos', isAuthenticated, (req, res) => {
    res.render('pedidos/index');
});

router.get('/favoritos', isAuthenticated, (req, res) => {
    res.render('favoritos/index');
});

router.get('/perfil', isAuthenticated, (req, res) => {
    res.render('perfil/index', { user: req.session.user });
});

router.get('/direcciones', isAuthenticated, (req, res) => {
    res.render('direcciones/index');
});

module.exports = router;