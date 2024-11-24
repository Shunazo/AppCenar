const express = require('express');
const router = express.Router();

router.get('/cliente/home', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'cliente') {
        return res.redirect('/login');
    }
    res.render('client/home');
});

module.exports = router;
