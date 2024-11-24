const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: './public/uploads/products',
    filename: function(req, file, cb) {
        cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const businessManagementController = {
    getCategories: (req, res) => {
        const businessId = req.session.user.businessId;
        
        db.all('SELECT * FROM categories WHERE business_id = ?', [businessId], (err, categories) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar categorías' });
            }
            res.json(categories);
        });
    },

    createCategory: (req, res) => {
        const { name, description } = req.body;
        const businessId = req.session.user.businessId;

        db.run('INSERT INTO categories (name, description, business_id) VALUES (?, ?, ?)',
            [name, description, businessId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear categoría' });
                }
                res.json({ id: this.lastID, name, description });
            }
        );
    },

    updateCategory: (req, res) => {
        const { id, name, description } = req.body;
        const businessId = req.session.user.businessId;

        db.run('UPDATE categories SET name = ?, description = ? WHERE id = ? AND business_id = ?',
            [name, description, id, businessId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar categoría' });
                }
                res.json({ success: true });
            }
        );
    },

    deleteCategory: (req, res) => {
        const { id } = req.params;
        const businessId = req.session.user.businessId;

        db.run('DELETE FROM categories WHERE id = ? AND business_id = ?',
            [id, businessId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al eliminar categoría' });
                }
                res.json({ success: true });
            }
        );
    },

    getProducts: (req, res) => {
        const businessId = req.session.user.businessId;

        db.all(`
            SELECT p.*, c.name as category_name 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.business_id = ?
        `, [businessId], (err, products) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar productos' });
            }
            res.json(products);
        });
    },

    createProduct: [upload.single('image'), (req, res) => {
        const { name, description, price, category_id } = req.body;
        const businessId = req.session.user.businessId;
        const image = req.file ? `/uploads/products/${req.file.filename}` : null;

        db.run(`
            INSERT INTO products (name, description, price, image, category_id, business_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [name, description, price, image, category_id, businessId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear producto' });
            }
            res.json({ id: this.lastID, name, description, price, image, category_id });
        });
    }],

    updateProduct: [upload.single('image'), (req, res) => {
        const { id, name, description, price, category_id } = req.body;
        const businessId = req.session.user.businessId;
        const image = req.file ? `/uploads/products/${req.file.filename}` : null;

        let query = 'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?';
        let params = [name, description, price, category_id];

        if (image) {
            query += ', image = ?';
            params.push(image);
        }

        query += ' WHERE id = ? AND business_id = ?';
        params.push(id, businessId);

        db.run(query, params, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar producto' });
            }
            res.json({ success: true });
        });
    }],

    deleteProduct: (req, res) => {
        const { id } = req.params;
        const businessId = req.session.user.businessId;

        db.run('DELETE FROM products WHERE id = ? AND business_id = ?',
            [id, businessId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al eliminar producto' });
                }
                res.json({ success: true });
            }
        );
    }
};

module.exports = businessManagementController;
