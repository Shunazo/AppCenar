const db = require('../config/database');

const businessController = {
    listBusinesses: (req, res) => {
        const typeId = req.params.typeId;
        const query = typeId ? 
            'SELECT * FROM businesses WHERE business_type_id = ? AND active = 1' :
            'SELECT * FROM businesses WHERE active = 1';
        
        db.all(query, typeId ? [typeId] : [], (err, businesses) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar comercios' });
            }
            res.render('client/businesses', { businesses });
        });
    },

    getProducts: (req, res) => {
        const businessId = req.params.id;
        
        db.get('SELECT * FROM businesses WHERE id = ?', [businessId], (err, business) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar comercio' });
            }

            db.all(`
                SELECT c.*, p.*
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
                WHERE c.business_id = ? AND p.active = 1
                ORDER BY c.name, p.name
            `, [businessId], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al cargar productos' });
                }

                // Organizar productos por categoría
                const categories = [];
                let currentCategory = null;

                results.forEach(row => {
                    if (!currentCategory || currentCategory.id !== row.category_id) {
                        currentCategory = {
                            id: row.category_id,
                            name: row.name,
                            products: []
                        };
                        categories.push(currentCategory);
                    }
                    if (row.product_id) {
                        currentCategory.products.push({
                            id: row.product_id,
                            name: row.product_name,
                            description: row.description,
                            price: row.price,
                            image: row.image
                        });
                    }
                });

                res.render('client/products', { business, categories });
            });
        });
    }
};

module.exports = businessController;
