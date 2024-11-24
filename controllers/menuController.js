const db = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/products');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const menuController = {
    getMenu: async (req, res) => {
        const businessId = req.session.user.businessId;
        
        db.all(`
            SELECT c.id as category_id, c.name as category_name,
                   p.id, p.name, p.description, p.price, p.image_url, p.is_available
            FROM product_categories c
            LEFT JOIN products p ON c.id = p.category_id
            WHERE c.business_id = ?
            ORDER BY c.order_index, p.name
        `, [businessId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching menu' });
            }
            
            // Organize products by category
            const menu = results.reduce((acc, item) => {
                const category = acc.find(c => c.id === item.category_id);
                if (category) {
                    if (item.id) { // If product exists
                        category.products.push({
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            image_url: item.image_url,
                            is_available: item.is_available
                        });
                    }
                } else {
                    acc.push({
                        id: item.category_id,
                        name: item.category_name,
                        products: item.id ? [{
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            image_url: item.image_url,
                            is_available: item.is_available
                        }] : []
                    });
                }
                return acc;
            }, []);
            
            res.render('business/menu', { menu });
        });
    },

    addProduct: [upload.single('image'), async (req, res) => {
        const businessId = req.session.user.businessId;
        const { name, description, price, categoryId } = req.body;
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;
        
        db.run(`
            INSERT INTO products (
                business_id, category_id, name, 
                description, price, image_url
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            businessId, categoryId, name, 
            description, price, imageUrl
        ], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error adding product' });
            }
            res.json({ 
                success: true, 
                productId: this.lastID,
                imageUrl 
            });
        });
    }],

    updateProduct: [upload.single('image'), async (req, res) => {
        const { productId } = req.params;
        const { name, description, price, categoryId } = req.body;
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;
        
        let query = `
            UPDATE products 
            SET name = ?, description = ?, 
                price = ?, category_id = ?
        `;
        let params = [name, description, price, categoryId];
        
        if (imageUrl) {
            query += ', image_url = ?';
            params.push(imageUrl);
        }
        
        query += ' WHERE id = ?';
        params.push(productId);
        
        db.run(query, params, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating product' });
            }
            res.json({ 
                success: true,
                imageUrl: imageUrl || undefined
            });
        });
    }],

    toggleProductAvailability: async (req, res) => {
        const { productId } = req.params;
        const { isAvailable } = req.body;
        
        db.run(
            'UPDATE products SET is_available = ? WHERE id = ?',
            [isAvailable ? 1 : 0, productId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error updating availability' });
                }
                res.json({ success: true });
            }
        );
    }
};

module.exports = menuController;
