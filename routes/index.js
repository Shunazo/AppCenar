const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
    res.render('home', {
        title: 'AppCenar - Inicio'
    });
});

// About page route
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'Sobre Nosotros'
    });
});

// Contact page route
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contacto'
    });
});

module.exports = router;
