const db = require('../config/database');

const categoryController = {
    getCategories: async (req, res) => {
        const businessId = req.session.user.businessId;
        
        db.all(`
            SELECT id, name, order_index
            FROM product_categories
            WHERE business_id = ?
            ORDER BY order_index
        `, [businessId], (err, categories) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching categories' });
            }
            res.json({ categories });
        });
    },

    addCategory: async (req, res) => {
        const businessId = req.session.user.businessId;
        const { name } = req.body;
        
        db.run(`
            INSERT INTO product_categories (business_id, name, order_index)
            SELECT ?, ?, COALESCE(MAX(order_index) + 1, 0)
            FROM product_categories
            WHERE business_id = ?
        `, [businessId, name, businessId], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error adding category' });
            }
            res.json({ 
                success: true, 
                categoryId: this.lastID 
            });
        });
    },

    updateCategory: async (req, res) => {
        const { categoryId } = req.params;
        const { name } = req.body;
        
        db.run(
            'UPDATE product_categories SET name = ? WHERE id = ?',
            [name, categoryId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error updating category' });
                }
                res.json({ success: true });
            }
        );
    },

    deleteCategory: async (req, res) => {
        const { categoryId } = req.params;
        
        db.run(
            'DELETE FROM product_categories WHERE id = ?',
            [categoryId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error deleting category' });
                }
                res.json({ success: true });
            }
        );
    },

    updateCategoryOrder: async (req, res) => {
        const { categories } = req.body;
        
        const updatePromises = categories.map(({ id, order }) => {
            return new Promise((resolve, reject) => {
                db.run(
                    'UPDATE product_categories SET order_index = ? WHERE id = ?',
                    [order, id],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        });

        try {
            await Promise.all(updatePromises);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Error updating category order' });
        }
    }
};

module.exports = categoryController;
