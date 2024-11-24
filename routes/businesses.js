const express = require('express');
const router = express.Router();
const db = require('../config/database');

// List all businesses
router.get('/', (req, res) => {
    db.all(`
        SELECT b.*, 
               COUNT(DISTINCT r.id) as review_count,
               AVG(r.rating) as avg_rating
        FROM businesses b
        LEFT JOIN reviews r ON b.id = r.business_id
        GROUP BY b.id
        ORDER BY b.name
    `, [], (err, businesses) => {
        res.render('businesses/index', {
            title: 'Comercios',
            businesses
        });
    });
});

// Business details
router.get('/:id', (req, res) => {
    const businessId = req.params.id;
    
    db.get(`
        SELECT b.*, 
               COUNT(DISTINCT r.id) as review_count,
               AVG(r.rating) as avg_rating
        FROM businesses b
        LEFT JOIN reviews r ON b.id = r.business_id
        WHERE b.id = ?
        GROUP BY b.id
    `, [businessId], (err, business) => {
        if (business) {
            db.all('SELECT * FROM products WHERE business_id = ?', [businessId], (err, products) => {
                res.render('businesses/detail', {
                    title: business.name,
                    business,
                    products
                });
            });
        } else {
            res.status(404).render('errors/404');
        }
    });
});

// Search businesses
router.get('/search', (req, res) => {
    const { q, category } = req.query;
    let query = `
        SELECT b.*, 
               COUNT(DISTINCT r.id) as review_count,
               AVG(r.rating) as avg_rating
        FROM businesses b
        LEFT JOIN reviews r ON b.id = r.business_id
        WHERE 1=1
    `;
    const params = [];

    if (q) {
        query += ` AND (b.name LIKE ? OR b.description LIKE ?)`;
        params.push(`%${q}%`, `%${q}%`);
    }

    if (category) {
        query += ` AND b.category = ?`;
        params.push(category);
    }

    query += ` GROUP BY b.id ORDER BY b.name`;

    db.all(query, params, (err, businesses) => {
        res.render('businesses/index', {
            title: 'Resultados de búsqueda',
            businesses,
            search: q,
            category
        });
    });
});

module.exports = router;
